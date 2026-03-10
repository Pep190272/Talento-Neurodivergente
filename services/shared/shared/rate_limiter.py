"""Distributed rate limiter with Redis backend + in-memory fallback.

Issue #76 — Production rate limiting for multi-instance deployments.

Architecture:
- Primary: Redis sliding window (distributed, survives restarts)
- Fallback: In-memory sliding window (single instance, dev/testing)
- Auto-detects Redis availability on startup
- Transparent switching — callers don't need to know which backend is active

Usage (FastAPI):
    from shared.rate_limiter import RateLimiter, PRESETS

    limiter = RateLimiter(redis_url="redis://localhost:6379")
    result = await limiter.check("user:123", PRESETS["AUTH"])
    if not result.allowed:
        raise HTTPException(429, detail="Rate limit exceeded")
"""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass
from enum import Enum
from typing import Optional

logger = logging.getLogger(__name__)


# ─── DTOs ────────────────────────────────────────────────────────────────────


@dataclass(frozen=True)
class RateLimitPreset:
    """Rate limit configuration preset."""
    window_seconds: int
    max_requests: int
    name: str = ""


@dataclass(frozen=True)
class RateLimitResult:
    """Result of a rate limit check."""
    allowed: bool
    remaining: int
    reset_time: float  # Unix timestamp
    retry_after: int = 0  # Seconds until next allowed request


# ─── Presets ─────────────────────────────────────────────────────────────────


PRESETS = {
    "AUTH": RateLimitPreset(window_seconds=60, max_requests=5, name="auth"),
    "API": RateLimitPreset(window_seconds=60, max_requests=60, name="api"),
    "READ": RateLimitPreset(window_seconds=60, max_requests=100, name="read"),
    "WRITE": RateLimitPreset(window_seconds=60, max_requests=30, name="write"),
    "LLM": RateLimitPreset(window_seconds=60, max_requests=10, name="llm"),
}


# ─── In-Memory Backend ──────────────────────────────────────────────────────


class InMemoryBackend:
    """Sliding window rate limiter using in-memory storage.

    Suitable for single-instance deployments and development.
    NOT shared across processes or instances.
    """

    def __init__(self) -> None:
        self._requests: dict[str, list[float]] = {}

    async def check(
        self, identifier: str, preset: RateLimitPreset
    ) -> RateLimitResult:
        now = time.time()
        window_start = now - preset.window_seconds

        # Clean old requests
        timestamps = self._requests.get(identifier, [])
        timestamps = [t for t in timestamps if t > window_start]

        if len(timestamps) >= preset.max_requests:
            oldest = timestamps[0]
            reset_time = oldest + preset.window_seconds
            return RateLimitResult(
                allowed=False,
                remaining=0,
                reset_time=reset_time,
                retry_after=max(1, int(reset_time - now)),
            )

        timestamps.append(now)
        self._requests[identifier] = timestamps

        return RateLimitResult(
            allowed=True,
            remaining=preset.max_requests - len(timestamps),
            reset_time=now + preset.window_seconds,
        )

    async def clear(self, identifier: str | None = None) -> None:
        if identifier:
            self._requests.pop(identifier, None)
        else:
            self._requests.clear()

    async def stats(self) -> dict:
        total = sum(len(v) for v in self._requests.values())
        return {"backend": "memory", "identifiers": len(self._requests), "total_requests": total}


# ─── Redis Backend ───────────────────────────────────────────────────────────


class RedisBackend:
    """Sliding window rate limiter using Redis sorted sets.

    Each identifier gets a sorted set where:
    - Members are unique request IDs (timestamp-based)
    - Scores are timestamps

    Benefits:
    - Distributed: works across multiple instances
    - Persistent: survives process restarts
    - Atomic: uses Redis pipeline for consistency
    - Auto-cleanup: EXPIRE on keys prevents memory leaks
    """

    def __init__(self, redis_client) -> None:
        self._redis = redis_client

    async def check(
        self, identifier: str, preset: RateLimitPreset
    ) -> RateLimitResult:
        now = time.time()
        window_start = now - preset.window_seconds
        key = f"ratelimit:{preset.name}:{identifier}"

        pipe = self._redis.pipeline()
        # Remove old entries outside the window
        pipe.zremrangebyscore(key, 0, window_start)
        # Count current entries
        pipe.zcard(key)
        # Add new entry (unique member via timestamp + counter)
        member = f"{now}:{id(pipe)}"
        pipe.zadd(key, {member: now})
        # Set expiry to auto-cleanup (window + buffer)
        pipe.expire(key, preset.window_seconds + 10)
        results = await pipe.execute()

        current_count = results[1]  # zcard result (before adding new)

        if current_count >= preset.max_requests:
            # Over limit — remove the entry we just added
            await self._redis.zrem(key, member)
            # Get oldest entry for reset time
            oldest = await self._redis.zrange(key, 0, 0, withscores=True)
            reset_time = oldest[0][1] + preset.window_seconds if oldest else now + preset.window_seconds
            return RateLimitResult(
                allowed=False,
                remaining=0,
                reset_time=reset_time,
                retry_after=max(1, int(reset_time - now)),
            )

        return RateLimitResult(
            allowed=True,
            remaining=preset.max_requests - current_count - 1,
            reset_time=now + preset.window_seconds,
        )

    async def clear(self, identifier: str | None = None) -> None:
        if identifier:
            # Delete all preset keys for this identifier
            for preset in PRESETS.values():
                key = f"ratelimit:{preset.name}:{identifier}"
                await self._redis.delete(key)
        else:
            # Scan and delete all ratelimit keys
            async for key in self._redis.scan_iter("ratelimit:*"):
                await self._redis.delete(key)

    async def stats(self) -> dict:
        count = 0
        total = 0
        async for key in self._redis.scan_iter("ratelimit:*"):
            count += 1
            total += await self._redis.zcard(key)
        return {"backend": "redis", "identifiers": count, "total_requests": total}


# ─── Main Rate Limiter ───────────────────────────────────────────────────────


class RateLimiter:
    """Rate limiter with automatic Redis/in-memory backend selection.

    Tries to connect to Redis on init. Falls back to in-memory if:
    - Redis URL not provided
    - Redis connection fails
    - Redis becomes unavailable during operation

    Thread-safe and async-compatible.
    """

    def __init__(self, redis_url: str | None = None) -> None:
        self._redis_url = redis_url
        self._backend: InMemoryBackend | RedisBackend = InMemoryBackend()
        self._redis_client = None
        self._initialized = False

    async def _init_redis(self) -> bool:
        """Try to connect to Redis. Returns True if successful."""
        if not self._redis_url:
            return False

        try:
            import redis.asyncio as aioredis
            client = aioredis.from_url(
                self._redis_url,
                decode_responses=True,
                socket_connect_timeout=3,
                socket_timeout=3,
            )
            await client.ping()
            self._redis_client = client
            self._backend = RedisBackend(client)
            logger.info("Rate limiter: using Redis backend at %s", self._redis_url)
            return True
        except ImportError:
            logger.warning("Rate limiter: redis package not installed, using in-memory fallback")
            return False
        except Exception as e:
            logger.warning("Rate limiter: Redis unavailable (%s), using in-memory fallback", e)
            return False

    async def check(
        self,
        identifier: str,
        preset: RateLimitPreset | None = None,
    ) -> RateLimitResult:
        """Check if a request is allowed under rate limits."""
        if not self._initialized:
            await self._init_redis()
            self._initialized = True

        if preset is None:
            preset = PRESETS["API"]

        try:
            return await self._backend.check(identifier, preset)
        except Exception as e:
            # If Redis fails mid-operation, fall back to in-memory
            if isinstance(self._backend, RedisBackend):
                logger.error("Redis rate limit failed (%s), falling back to memory", e)
                self._backend = InMemoryBackend()
                return await self._backend.check(identifier, preset)
            raise

    async def clear(self, identifier: str | None = None) -> None:
        """Clear rate limit state."""
        await self._backend.clear(identifier)

    async def stats(self) -> dict:
        """Get rate limiter statistics."""
        return await self._backend.stats()

    async def close(self) -> None:
        """Close Redis connection if open."""
        if self._redis_client:
            await self._redis_client.close()

    @property
    def backend_type(self) -> str:
        return "redis" if isinstance(self._backend, RedisBackend) else "memory"
