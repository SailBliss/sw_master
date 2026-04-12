# M1/P2 — Directorio Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar la página pública del directorio (`/directorio`) con búsqueda por texto, filtros de categoría y ciudad, grid responsive de tarjetas de emprendimiento, y estado vacío.

**Architecture:** Server Component en Next.js 15 que recibe `searchParams` como Promise, llama `getProfiles()` con los filtros extraídos, y renderiza todo inline (sin sub-componentes separados). Tres cambios de soporte en la capa de datos: agregar `city` al tipo `DirectoryProfile`, mapearlo en `data.ts`, y agregar la constante `CATEGORIES` a `utils.ts`.

**Tech Stack:** Next.js 15 (App Router, Server Components), TypeScript estricto, Tailwind CSS, Supabase (ya abstraído detrás de `getProfiles()`).

---

## File Map

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `lib/types.ts` | Modificar | Agregar `city: string \| null` a `DirectoryProfile` |
| `lib/utils.ts` | Modificar | Agregar `export const CATEGORIES` |
| `lib/data.ts` | Modificar | Mapear `city` en `mapToDirectoryProfile()` |
| `app/directorio/page.tsx` | Reemplazar | Página completa con búsqueda, filtros, grid, estado vacío |

---

### Task 1: Agregar `city` al tipo `DirectoryProfile`

**Files:**
- Modify: `lib/types.ts`

El campo `city` ya se selecciona en el query de Supabase (en `business_profiles`), pero no estaba en el tipo ni en el mapper. Esto lo habilita en el tipo.

- [ ] **Step 1: Editar `lib/types.ts`**

Reemplazar el bloque `// From business_profiles` para agregar `city`:

```ts
// lib/types.ts
export type DirectoryProfile = {
  // From business_profiles
  id: string;
  business_name: string;
  description: string | null;
  category: string | null;
  city: string | null;
  business_phone: string;
  instagram_handle: string | null;
  website_url: string | null;
  other_socials: string | null;
  directory_image_path: string | null;
  offers_discount: boolean;
  discount_details: string | null;

  // From entrepreneurs
  full_name: string | null;

  // Computed in the data layer
  slug: string;
  is_verified: boolean;
};
```

- [ ] **Step 2: Verificar que no hay errores de TypeScript**

```bash
cd c:/codigos/MAESTER_SW/sw_master && npx tsc --noEmit 2>&1 | head -30
```

Esperado: sin errores nuevos. Si TypeScript reporta que `city` no existe en alguna llamada, es porque `mapToDirectoryProfile` todavía no lo mapea — se arregla en Task 2.

---

### Task 2: Mapear `city` en `data.ts` y agregar `CATEGORIES` en `utils.ts`

**Files:**
- Modify: `lib/data.ts` (línea ~84, objeto retornado por `mapToDirectoryProfile`)
- Modify: `lib/utils.ts`

- [ ] **Step 1: Agregar `city` en `mapToDirectoryProfile` (`lib/data.ts`)**

El objeto retornado actualmente va de `id` hasta `is_verified`. Agregar `city` después de `category`:

```ts
  return {
    id: profile.id,
    business_name: profile.business_name,
    description: profile.description,
    category: profile.category,
    city: profile.city,           // <-- agregar esta línea
    business_phone: profile.business_phone,
    instagram_handle: profile.instagram_handle,
    website_url: profile.website_url,
    other_socials: profile.other_socials,
    directory_image_path: profile.directory_image_path,
    offers_discount: profile.offers_discount ?? false,
    discount_details: profile.discount_details,
    full_name: row.full_name,
    slug: slugify(profile.business_name),
    is_verified: true,
  }
```

- [ ] **Step 2: Agregar `CATEGORIES` en `lib/utils.ts`**

Agregar al final del archivo (después de `formatPhone`):

```ts
export const CATEGORIES: string[] = [
  'Moda y accesorios',
  'Salud y bienestar',
  'Alimentación',
  'Belleza y cuidado personal',
  'Hogar y decoración',
  'Educación y servicios',
  'Tecnología',
  'Arte y entretenimiento',
]
```

- [ ] **Step 3: Verificar sin errores de TypeScript**

```bash
cd c:/codigos/MAESTER_SW/sw_master && npx tsc --noEmit 2>&1 | head -30
```

Esperado: sin errores.

- [ ] **Step 4: Commit**

```bash
cd c:/codigos/MAESTER_SW/sw_master && git add lib/types.ts lib/utils.ts lib/data.ts && git commit -m "feat(lib): add city field to DirectoryProfile and CATEGORIES constant"
```

---

### Task 3: Implementar `app/directorio/page.tsx`

**Files:**
- Modify: `app/directorio/page.tsx` (reemplazar el placeholder actual)

La página recibe `searchParams` como `Promise` (Next.js 15), hace `await`, extrae los filtros, llama `getProfiles`, y renderiza todo inline.

- [ ] **Step 1: Reemplazar `app/directorio/page.tsx` con la implementación completa**

```tsx
import { getProfiles } from '@/lib/data'
import { slugify, CATEGORIES } from '@/lib/utils'
import type { DirectoryProfile } from '@/lib/types'

const CITIES = [
  'Medellín',
  'Bogotá',
  'Cali',
  'Envigado',
  'Sabaneta',
  'Itagüí',
  'Bello',
  'Rionegro',
  'Retiro',
]

function buildUrl(params: {
  q?: string
  categoria?: string
  ciudad?: string
}): string {
  const parts: string[] = []
  if (params.q) parts.push(`q=${encodeURIComponent(params.q)}`)
  if (params.categoria) parts.push(`categoria=${encodeURIComponent(params.categoria)}`)
  if (params.ciudad) parts.push(`ciudad=${encodeURIComponent(params.ciudad)}`)
  return parts.length > 0 ? `/directorio?${parts.join('&')}` : '/directorio'
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max).trimEnd() + '...'
}

function ProfileCard({ profile }: { profile: DirectoryProfile }) {
  const slug = slugify(profile.business_name)
  const shortDesc = profile.description ? truncate(profile.description, 80) : null

  return (
    <a
      href={`/directorio/${slug}`}
      className="flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4 gap-3"
    >
      <div className="flex items-center gap-3">
        {profile.directory_image_path ? (
          <img
            src={profile.directory_image_path}
            alt={profile.business_name}
            className="w-12 h-12 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-sm font-semibold shrink-0">
            {getInitials(profile.business_name)}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{profile.business_name}</p>
          <p className="text-xs text-gray-500 truncate">
            {profile.category ?? '—'}{profile.city ? ` · ${profile.city}` : ''}
          </p>
        </div>
      </div>

      {shortDesc && (
        <p className="text-sm text-gray-600 leading-relaxed">{shortDesc}</p>
      )}

      <div className="mt-auto">
        <span className="inline-flex items-center gap-1 text-xs font-medium bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full">
          ✓ SW Verificada
        </span>
      </div>
    </a>
  )
}

type SearchParams = Promise<{ q?: string; categoria?: string; ciudad?: string }>

export default async function DirectorioPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const q = params.q?.trim() ?? ''
  const categoria = params.categoria?.trim() ?? ''
  const ciudad = params.ciudad?.trim() ?? ''

  const profiles = await getProfiles({
    q: q || undefined,
    categoria: categoria || undefined,
    ciudad: ciudad || undefined,
  })

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Directorio SW Mujeres</h1>
          <p className="text-gray-500 text-sm mt-1">
            Emprendimientos verificados de la comunidad SW Mujeres
          </p>
        </div>

        {/* Búsqueda */}
        <form method="get" action="/directorio" className="flex gap-2">
          {categoria && (
            <input type="hidden" name="categoria" value={categoria} />
          )}
          {ciudad && (
            <input type="hidden" name="ciudad" value={ciudad} />
          )}
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar emprendimiento o descripción..."
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
          <button
            type="submit"
            className="bg-violet-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors"
          >
            Buscar
          </button>
          {(q || categoria || ciudad) && (
            <a
              href="/directorio"
              className="border border-gray-300 text-gray-600 px-4 py-2 rounded-xl text-sm hover:bg-gray-100 transition-colors"
            >
              Limpiar
            </a>
          )}
        </form>

        {/* Filtros de categoría */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = categoria === cat
            const href = isActive
              ? buildUrl({ q: q || undefined, ciudad: ciudad || undefined })
              : buildUrl({ q: q || undefined, categoria: cat, ciudad: ciudad || undefined })
            return (
              <a
                key={cat}
                href={href}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  isActive
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-violet-400 hover:text-violet-700'
                }`}
              >
                {cat}
              </a>
            )
          })}
        </div>

        {/* Filtro de ciudad */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-500 font-medium">Ciudad:</span>
          <a
            href={buildUrl({ q: q || undefined, categoria: categoria || undefined })}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
              !ciudad
                ? 'bg-violet-600 text-white border-violet-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-violet-400 hover:text-violet-700'
            }`}
          >
            Todas
          </a>
          {CITIES.map((cit) => {
            const isActive = ciudad === cit
            const href = isActive
              ? buildUrl({ q: q || undefined, categoria: categoria || undefined })
              : buildUrl({ q: q || undefined, categoria: categoria || undefined, ciudad: cit })
            return (
              <a
                key={cit}
                href={href}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  isActive
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-violet-400 hover:text-violet-700'
                }`}
              >
                {cit}
              </a>
            )
          })}
        </div>

        {/* Conteo */}
        <p className="text-sm text-gray-500">
          {profiles.length === 0
            ? 'Sin resultados'
            : `${profiles.length} emprendimiento${profiles.length !== 1 ? 's' : ''} encontrado${profiles.length !== 1 ? 's' : ''}`}
        </p>

        {/* Grid o estado vacío */}
        {profiles.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-gray-500 text-lg">
              No encontramos emprendimientos con esos filtros.
            </p>
            <a
              href="/directorio"
              className="inline-block text-violet-600 hover:underline text-sm"
            >
              Ver todos los emprendimientos
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Verificar sin errores de TypeScript**

```bash
cd c:/codigos/MAESTER_SW/sw_master && npx tsc --noEmit 2>&1 | head -40
```

Esperado: sin errores. Si aparece un error sobre `directory_image_path` en `<img src>`, es porque Next.js requiere el componente `<Image>` de `next/image` en producción — para este milestone es aceptable usar `<img>` nativo ya que las imágenes vienen de Supabase Storage con URLs externas.

- [ ] **Step 3: Levantar el servidor de desarrollo y verificar visualmente**

```bash
cd c:/codigos/MAESTER_SW/sw_master && npm run dev
```

Abrir `http://localhost:3000/directorio` y verificar:
- [ ] Grid se muestra con las tarjetas de los perfiles activos
- [ ] Búsqueda por texto filtra correctamente (probar con un nombre de negocio conocido)
- [ ] Filtro de categoría activa/desactiva correctamente
- [ ] Filtro de ciudad activa/desactiva correctamente
- [ ] Estado vacío aparece cuando no hay resultados (probar con `?q=xyzxyzxyz`)
- [ ] Badge "SW Verificada" visible en todas las tarjetas
- [ ] Avatar con iniciales aparece cuando no hay imagen

- [ ] **Step 4: Commit**

```bash
cd c:/codigos/MAESTER_SW/sw_master && git add app/directorio/page.tsx && git commit -m "feat(directorio): implement directory page with search, filters, and profile grid"
```

---

## Self-Review

**Spec coverage:**

| Requisito del spec | Task que lo cubre |
|---|---|
| `getProfiles` acepta `ProfileFilters` con q/categoria/ciudad | Ya implementado en data.ts (no requiere cambio) |
| `city` en `DirectoryProfile` | Task 1 + Task 2 |
| `CATEGORIES` exportada en utils | Task 2 |
| `searchParams` como Promise (Next.js 15) | Task 3 |
| Búsqueda con form GET | Task 3 |
| Hiddens para filtros activos en el form | Task 3 |
| Filtros de categoría como links toggle | Task 3 |
| Filtro de ciudad | Task 3 |
| Grid responsive 1/2/3 columnas | Task 3 |
| Tarjeta con logo/avatar + nombre + cat + ciudad + desc 80 chars + badge | Task 3 |
| Link de tarjeta a `/directorio/[slug]` via `slugify()` | Task 3 |
| Estado vacío con link a ver todos | Task 3 |
| Sin WhatsApp ni Instagram en la tarjeta | Task 3 (no aparece) |

**Placeholder scan:** Ninguno detectado. Todos los pasos incluyen código completo.

**Type consistency:** `DirectoryProfile` se define en Task 1, se mapea en Task 2, y se usa en Task 3. El campo `city` es `string | null` en los tres. `CATEGORIES` es `string[]` en Task 2 y se usa como tal en Task 3. Consistente.
