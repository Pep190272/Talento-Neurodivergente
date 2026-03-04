FROM python:3.11-slim AS base

WORKDIR /app

COPY shared/ /tmp/shared/
RUN pip install --no-cache-dir /tmp/shared/ && rm -rf /tmp/shared/

COPY matching-service/pyproject.toml .
RUN pip install --no-cache-dir .

COPY matching-service/ .

EXPOSE 8003

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:8003/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8003"]
