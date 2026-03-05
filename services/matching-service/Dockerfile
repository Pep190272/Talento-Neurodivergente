FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Install shared kernel
COPY shared/ /tmp/shared/
RUN pip install --no-cache-dir /tmp/shared/ && rm -rf /tmp/shared/

# Install service dependencies
COPY matching-service/pyproject.toml .
RUN pip install --no-cache-dir .

# Copy application code
COPY matching-service/app/ ./app/

# Copy Alembic config and migrations
COPY matching-service/alembic.ini .
COPY matching-service/alembic/ ./alembic/

EXPOSE 8003

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:8003/health || exit 1

CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8003"]
