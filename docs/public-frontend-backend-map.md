# Public Frontend Backend Map

## 1. Resumen de arquitectura frontend/backend

El proyecto usa Next.js App Router. Las rutas viven en `app/`, las APIs HTTP en `app/api/`, y la logica de dominio en `src/features/*`.

El frontend publico debe renderizar datos que vienen de servicios y repositorios. No debe decidir reglas de visibilidad, aprobacion, membresia, pagos ni autenticacion.

## 2. Backend existente que no se debe tocar

- `src/features/profiles/**`: lectura publica de perfiles y regla de visibilidad.
- `src/features/enrollment/**`: flujo de solicitudes, validacion, inserciones y archivos.
- `src/features/tracking/**`: vistas, clics y estadisticas por token.
- `src/features/admin/**`: panel admin, solicitudes, perfiles, membresias y finanzas.
- `lib/auth.ts` y `app/api/admin/**`: OTP y sesion admin.
- `lib/supabase-admin.ts`: cliente service role, solo servidor.

## 3. Helpers y clientes de Supabase

- `lib/supabase.ts`: exporta `supabasePublic` con anon key para lecturas publicas seguras.
- `src/shared/lib/supabase.ts`: re-export de `supabasePublic`.
- `lib/supabase-admin.ts`: exporta `supabaseAdmin` con service role. No usar en Client Components.
- `src/shared/lib/supabase-admin.ts`: re-export de `supabaseAdmin`.
- `lib/storage.ts`: helpers de storage server-side.

## 4. Variables de entorno necesarias

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `EMAIL_FROM`
- `EMAIL_APP_PASSWORD`
- `EMAIL_ADMIN`
- Variables de Gemini usadas por `lib/gemini.ts` para chat y embeddings.

No editar `.env.local` en esta rama.

## 5. Tablas o entidades que alimentan el frontend publico

- `entrepreneurs`
- `business_profiles`
- `memberships`
- `applications`
- `products`
- `profile_description_reviews`
- `profile_views`
- `contact_clicks`

La visibilidad publica de perfiles debe seguir esta regla en backend/data access:

```text
memberships.status = 'active'
AND memberships.end_at > now()
AND applications.status = 'aprobado'
```

## 6. Rutas API publicas existentes

- `POST /api/solicitudes`: recibe solicitudes de inscripcion.
- `POST /api/tracking`: registra vistas y clics de contacto.
- `POST /api/chat`: busqueda conversacional con Gemini y Supabase RPC.
- `POST /api/profiles/review-description`: revision editorial/IA de descripcion.
- `GET /api/perfiles`: placeholder.
- `GET /api/membresias`: placeholder.
- `GET /api/email`: placeholder.

## 7. Rutas API/admin protegidas

- `POST /api/admin/solicitar-acceso`
- `POST /api/admin/verificar-otp`
- `POST /api/admin/logout`
- `GET/POST /api/finanzas`
- `DELETE /api/finanzas/[id]`

Las rutas de panel bajo `app/admin/(panel)/**` quedan protegidas por `app/admin/(panel)/layout.tsx`, que valida `sw_admin_session`.

## 8. Como crear una nueva pagina publica conectada al backend

1. Crear `app/<ruta>/page.tsx`.
2. Si necesita datos publicos, llamar un servicio de `src/features/*/services`, no consultar tablas desde UI si existe un servicio.
3. Mantener la pagina como Server Component salvo que necesite estado o eventos del navegador.
4. No importar `supabaseAdmin` en componentes cliente.
5. Si la pagina lista perfiles, usar `profilesService` para conservar la regla de visibilidad.

## 9. Como crear un componente publico reutilizable

1. Crear el componente bajo `src/components/public/<grupo>/`.
2. Exportarlo desde `src/components/public/index.ts`.
3. Mantener props simples y serializables.
4. Usar Client Component solo si requiere estado, eventos o APIs del navegador.
5. Probarlo en `/dev/components`.

## 10. Archivos neutralizados en esta rama

- `app/page.tsx`: reemplazada landing visual por esqueleto de home/directorio con conexion a `profilesService.findAll()`.
- `app/directorio/page.tsx`: reemplazado listado visual por placeholder y salida minima conectada a `profilesService.findAll()`.
- `app/directorio/[slug]/page.tsx`: reemplazada ficha visual por placeholder conectado a `profilesService.getBySlug()`.
- `app/inscripcion/page.tsx`: neutralizado flujo visual largo; conserva lectura de `products` desde `supabasePublic`.
- `app/aliadas/page.tsx`: neutralizada ruta manual; conserva lectura de `products` desde `supabasePublic`.
- `app/estadisticas/[token]/page.tsx`: neutralizada vista visual; conserva validacion de token con `trackingService.getFullStats()`.

## 11. Riesgos o dudas detectadas

- `app/layout.tsx` monta `ChatBubble` globalmente. No se modifico para evitar impacto indirecto sobre `/admin`.
- `docs/` y `BITACORA.md` estan ignorados por `.gitignore`; revisar si esta documentacion debe entrar al repositorio versionado.
- El flujo de inscripcion mantiene la contradiccion existente: producto de lanzamiento sin comprobante vs `applications.receipt_path` requerido.
- `business-images` aparece en admin, pero debe verificarse en Supabase antes de depender de ese bucket.
- `rate_limit_attempts` existe en SQL versionado, pero debe verificarse en base live antes de asumirlo.

## 12. Proximos pasos recomendados

1. Decidir si `/aliadas` debe seguir en la arquitectura publica o quedar documentada como ruta manual.
2. Definir tokens visuales del nuevo frontend publico sin tocar admin.
3. Reconectar busqueda real y chat desde los nuevos componentes.
4. Reconectar tracking de vista/contacto en la nueva ficha de negocio.
5. Resolver deliberadamente el flujo de comprobante para lanzamiento gratuito antes de reconstruir `/inscripcion`.
