// app/admin/(panel)/layout.tsx
// Layout protegido del panel de administración.
// Verifica la sesión en cada render. Si no hay sesión válida, redirige a /admin/login.
// IMPORTANTE: cookies() en Next.js 15 devuelve una Promise — se usa con await.

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { verifySession, SESSION_COOKIE_NAME } from '@src/shared/lib/auth'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionToken) {
    redirect('/admin/login')
  }

  // verifySession devuelve null si el JWT es inválido o expiró.
  // redirect() lanza una excepción internamente — no atrapar en un catch general.
  const adminEmail = await verifySession(sessionToken)

  if (!adminEmail) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
        {/* Logo / título */}
        <div className="px-5 py-5 border-b border-gray-100">
          <span className="text-sm font-bold text-gray-900 tracking-wide uppercase">
            SW Admin
          </span>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <NavLink href="/admin">Dashboard</NavLink>
          <NavLink href="/admin/solicitudes">Solicitudes</NavLink>
          <NavLink href="/admin/perfiles">Perfiles</NavLink>
          <NavLink href="/admin/membresias">Membresías</NavLink>
          <NavLink href="/admin/finanzas">Finanzas</NavLink>
        </nav>

        {/* Footer del sidebar: email + logout */}
        <div className="px-4 py-4 border-t border-gray-100 space-y-3">
          <p
            className="text-xs text-gray-400 truncate"
            title={adminEmail}
          >
            {adminEmail}
          </p>

          {/*
            Form con method POST hacia la API route de logout.
            Funciona sin JavaScript del lado del cliente.
          */}
          <form action="/api/admin/logout" method="POST">
            <button
              type="submit"
              className="w-full text-left text-xs text-red-500 hover:text-red-700 transition-colors"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}

// Componente auxiliar para los ítems de navegación.
// No maneja active state aquí — se puede agregar con usePathname si se necesita.
function NavLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
    >
      {children}
    </Link>
  )
}
