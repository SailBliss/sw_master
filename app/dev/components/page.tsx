import {
  BusinessCard,
  CategoryChip,
  PagePlaceholder,
  PublicNavbar,
  SearchBar,
  SectionShell,
  SmartSearchButton,
} from '@src/components/public'

const categories = ['Belleza', 'Salud', 'Alimentos', 'Servicios']

export default function ComponentsLabPage() {
  return (
    <main className="min-h-screen bg-[--bg] text-[--fg]">
      <PublicNavbar />

      <SectionShell eyebrow="Laboratorio interno" title="Componentes publicos base">
        <div className="grid gap-6">
          <div className="rounded-lg border border-[--sw-line] bg-sw-paper p-4">
            <h2 className="mb-3 text-sm font-semibold">Navbar publica</h2>
            <PublicNavbar activePath="/directorio" />
          </div>

          <div className="rounded-lg border border-[--sw-line] bg-sw-paper p-4">
            <h2 className="mb-3 text-sm font-semibold">SearchBar y chat inteligente</h2>
            <div className="grid gap-3">
              <SearchBar />
              <SmartSearchButton />
            </div>
          </div>

          <div className="rounded-lg border border-[--sw-line] bg-sw-paper p-4">
            <h2 className="mb-3 text-sm font-semibold">CategoryChip y botones</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((category, index) => (
                <CategoryChip key={category} label={category} selected={index === 0} />
              ))}
              <button className="rounded-md bg-[--accent] px-4 py-2 text-sm font-semibold text-sw-cream">
                Boton primario
              </button>
              <button className="rounded-md border border-[--sw-line-strong] px-4 py-2 text-sm text-[--fg-2]">
                Boton secundario
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-[--sw-line] bg-sw-paper p-4">
            <h2 className="mb-3 text-sm font-semibold">BusinessCard</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <BusinessCard
                name="Negocio base"
                category="Categoria"
                city="Medellin"
                description="Descripcion corta para probar jerarquia, espaciado y acciones futuras."
              />
              <BusinessCard
                name="Marca ejemplo"
                category="Servicios"
                city="Envigado"
                description="Tarjeta temporal sin identidad visual final."
              />
            </div>
          </div>

          <PagePlaceholder
            title="Estado vacio / PagePlaceholder"
            description="Componente reutilizable para neutralizar paginas y documentar que ira en cada pantalla."
            backendNote="Usar este bloque para indicar la conexion backend que debe reconectarse en la UI final."
          />
        </div>
      </SectionShell>
    </main>
  )
}
