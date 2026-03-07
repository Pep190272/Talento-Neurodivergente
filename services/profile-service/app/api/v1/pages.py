"""HTML page routes served via Jinja2 templates."""

from __future__ import annotations

from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

router = APIRouter(tags=["pages"])

templates = Jinja2Templates(directory="app/templates")


@router.get("/", response_class=HTMLResponse)
async def home(request: Request) -> HTMLResponse:
    return templates.TemplateResponse("pages/home.html", {"request": request})


@router.get("/para-candidatos", response_class=HTMLResponse)
async def para_candidatos(request: Request) -> HTMLResponse:
    return templates.TemplateResponse("pages/para-candidatos.html", {"request": request})


@router.get("/para-empresas", response_class=HTMLResponse)
async def para_empresas(request: Request) -> HTMLResponse:
    return templates.TemplateResponse("pages/para-empresas.html", {"request": request})


@router.get("/para-terapeutas", response_class=HTMLResponse)
async def para_terapeutas(request: Request) -> HTMLResponse:
    return templates.TemplateResponse("pages/para-terapeutas.html", {"request": request})


@router.get("/about", response_class=HTMLResponse)
async def about(request: Request) -> HTMLResponse:
    return templates.TemplateResponse("pages/about.html", {"request": request})


@router.get("/faq", response_class=HTMLResponse)
async def faq(request: Request) -> HTMLResponse:
    return templates.TemplateResponse("pages/faq.html", {"request": request})


@router.get("/login", response_class=HTMLResponse)
async def login(request: Request) -> HTMLResponse:
    return templates.TemplateResponse("pages/login.html", {"request": request})


@router.get("/register", response_class=HTMLResponse)
async def register(request: Request) -> HTMLResponse:
    return templates.TemplateResponse("pages/register.html", {"request": request})


@router.get("/dashboard", response_class=HTMLResponse)
async def dashboard(request: Request) -> HTMLResponse:
    return templates.TemplateResponse("pages/dashboard.html", {"request": request})


@router.get("/forms", response_class=HTMLResponse)
async def forms(request: Request) -> HTMLResponse:
    return templates.TemplateResponse("pages/forms.html", {"request": request})


@router.get("/quiz", response_class=HTMLResponse)
async def quiz(request: Request) -> HTMLResponse:
    return templates.TemplateResponse("pages/quiz.html", {"request": request})


@router.get("/games", response_class=HTMLResponse)
async def games(request: Request) -> HTMLResponse:
    return templates.TemplateResponse("pages/games.html", {"request": request})


@router.get("/inclusivity", response_class=HTMLResponse)
async def inclusivity(request: Request) -> HTMLResponse:
    return templates.TemplateResponse("pages/inclusivity.html", {"request": request})
