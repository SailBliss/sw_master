import {
  BusinessCard,
  CategoryChip,
  PagePlaceholder,
  PublicNavbar,
  SearchBar,
  SectionShell,
  SmartSearchButton,
} from '@src/components/public'
import { CategoryIcon, CATEGORY_NAMES } from '@components/icons/categories'
import { SearchIcon } from '@components/icons/ui'

const categories = ['Belleza', 'Salud', 'Alimentos', 'Servicios']
const uiIcons = [
  {
    name: 'SearchIcon',
    importPath: '@components/icons/ui',
    filePath: 'components/icons/ui/SearchIcon.tsx',
    preview: <SearchIcon size={28} />,
  },
]

const categoryIconItems = CATEGORY_NAMES.map((name) => ({
  name,
  importPath: '@components/icons/categories',
  filePath: 'components/icons/categories/CategoryIcon.tsx',
  preview: <CategoryIcon name={name} size={28} />,
}))

export default function ComponentsLabPage() {
  return (
    <main className="min-h-screen bg-[--bg] text-[--fg]">
      <PublicNavbar />

      <SectionShell eyebrow="Laboratorio interno" title="Componentes publicos base">
        <div className="grid gap-6">
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
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold">Iconos</h2>
                <p className="mt-1 max-w-2xl text-xs leading-5 text-[--fg-2]">
                  Inventario canonico para reutilizar antes de crear un icono nuevo.
                </p>
              </div>
              <code className="rounded-md bg-sw-pearl px-3 py-2 text-xs text-[--fg-2]">
                components/icons
              </code>
            </div>

            <div className="grid gap-6">
              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[--accent]">
                  UI
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {uiIcons.map((icon) => (
                    <div
                      key={icon.name}
                      className="grid min-h-28 grid-cols-[44px_minmax(0,1fr)] gap-3 rounded-md border border-[--sw-line] bg-sw-pearl p-3"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sw-cream text-[--accent]">
                        {icon.preview}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold">{icon.name}</div>
                        <div className="mt-1 text-xs text-[--fg-2]">{icon.importPath}</div>
                        <code className="mt-2 block break-words text-[11px] leading-4 text-[--fg-3]">
                          {icon.filePath}
                        </code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[--accent]">
                  Categorias
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {categoryIconItems.map((icon) => (
                    <div
                      key={icon.name}
                      className="grid min-h-28 grid-cols-[44px_minmax(0,1fr)] gap-3 rounded-md border border-[--sw-line] bg-sw-pearl p-3"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sw-cream text-[--accent]">
                        {icon.preview}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold">{icon.name}</div>
                        <div className="mt-1 text-xs text-[--fg-2]">{icon.importPath}</div>
                        <code className="mt-2 block break-words text-[11px] leading-4 text-[--fg-3]">
                          {icon.filePath}
                        </code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
