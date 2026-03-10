FROM python:3.11-slim

WORKDIR /app
ENV PYTHONPATH=/app

RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Install shared kernel
COPY shared/ /tmp/shared/
RUN pip install --no-cache-dir /tmp/shared/ && rm -rf /tmp/shared/

# Install service dependencies
COPY intelligence-service/pyproject.toml .
RUN pip install --no-cache-dir .

# Copy application code
COPY intelligence-service/app/ ./app/

# Copy Alembic config and migrations
COPY intelligence-service/alembic.ini .
COPY intelligence-service/alembic/ ./alembic/

EXPOSE 8004

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:8004/health || exit 1

CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8004"]
