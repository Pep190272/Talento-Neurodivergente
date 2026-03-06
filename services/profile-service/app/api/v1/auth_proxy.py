"""Auth proxy — forwards auth requests to auth-service for standalone dev."""

from __future__ import annotations

import httpx
from fastapi import APIRouter, Request, Response
from fastapi.responses import JSONResponse

from app.config import ProfileServiceSettings

router = APIRouter(prefix="/api/v1/auth", tags=["auth-proxy"])

_settings = ProfileServiceSettings()
_AUTH_URL = _settings.AUTH_SERVICE_URL


@router.post("/register")
async def proxy_register(request: Request, response: Response) -> JSONResponse:
    return await _proxy(request, response, "/api/v1/auth/register")


@router.post("/login")
async def proxy_login(request: Request, response: Response) -> JSONResponse:
    return await _proxy(request, response, "/api/v1/auth/login")


@router.post("/logout")
async def proxy_logout(request: Request, response: Response) -> JSONResponse:
    return await _proxy(request, response, "/api/v1/auth/logout")


@router.get("/me")
async def proxy_me(request: Request, response: Response) -> JSONResponse:
    return await _proxy(request, response, "/api/v1/auth/me")


async def _proxy(request: Request, response: Response, path: str) -> JSONResponse:
    """Forward request to auth-service and relay the response."""
    url = f"{_AUTH_URL}{path}"
    headers = {}
    auth_header = request.headers.get("authorization")
    if auth_header:
        headers["Authorization"] = auth_header
    cookie = request.cookies.get("access_token")
    if cookie:
        headers["Cookie"] = f"access_token={cookie}"

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            if request.method == "GET":
                upstream = await client.get(url, headers=headers)
            else:
                body = await request.body()
                headers["Content-Type"] = "application/json"
                upstream = await client.post(url, content=body, headers=headers)
    except httpx.ConnectError:
        return JSONResponse(
            status_code=503,
            content={"detail": "Auth service no disponible. Levanta auth-service en puerto 8001."},
        )

    # Relay Set-Cookie headers from auth-service
    for key, val in upstream.headers.multi_items():
        if key.lower() == "set-cookie":
            response.headers.append("set-cookie", val)

    return JSONResponse(status_code=upstream.status_code, content=upstream.json())
