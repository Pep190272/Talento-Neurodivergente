/**
 * Email service for DiversIA Next.js app.
 * Uses nodemailer for SMTP delivery. Best-effort — never blocks callers.
 */

import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASSWORD || '',
  },
})

function isConfigured(): boolean {
  return !!(process.env.SMTP_USER && process.env.SMTP_PASSWORD)
}

interface WelcomeEmailParams {
  to: string
  name: string
  role: string
}

export async function sendWelcomeEmail({ to, name, role }: WelcomeEmailParams): Promise<boolean> {
  if (!isConfigured()) {
    console.warn('[Email] SMTP not configured — skipping welcome email to', to)
    return false
  }

  const roleLabels: Record<string, string> = {
    individual: 'Candidato/a',
    company: 'Empresa',
    therapist: 'Terapeuta',
  }
  const roleLabel = roleLabels[role] || role

  const fromName = process.env.SMTP_FROM_NAME || 'DiversIA'
  const fromAddr = process.env.SMTP_FROM || 'no-reply@diversia.click'

  const htmlBody = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Roboto,Arial,sans-serif;background:#f4f7fa;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 24px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:28px;">DiversIA</h1>
      <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Talento neurodivergente, oportunidades reales</p>
    </div>
    <div style="padding:32px 24px;">
      <h2 style="color:#1e293b;margin:0 0 16px;">Hola ${name},</h2>
      <p style="color:#475569;line-height:1.6;">
        Tu cuenta como <strong>${roleLabel}</strong> ha sido creada correctamente.
        Ya puedes acceder a tu panel y empezar a explorar todas las funcionalidades de DiversIA.
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="https://app.diversia.click/login"
           style="display:inline-block;background:#6366f1;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
          Iniciar Sesion
        </a>
      </div>
      <p style="color:#64748b;font-size:13px;line-height:1.5;">
        Si tienes preguntas, responde a este correo o contactanos en soporte@diversia.click.
      </p>
    </div>
    <div style="background:#f8fafc;padding:16px 24px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="color:#94a3b8;font-size:12px;margin:0;">
        &copy; 2026 DiversIA &mdash; Todos los derechos reservados.
      </p>
    </div>
  </div>
</body>
</html>`

  try {
    await transporter.sendMail({
      from: `${fromName} <${fromAddr}>`,
      to,
      subject: `Bienvenido/a a DiversIA, ${name}!`,
      html: htmlBody,
      text: `Hola ${name},\n\nTu cuenta como ${roleLabel} ha sido creada correctamente en DiversIA.\nAccede a tu panel en: https://app.diversia.click/login\n\n-- Equipo DiversIA`,
    })
    console.log('[Email] Welcome email sent to', to)
    return true
  } catch (error) {
    console.error('[Email] Failed to send welcome email to', to, error)
    return false
  }
}
