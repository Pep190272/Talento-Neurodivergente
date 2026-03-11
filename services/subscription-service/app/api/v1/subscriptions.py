"""Subscription API endpoints — v1."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_plan_repo, get_subscription_repo
from app.api.schemas import (
    CancelSubscriptionRequest,
    ChangePlanRequest,
    CreatePlanRequest,
    PlanResponse,
    SubscribeRequest,
    SubscriptionResponse,
)
from app.application.dto.subscription_dto import (
    CancelSubscriptionDTO,
    ChangePlanDTO,
    CreatePlanDTO,
    SubscribeDTO,
)
from app.application.use_cases.cancel_subscription import CancelSubscriptionUseCase
from app.application.use_cases.change_plan import ChangePlanUseCase
from app.application.use_cases.create_plan import CreatePlanUseCase, DuplicatePlanSlugError
from app.application.use_cases.get_subscription import GetSubscriptionUseCase
from app.application.use_cases.list_plans import ListPlansUseCase
from app.application.use_cases.subscribe import SubscribeUseCase
from app.domain.entities.plan import PlanNotFoundError, PlanValidationError
from app.domain.entities.subscription import (
    DuplicateSubscriptionError,
    SubscriptionNotFoundError,
    SubscriptionStateError,
    SubscriptionValidationError,
)

router = APIRouter()


# ── Plans ─────────────────────────────────────────────────────


@router.post("/plans", response_model=PlanResponse, status_code=201)
async def create_plan(
    body: CreatePlanRequest,
    plan_repo=Depends(get_plan_repo),
):
    """Create a new subscription plan (admin)."""
    dto = CreatePlanDTO(
        name=body.name,
        slug=body.slug,
        tier=body.tier,
        target=body.target,
        price_monthly=body.price_monthly,
        price_yearly=body.price_yearly,
        currency=body.currency,
        max_matches_per_month=body.max_matches_per_month,
        max_job_posts=body.max_job_posts,
        max_ai_reports=body.max_ai_reports,
        max_courses=body.max_courses,
        max_users_per_license=body.max_users_per_license,
        features=body.features,
    )
    try:
        uc = CreatePlanUseCase(plan_repo=plan_repo)
        result = await uc.execute(dto)
    except DuplicatePlanSlugError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except (PlanValidationError, ValueError) as e:
        raise HTTPException(status_code=422, detail=str(e))

    return PlanResponse(**result.__dict__)


@router.get("/plans", response_model=list[PlanResponse])
async def list_plans(
    target: str | None = None,
    plan_repo=Depends(get_plan_repo),
):
    """List all active subscription plans."""
    try:
        uc = ListPlansUseCase(plan_repo=plan_repo)
        results = await uc.execute(target=target)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return [PlanResponse(**r.__dict__) for r in results]


# ── Subscriptions ─────────────────────────────────────────────


@router.post("/subscriptions", response_model=SubscriptionResponse, status_code=201)
async def subscribe(
    body: SubscribeRequest,
    plan_repo=Depends(get_plan_repo),
    sub_repo=Depends(get_subscription_repo),
):
    """Subscribe a user/company to a plan."""
    dto = SubscribeDTO(
        subscriber_id=body.subscriber_id,
        subscriber_type=body.subscriber_type,
        plan_slug=body.plan_slug,
        billing_cycle=body.billing_cycle,
    )
    try:
        uc = SubscribeUseCase(plan_repo=plan_repo, subscription_repo=sub_repo)
        result = await uc.execute(dto)
    except PlanNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except DuplicateSubscriptionError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except (SubscriptionValidationError, ValueError) as e:
        raise HTTPException(status_code=422, detail=str(e))

    return SubscriptionResponse(**result.__dict__)


@router.get("/subscriptions/{subscriber_id}", response_model=SubscriptionResponse)
async def get_subscription(
    subscriber_id: str,
    plan_repo=Depends(get_plan_repo),
    sub_repo=Depends(get_subscription_repo),
):
    """Get current subscription for a subscriber."""
    try:
        uc = GetSubscriptionUseCase(plan_repo=plan_repo, subscription_repo=sub_repo)
        result = await uc.execute(subscriber_id)
    except SubscriptionNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

    return SubscriptionResponse(**result.__dict__)


@router.post("/subscriptions/{subscription_id}/cancel", response_model=SubscriptionResponse)
async def cancel_subscription(
    subscription_id: str,
    body: CancelSubscriptionRequest | None = None,
    sub_repo=Depends(get_subscription_repo),
):
    """Cancel a subscription."""
    dto = CancelSubscriptionDTO(
        subscription_id=subscription_id,
        reason=body.reason if body else "",
    )
    try:
        uc = CancelSubscriptionUseCase(subscription_repo=sub_repo)
        result = await uc.execute(dto)
    except SubscriptionNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except SubscriptionStateError as e:
        raise HTTPException(status_code=409, detail=str(e))

    return SubscriptionResponse(**result.__dict__)


@router.post("/subscriptions/{subscriber_id}/change-plan", response_model=SubscriptionResponse)
async def change_plan(
    subscriber_id: str,
    body: ChangePlanRequest,
    plan_repo=Depends(get_plan_repo),
    sub_repo=Depends(get_subscription_repo),
):
    """Change subscription plan (upgrade/downgrade)."""
    dto = ChangePlanDTO(
        subscriber_id=subscriber_id,
        new_plan_slug=body.new_plan_slug,
    )
    try:
        uc = ChangePlanUseCase(plan_repo=plan_repo, subscription_repo=sub_repo)
        result = await uc.execute(dto)
    except SubscriptionNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PlanNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

    return SubscriptionResponse(**result.__dict__)
