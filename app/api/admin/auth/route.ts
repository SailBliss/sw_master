// Valida un magic link token, crea la sesión JWT y setea la cookie httpOnly.
// Redirige a /admin si es válido, a /admin/login?error=invalid si no.

import { NextRequest, NextResponse } from 'next/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyMagicLink, createSession, SESSION_COOKIE_NAME } from '@/lib/auth'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    redirect('/admin/login?error=invalid')
  }

  try {
    const email = await verifyMagicLink(token)

    if (!email) {
      redirect('/admin/login?error=invalid')
    }

    const sessionToken = await createSession(email)
    const cookieStore = await cookies()

    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    redirect('/admin')
  } catch (err) {
    // Errores de redirect son instancias de Error con mensaje especial — dejarlos pasar.
    // Cualquier otro error (DB, JWT) redirige al login con error.
    if (err instanceof Error && err.message === 'NEXT_REDIRECT') {
      throw err
    }

    console.error('[GET /api/admin/auth] Error interno:', err)
    redirect('/admin/login?error=invalid')
  }
}
