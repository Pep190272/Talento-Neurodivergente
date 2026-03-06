FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Install shared kernel
COPY shared/ /tmp/shared/
RUN pip install --no-cache-dir /tmp/shared/ && rm -rf /tmp/shared/

# Install service dependencies
COPY profile-service/pyproject.toml .
RUN pip install --no-cache-dir .

# Copy application code (includes templates and static)
COPY profile-service/app/ ./app/

# Copy Alembic config and migrations
COPY profile-service/alembic.ini .
COPY profile-service/alembic/ ./alembic/

EXPOSE 8002

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:8002/health || exit 1

CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8002"]
