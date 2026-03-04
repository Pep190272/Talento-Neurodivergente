FROM python:3.11-slim

WORKDIR /app

# Install shared kernel first
COPY shared/ /tmp/shared/
RUN pip install --no-cache-dir /tmp/shared/

# Install service dependencies
COPY profile-service/pyproject.toml .
RUN pip install --no-cache-dir -e .

# Copy service code
COPY profile-service/app/ ./app/

EXPOSE 8002

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:8002/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8002"]
