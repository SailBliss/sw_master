'use client'

// Página de login del panel de administración.
// Flujo de dos pasos: primero el email, luego el código OTP de 6 dígitos.

import { useState } from 'react'

export default function AdminLoginPage() {
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSendCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/solicitar-acceso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      if (!response.ok) {
        setError('Ocurrió un error. Intenta de nuevo.')
        return
      }

      setStep('code')
    } catch {
      setError('No se pudo conectar. Verifica tu conexión e intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/verificar-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: code.trim() }),
      })

      if (!response.ok) {
        const data = await response.json() as { error?: string }
        setError(data.error ?? 'Código inválido o expirado.')
        return
      }

      window.location.href = '/admin'
    } catch {
      setError('No se pudo conectar. Verifica tu conexión e intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / nombre */}
        <div className="text-center mb-8">
          <span className="inline-block text-2xl font-bold tracking-tight text-violet-700">
            SW Mujeres
          </span>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">
            Panel de administración
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {step === 'email' ? (
            <>
              <h1 className="text-lg font-semibold text-gray-800 mb-6 text-center">
                Acceso al panel
              </h1>

              <form onSubmit={handleSendCode} noValidate>
                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    placeholder="tu@correo.com"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 mb-3">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full rounded-lg bg-violet-700 hover:bg-violet-800 text-white text-sm font-semibold py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Enviando…' : 'Enviar código'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-lg font-semibold text-gray-800 mb-1 text-center">
                Ingresa tu código
              </h1>
              <p className="text-sm text-gray-500 mb-6 text-center">
                Enviamos un código de 6 dígitos a{' '}
                <span className="font-medium text-gray-700">{email}</span>
              </p>

              <form onSubmit={handleVerifyCode} noValidate>
                <div className="mb-4">
                  <label
                    htmlFor="code"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Código de verificación
                  </label>
                  <input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="one-time-code"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    disabled={loading}
                    placeholder="123456"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50 tracking-widest text-center text-lg"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 mb-3">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-full rounded-lg bg-violet-700 hover:bg-violet-800 text-white text-sm font-semibold py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verificando…' : 'Entrar'}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep('email'); setCode(''); setError(null) }}
                  className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Volver
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
