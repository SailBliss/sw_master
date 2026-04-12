'use client'

// Página de login del panel de administración.
// Solicita un magic link por email. Nunca revela si el email existe o no.

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'

// --- Sub-componente que lee searchParams (requiere Suspense en Next.js 15+) ---

function InvalidLinkBanner() {
  const searchParams = useSearchParams()
  const hasInvalidError = searchParams.get('error') === 'invalid'

  if (!hasInvalidError) return null

  return (
    <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
      El link no es válido o ya expiró. Solicita uno nuevo.
    </div>
  )
}

// --- Formulario principal ---

function LoginForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setFetchError(null)

    try {
      const response = await fetch('/api/admin/solicitar-acceso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      if (!response.ok) {
        setFetchError('Ocurrió un error. Intenta de nuevo.')
        return
      }

      setSubmitted(true)
    } catch {
      setFetchError('No se pudo conectar. Verifica tu conexión e intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <h1 className="text-lg font-semibold text-gray-800 mb-6 text-center">
        Acceso al panel
      </h1>

      <Suspense>
        <InvalidLinkBanner />
      </Suspense>

      {submitted ? (
        /* Mensaje de éxito — siempre el mismo, independiente de si el email existe */
        <div className="rounded-lg bg-violet-50 border border-violet-200 px-4 py-4 text-sm text-violet-800 text-center leading-relaxed">
          Revisa tu correo. Te enviamos un link de acceso válido por 15 minutos.
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
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

          {fetchError && (
            <p className="text-sm text-red-600 mb-3">{fetchError}</p>
          )}

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full rounded-lg bg-violet-700 hover:bg-violet-800 text-white text-sm font-semibold py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Enviando…' : 'Enviar link de acceso'}
          </button>
        </form>
      )}
    </div>
  )
}

// --- Página ---

export default function AdminLoginPage() {
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

        <LoginForm />
      </div>
    </main>
  )
}
