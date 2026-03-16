'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import '../login/login.css'

function ResetPasswordForm() {
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    if (!token) {
        return (
            <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#fca5a5', marginBottom: '1.5rem', fontFamily: 'Rajdhani, sans-serif' }}>
                    Enlace inválido. Solicita un nuevo enlace de recuperación.
                </p>
                <Link href="/forgot-password" className="register-link">
                    Solicitar nuevo enlace
                </Link>
            </div>
        )
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.')
            return
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.')
            return
        }

        setLoading(true)

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Error al restablecer la contraseña.')
            } else {
                setSuccess(true)
            }
        } catch (err) {
            setError('Error de conexión. Inténtalo de nuevo.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem', fontFamily: 'Rajdhani, sans-serif', lineHeight: 1.6 }}>
                    Tu contraseña ha sido actualizada correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
                </p>
                <Link href="/login" className="register-link">
                    Ir al inicio de sesión
                </Link>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="login-form">
            {error && (
                <div className="login-error">
                    <span className="error-icon">⚠️</span>
                    {error}
                </div>
            )}

            <div className="form-group">
                <label htmlFor="password" className="form-label">Nueva contraseña</label>
                <div className="password-wrapper">
                    <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="form-input"
                        required
                        disabled={loading}
                    />
                    <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                        {showPassword ? '🙈' : '👁️'}
                    </button>
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Confirmar nueva contraseña</label>
                <div className="password-wrapper">
                    <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repite tu contraseña"
                        className="form-input"
                        required
                        disabled={loading}
                    />
                    <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        tabIndex={-1}
                        aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                        {showConfirmPassword ? '🙈' : '👁️'}
                    </button>
                </div>
            </div>

            <button
                type="submit"
                className="login-button"
                disabled={loading}
            >
                {loading ? (
                    <span className="loading-spinner"></span>
                ) : (
                    'Restablecer contraseña'
                )}
            </button>
        </form>
    )
}

export default function ResetPasswordPage() {
    return (
        <div className="login-container">
            <div className="login-background">
                <div className="login-glow"></div>
            </div>

            <div className="login-card">
                <div className="login-header">
                    <h1 className="login-title">Nueva Contraseña</h1>
                    <p className="login-subtitle">Introduce tu nueva contraseña</p>
                </div>

                <Suspense fallback={<span className="loading-spinner"></span>}>
                    <ResetPasswordForm />
                </Suspense>

                <div className="login-footer">
                    <Link href="/login" className="register-link">
                        Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        </div>
    )
}
