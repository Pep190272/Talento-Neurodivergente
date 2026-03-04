FROM python:3.11-slim AS base

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy shared kernel first (for layer caching)
COPY ../shared /shared
RUN pip install --no-cache-dir /shared

# Copy service dependencies
COPY pyproject.toml .
RUN pip install --no-cache-dir .

# Copy application code
COPY app/ app/

EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
