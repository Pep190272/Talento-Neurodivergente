'use client'

import { useState } from 'react'
import Link from 'next/link'
import '../login/login.css'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Error al procesar la solicitud.')
            } else {
                setSent(true)
            }
        } catch (err) {
            setError('Error de conexión. Inténtalo de nuevo.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-container">
            <div className="login-background">
                <div className="login-glow"></div>
            </div>

            <div className="login-card">
                <div className="login-header">
                    <h1 className="login-title">Recuperar Contraseña</h1>
                    <p className="login-subtitle">
                        {sent
                            ? 'Revisa tu correo electrónico'
                            : 'Introduce tu email para recibir un enlace de recuperación'}
                    </p>
                </div>

                {sent ? (
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem', fontFamily: 'Rajdhani, sans-serif', lineHeight: 1.6 }}>
                            Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña. Revisa también la carpeta de spam.
                        </p>
                        <Link href="/login" className="register-link">
                            Volver al inicio de sesión
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="login-form">
                        {error && (
                            <div className="login-error">
                                <span className="error-icon">⚠️</span>
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                className="form-input"
                                required
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="loading-spinner"></span>
                            ) : (
                                'Enviar enlace de recuperación'
                            )}
                        </button>
                    </form>
                )}

                <div className="login-footer">
                    <p>¿Ya recuerdas tu contraseña?</p>
                    <Link href="/login" className="register-link">
                        Iniciar sesión
                    </Link>
                </div>
            </div>
        </div>
    )
}
