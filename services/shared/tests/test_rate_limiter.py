"""Unit tests for shared rate limiter (in-memory backend)."""

import pytest

from shared.rate_limiter import (
    InMemoryBackend,
    PRESETS,
    RateLimitPreset,
    RateLimiter,
)


@pytest.fixture
def backend():
    return InMemoryBackend()


@pytest.fixture
def strict_preset():
    return RateLimitPreset(window_seconds=60, max_requests=3, name="test")


class TestInMemoryBackend:
    @pytest.mark.asyncio
    async def test_allows_within_limit(self, backend, strict_preset):
        r1 = await backend.check("user-1", strict_preset)
        assert r1.allowed is True
        assert r1.remaining == 2

    @pytest.mark.asyncio
    async def test_blocks_over_limit(self, backend, strict_preset):
        for _ in range(3):
            await backend.check("user-1", strict_preset)

        result = await backend.check("user-1", strict_preset)
        assert result.allowed is False
        assert result.remaining == 0
        assert result.retry_after > 0

    @pytest.mark.asyncio
    async def test_different_identifiers_independent(self, backend, strict_preset):
        for _ in range(3):
            await backend.check("user-1", strict_preset)

        result = await backend.check("user-2", strict_preset)
        assert result.allowed is True

    @pytest.mark.asyncio
    async def test_clear_specific_identifier(self, backend, strict_preset):
        for _ in range(3):
            await backend.check("user-1", strict_preset)

        await backend.clear("user-1")
        result = await backend.check("user-1", strict_preset)
        assert result.allowed is True

    @pytest.mark.asyncio
    async def test_clear_all(self, backend, strict_preset):
        await backend.check("user-1", strict_preset)
        await backend.check("user-2", strict_preset)
        await backend.clear()

        stats = await backend.stats()
        assert stats["identifiers"] == 0

    @pytest.mark.asyncio
    async def test_stats(self, backend, strict_preset):
        await backend.check("user-1", strict_preset)
        await backend.check("user-1", strict_preset)
        await backend.check("user-2", strict_preset)

        stats = await backend.stats()
        assert stats["backend"] == "memory"
        assert stats["identifiers"] == 2
        assert stats["total_requests"] == 3

    @pytest.mark.asyncio
    async def test_remaining_decrements(self, backend, strict_preset):
        r1 = await backend.check("user-1", strict_preset)
        assert r1.remaining == 2

        r2 = await backend.check("user-1", strict_preset)
        assert r2.remaining == 1

        r3 = await backend.check("user-1", strict_preset)
        assert r3.remaining == 0


class TestRateLimiter:
    @pytest.mark.asyncio
    async def test_defaults_to_memory_backend(self):
        limiter = RateLimiter()
        result = await limiter.check("test-user")
        assert result.allowed is True
        assert limiter.backend_type == "memory"

    @pytest.mark.asyncio
    async def test_uses_default_preset(self):
        limiter = RateLimiter()
        result = await limiter.check("test-user")
        # Default is API preset (60 req/min)
        assert result.remaining == 59

    @pytest.mark.asyncio
    async def test_custom_preset(self):
        limiter = RateLimiter()
        preset = RateLimitPreset(window_seconds=60, max_requests=2, name="custom")
        await limiter.check("u1", preset)
        await limiter.check("u1", preset)
        result = await limiter.check("u1", preset)
        assert result.allowed is False

    @pytest.mark.asyncio
    async def test_presets_available(self):
        assert "AUTH" in PRESETS
        assert "API" in PRESETS
        assert "READ" in PRESETS
        assert "WRITE" in PRESETS
        assert "LLM" in PRESETS
        assert PRESETS["AUTH"].max_requests == 5
        assert PRESETS["LLM"].max_requests == 10

    @pytest.mark.asyncio
    async def test_invalid_redis_falls_back(self):
        limiter = RateLimiter(redis_url="redis://nonexistent:9999")
        result = await limiter.check("user-1")
        assert result.allowed is True
        assert limiter.backend_type == "memory"

    @pytest.mark.asyncio
    async def test_close_without_redis(self):
        limiter = RateLimiter()
        await limiter.close()  # Should not raise
