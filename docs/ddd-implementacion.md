# DDD Táctico — Implementación en DirectorioSW

**Rama:** `feature/ddd-tactico`  
**Fecha:** 2026-04-16  
**Commits:** 12 commits, rama limpia sobre master

---

## Qué se hizo

Se reorganizó todo el proyecto bajo el patrón **Domain-Driven Design táctico ligero**. El código anterior mezclaba lógica de negocio, acceso a datos, validaciones, y rutas HTTP en los mismos archivos. Ahora cada responsabilidad tiene un lugar claro.

### Antes

```
lib/data.ts          ← queries de directorio público (200 líneas)
lib/admin-data.ts    ← queries del panel admin (700 líneas, todo mezclado)
lib/types.ts         ← tipos de todos los dominios juntos
lib/utils.ts         ← slugify, formatPhone, CATEGORIES mezclados
app/api/solicitudes/route.ts  ← validación + uploads + 5 inserts + rollback + email (300 líneas)
```

### Después

```
src/
├── features/
│   ├── profiles/       ← directorio público
│   ├── enrollment/     ← inscripción de empresarias
│   ├── admin/          ← panel de administración
│   └── tracking/       ← analíticas
└── shared/
    ├── lib/            ← re-exports de infraestructura (Supabase, email, storage, auth)
    └── utils/          ← slugify, formatPhone, categories
```

---

## Por qué se eligió DDD táctico ligero

Se evaluaron tres niveles de DDD:

**DDD táctico ligero (elegido):** Separar lógica de negocio en `src/features/` con services, repositories, y types por módulo. Supabase visible en los repositorios — sin interfaces/ports formales. El beneficio/costo es el correcto para este proyecto.

**DDD completo con Ports & Adapters:** Agregar interfaces `IProfileRepository` que la infraestructura implementa. Permite swappear Supabase sin tocar el dominio. Descartado porque no hay planes de cambiar de base de datos — el overhead no se justifica.

**Solo reorganizar sin vocabulario DDD:** Extraer lógica a "servicios" sin estructura formal. Descartado porque sin una convención clara, el código vuelve a mezclarse con el tiempo.

---

## Qué hace cada capa

### `app/` — Rutas Next.js (cero lógica)

Las páginas y API routes solo hacen tres cosas:
1. Parsear el request (FormData, JSON, path params)
2. Llamar al service correspondiente
3. Renderizar la respuesta o redirigir

Las API routes en `app/api/` solo existen para llamadas desde el cliente (tracking, formulario de inscripción). Las páginas Server Component llaman directamente a los services.

### `src/features/*/services/` — "El Pensador"

Orquesta los casos de uso. Sabe qué hay que hacer pero no sabe cómo almacenarlo. Ejemplo: `enrollmentService.submit()` valida, sube archivos, llama al repository, envía email. El email falla silenciosamente — el negocio no se interrumpe por eso.

### `src/features/*/repository/` — "El Bibliotecario"

Encapsula las queries de Supabase. Sabe cómo leer y escribir datos pero no sabe cuándo ni por qué. Cada repository define sus propios tipos de fila internos (raw types) — no se comparten entre repositorios.

### `src/features/*/types.ts` — "El Manual"

Tipos de dominio para ese feature. Solo los tipos que el service y el consumer (app/) necesitan conocer. Los tipos de fila internos de Supabase viven en el repository, no aquí.

### `src/shared/lib/` — Re-exports de infraestructura

Re-exporta los mismos clientes de `lib/` (Supabase, Nodemailer, Storage, Auth). Los archivos originales en `lib/` se mantienen — `src/shared/lib/` es una fachada que permite a `src/features/` importar desde `@src/` en lugar de `@/lib/`.

### `src/shared/utils/` — Utilidades puras

Funciones sin efectos secundarios: `slugify()`, `formatPhone()`, `CATEGORIES`. No dependen de nada externo.

---

## Reglas de la arquitectura

1. **Las API routes son delgadas.** Si una route tiene más de 30 líneas de lógica, algo salió mal.

2. **Los services no conocen HTTP.** No reciben `Request`, no devuelven `Response`. Reciben datos simples, devuelven datos simples.

3. **Los repositories no conocen el negocio.** No deciden si un plan es de pago o si el email debe fallar silenciosamente. Solo leen y escriben.

4. **`supabaseAdmin` es server-only.** Solo en `src/features/*/repository/` y `src/shared/lib/supabase-admin.ts`. Nunca en client components.

5. **La visibility rule vive en `profiles.repository.ts`.** Es la única fuente de verdad sobre qué perfiles son visibles. El frontend renderiza lo que recibe.

6. **Los inserts atómicos tienen rollback manual.** `enrollment.repository.ts` inserta en 5 tablas y deshace en cascada si algún paso falla. No usar excepciones para controlar flujo — rollback explícito.

---

## Cómo agregar un nuevo feature

Supongamos que hay que agregar un módulo `reviews` (reseñas de empresarias):

```
src/features/reviews/
├── types.ts                          ← ReviewStatus, Review
├── repository/
│   └── reviews.repository.ts         ← getReviews(), submitReview()
└── services/
    └── reviews.service.ts            ← reviewsService.submit(), reviewsService.list()
```

Luego en `app/`:
```typescript
// app/directorio/[slug]/page.tsx
import { reviewsService } from '@src/features/reviews/services/reviews.service'

const reviews = await reviewsService.list(profileId)
```

No crear un nuevo `app/api/reviews/route.ts` a menos que el cliente necesite llamarlo desde el browser. Si es Server Component, llama al service directamente.

---

## Commits en esta rama

```
b77d8d6 chore(cleanup): remove obsolete lib files replaced by src/features
daa78f1 refactor(app): update all imports to use src/features and src/shared
b89cfa2 feat(api): implement tracking route with trackingService
599016c refactor(api): thin solicitudes route delegates to enrollmentService
e1bec8e feat(tracking): add types, repository, and service
185ce44 feat(admin): add application, membership, finances, and profile services
2934c87 feat(admin): add types and repositories
ff58c56 feat(enrollment): add types, validators, repository, and service
559e050 feat(profiles): add types, repository, and service
5d51627 feat(shared): add lib re-exports for supabase, email, storage, auth
cbe9622 feat(shared): add slugify, formatPhone, and categories utils
b7c8c63 chore(config): add @src alias for src/ directory
```

---

## Deuda conocida

- `app/admin/(panel)/finanzas/page.tsx` sigue siendo un placeholder. El `finances.repository.ts` tiene la forma correcta pero no hay UI todavía.
- `lib/supabase.ts`, `lib/supabase-admin.ts`, `lib/email.ts`, `lib/storage.ts`, `lib/auth.ts` siguen existiendo. No se eliminaron porque las rutas de admin aún los importan directamente en algunos casos. En una limpieza futura se puede migrar todo a `src/shared/lib/` y eliminar los originales.
