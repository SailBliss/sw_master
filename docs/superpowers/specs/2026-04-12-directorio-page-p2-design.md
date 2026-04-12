# M1 / P2 — Página del Directorio (`app/directorio/page.tsx`)

**Fecha:** 2026-04-12  
**Módulo:** M1 (Directory + Landing)  
**Tarea:** P2 — Grid, filtros, búsqueda de texto

---

## Objetivo

Implementar la página pública del directorio con búsqueda por texto, filtros de categoría y ciudad, grid responsive de tarjetas de emprendimiento, y estado vacío.

---

## Archivos a modificar

| Archivo | Cambio |
|---|---|
| `lib/types.ts` | Agregar `city: string \| null` a `DirectoryProfile` |
| `lib/utils.ts` | Agregar `export const CATEGORIES` (8 categorías del PRD) |
| `lib/data.ts` | Mapear `city: profile.city` en `mapToDirectoryProfile()` |
| `app/directorio/page.tsx` | Implementación completa del Server Component |

---

## Arquitectura

### `lib/types.ts`
Agregar campo `city: string | null` — el campo ya existe en `business_profiles` y se selecciona en el query de Supabase, pero faltaba en el tipo y en el mapper.

### `lib/utils.ts`
Nueva constante exportada:
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

### `lib/data.ts`
En `mapToDirectoryProfile()`, agregar `city: profile.city` en el objeto retornado. La lógica de visibilidad y los filtros ya están implementados correctamente y no se tocan.

### `app/directorio/page.tsx`

Server Component. Sin `'use client'`.

**Props:**
```ts
{ searchParams: Promise<{ q?: string; categoria?: string; ciudad?: string }> }
```
Se hace `await searchParams` antes de acceder (Next.js 15).

**Estructura de renderizado:**
1. `SearchBar` — `<form method="get" action="/directorio">` con `<input name="q">` y hiddens para `categoria` y `ciudad` activos.
2. `CategoryFilter` — Links que activan/desactivan categoría. Si está activa, el link desactiva (va a `/directorio` preservando otros filtros). Resaltado visual en la activa.
3. `CityFilter` — Links o select para las 9 ciudades disponibles: Medellín, Bogotá, Cali, Envigado, Sabaneta, Itagüí, Bello, Rionegro, Retiro.
4. `ProfileGrid` — CSS grid: 1 col móvil / 2 tablet / 3 desktop.
5. `ProfileCard` — `<a href="/directorio/[slug]">` con logo/avatar + nombre + categoría + ciudad + descripción truncada a 80 chars + badge "SW Verificada".
6. `EmptyState` — Si `profiles.length === 0`: mensaje + link para ver todos.

**Helper `buildUrl`:**  
Construye URLs de filtro preservando parámetros activos. Evita duplicación de lógica en cada link de filtro.

**Logo / Avatar:**
- Si `directory_image_path` existe → `<img>`.
- Si no → `<div>` con las iniciales del negocio (primera letra de cada palabra, máx 2).

---

## Restricciones

- Sin `any`. Todos los tipos explícitos.
- La regla de visibilidad vive exclusivamente en `getProfiles()` — la página renderiza lo que recibe, sin filtrar.
- No crear sub-componentes separados — todo inline en `page.tsx`.
- No mostrar WhatsApp ni Instagram en la tarjeta (eso es P3).
