"""Pydantic schemas for API request/response validation."""

from __future__ import annotations

from pydantic import BaseModel, Field


# ── Plan schemas ──────────────────────────────────────────────


class CreatePlanRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=100, pattern=r"^[a-z0-9-]+$")
    tier: str = Field(default="free")
    target: str = Field(default="b2b")
    price_monthly: float = Field(default=0.0, ge=0)
    price_yearly: float = Field(default=0.0, ge=0)
    currency: str = Field(default="EUR", min_length=3, max_length=3)
    max_matches_per_month: int = Field(default=0, ge=0)
    max_job_posts: int = Field(default=0, ge=0)
    max_ai_reports: int = Field(default=0, ge=0)
    max_courses: int = Field(default=0, ge=0)
    max_users_per_license: int = Field(default=1, ge=1)
    features: list[str] = Field(default_factory=list)


class PlanResponse(BaseModel):
    id: str
    name: str
    slug: str
    tier: str
    target: str
    price_monthly: float
    price_yearly: float
    currency: str
    features: list[str]
    is_active: bool


# ── Subscription schemas ─────────────────────────────────────


class SubscribeRequest(BaseModel):
    subscriber_id: str = Field(..., min_length=1, max_length=25)
    subscriber_type: str = Field(default="company")
    plan_slug: str = Field(..., min_length=1)
    billing_cycle: str = Field(default="monthly")


class SubscriptionResponse(BaseModel):
    id: str
    subscriber_id: str
    subscriber_type: str
    plan_id: str
    plan_name: str
    status: str
    billing_cycle: str
    current_period_end: str
    is_early_adopter: bool


class CancelSubscriptionRequest(BaseModel):
    reason: str = Field(default="")


class ChangePlanRequest(BaseModel):
    new_plan_slug: str = Field(..., min_length=1)
