// lib/auth.ts — Lógica de autenticación del panel de administración.
// Magic links + JWT. SOLO importar desde API routes o Server Components.
// Nunca desde Client Components.

import crypto from 'crypto'
import { SignJWT, jwtVerify } from 'jose'
import { supabaseAdmin } from '@/lib/supabase-admin'

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

export const SESSION_COOKIE_NAME = 'sw_admin_session'

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('Missing env var: JWT_SECRET')
  return new TextEncoder().encode(secret)
}

function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL
  if (!url) throw new Error('Missing env var: NEXT_PUBLIC_SITE_URL')
  return url
}

// ---------------------------------------------------------------------------
// isEmailAllowed
// ---------------------------------------------------------------------------

/**
 * Verifica si un email existe en admin_allowlist.
 * Devuelve true si está permitido, false en cualquier otro caso.
 */
export async function isEmailAllowed(email: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('admin_allowlist')
    .select('email')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle()

  if (error) {
    throw new Error(`Error al consultar admin_allowlist: ${error.message}`)
  }

  return data !== null
}

// ---------------------------------------------------------------------------
// createMagicLink
// ---------------------------------------------------------------------------

/**
 * Genera un magic link de un solo uso válido por 15 minutos.
 * Inserta el token en admin_magic_links y devuelve la URL completa.
 */
export async function createMagicLink(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

  const { error } = await supabaseAdmin.from('admin_magic_links').insert({
    email: email.toLowerCase().trim(),
    token,
    expires_at: expiresAt,
  })

  if (error) {
    throw new Error(`Error al crear magic link: ${error.message}`)
  }

  const baseUrl = getBaseUrl()
  return `${baseUrl}/admin/auth?token=${token}`
}

// ---------------------------------------------------------------------------
// verifyMagicLink
// ---------------------------------------------------------------------------

/**
 * Valida un token de magic link.
 * Devuelve el email si el token es válido y lo marca como usado.
 * Devuelve null si el token no existe, ya fue usado, o expiró.
 */
export async function verifyMagicLink(token: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from('admin_magic_links')
    .select('id, email, used_at, expires_at')
    .eq('token', token)
    .maybeSingle()

  if (error) {
    throw new Error(`Error al verificar magic link: ${error.message}`)
  }

  if (!data) return null
  if (data.used_at !== null) return null
  if (new Date(data.expires_at) < new Date()) return null

  // Marcar como usado
  const { error: updateError } = await supabaseAdmin
    .from('admin_magic_links')
    .update({ used_at: new Date().toISOString() })
    .eq('id', data.id)

  if (updateError) {
    throw new Error(`Error al marcar token como usado: ${updateError.message}`)
  }

  return data.email
}

// ---------------------------------------------------------------------------
// createSession
// ---------------------------------------------------------------------------

/**
 * Crea un JWT firmado con el email del admin.
 * Válido por 7 días. Firmado con JWT_SECRET.
 */
export async function createSession(email: string): Promise<string> {
  const secret = getJwtSecret()
  const now = Math.floor(Date.now() / 1000)
  const sevenDaysInSeconds = 7 * 24 * 60 * 60

  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + sevenDaysInSeconds)
    .sign(secret)

  return token
}

// ---------------------------------------------------------------------------
// verifySession
// ---------------------------------------------------------------------------

/**
 * Verifica y decodifica un JWT de sesión.
 * Devuelve el email si el token es válido, null si no.
 */
export async function verifySession(token: string): Promise<string | null> {
  try {
    const secret = getJwtSecret()
    const { payload } = await jwtVerify(token, secret)

    if (typeof payload.email !== 'string') return null

    return payload.email
  } catch {
    // Token inválido, expirado o malformado
    return null
  }
}
