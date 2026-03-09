-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: 20260309_001_create_saas_bounded_contexts
-- Description: Create tables for 5 new bounded contexts (Subscriptions,
--              Learning, Community, Marketplace, Analytics)
-- Author: DDD-first design — domain models → database tables
-- Date: 2026-03-09
--
-- Conventions (matching existing microservices):
--   - snake_case columns, plural lowercase table names
--   - String(25) CUID-like IDs
--   - DateTime(timezone=True) for all timestamps
--   - Enum types prefixed with schema name
--   - JSON/JSONB for complex nested structures
--   - No cross-schema foreign keys (bounded context isolation)
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ═══════════════════════════════════════════════════════════════════════════
-- SCHEMA 1: SUBSCRIPTIONS
-- Bounded Context: Plans, subscriptions, billing cycles, Stripe integration
-- ═══════════════════════════════════════════════════════════════════════════

-- Enums
CREATE TYPE subscriptions.plan_target AS ENUM ('b2c', 'b2b');
CREATE TYPE subscriptions.plan_tier AS ENUM (
    'free', 'basic', 'pro', 'pro_plus',
    'starter', 'business', 'enterprise'
);
CREATE TYPE subscriptions.billing_cycle AS ENUM ('monthly', 'yearly');
CREATE TYPE subscriptions.subscription_status AS ENUM (
    'trialing', 'active', 'past_due', 'canceled', 'expired'
);
CREATE TYPE subscriptions.subscriber_type AS ENUM ('individual', 'company');
CREATE TYPE subscriptions.invoice_status AS ENUM (
    'draft', 'pending', 'paid', 'failed', 'refunded'
);

-- ─────────────────────────────────────────────────────────────
-- subscriptions.plans — Aggregate Root: Plan
-- ─────────────────────────────────────────────────────────────
CREATE TABLE subscriptions.plans (
    id                  VARCHAR(25) PRIMARY KEY,
    name                VARCHAR(255) NOT NULL,
    slug                VARCHAR(100) NOT NULL UNIQUE,
    tier                subscriptions.plan_tier NOT NULL DEFAULT 'free',
    target              subscriptions.plan_target NOT NULL DEFAULT 'b2b',

    -- Money value object (amount + currency)
    price_monthly       DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    price_yearly        DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    currency            VARCHAR(3) NOT NULL DEFAULT 'EUR',

    -- PlanLimits value object
    max_job_posts       INTEGER NOT NULL DEFAULT 0,
    max_inmails         INTEGER NOT NULL DEFAULT 0,
    max_courses         INTEGER NOT NULL DEFAULT 0,
    max_users_per_license INTEGER NOT NULL DEFAULT 1,

    -- PlanFeature collection (JSON array)
    features            JSONB NOT NULL DEFAULT '[]'::jsonb,

    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX plans_tier_idx ON subscriptions.plans (tier);
CREATE INDEX plans_target_idx ON subscriptions.plans (target);
CREATE INDEX plans_is_active_idx ON subscriptions.plans (is_active);

-- ─────────────────────────────────────────────────────────────
-- subscriptions.subscriptions — Aggregate Root: Subscription
-- References auth.users by subscriber_id (no FK, bounded context isolation)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE subscriptions.subscriptions (
    id                      VARCHAR(25) PRIMARY KEY,
    subscriber_id           VARCHAR(25) NOT NULL,
    subscriber_type         subscriptions.subscriber_type NOT NULL,
    plan_id                 VARCHAR(25) NOT NULL REFERENCES subscriptions.plans(id),

    status                  subscriptions.subscription_status NOT NULL DEFAULT 'trialing',
    billing_cycle           subscriptions.billing_cycle NOT NULL DEFAULT 'monthly',

    current_period_start    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    current_period_end      TIMESTAMP WITH TIME ZONE NOT NULL,

    -- Stripe integration
    stripe_subscription_id  VARCHAR(255) UNIQUE,
    stripe_customer_id      VARCHAR(255),

    -- Cancellation
    canceled_at             TIMESTAMP WITH TIME ZONE,
    cancel_reason           TEXT,

    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX subscriptions_subscriber_idx ON subscriptions.subscriptions (subscriber_id);
CREATE INDEX subscriptions_status_idx ON subscriptions.subscriptions (status);
CREATE INDEX subscriptions_plan_idx ON subscriptions.subscriptions (plan_id);
CREATE UNIQUE INDEX subscriptions_stripe_sub_idx ON subscriptions.subscriptions (stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────
-- subscriptions.invoices — Aggregate Root: Invoice
-- ─────────────────────────────────────────────────────────────
CREATE TABLE subscriptions.invoices (
    id                      VARCHAR(25) PRIMARY KEY,
    subscription_id         VARCHAR(25) NOT NULL REFERENCES subscriptions.subscriptions(id),

    amount                  DECIMAL(10,2) NOT NULL,
    currency                VARCHAR(3) NOT NULL DEFAULT 'EUR',
    status                  subscriptions.invoice_status NOT NULL DEFAULT 'draft',

    -- Stripe integration
    stripe_invoice_id       VARCHAR(255) UNIQUE,
    stripe_payment_intent_id VARCHAR(255),

    -- Billing period
    period_start            TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end              TIMESTAMP WITH TIME ZONE NOT NULL,

    -- Payment lifecycle
    paid_at                 TIMESTAMP WITH TIME ZONE,
    failed_at               TIMESTAMP WITH TIME ZONE,
    failure_reason          TEXT,

    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX invoices_subscription_idx ON subscriptions.invoices (subscription_id);
CREATE INDEX invoices_status_idx ON subscriptions.invoices (status);
CREATE INDEX invoices_period_idx ON subscriptions.invoices (period_start, period_end);


-- ═══════════════════════════════════════════════════════════════════════════
-- SCHEMA 2: LEARNING
-- Bounded Context: Courses, modules, lessons, enrollments, certificates
-- ═══════════════════════════════════════════════════════════════════════════

-- Enums
CREATE TYPE learning.course_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE learning.difficulty AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE learning.access_tier AS ENUM ('free', 'pro', 'pro_plus');
CREATE TYPE learning.content_type AS ENUM ('video', 'text', 'interactive', 'quiz');
CREATE TYPE learning.enrollment_status AS ENUM ('enrolled', 'in_progress', 'completed', 'abandoned');
CREATE TYPE learning.certificate_status AS ENUM ('active', 'revoked');
CREATE TYPE learning.lesson_progress_status AS ENUM ('not_started', 'in_progress', 'completed');

-- ─────────────────────────────────────────────────────────────
-- learning.courses — Aggregate Root: Course
-- ─────────────────────────────────────────────────────────────
CREATE TABLE learning.courses (
    id                          VARCHAR(25) PRIMARY KEY,
    title                       VARCHAR(500) NOT NULL,
    slug                        VARCHAR(255) NOT NULL UNIQUE,
    description                 TEXT NOT NULL DEFAULT '',
    category                    VARCHAR(100) NOT NULL DEFAULT '',

    difficulty                  learning.difficulty NOT NULL DEFAULT 'beginner',
    access_tier                 learning.access_tier NOT NULL DEFAULT 'free',
    status                      learning.course_status NOT NULL DEFAULT 'draft',

    -- Neurodivergent targeting
    target_profiles             TEXT[] NOT NULL DEFAULT '{}',

    estimated_duration_minutes  INTEGER NOT NULL DEFAULT 0,
    author_id                   VARCHAR(25) NOT NULL,

    created_at                  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX courses_status_idx ON learning.courses (status);
CREATE INDEX courses_access_tier_idx ON learning.courses (access_tier);
CREATE INDEX courses_author_idx ON learning.courses (author_id);
CREATE INDEX courses_category_idx ON learning.courses (category);

-- ─────────────────────────────────────────────────────────────
-- learning.modules — Entity: Module (child of Course)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE learning.modules (
    id              VARCHAR(25) PRIMARY KEY,
    course_id       VARCHAR(25) NOT NULL REFERENCES learning.courses(id) ON DELETE CASCADE,
    title           VARCHAR(500) NOT NULL,
    sort_order      INTEGER NOT NULL DEFAULT 0,

    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX modules_course_idx ON learning.modules (course_id);
CREATE INDEX modules_order_idx ON learning.modules (course_id, sort_order);

-- ─────────────────────────────────────────────────────────────
-- learning.lessons — Entity: Lesson (child of Module)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE learning.lessons (
    id                      VARCHAR(25) PRIMARY KEY,
    module_id               VARCHAR(25) NOT NULL REFERENCES learning.modules(id) ON DELETE CASCADE,
    title                   VARCHAR(500) NOT NULL,
    sort_order              INTEGER NOT NULL DEFAULT 0,

    content_type            learning.content_type NOT NULL DEFAULT 'text',
    duration_minutes        INTEGER NOT NULL DEFAULT 0,
    content_url             TEXT,
    content_body            TEXT,

    -- AccessibilityConfig value object (JSON for flexibility)
    accessibility_features  JSONB NOT NULL DEFAULT '{
        "has_captions": false,
        "has_transcript": false,
        "has_audio_description": false,
        "allows_speed_control": false,
        "no_timed_elements": false,
        "high_contrast_available": false
    }'::jsonb,

    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX lessons_module_idx ON learning.lessons (module_id);
CREATE INDEX lessons_order_idx ON learning.lessons (module_id, sort_order);

-- ─────────────────────────────────────────────────────────────
-- learning.enrollments — Aggregate Root: Enrollment
-- ─────────────────────────────────────────────────────────────
CREATE TABLE learning.enrollments (
    id                      VARCHAR(25) PRIMARY KEY,
    user_id                 VARCHAR(25) NOT NULL,
    course_id               VARCHAR(25) NOT NULL REFERENCES learning.courses(id),

    status                  learning.enrollment_status NOT NULL DEFAULT 'enrolled',
    completion_percentage   FLOAT NOT NULL DEFAULT 0.0,

    started_at              TIMESTAMP WITH TIME ZONE,
    completed_at            TIMESTAMP WITH TIME ZONE,

    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    UNIQUE (user_id, course_id)
);

CREATE INDEX enrollments_user_idx ON learning.enrollments (user_id);
CREATE INDEX enrollments_course_idx ON learning.enrollments (course_id);
CREATE INDEX enrollments_status_idx ON learning.enrollments (status);

-- ─────────────────────────────────────────────────────────────
-- learning.lesson_progress — Entity: LessonProgress (child of Enrollment)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE learning.lesson_progress (
    id                  VARCHAR(25) PRIMARY KEY,
    enrollment_id       VARCHAR(25) NOT NULL REFERENCES learning.enrollments(id) ON DELETE CASCADE,
    lesson_id           VARCHAR(25) NOT NULL REFERENCES learning.lessons(id),

    status              learning.lesson_progress_status NOT NULL DEFAULT 'not_started',
    time_spent_seconds  INTEGER NOT NULL DEFAULT 0,
    completed_at        TIMESTAMP WITH TIME ZONE,

    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    UNIQUE (enrollment_id, lesson_id)
);

CREATE INDEX lesson_progress_enrollment_idx ON learning.lesson_progress (enrollment_id);

-- ─────────────────────────────────────────────────────────────
-- learning.certificates — Aggregate Root: Certificate
-- ─────────────────────────────────────────────────────────────
CREATE TABLE learning.certificates (
    id                  VARCHAR(25) PRIMARY KEY,
    user_id             VARCHAR(25) NOT NULL,
    course_id           VARCHAR(25) NOT NULL REFERENCES learning.courses(id),
    enrollment_id       VARCHAR(25) NOT NULL REFERENCES learning.enrollments(id),

    verification_code   VARCHAR(50) NOT NULL UNIQUE,
    status              learning.certificate_status NOT NULL DEFAULT 'active',
    issued_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX certificates_user_idx ON learning.certificates (user_id);
CREATE INDEX certificates_course_idx ON learning.certificates (course_id);
CREATE UNIQUE INDEX certificates_verification_idx ON learning.certificates (verification_code);


-- ═══════════════════════════════════════════════════════════════════════════
-- SCHEMA 3: COMMUNITY
-- Bounded Context: Groups, posts, comments, memberships, events
-- ═══════════════════════════════════════════════════════════════════════════

-- Enums
CREATE TYPE community.group_visibility AS ENUM ('public', 'private', 'hidden');
CREATE TYPE community.group_status AS ENUM ('active', 'archived', 'suspended');
CREATE TYPE community.post_status AS ENUM ('published', 'hidden', 'deleted');
CREATE TYPE community.post_content_type AS ENUM ('text', 'link', 'poll');
CREATE TYPE community.comment_status AS ENUM ('published', 'hidden', 'deleted');
CREATE TYPE community.membership_role AS ENUM ('member', 'moderator', 'owner');
CREATE TYPE community.membership_status AS ENUM ('active', 'muted', 'banned');
CREATE TYPE community.event_type AS ENUM ('webinar', 'workshop', 'meetup', 'ama');
CREATE TYPE community.event_status AS ENUM ('draft', 'published', 'live', 'completed', 'canceled');

-- ─────────────────────────────────────────────────────────────
-- community.groups — Aggregate Root: Group
-- ─────────────────────────────────────────────────────────────
CREATE TABLE community.groups (
    id              VARCHAR(25) PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) NOT NULL UNIQUE,
    description     TEXT NOT NULL DEFAULT '',
    category        VARCHAR(100) NOT NULL DEFAULT '',

    visibility      community.group_visibility NOT NULL DEFAULT 'public',
    status          community.group_status NOT NULL DEFAULT 'active',
    owner_id        VARCHAR(25) NOT NULL,
    moderator_ids   TEXT[] NOT NULL DEFAULT '{}',

    member_count    INTEGER NOT NULL DEFAULT 0,
    rules           TEXT NOT NULL DEFAULT '',

    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX groups_status_idx ON community.groups (status);
CREATE INDEX groups_visibility_idx ON community.groups (visibility);
CREATE INDEX groups_owner_idx ON community.groups (owner_id);
CREATE INDEX groups_category_idx ON community.groups (category);

-- ─────────────────────────────────────────────────────────────
-- community.posts — Aggregate Root: Post
-- ─────────────────────────────────────────────────────────────
CREATE TABLE community.posts (
    id              VARCHAR(25) PRIMARY KEY,
    group_id        VARCHAR(25) NOT NULL REFERENCES community.groups(id) ON DELETE CASCADE,
    author_id       VARCHAR(25) NOT NULL,

    title           VARCHAR(500) NOT NULL DEFAULT '',
    content         TEXT NOT NULL DEFAULT '',
    content_type    community.post_content_type NOT NULL DEFAULT 'text',

    status          community.post_status NOT NULL DEFAULT 'published',
    pinned          BOOLEAN NOT NULL DEFAULT FALSE,

    -- Denormalized reaction counts for read performance
    reaction_counts JSONB NOT NULL DEFAULT '{}'::jsonb,
    comment_count   INTEGER NOT NULL DEFAULT 0,

    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX posts_group_idx ON community.posts (group_id);
CREATE INDEX posts_author_idx ON community.posts (author_id);
CREATE INDEX posts_status_idx ON community.posts (status);
CREATE INDEX posts_pinned_idx ON community.posts (group_id, pinned) WHERE pinned = TRUE;
CREATE INDEX posts_created_idx ON community.posts (created_at DESC);

-- ─────────────────────────────────────────────────────────────
-- community.comments — Separate Aggregate (high volume)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE community.comments (
    id                  VARCHAR(25) PRIMARY KEY,
    post_id             VARCHAR(25) NOT NULL REFERENCES community.posts(id) ON DELETE CASCADE,
    author_id           VARCHAR(25) NOT NULL,
    parent_comment_id   VARCHAR(25) REFERENCES community.comments(id) ON DELETE CASCADE,

    content             TEXT NOT NULL DEFAULT '',
    status              community.comment_status NOT NULL DEFAULT 'published',

    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX comments_post_idx ON community.comments (post_id);
CREATE INDEX comments_author_idx ON community.comments (author_id);
CREATE INDEX comments_parent_idx ON community.comments (parent_comment_id) WHERE parent_comment_id IS NOT NULL;
CREATE INDEX comments_created_idx ON community.comments (created_at DESC);

-- ─────────────────────────────────────────────────────────────
-- community.memberships — Aggregate Root: Membership
-- ─────────────────────────────────────────────────────────────
CREATE TABLE community.memberships (
    id              VARCHAR(25) PRIMARY KEY,
    user_id         VARCHAR(25) NOT NULL,
    group_id        VARCHAR(25) NOT NULL REFERENCES community.groups(id) ON DELETE CASCADE,

    role            community.membership_role NOT NULL DEFAULT 'member',
    status          community.membership_status NOT NULL DEFAULT 'active',
    joined_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    muted_until     TIMESTAMP WITH TIME ZONE,

    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    UNIQUE (user_id, group_id)
);

CREATE INDEX memberships_user_idx ON community.memberships (user_id);
CREATE INDEX memberships_group_idx ON community.memberships (group_id);
CREATE INDEX memberships_status_idx ON community.memberships (status);

-- ─────────────────────────────────────────────────────────────
-- community.events — Aggregate Root: Event
-- ─────────────────────────────────────────────────────────────
CREATE TABLE community.events (
    id                  VARCHAR(25) PRIMARY KEY,
    group_id            VARCHAR(25) NOT NULL REFERENCES community.groups(id) ON DELETE CASCADE,
    organizer_id        VARCHAR(25) NOT NULL,

    title               VARCHAR(500) NOT NULL,
    description         TEXT NOT NULL DEFAULT '',
    event_type          community.event_type NOT NULL DEFAULT 'webinar',

    starts_at           TIMESTAMP WITH TIME ZONE NOT NULL,
    ends_at             TIMESTAMP WITH TIME ZONE NOT NULL,
    timezone            VARCHAR(50) NOT NULL DEFAULT 'Europe/Madrid',

    max_attendees       INTEGER,
    current_attendees   INTEGER NOT NULL DEFAULT 0,
    meeting_url         TEXT,

    status              community.event_status NOT NULL DEFAULT 'draft',

    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX events_group_idx ON community.events (group_id);
CREATE INDEX events_organizer_idx ON community.events (organizer_id);
CREATE INDEX events_status_idx ON community.events (status);
CREATE INDEX events_starts_idx ON community.events (starts_at);


-- ═══════════════════════════════════════════════════════════════════════════
-- SCHEMA 4: MARKETPLACE
-- Bounded Context: Providers, services, bookings, reviews
-- ═══════════════════════════════════════════════════════════════════════════

-- Enums
CREATE TYPE marketplace.provider_type AS ENUM ('coach', 'therapist', 'consultant', 'bootcamp', 'tool');
CREATE TYPE marketplace.verification_status AS ENUM ('pending', 'verified', 'rejected', 'suspended');
CREATE TYPE marketplace.service_type AS ENUM ('one_time', 'package', 'subscription');
CREATE TYPE marketplace.service_status AS ENUM ('draft', 'active', 'paused', 'archived');
CREATE TYPE marketplace.booking_status AS ENUM (
    'pending', 'confirmed', 'in_progress', 'completed', 'canceled', 'disputed'
);
CREATE TYPE marketplace.review_status AS ENUM ('published', 'hidden', 'flagged');

-- ─────────────────────────────────────────────────────────────
-- marketplace.providers — Aggregate Root: Provider
-- ─────────────────────────────────────────────────────────────
CREATE TABLE marketplace.providers (
    id                      VARCHAR(25) PRIMARY KEY,
    user_id                 VARCHAR(25) NOT NULL UNIQUE,
    name                    VARCHAR(255) NOT NULL,
    bio                     TEXT NOT NULL DEFAULT '',
    slug                    VARCHAR(255) NOT NULL UNIQUE,

    provider_type           marketplace.provider_type NOT NULL,
    specializations         TEXT[] NOT NULL DEFAULT '{}',
    verification_status     marketplace.verification_status NOT NULL DEFAULT 'pending',

    -- Rating value object (denormalized for read performance)
    rating_average          FLOAT NOT NULL DEFAULT 0.0,
    rating_count            INTEGER NOT NULL DEFAULT 0,

    portfolio_url           TEXT,
    contact_email           VARCHAR(255),

    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX providers_user_idx ON marketplace.providers (user_id);
CREATE INDEX providers_type_idx ON marketplace.providers (provider_type);
CREATE INDEX providers_verification_idx ON marketplace.providers (verification_status);
CREATE INDEX providers_rating_idx ON marketplace.providers (rating_average DESC);

-- ─────────────────────────────────────────────────────────────
-- marketplace.services — Aggregate Root: Service
-- ─────────────────────────────────────────────────────────────
CREATE TABLE marketplace.services (
    id                  VARCHAR(25) PRIMARY KEY,
    provider_id         VARCHAR(25) NOT NULL REFERENCES marketplace.providers(id),

    title               VARCHAR(500) NOT NULL,
    description         TEXT NOT NULL DEFAULT '',
    category            VARCHAR(100) NOT NULL DEFAULT '',

    service_type        marketplace.service_type NOT NULL DEFAULT 'one_time',
    status              marketplace.service_status NOT NULL DEFAULT 'draft',

    -- Money value object
    price               DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    currency            VARCHAR(3) NOT NULL DEFAULT 'EUR',

    duration_minutes    INTEGER,
    max_capacity        INTEGER,

    -- Neurodivergent targeting
    target_profiles     TEXT[] NOT NULL DEFAULT '{}',

    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX services_provider_idx ON marketplace.services (provider_id);
CREATE INDEX services_status_idx ON marketplace.services (status);
CREATE INDEX services_category_idx ON marketplace.services (category);
CREATE INDEX services_type_idx ON marketplace.services (service_type);

-- ─────────────────────────────────────────────────────────────
-- marketplace.bookings — Aggregate Root: Booking
-- ─────────────────────────────────────────────────────────────
CREATE TABLE marketplace.bookings (
    id                  VARCHAR(25) PRIMARY KEY,
    service_id          VARCHAR(25) NOT NULL REFERENCES marketplace.services(id),
    provider_id         VARCHAR(25) NOT NULL REFERENCES marketplace.providers(id),
    client_id           VARCHAR(25) NOT NULL,

    status              marketplace.booking_status NOT NULL DEFAULT 'pending',
    scheduled_at        TIMESTAMP WITH TIME ZONE,
    completed_at        TIMESTAMP WITH TIME ZONE,

    -- Money value objects
    amount              DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    platform_fee        DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    provider_payout     DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    currency            VARCHAR(3) NOT NULL DEFAULT 'EUR',

    -- Cancellation
    cancellation_reason TEXT,
    canceled_by         VARCHAR(25),

    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX bookings_service_idx ON marketplace.bookings (service_id);
CREATE INDEX bookings_provider_idx ON marketplace.bookings (provider_id);
CREATE INDEX bookings_client_idx ON marketplace.bookings (client_id);
CREATE INDEX bookings_status_idx ON marketplace.bookings (status);
CREATE INDEX bookings_scheduled_idx ON marketplace.bookings (scheduled_at);

-- ─────────────────────────────────────────────────────────────
-- marketplace.reviews — Aggregate Root: Review
-- ─────────────────────────────────────────────────────────────
CREATE TABLE marketplace.reviews (
    id              VARCHAR(25) PRIMARY KEY,
    booking_id      VARCHAR(25) NOT NULL UNIQUE REFERENCES marketplace.bookings(id),
    reviewer_id     VARCHAR(25) NOT NULL,
    provider_id     VARCHAR(25) NOT NULL REFERENCES marketplace.providers(id),

    rating          INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content         TEXT NOT NULL DEFAULT '',
    status          marketplace.review_status NOT NULL DEFAULT 'published',

    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX reviews_provider_idx ON marketplace.reviews (provider_id);
CREATE INDEX reviews_reviewer_idx ON marketplace.reviews (reviewer_id);
CREATE INDEX reviews_status_idx ON marketplace.reviews (status);
CREATE INDEX reviews_rating_idx ON marketplace.reviews (provider_id, rating);


-- ═══════════════════════════════════════════════════════════════════════════
-- SCHEMA 5: ANALYTICS
-- Bounded Context: Platform metrics, DEI reports, usage tracking
-- ═══════════════════════════════════════════════════════════════════════════

-- Enums
CREATE TYPE analytics.metric_type AS ENUM (
    'platform', 'company', 'candidate_pool', 'matching', 'learning'
);
CREATE TYPE analytics.metric_period AS ENUM (
    'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
);
CREATE TYPE analytics.report_type AS ENUM (
    'diversity_snapshot', 'esg_csrd', 'neuroinclusion_score', 'hiring_funnel'
);
CREATE TYPE analytics.report_status AS ENUM ('generating', 'ready', 'exported');
CREATE TYPE analytics.actor_type AS ENUM ('user', 'company', 'system');

-- ─────────────────────────────────────────────────────────────
-- analytics.metric_snapshots — Aggregate Root: MetricSnapshot
-- ─────────────────────────────────────────────────────────────
CREATE TABLE analytics.metric_snapshots (
    id              VARCHAR(25) PRIMARY KEY,
    metric_type     analytics.metric_type NOT NULL,
    period          analytics.metric_period NOT NULL DEFAULT 'daily',

    period_start    TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end      TIMESTAMP WITH TIME ZONE NOT NULL,

    -- Flexible aggregated data
    dimensions      JSONB NOT NULL DEFAULT '{}'::jsonb,

    computed_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX metric_snapshots_type_idx ON analytics.metric_snapshots (metric_type);
CREATE INDEX metric_snapshots_period_idx ON analytics.metric_snapshots (period);
CREATE INDEX metric_snapshots_range_idx ON analytics.metric_snapshots (period_start, period_end);
CREATE INDEX metric_snapshots_computed_idx ON analytics.metric_snapshots (computed_at);

-- ─────────────────────────────────────────────────────────────
-- analytics.dei_reports — Aggregate Root: DeiReport
-- ─────────────────────────────────────────────────────────────
CREATE TABLE analytics.dei_reports (
    id              VARCHAR(25) PRIMARY KEY,
    company_id      VARCHAR(25) NOT NULL,
    report_type     analytics.report_type NOT NULL,

    period_start    TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end      TIMESTAMP WITH TIME ZONE NOT NULL,

    -- ReportData value object (structured metrics)
    data            JSONB NOT NULL DEFAULT '{
        "metrics": {},
        "breakdowns": {},
        "comparisons": {}
    }'::jsonb,

    status          analytics.report_status NOT NULL DEFAULT 'generating',
    generated_at    TIMESTAMP WITH TIME ZONE,
    exported_at     TIMESTAMP WITH TIME ZONE,
    export_format   VARCHAR(20),

    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX dei_reports_company_idx ON analytics.dei_reports (company_id);
CREATE INDEX dei_reports_type_idx ON analytics.dei_reports (report_type);
CREATE INDEX dei_reports_status_idx ON analytics.dei_reports (status);
CREATE INDEX dei_reports_period_idx ON analytics.dei_reports (period_start, period_end);

-- ─────────────────────────────────────────────────────────────
-- analytics.usage_events — Aggregate Root: UsageEvent (append-only)
-- Immutable event log — no UPDATE allowed by convention
-- ─────────────────────────────────────────────────────────────
CREATE TABLE analytics.usage_events (
    id              VARCHAR(25) PRIMARY KEY,
    actor_id        VARCHAR(25) NOT NULL,
    actor_type      analytics.actor_type NOT NULL DEFAULT 'user',

    event_type      VARCHAR(100) NOT NULL,
    resource_type   VARCHAR(100),
    resource_id     VARCHAR(25),

    metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
    occurred_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Optimized for time-series queries
CREATE INDEX usage_events_actor_idx ON analytics.usage_events (actor_id);
CREATE INDEX usage_events_type_idx ON analytics.usage_events (event_type);
CREATE INDEX usage_events_occurred_idx ON analytics.usage_events (occurred_at DESC);
CREATE INDEX usage_events_resource_idx ON analytics.usage_events (resource_type, resource_id) WHERE resource_id IS NOT NULL;

-- Composite for dashboard queries: "events by actor in time range"
CREATE INDEX usage_events_actor_time_idx ON analytics.usage_events (actor_id, occurred_at DESC);


COMMIT;
