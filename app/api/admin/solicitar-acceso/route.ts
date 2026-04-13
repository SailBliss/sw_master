// Recibe un email y, si está en admin_allowlist, genera y envía un OTP de 6 dígitos.
// Siempre responde con el mismo mensaje genérico para no revelar si el email existe.

import { NextRequest, NextResponse } from 'next/server'
import { isEmailAllowed, createOtp } from '@/lib/auth'
import { sendOtpEmail } from '@/lib/email'

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo de la solicitud inválido.' }, { status: 400 })
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    !('email' in body) ||
    typeof (body as Record<string, unknown>).email !== 'string'
  ) {
    return NextResponse.json({ error: 'El campo email es obligatorio.' }, { status: 400 })
  }

  const email = ((body as Record<string, string>).email).trim()

  if (!email) {
    return NextResponse.json({ error: 'El campo email es obligatorio.' }, { status: 400 })
  }

  try {
    const allowed = await isEmailAllowed(email)

    // Respuesta idéntica si el email no está permitido — evita enumeración de usuarios.
    if (!allowed) {
      return NextResponse.json({ ok: true }, { status: 200 })
    }

    const code = await createOtp(email)
    await sendOtpEmail({ to: email, code })

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    console.error('[POST /api/admin/solicitar-acceso] Error interno:', err)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}
