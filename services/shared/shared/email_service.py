"""Shared email service for DiversIA microservices.

Uses aiosmtplib for async SMTP delivery with graceful fallback
(logs instead of crashing if SMTP is not configured).
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from email.message import EmailMessage

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class EmailConfig:
    """SMTP connection parameters."""

    host: str = "smtp.gmail.com"
    port: int = 587
    user: str = ""
    password: str = ""
    from_addr: str = "no-reply@diversia.click"
    from_name: str = "DiversIA"

    @property
    def is_configured(self) -> bool:
        return bool(self.user and self.password)


async def send_email(
    *,
    config: EmailConfig,
    to: str,
    subject: str,
    html_body: str,
    text_body: str | None = None,
) -> bool:
    """Send an email asynchronously. Returns True on success, False on failure.

    Never raises — logs errors instead so callers (registration, etc.)
    don't fail just because email delivery is down.
    """
    if not config.is_configured:
        logger.warning(
            "SMTP not configured (SMTP_USER/SMTP_PASSWORD empty). "
            "Skipping email to %s: %s",
            to,
            subject,
        )
        return False

    try:
        import aiosmtplib  # noqa: lazy import so services without aiosmtplib still work
    except ImportError:
        logger.warning(
            "aiosmtplib not installed — cannot send email to %s. "
            "Install with: pip install aiosmtplib",
            to,
        )
        return False

    msg = EmailMessage()
    msg["From"] = f"{config.from_name} <{config.from_addr}>"
    msg["To"] = to
    msg["Subject"] = subject

    if text_body:
        msg.set_content(text_body)
        msg.add_alternative(html_body, subtype="html")
    else:
        msg.set_content(html_body, subtype="html")

    try:
        await aiosmtplib.send(
            msg,
            hostname=config.host,
            port=config.port,
            start_tls=True,
            username=config.user,
            password=config.password,
        )
        logger.info("Email sent to %s: %s", to, subject)
        return True
    except Exception:
        logger.exception("Failed to send email to %s: %s", to, subject)
        return False


# ── Email templates ──────────────────────────────────────────────────────


def build_welcome_email(*, user_name: str, user_role: str) -> tuple[str, str, str]:
    """Return (subject, html_body, text_body) for the welcome email."""
    role_labels = {
        "candidate": "Candidato/a",
        "company": "Empresa",
        "therapist": "Terapeuta",
    }
    role_label = role_labels.get(user_role, user_role.capitalize())

    subject = f"Bienvenido/a a DiversIA, {user_name}!"

    html_body = f"""\
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Roboto,Arial,sans-serif;background:#f4f7fa;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 24px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:28px;">DiversIA</h1>
      <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Talento neurodivergente, oportunidades reales</p>
    </div>
    <!-- Body -->
    <div style="padding:32px 24px;">
      <h2 style="color:#1e293b;margin:0 0 16px;">Hola {user_name},</h2>
      <p style="color:#475569;line-height:1.6;">
        Tu cuenta como <strong>{role_label}</strong> ha sido creada correctamente.
        Ya puedes acceder a tu panel y empezar a explorar todas las funcionalidades de DiversIA.
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="https://diversia.click/dashboard"
           style="display:inline-block;background:#6366f1;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
          Ir a mi panel
        </a>
      </div>
      <p style="color:#64748b;font-size:13px;line-height:1.5;">
        Si tienes preguntas, responde a este correo o visita nuestra
        <a href="https://diversia.click/faq" style="color:#6366f1;">seccion de ayuda</a>.
      </p>
    </div>
    <!-- Footer -->
    <div style="background:#f8fafc;padding:16px 24px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="color:#94a3b8;font-size:12px;margin:0;">
        &copy; 2026 DiversIA &mdash; Todos los derechos reservados.
      </p>
    </div>
  </div>
</body>
</html>"""

    text_body = (
        f"Hola {user_name},\n\n"
        f"Tu cuenta como {role_label} ha sido creada correctamente en DiversIA.\n"
        f"Accede a tu panel en: https://diversia.click/dashboard\n\n"
        f"-- Equipo DiversIA"
    )

    return subject, html_body, text_body


def build_admin_notification_email(
    *, user_name: str, user_email: str, user_role: str,
) -> tuple[str, str, str]:
    """Return (subject, html_body, text_body) to notify admins of a new registration."""
    role_labels = {
        "candidate": "Candidato/a",
        "company": "Empresa",
        "therapist": "Terapeuta",
    }
    role_label = role_labels.get(user_role, user_role.capitalize())

    subject = f"[DiversIA] Nuevo registro: {user_name} ({role_label})"

    html_body = f"""\
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Roboto,Arial,sans-serif;background:#f4f7fa;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#10b981,#059669);padding:24px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;">Nuevo Registro en DiversIA</h1>
    </div>
    <div style="padding:24px;">
      <p style="color:#475569;line-height:1.6;">Se ha registrado un nuevo usuario en la plataforma:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:8px 0;color:#64748b;width:100px;">Nombre:</td><td style="padding:8px 0;font-weight:600;color:#1e293b;">{user_name}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Email:</td><td style="padding:8px 0;font-weight:600;color:#1e293b;">{user_email}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Tipo:</td><td style="padding:8px 0;font-weight:600;color:#1e293b;">{role_label}</td></tr>
      </table>
    </div>
    <div style="background:#f8fafc;padding:16px 24px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="color:#94a3b8;font-size:12px;margin:0;">&copy; 2026 DiversIA</p>
    </div>
  </div>
</body>
</html>"""

    text_body = (
        f"Nuevo registro en DiversIA:\n\n"
        f"Nombre: {user_name}\n"
        f"Email: {user_email}\n"
        f"Tipo: {role_label}\n"
    )

    return subject, html_body, text_body


def build_early_adopter_email(
    *, user_name: str, user_role: str, free_months: int = 3,
) -> tuple[str, str, str]:
    """Return (subject, html_body, text_body) for the early adopter welcome email with free plan info."""
    role_labels = {
        "company": "Empresa",
        "therapist": "Terapeuta",
    }
    role_label = role_labels.get(user_role, user_role.capitalize())
    plan_name = "PRO" if user_role == "company" else "PROFESIONAL"

    subject = f"🎉 {user_name}, eres Early Adopter de DiversIA!"

    html_body = f"""\
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Roboto,Arial,sans-serif;background:#f4f7fa;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:32px 24px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:28px;">🎉 Enhorabuena!</h1>
      <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:16px;">Eres Early Adopter de DiversIA</p>
    </div>
    <div style="padding:32px 24px;">
      <h2 style="color:#1e293b;margin:0 0 16px;">Hola {user_name},</h2>
      <p style="color:#475569;line-height:1.6;">
        Gracias por registrarte como <strong>{role_label}</strong> en DiversIA.
        Como uno de nuestros primeros usuarios, te ofrecemos el plan
        <strong>{plan_name}</strong> completamente <strong>gratis durante {free_months} meses</strong>.
      </p>
      <div style="background:#fffbeb;border:1px solid #fbbf24;border-radius:8px;padding:16px;margin:20px 0;">
        <p style="color:#92400e;margin:0;font-size:14px;font-weight:600;">
          ✅ Tu plan {plan_name} ya esta activo automaticamente.
        </p>
        <p style="color:#92400e;margin:8px 0 0;font-size:13px;">
          No necesitas introducir ningun codigo. Disfruta de todas las funcionalidades premium
          durante {free_months} meses sin coste alguno.
        </p>
      </div>
      <div style="text-align:center;margin:28px 0;">
        <a href="https://app.diversia.click/dashboard"
           style="display:inline-block;background:#f59e0b;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
          Ir a mi panel
        </a>
      </div>
      <p style="color:#64748b;font-size:13px;line-height:1.5;">
        Si tienes preguntas, responde a este correo o contactanos en
        <a href="mailto:info@diversia.click" style="color:#6366f1;">info@diversia.click</a>.
      </p>
    </div>
    <div style="background:#f8fafc;padding:16px 24px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="color:#94a3b8;font-size:12px;margin:0;">&copy; 2026 DiversIA &mdash; Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>"""

    text_body = (
        f"Hola {user_name},\n\n"
        f"Enhorabuena! Eres Early Adopter de DiversIA.\n"
        f"Como {role_label}, tienes el plan {plan_name} gratis durante {free_months} meses.\n\n"
        f"Tu plan ya esta activo automaticamente. No necesitas codigo.\n\n"
        f"Accede a tu panel: https://app.diversia.click/dashboard\n\n"
        f"-- Equipo DiversIA"
    )

    return subject, html_body, text_body
