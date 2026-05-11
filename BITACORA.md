# Bitácora — DirectorioSW

Registro cronológico de decisiones, implementaciones y resultados por módulo y tarea.

## Documentacion rama chatbot

**Que hace:** documenta los cambios de la rama `chatbot` contra `master`: widget de chat, API, Gemini, embeddings, RPC SQL, setup y riesgos.
**Por que existe:** la rama introduce varias piezas conectadas y no era evidente que habia cambiado ni como dejarlo funcionando.
**Archivos creados o modificados:**
- `docs/chatbot-semantic-search.md`
- `README.md`
- `BITACORA.md`
**Decisiones tomadas:** se crea una guia dedicada en `docs/` y se enlaza desde README para que sea facil encontrarla; se deja explicito que la base local se llama `master`, aunque el pedido mencionaba `main`.
**Como probarlo:** leer `docs/chatbot-semantic-search.md` y verificar que cubre setup, SQL, script de embeddings, endpoint y pendientes.

---

## M0 — Foundations

### Tarea 1 — Estructura de carpetas

**Qué hace:** crea todos los directorios y archivos placeholder del proyecto para que Next.js no rompa durante el desarrollo de M1+.
**Por qué existe:** tener la estructura completa desde el inicio permite navegar a cualquier ruta sin errores 404 en el servidor de desarrollo y hace visible el mapa completo del sistema.
**Archivos creados o modificados:**
- `app/directorio/page.tsx` — placeholder
- `app/directorio/[slug]/page.tsx` — placeholder
- `app/inscripcion/page.tsx` — placeholder
- `app/estadisticas/[token]/page.tsx` — placeholder
- `app/admin/login/page.tsx` — placeholder
- `app/admin/(panel)/layout.tsx` — placeholder con `{children}`
- `app/admin/(panel)/page.tsx` — placeholder
- `app/admin/(panel)/solicitudes/page.tsx` — placeholder
- `app/admin/(panel)/solicitudes/[id]/page.tsx` — placeholder
- `app/admin/(panel)/perfiles/page.tsx` — placeholder
- `app/admin/(panel)/perfiles/[id]/page.tsx` — placeholder
- `app/admin/(panel)/membresias/page.tsx` — placeholder
- `app/admin/(panel)/finanzas/page.tsx` — placeholder
- `app/api/perfiles/route.ts` — placeholder GET
- `app/api/solicitudes/route.ts` — placeholder GET
- `app/api/membresias/route.ts` — placeholder GET
- `app/api/tracking/route.ts` — placeholder GET
- `app/api/email/route.ts` — placeholder GET
- `lib/email.ts` — placeholder
- `lib/utils.ts` — placeholder
- `components/ui/` — carpeta vacía
- `components/directorio/` — carpeta vacía
- `public/images/` — carpeta vacía
**Decisiones tomadas:** los placeholders de páginas usan un componente mínimo con texto descriptivo en lugar de `null` o un archivo vacío — así Next.js puede compilar sin errores y el desarrollador sabe qué viene en cada ruta. El `layout.tsx` del panel admin usa `{children}` para no romper el route group.
**Cómo probarlo:** `npm run dev` → navegar a `/directorio`, `/inscripcion`, `/admin/login` — todas deben responder 200 sin errores de compilación.

---

## Corrige visibilidad en RPC semantica

**Que hace:** ajusta `match_businesses_gemini` para filtrar perfiles visibles por solicitudes aprobadas en vez de `profile_reviews`.
**Por que existe:** la regla vigente de visibilidad publica es membresia activa mas `applications.status = 'aprobado'`; `profile_reviews` no controla visibilidad y su enum usa otros valores.
**Archivos creados o modificados:**
- `supabase/sql/semantic_search_gemini.sql`
- `BITACORA.md`
**Decisiones tomadas:** se reemplaza el `exists` sobre `public.profile_reviews` por `public.applications` para mantener la RPC alineada con `CLAUDE.md` y `context/05_DATABASE_SCHEMA.md`.
**Como probarlo:** ejecutar el SQL en Supabase SQL Editor y luego correr `notify pgrst, 'reload schema';`.

---

## Estabilizacion dev Next Tailwind

**Que hace:** ajusta `next dev` para usar Turbopack con raiz explicita y limita el escaneo de Tailwind a carpetas de codigo reales.
**Por que existe:** el servidor de desarrollo intentaba resolver `tailwindcss` desde el directorio padre y podia consumir demasiada memoria al escanear el repo completo.
**Archivos creados o modificados:**
- `package.json`
- `next.config.ts`
- `app/globals.css`
- `BITACORA.md`
**Decisiones tomadas:** se desactiva la cache persistente de Turbopack en dev y se agrega `dev:webpack` como respaldo manual; Tailwind usa `source(none)` con fuentes explicitas para evitar `.agents`, `.worktrees`, docs y artefactos generados.
**Como probarlo:** `npm run dev` -> abrir `/` y confirmar respuesta `200`; usar `npm run dev:webpack` solo como fallback.

---

## Fuentes locales de marca

**Que hace:** cambia las fuentes de marca a archivos locales servidos con `next/font/local`.
**Por que existe:** evita depender de Google Fonts durante desarrollo y mantiene disponibles las variables `--font-display` y `--font-body`.
**Archivos creados o modificados:**
- `app/layout.tsx`
- `app/fonts.ts`
- `app/fonts/`
- `app/globals.css`
- `BITACORA.md`
**Decisiones tomadas:** se conservan fallbacks CSS para que las variables tipograficas sigan resolviendo aunque la fuente local no cargue.
**Como probarlo:** `npm run dev` -> abrir `/` y verificar que no falle la carga de fuentes ni cambie la jerarquia tipografica.

---

### Tarea 2 — .env.local y configuración de entorno

**Qué hace:** crea `.env.local` con las variables de entorno necesarias y verifica que `.gitignore` lo excluya del repositorio.
**Por qué existe:** sin este archivo el proyecto no puede conectarse a Supabase ni enviar emails. Las credenciales nunca deben ir al repositorio.
**Archivos creados o modificados:**
- `.env.local` — variables con placeholders para Supabase, Gmail y URL del sitio
- `.gitignore` — verificado que incluye `.env.local`
- `.gitattributes` — creado para normalizar line endings a LF en todos los sistemas
- `.editorconfig` — creado para que el editor respete LF automáticamente
**Decisiones tomadas:** durante el primer `git add`, Git lanzó warnings de conversión LF→CRLF en todos los archivos (proyecto desarrollado en Windows). Se resolvió con `.gitattributes` que declara LF como estándar del repositorio y un `git add --renormalize .` para normalizar los archivos existentes. Sin `.gitattributes` los warnings persisten y pueden generar diffs falsos en equipos mixtos.
**Cómo probarlo:** `cat .env.local` debe mostrar las variables. `git check-ignore -v .env.local` debe confirmar que está ignorado.

---

### Tarea 3 — lib/supabase.ts

**Qué hace:** exporta dos clientes de Supabase con distintos niveles de acceso.
**Por qué existe:** el proyecto necesita dos contextos: lecturas públicas que respeten RLS (frontend) y operaciones privilegiadas que lo bypaseen (API routes). Un solo cliente con la service role key expuesto al cliente sería un riesgo de seguridad crítico.
**Archivos creados o modificados:**
- `lib/supabase.ts` — `supabasePublic` (anon key) y `supabaseAdmin` (service role key)
**Decisiones tomadas:** `supabaseAdmin` solo debe importarse en archivos dentro de `app/api/` o `lib/`. Nunca en componentes. Esta regla es de arquitectura, no de TypeScript — el lenguaje no puede forzarla, pero el CLAUDE.md la documenta como no negociable.
**Cómo probarlo:** crear una API route de diagnóstico temporal (`app/api/diagnostico/route.ts`) que ejecute un `SELECT 1` contra Supabase y confirme la respuesta 200 con datos.

---

### Tarea 4 — lib/email.ts

**Qué hace:** centraliza todo el envío de correo transaccional del sistema usando Nodemailer con Gmail SMTP.
**Por qué existe:** si cada API route configurara su propio transporter, cambiar de proveedor de email requeriría tocar múltiples archivos. Con este módulo, el cambio es en un solo lugar.
**Archivos creados o modificados:**
- `lib/email.ts` — transporter Gmail + `sendEmail` base + tres funciones específicas
**Decisiones tomadas:** se eligió Gmail con contraseña de aplicación (no OAuth) porque es suficiente para el volumen del MVP (~500 emails/día) y no requiere configurar un flujo OAuth completo. `EMAIL_ADMIN` soporta múltiples destinatarios separados por coma — se parsea con `.split(',').filter(Boolean)` para no enviar a strings vacíos si hay espacios. Los cuerpos son HTML simple en lugar de una librería de templates para mantener cero dependencias extra.
**Cómo probarlo:** desde una API route de prueba, llamar `notifyAdminNewApplication` con datos ficticios y verificar que el email llega a la cuenta de admin configurada en `.env.local`.

---

## M1 — Directory + Landing

### Tarea 5 — lib/data.ts + lib/types.ts + lib/utils.ts (capa de datos)

**Qué hace:** implementa la capa de acceso a datos del directorio: tipos TypeScript derivados del esquema real, helpers de utilidad, y las dos funciones de consulta que usan todas las páginas.
**Por qué existe:** centralizar la lógica de visibilidad y el mapeo de filas en un solo lugar evita que la regla crítica (membresía activa + solicitud aprobada + `end_at > now()`) se duplique o se implemente de forma distinta en cada página.
**Archivos creados o modificados:**
- `lib/types.ts` — tipo `DirectoryProfile` con todos los campos del perfil público, incluyendo `city` y `slug` computado
- `lib/utils.ts` — `slugify()`, `formatPhone()`, constante `CATEGORIES` (8 categorías del PRD)
- `lib/data.ts` — `getProfiles(filters?)` y `getProfileBySlug(slug)` con regla de visibilidad aplicada en el cliente (no en SQL, para compatibilidad con el esquema actual)
**Decisiones tomadas:** la regla de visibilidad se aplica en TypeScript después de traer los datos, no como filtro SQL, porque los joins anidados de Supabase con condiciones en tablas relacionadas son propensos a comportamiento inesperado con el cliente JS. `getProfileBySlug` delega a `getProfiles()` y filtra en memoria — para el volumen del MVP (decenas a cientos de perfiles) es eficiente y evita duplicar la regla de visibilidad.
**Cómo probarlo:** en una API route temporal, llamar `getProfiles()` y verificar que solo devuelve perfiles con membresía activa y solicitud aprobada. `getProfileBySlug('nombre-del-negocio')` debe devolver el perfil correcto o `null`.

---

### Tarea 6 — app/directorio/page.tsx (P2: directorio)

**Qué hace:** renderiza el directorio completo con búsqueda por texto, filtros por categoría y ciudad, y un grid responsive de tarjetas de negocio.
**Por qué existe:** es la página principal del producto — donde las compradoras llegan a buscar emprendimientos.
**Archivos creados o modificados:**
- `app/directorio/page.tsx` — Server Component completo con form de búsqueda, filtros como links, grid de tarjetas, estado vacío
- `lib/types.ts` — `city: string | null` agregado a `DirectoryProfile`
- `lib/utils.ts` — `CATEGORIES` exportada como constante
- `lib/data.ts` — `city` mapeado en `mapToDirectoryProfile()`, soporte de filtros `q`, `categoria`, `ciudad` en `getProfiles()`
**Decisiones tomadas:** los filtros de categoría y ciudad son `<a href>` en lugar de `<select>` con JavaScript — navegación sin JS, compatible con cualquier cliente, y el estado activo se deriva simplemente de los query params actuales. La búsqueda usa `<form method="get">` por la misma razón. No se usó paginación porque el volumen inicial no lo justifica y añade complejidad. La descripción se trunca a 80 caracteres en el componente, no en la query, para no perder datos en otras vistas.
**Cómo probarlo:** `npm run dev` → `/directorio` muestra todas las empresarias activas. `/directorio?categoria=Alimentación` filtra por categoría. `/directorio?q=yoga` busca por texto. `/directorio?ciudad=Medellín` filtra por ciudad. Combinaciones de parámetros funcionan.

---

### Tarea 7 — app/page.tsx (P1: landing)

**Qué hace:** landing page pública con seis secciones: nav, hero, métricas de comunidad, descripción de SW, preview del directorio (4 tarjetas), sección para empresarias, y footer.
**Por qué existe:** es la puerta de entrada del sitio — presenta la comunidad y el directorio a quienes llegan directo a swmujeres.com.
**Archivos creados o modificados:**
- `app/page.tsx` — Server Component completo con las 6 secciones, `Link` de Next.js para navegación interna, `getProfiles()` llamado una sola vez
**Decisiones tomadas:** `getProfiles()` se llama una única vez al inicio del componente y el resultado se reutiliza tanto para `profiles.length` (métrica de emprendimientos) como para `profiles.slice(0, 4)` (preview). Hacer dos queries separadas sería redundante. El componente `PreviewCard` es una copia local de la tarjeta de `/directorio` en lugar de un componente compartido — en este punto del proyecto crear un componente compartido sería abstracción prematura; si en el futuro divergen, ya están separados. Se usó `<Link>` de `next/link` para todas las rutas internas y `<a>` solo para links externos (Facebook, Instagram) — requerimiento del linter de Next.js.
**Cómo probarlo:** `npm run dev` → `/` muestra las 6 secciones. La métrica de emprendimientos refleja el count real de la DB. Las 4 tarjetas de preview son las primeras del directorio. Los CTAs de hero y empresarias navegan a `/directorio` e `/inscripcion`. El footer tiene los links correctos.

---

## M2 — Formulario de inscripción

### Tarea 3 — app/api/solicitudes/route.ts (POST handler)

**Qué hace:** recibe el formulario de inscripción como FormData, valida campos y archivos, verifica duplicados por cédula, sube el comprobante a Storage, inserta en 5 tablas con rollback manual, y notifica a la admin por email.
**Por qué existe:** es el único punto de entrada del sistema para nuevas empresarias; centraliza toda la lógica de negocio del flujo de inscripción.
**Archivos creados o modificados:**
- `app/api/solicitudes/route.ts` — reemplaza el placeholder con el handler POST completo
**Decisiones tomadas:** se usa `crypto.randomUUID()` para generar el UUID del entrepreneur antes de insertar, porque los uploads a Storage necesitan el ID como prefijo de ruta y Supabase no puede devolverlo antes del insert. El rollback es manual (delete en cascada inversa) en lugar de una función RPC/PL/pgSQL — el cliente JS de Supabase no expone transacciones directas, y crear una función SQL solo para esto sería sobrediseño para el MVP. Si el email a la admin falla, se loggea pero no interrumpe la respuesta — la solicitud ya está persistida. `city` no se incluye en el insert de `business_profiles` porque la columna no existe en la tabla; el campo aparece en `DirectoryProfile` de `lib/types.ts` solo como tipo de lectura.
**Nota para M3:** `directory_image_path: null` en el insert significa que el logo del negocio no se sube en el formulario de inscripción — se gestiona desde el panel admin cuando se construya el editor de perfiles.
**Cómo probarlo:** POST a `http://localhost:3000/api/solicitudes` con FormData incompleto → 400. Con cédula duplicada → 409. Con todos los campos correctos y comprobante adjunto → 200 con `applicationId`. Verificar en Supabase que se crearon filas en las 5 tablas.

---

### Tarea 4 — app/inscripcion/page.tsx (P4: formulario multi-paso)

**Qué hace:** formulario de inscripción de 3 pasos para nuevas empresarias — datos personales, datos del negocio, plan y pago — con validación por paso, carga de productos desde Supabase, y pantalla de confirmación al enviar.
**Por qué existe:** es el punto de entrada de las empresarias al sistema; sin él no pueden ingresar solicitudes.
**Archivos creados o modificados:**
- `app/inscripcion/page.tsx` — Client Component completo con sub-componentes `StepIndicator`, `Step1Form`, `Step2Form`, `Step3Form`, `Field`
- `app/api/solicitudes/route.ts` — ajustado: comprobante de pago ahora es opcional cuando `price_cop = 0` (plan gratuito); la validación se movió a después de obtener el producto
**Decisiones tomadas:** el estado de cada paso vive en `useState` separados (`step1`, `step2`, `step3`) en lugar de un objeto plano único — esto hace que los errores y el `onChange` de cada paso sean independientes y que TypeScript los tipe con precisión. Sub-componentes definidos como funciones en el mismo archivo en lugar de archivos separados porque ninguno tiene uso fuera de esta página y el costo de indirección no vale. El `directory_image` de `ApplicationFormStep2` no se incluye en el formulario porque el API route no lo maneja (se gestiona en admin, M3). El botón "Enviar solicitud" se deshabilita también si `productsLoading` es true para evitar submit sin `product_id`. `window.scrollTo` en cada cambio de paso lleva al usuario al inicio del formulario — especialmente útil en móvil.
**Cómo probarlo:** `npm run dev` → `/inscripcion` muestra el formulario. Intentar avanzar sin llenar campos muestra errores inline. Los datos del paso 1 se preservan al volver desde el paso 2. El selector de plan carga opciones reales de Supabase. Con plan gratuito no exige comprobante. Enviar el formulario completo → pantalla de confirmación.

---

## M3 — Panel de administración

### Tarea 1 — Magic link auth (login + endpoints)

**Qué hace:** implementa el flujo completo de autenticación sin contraseña para el panel admin: formulario de login, endpoint que genera y envía el magic link, y endpoint que valida el token y crea la sesión JWT.
**Por qué existe:** el panel admin necesita un mecanismo de acceso seguro que no requiera gestionar contraseñas y que solo permita entrar a los emails registrados en `admin_allowlist`.
**Archivos creados o modificados:**
- `app/api/admin/solicitar-acceso/route.ts` — POST: verifica email en allowlist, genera token de un solo uso (32 bytes), envía magic link por email; responde siempre con mensaje genérico
- `app/api/admin/auth/route.ts` — GET: valida token, lo marca como usado, crea JWT de sesión (7 días), setea cookie `sw_admin_session` httpOnly, redirige a `/admin`
- `app/admin/login/page.tsx` — formulario de email con estado de carga, mensaje de éxito genérico, banner de link expirado si `?error=invalid`
- `lib/email.ts` — agrega `sendMagicLinkEmail({ to, magicLinkUrl })` con plantilla HTML y botón de acceso
**Decisiones tomadas:** la respuesta de `/solicitar-acceso` es siempre 200 con el mismo mensaje, sin importar si el email existe — evita enumeración de usuarios. `useSearchParams()` se aisló en un sub-componente `InvalidLinkBanner` envuelto en `<Suspense>` porque Next.js 15+ lanza error de prerender si se usa directamente en el componente raíz de la página. Los errores de tipo `NEXT_REDIRECT` se re-lanzan en el catch del auth route porque Next.js los implementa como excepciones especiales — tragarlos cancelaría el redirect silenciosamente.
**Cómo probarlo:** `npm run dev` → `/admin/login` muestra el formulario. POST a `/api/admin/solicitar-acceso` con email no registrado → 200 con mensaje genérico. Con email registrado → llega email con link. Clic en link → GET `/api/admin/auth?token=...` → cookie seteada → redirect a `/admin`. Segundo clic en el mismo link → redirect a `/admin/login?error=invalid`.

---

## M3 — Panel de administración: Membresías y Dashboard

### Tarea — Página de membresías (`/admin/membresias`)

**Qué hace:** muestra alertas de membresías vencidas o por vencer (< 7 días) y una tabla completa de todas las membresías ordenada activas primero.
**Por qué existe:** permite a la admin identificar de un vistazo qué empresarias necesitan renovación o tienen membresías problemáticas.
**Archivos creados o modificados:**
- `app/admin/(panel)/membresias/page.tsx` — reemplaza el placeholder con la implementación completa
**Decisiones tomadas:** las queries `getMembershipAlerts()` y `getAdminProfiles()` se ejecutan en paralelo con `Promise.all`. Los días restantes en la tabla se calculan en el componente (no en la capa de datos) porque `AdminProfile` ya tiene `membership_end` y no vale la pena duplicar la lógica de `daysFromNow` en `admin-data.ts`. El badge de días en la tabla usa color pero no repite el texto narrativo — la columna "Días restantes" muestra el número directamente, reservando el texto narrativo solo para las cards de alerta.
**Cómo probarlo:** `npm run dev` → `/admin/membresias`. Sección 1 muestra cards si hay membresías activas próximas a vencer. Sección 2 muestra tabla completa ordenada.

---

### Tarea — Dashboard del panel (`/admin`)

**Qué hace:** muestra 4 métricas clave (solicitudes pendientes, perfiles totales, perfiles activos, alertas), un saludo con la fecha en español, accesos rápidos y un banner de alerta si hay solicitudes pendientes.
**Por qué existe:** es la primera pantalla tras el login — debe dar contexto inmediato sobre el estado del directorio sin necesidad de navegar.
**Archivos creados o modificados:**
- `app/admin/(panel)/page.tsx` — reemplaza el placeholder con el dashboard completo
**Decisiones tomadas:** las 4 queries (`getAdminApplications('pendiente')`, `getAdminApplications()`, `getAdminProfiles()`, `getMembershipAlerts()`) se ejecutan en paralelo con `Promise.all`. `activeProfiles` se calcula en JS filtrando el resultado de `getAdminProfiles()` — evita una quinta query. El banner de solicitudes pendientes solo aparece si `pendingCount > 0`, condición evaluada en el servidor. La fecha se formatea con `toLocaleDateString('es-CO', ...)` directamente en el Server Component para garantizar consistencia de locale sin depender del cliente.
**Cómo probarlo:** `npm run dev` → `/admin`. Verificar que el saludo muestra la fecha correcta en español. Si hay solicitudes pendientes, aparece el banner amarillo. Las 4 métricas deben reflejar el estado real de la base de datos.

---
## Migración de magic links a OTP de 6 dígitos

**Qué hace:** reemplaza el flujo de autenticación admin de magic links por un código OTP de 6 dígitos enviado al correo, con un formulario de dos pasos en `/admin/login`.
**Por qué existe:** los magic links requieren que el admin salte entre el cliente de correo y el navegador con el estado de sesión activo, lo que es frágil en móvil. Un OTP de 6 dígitos es más simple y funciona en cualquier dispositivo.
**Archivos creados o modificados:**
- `lib/auth.ts` — reemplazado: se eliminaron `createMagicLink` y `verifyMagicLink`; se agregaron `createOtp` y `verifyOtp`. Se mantuvieron `isEmailAllowed`, `createSession`, `verifySession` y `SESSION_COOKIE_NAME`.
- `lib/email.ts` — se agregó `sendOtpEmail({ to, code })`. Las funciones existentes se mantienen intactas.
- `app/api/admin/solicitar-acceso/route.ts` — reemplazado: ahora llama `createOtp` + `sendOtpEmail` en vez de `createMagicLink` + `sendMagicLinkEmail`.
- `app/api/admin/verificar-otp/route.ts` — creado nuevo: valida el OTP, crea la sesión JWT y setea la cookie `sw_admin_session`.
- `app/admin/login/page.tsx` — reemplazado: formulario de dos pasos (email → código OTP).
- `app/api/admin/auth/route.ts` — eliminado: ya no se necesita (era el callback de magic links).
**Decisiones tomadas:** se reutiliza la tabla `admin_magic_links` guardando el código de 6 dígitos en el campo `token` — evita crear una nueva tabla. El OTP expira en 10 minutos (antes los magic links duraban 15). La ruta `verificar-otp` devuelve `{ ok: true }` y deja que el cliente haga `window.location.href = '/admin'` en vez de usar `redirect()` del servidor — esto garantiza que la cookie ya esté seteada en el navegador antes de la navegación; `redirect()` en route handlers ocurre en el mismo response y puede causar race conditions con la cookie en algunos browsers. El input del código filtra caracteres no numéricos en el `onChange` para evitar que el usuario ingrese letras.
**Cómo probarlo:** `npm run dev` → `/admin/login`. Ingresar un email que esté en `admin_allowlist`. Verificar que llega el email con el código. Ingresar el código de 6 dígitos. Verificar redirect a `/admin`. Probar con código incorrecto — debe mostrar "Código inválido o expirado".

---

## Task 7 — DDD services layer (admin)

**Qué hace:** crea la capa de servicios para los módulos admin: aplicaciones, membresías, finanzas y perfiles.
**Por qué existe:** los servicios orquestan la lógica de negocio — encapsulan llamadas a múltiples repositorios, manejan notificaciones y abstraen detalles técnicos de los casos de uso (rutas API, páginas).
**Archivos creados o modificados:**
- `src/features/admin/services/applications.service.ts` — orquesta: listado, obtención por ID, aprobación (activa membresía + notifica por email), rechazo (opcional notificación).
- `src/features/admin/services/memberships.service.ts` — orquesta: obtener alertas de membresías vencidas, toggle de estatus.
- `src/features/admin/services/finances.service.ts` — orquesta: obtener ledger, agregar entrada, calcular resumen (totales e ingresos/egresos).
- `src/features/admin/services/profiles.admin.service.ts` — orquesta: listar (con búsqueda opcional), obtener por ID, actualizar.
**Decisiones tomadas:** los servicios exportan un objeto con métodos async en lugar de funciones individuales — patrón consistente con `lib/auth.ts` existente. En `applications.service.ts` el método `approve` requiere `entrepreneurName` como parámetro separado porque la firma de `notifyEntrepreneurApproved` lo exige (`{ to, entrepreneurName, businessName }`). En `finances.service.ts` el método `getSummary` calcula las sumas en JavaScript (no en SQL) porque los montos ya están en memoria del `getLedger()`; es O(n) pero el ledger no será nunca lo bastante grande para justificar una query aggregada. Los emails fallan silenciosamente en `approve` y `reject` — la solicitud se procesa al margen del resultado del email.
**Cómo probarlo:** `npm run build` → sin errores. Las importaciones de tipos desde `../types` y funciones desde `../repository/**` se resuelven. Los servicios están listos para ser consumidos en rutas API y páginas (M3).

---

## M5 — Tracking

### Task 4 — getFullStats tracking service

**Qué hace:** extiende el tracking service con el método `getFullStats` que combina stats base con series de tiempo e promedios del directorio.
**Por qué existe:** permite que la página de estadísticas (`/estadisticas/[token]`) acceda a los datos completos de un perfil en una sola llamada — vistas/clicks del último mes, comparativas con el promedio del directorio.
**Archivos creados o modificados:**
- `src/features/tracking/services/tracking.service.ts` — agregadas importaciones de `getTimeSeriesStats` y `getDirectoryAverages`, agregado tipo `FullStats`, agregado método `getFullStats(token)` que orquesta ambas queries en paralelo
**Decisiones tomadas:** el método usa `Promise.all` para ejecutar `getTimeSeriesStats` y `getDirectoryAverages` en paralelo — no hay dependencia entre ellas. El spread `{ ...base, timeSeries, averages }` funciona porque `base` es `ProfileStats & { businessName }` y añadimos `timeSeries` y `averages`, satisfaciendo la forma completa de `FullStats`.
**Cómo probarlo:** `npm run build` → compile sin errores. El método `trackingService.getFullStats(token)` devuelve `FullStats | null` con estructura correcta.

---

## M6 — SEO & Launch

### M6-4 — Lighthouse: imágenes optimizadas

**Qué hace:** reemplaza los `<img>` crudos del directorio y la landing por el componente `<Image>` de Next.js, convierte las rutas brutas de Supabase Storage a URLs públicas completas, y agrega preconnect al dominio de Supabase.
**Por qué existe:** los `<img>` crudos no generan WebP automático ni previenen CLS — ambos penalizan Lighthouse. Las rutas crudas (`storage/...`) almacenadas en `directory_image_path` nunca eran URLs válidas para el navegador; las imágenes estaban rotas en el directorio público.
**Archivos creados o modificados:**
- `src/shared/utils/getPublicImageUrl.ts` — nueva utilidad: si la ruta ya empieza con `http` la retorna igual; si no, le antepone `${NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/`.
- `src/features/profiles/repository/profiles.repository.ts` — `mapToDirectoryProfile` aplica `getPublicImageUrl` al campo `directory_image_path` al mapear el resultado de Supabase; todos los consumidores reciben la URL lista para usar.
- `next.config.ts` — agregado `images.remotePatterns` para `*.supabase.co/storage/v1/object/public/**`.
- `app/page.tsx` — `<img>` → `<Image width={44} height={44}>` en `PreviewCard`; import de `next/image`.
- `app/directorio/page.tsx` — `<img>` → `<Image width={48} height={48}>` en `ProfileCard`; import de `next/image`.
- `app/layout.tsx` — añadido `<link rel="preconnect">` al dominio de Supabase en `<head>`.
**Decisiones tomadas:** la conversión de URL vive en el repositorio (no en cada componente) porque es el único punto donde `directory_image_path` sale de la base de datos — así no hay que recordar hacerlo en cada uso. El guard `path.startsWith('http')` permite que perfiles que ya tengan una URL completa sigan funcionando sin doble-prefijo. No se usó `fill` en estos avatares porque tienen dimensiones fijas conocidas (`w-11/w-12`); `width`/`height` explícitos son más eficientes para tamaños pequeños.
**Cómo probarlo:** `npm run dev` → abrir `/directorio` o `/`; las fotos de perfil deben cargar como WebP. En DevTools → Network → filtrar por Img: los request deben ir a `/_next/image?url=...`. `npm run build` → sin errores de remotePatterns.


---

## Rediseño visual — Prototipo Directorio

### Diseño — Implementación del brand system SW Mujeres

**Qué hace:** aplica el sistema de diseño oficial de SW Mujeres (tipografía EB Garamond + Montserrat, paleta burgundy/cream, layout editorial) a las páginas públicas: landing, directorio y perfil de negocio.
**Por qué existe:** las páginas usaban un estilo genérico (pink/stone Tailwind). La directora exportó el prototipo final desde Claude Design y lo entregó para implementación real.
**Archivos creados o modificados:**
- `app/layout.tsx` — reemplaza Geist por EB Garamond (display, italic) + Montserrat (body) vía `next/font/google`.
- `app/globals.css` — agrega todos los tokens de color SW (`--sw-burgundy`, `--sw-cream`, etc.), variables semánticas (`--bg`, `--fg`, `--accent`), shadows y helpers tipográficos (`.sw-display`, `.sw-eyebrow`).
- `app/page.tsx` — landing rediseñada: hero oscuro con headline serif italic, barra de búsqueda integrada, métricas, feature grid, preview del directorio, sección para empresarias con pasos numerados, footer con columnas.
- `app/directorio/page.tsx` — directorio con hero editorial, sidebar de filtros por categoría y ciudad, grilla de 2 columnas con tarjetas photo-top, estado vacío, footer compacto.
- `app/directorio/[slug]/page.tsx` — perfil magazine-style: headline gigante italic, imagen hero 5:4, panel de contacto sticky (WhatsApp + Instagram + web), badge de verificación, sección "la empresaria", breadcrumb, metadata y JSON-LD conservados.
- `public/logo-symbol-circle-dark.svg` — logo SVG del brand kit.
- `public/logo-symbol-circle-burgundy.svg` — variante burgundy del logo.
- `public/logo-symbol-minimal.svg` — variante minimal para badges dentro de tarjetas.
**Decisiones tomadas:** se usan inline styles para los tokens de color (ej. `color: 'var(--accent)'`) en lugar de clases Tailwind arbitrarias porque el sistema de diseño opera principalmente con CSS custom properties; esto hace el código más legible y consistente con el prototipo. Los gradientes decorativos reemplazan imágenes cuando `directory_image_path` es null — evita estados de error visibles. `ContactLinks` y `TrackView` se conservaron intactos en el perfil para no romper el tracking de M5.
**Cómo probarlo:** rama `feature/directorio-mujeres`. `npm run build` → sin errores. `npm run dev` → visitar `/`, `/directorio`, `/directorio/[slug]`.

---

## Ajuste hero landing estilo editorial

**Qué hace:** rediseña el hero de la landing para acercarlo a una composición editorial con titular serif, buscador compacto y collage visual de marca.
**Por qué existe:** el hero anterior no transmitía el tono visual buscado para SW Mujeres; la nueva composición da más presencia al mensaje y se alinea mejor con la referencia entregada.
**Archivos creados o modificados:**
- `app/page.tsx` — actualiza el hero: fondo burgundy con profundidad, título EB Garamond, `mujeres` en italic rosado, copy corto, buscador compacto, avatares reducidos y collage con gradientes de marca.
- `public/11.svg` — sello circular SW usado superpuesto en el collage del hero.
**Decisiones tomadas:** el collage usa gradientes de marca en vez de fotos para mantener una composición consistente aunque el directorio no tenga imágenes suficientes. El sello se mueve a `public/11.svg` porque la versión exportada calza mejor con el estilo de la referencia. Se conserva el brand system existente: EB Garamond para display y Montserrat para UI/body.
**Cómo probarlo:** `npx.cmd tsc --noEmit` → sin errores. `npm.cmd run dev` → abrir `http://localhost:3000/`.
---

## Ajuste peso tipografico del hero

**Que hace:** reduce el peso visual de las letras del hero principal en la landing.
**Por que existe:** el titular se veia demasiado pesado frente al estilo editorial buscado para SW Mujeres.
**Archivos creados o modificados:**
- `app/page.tsx` - baja el `fontWeight` del titular, del enfasis `mujeres` y del contador de negocios activos.
- `BITACORA.md` - documenta el ajuste realizado.
**Decisiones tomadas:** se cambia solo el peso tipografico para conservar la composicion, tamanos, colores y espaciado ya aprobados.
**Como probarlo:** `npm run dev` -> abrir `http://localhost:3000/` y revisar que el hero se vea mas liviano.

---

## Ajuste metricas sin italic

**Que hace:** quita el estilo italic de los numeros de la franja de metricas en la landing.
**Por que existe:** permite revisar visualmente una version mas recta y sobria de esos datos destacados.
**Archivos creados o modificados:**
- `app/page.tsx` - cambia los numeros de metricas de `fontStyle: 'italic'` a `fontStyle: 'normal'`.
- `BITACORA.md` - documenta el ajuste realizado.
**Decisiones tomadas:** se mantiene la misma familia tipografica, tamano, color y espaciado para aislar la comparacion al italic.
**Como probarlo:** `npm run dev` -> abrir `http://localhost:3000/` y revisar la franja de metricas bajo el hero.

---

## Ajuste titular quienes somos sin italic

**Que hace:** quita el italic del texto "Aqui encuentras negocios" y conserva italic solo en "verificados.".
**Por que existe:** permite comparar una version mas sobria del titular manteniendo el enfasis editorial en la palabra clave.
**Archivos creados o modificados:**
- `app/page.tsx` - cambia el `h2` de la seccion "Quienes somos" a `fontStyle: 'normal'` y agrega italic al span de `verificados.`.
- `BITACORA.md` - documenta el ajuste realizado.
**Decisiones tomadas:** se conserva la misma familia, peso, tamano, color y espaciado para que el cambio visual sea solo el estilo italic.
**Como probarlo:** `npm run dev` -> abrir `http://localhost:3000/` y revisar el titular de la seccion "Quienes somos".

---

## Ajuste navbars sin inscripcion

**Que hace:** elimina el enlace "Inscribete" de las navbars publicas.
**Por que existe:** la navegacion superior debe quedar mas limpia y sin acceso directo a inscripcion.
**Archivos creados o modificados:**
- `app/page.tsx` - quita `Inscribete` del `SiteHeader`.
- `app/directorio/page.tsx` - quita `Inscribete` del header del directorio.
- `app/directorio/[slug]/page.tsx` - quita `Inscribete` del header del perfil publico.
- `BITACORA.md` - documenta el ajuste realizado.
**Decisiones tomadas:** se conservan los CTAs y enlaces de inscripcion fuera de las navbars porque la solicitud apunta solo a navegacion superior.
**Como probarlo:** `npm run dev` -> abrir `/`, `/directorio` y un perfil en `/directorio/[slug]`; la navbar debe mostrar solo el logo y `Directorio`.

---

## Campo de captura solo para unica publicacion

**Que hace:** muestra el upload "Captura de tu publicacion en el grupo SW" solo cuando el plan seleccionado corresponde a "Unica publicacion".
**Por que existe:** ese soporte aplica unicamente para solicitudes asociadas a una publicacion puntual, no para todos los planes del formulario.
**Archivos creados o modificados:**
- `app/inscripcion/page.tsx` - condiciona el render del campo y limpia `post_screenshot` al cambiar a otro plan.
- `app/aliadas/page.tsx` - aplica la misma condicion en el formulario privado de aliadas.
- `BITACORA.md` - documenta el ajuste realizado.
**Decisiones tomadas:** se normaliza el nombre del plan quitando tildes y pasando a minusculas para que funcione con "Unica publicacion" o "Única publicación". Tambien se borra la captura ya seleccionada si la usuaria cambia a un plan distinto, evitando enviar un archivo de un campo oculto.
**Como probarlo:** `npm run dev` -> abrir `/inscripcion` o `/aliadas`, ir al paso 3 y confirmar que el campo de captura solo aparece al seleccionar el plan "Unica publicacion".

---

## Ajuste cards sin borde

**Que hace:** elimina el borde visible de las cards publicas de negocios.
**Por que existe:** las cards debian verse mas limpias y menos delineadas en la grilla.
**Archivos creados o modificados:**
- `components/directorio/PreviewCard.tsx` - quita la propiedad `border` del contenedor de la card.
- `BITACORA.md` - documenta el ajuste realizado.
**Decisiones tomadas:** se conserva el radio, el overflow y los fondos existentes para mantener la estructura visual sin el contorno.
**Como probarlo:** `npm run dev` -> abrir `/` o `/directorio` y confirmar que las cards no tengan borde exterior.

---

## Restaurar borde de cards

**Que hace:** vuelve a mostrar el borde exterior en las cards publicas de negocios.
**Por que existe:** se descarto la prueba sin borde y se retoma el contorno original de las cards.
**Archivos creados o modificados:**
- `components/directorio/PreviewCard.tsx` - restaura `border: '1px solid'` en el contenedor de la card.
- `BITACORA.md` - documenta el ajuste realizado.
**Decisiones tomadas:** se restaura solo el borde, sin modificar radio, fondos, contenido ni hover.
**Como probarlo:** `npm run dev` -> abrir `/` o `/directorio` y confirmar que las cards tengan borde exterior nuevamente.

---

## Ajuste descripcion adaptable en cards

**Que hace:** permite que las cards muestren mas descripcion cuando el alto de la fila crece por otra card expandida.
**Por que existe:** el estado colapsado debe verse igual que antes, pero el recorte fijo dejaba espacio sin aprovechar en cards vecinas cuando la fila crecia.
**Archivos creados o modificados:**
- `components/directorio/PreviewCard.tsx` - conserva el truncado en estado normal y usa `ResizeObserver` para mostrar la descripcion completa cuando la card gana alto por el layout.
- `app/directorio/page.tsx` - mantiene `descMaxLen={80}` para que el estado colapsado del directorio siga como antes.
- `app/globals.css` - hace que el body de la card pueda ocupar el alto disponible y que la descripcion maneje el overflow.
- `BITACORA.md` - documenta el ajuste realizado.
**Decisiones tomadas:** se mide el alto de la card en cliente para diferenciar el estado colapsado del estado estirado por la fila; asi se conserva el recorte normal y se libera solo cuando hay espacio real extra.
**Como probarlo:** `npm run dev` -> abrir `/directorio`, pasar el mouse por una card y confirmar que las cards vecinas muestran mas descripcion si tienen espacio.

---

## Ajuste footer con arte SVG

**Que hace:** reemplaza el bloque textual izquierdo del footer por el arte `10.svg`.
**Por que existe:** el footer debe usar el asset visual exportado en lugar de reconstruir logo, texto y claim con HTML.
**Archivos creados o modificados:**
- `app/page.tsx` - reemplaza logo, descripcion y claim del footer por `<Image src="/10.svg">`.
- `public/10.svg` - asset visual usado en el footer.
- `BITACORA.md` - documenta el ajuste realizado.
**Decisiones tomadas:** se mantiene la grilla y columnas del footer; solo se sustituye el contenido del bloque izquierdo.
**Como probarlo:** `npm run dev` -> abrir `/` y revisar que el lado izquierdo del footer muestre el arte de `10.svg`.

---

## Ajuste tamano y color del arte del footer

**Que hace:** reduce el arte `10.svg` del footer y cambia sus trazos negros por un tono cream claro.
**Por que existe:** el SVG se veia demasiado grande y el negro no funcionaba bien sobre el fondo burgundy oscuro.
**Archivos creados o modificados:**
- `app/page.tsx` - baja el render del SVG del footer a 220px de ancho maximo.
- `public/10.svg` - cambia `#000000` por `#f7efe9`.
- `BITACORA.md` - documenta el ajuste realizado.
**Decisiones tomadas:** se usa `#f7efe9` porque corresponde al token visual `--sw-cream` y mantiene contraste calido sobre el footer.
**Como probarlo:** `npm run dev` -> abrir `/` y revisar que el arte del footer sea mas pequeno y claro.

---

## Validacion de campos en formulario de inscripcion

**Que hace:** agrega validacion completa (formato + reglas de negocio) en los 3 pasos del formulario publico de inscripcion, un componente PhoneInput con selector de pais y banderas, y validacion server-side via Zod en el API route.
**Por que existe:** el formulario solo verificaba presencia de campos; sin validacion de formato, datos invalidos llegaban a la base de datos y errores como cedulas con letras, nombres sin apellido o URLs de Facebook falsas pasaban sin aviso.
**Archivos creados o modificados:**
- `components/ui/PhoneInput.tsx` - nuevo componente: pill con selector de pais (bandera + codigo) y campo de digitos; Colombia predeterminado; 20 paises LATAM + ES + US.
- `app/inscripcion/page.tsx` - reemplaza inputs de telefono por PhoneInput; mejora validateStep1 (cedula digits, nombre+apellido, email regex, facebook.com obligatorio), validateStep2 (category vs CATEGORIES, description min/max, instagram normalization, website URL), validateStep3 (MIME + 5 MB en comprobante).
- `src/features/enrollment/validators.ts` - reescribe schemas Zod con reglas completas; wired al API route.
- `app/api/solicitudes/route.ts` - reemplaza checks manuales por enrollmentSchema.safeParse(); normaliza instagram_handle (URL/@ → bare username) antes de validar y antes de insertar en DB; agrega validacion de MIME y tamano del comprobante server-side.
**Decisiones tomadas:** instagram acepta @usuario, usuario o URL completa de instagram.com; se normaliza a solo el texto del username antes de guardar en DB. El telefono se almacena como dialCode+digits (ej. +573001234567). La validacion de facebook.com es por hostname, no por regex de URL, para ser resiliente a subdominios como m.facebook.com.
**Como probarlo:** `npm run dev` -> `/inscripcion` -> intentar avanzar con campos vacios o con formato incorrecto en cada paso; verificar mensajes de error por campo.

---

## Rediseño hero sin barra lateral

**Que hace:** rediseña la landing con un hero claro inspirado en la referencia, navegacion superior, buscador, arte central, panel de comunidad, metricas, categorias, destacados, eventos y recursos.
**Por que existe:** se necesitaba comparar una direccion visual mas cercana al mockup compartido sin incorporar la barra lateral.
**Archivos creados o modificados:**
- `app/page.tsx` - reemplaza la landing por una composicion editorial modular sin sidebar.
- `app/globals.css` - agrega estilos responsive para el nuevo hero, paneles, categorias, destacados y bloques secundarios.
- `BITACORA.md` - documenta el ajuste realizado.
**Decisiones tomadas:** se conserva la pagina como Server Component; el contador y los negocios destacados siguen viniendo de `profilesService.findAll()`. La barra lateral se descarta por peticion explicita y se concentra la navegacion en el header superior.
**Como probarlo:** `npm run dev` -> abrir `/` y revisar desktop/mobile; `npm run build` para validar compilacion.

---

## Reorganizacion secciones landing

**Que hace:** separa `Explora por categorias` y `Negocios destacados` como secciones propias, y mueve el bloque `Recibe inspiracion cada semana` a la seccion inferior junto a recursos.
**Por que existe:** el newsletter no debia competir visualmente con categorias y destacados en la misma fila.
**Archivos creados o modificados:**
- `app/page.tsx` - reorganiza la estructura de secciones de la landing.
- `app/globals.css` - ajusta el responsive para la nueva fila inferior.
- `BITACORA.md` - documenta el ajuste realizado.
**Decisiones tomadas:** se mantiene categorias y destacados en ancho completo; recursos y newsletter quedan como la seccion secundaria inferior.
**Como probarlo:** `npm run dev` -> abrir `/` y confirmar que categorias, destacados y newsletter esten en bloques separados.

---

## Franja de categorias

**Que hace:** convierte `Explora por categorias` de contenedor tipo card a franja horizontal.
**Por que existe:** la seccion debe leerse como una banda de navegacion, no como una caja flotante.
**Archivos creados o modificados:**
- `app/page.tsx` - quita el estilo de card del rail de categorias y usa bordes superior/inferior con separadores internos.
- `BITACORA.md` - documenta el ajuste realizado.
**Decisiones tomadas:** se conservan los separadores entre categorias para mantener escaneo rapido, pero se elimina el borde redondeado y la sombra exterior.
**Como probarlo:** `npm run dev` -> abrir `/` y revisar que categorias se vea como franja.

---

## Metricas sin contenedor

**Que hace:** elimina fondo, borde y sombra del bloque de metricas del hero.
**Por que existe:** las metricas deben verse integradas al fondo, no como una card independiente.
**Archivos creados o modificados:**
- `app/page.tsx` - quita `softCard` del wrapper de metricas y conserva la grilla con separadores.
- `BITACORA.md` - documenta el ajuste realizado.
**Decisiones tomadas:** se mantienen los separadores internos porque ayudan a leer cada metrica sin necesitar caja exterior.
**Como probarlo:** `npm run dev` -> abrir `/` y revisar que el bloque de metricas no tenga fondo ni borde externo.

---

## Quitar flecha destacados

**Que hace:** elimina el boton circular con flecha superpuesto a la derecha de `Negocios destacados`.
**Por que existe:** el CTA duplicaba el enlace `Ver todos` y estorbaba visualmente sobre la ultima card.
**Archivos creados o modificados:**
- `app/page.tsx` - quita el link circular absoluto del bloque de destacados.
- `BITACORA.md` - documenta el ajuste realizado.
**Decisiones tomadas:** se conserva `Ver todos` como unico CTA de la seccion.
**Como probarlo:** `npm run dev` -> abrir `/` y confirmar que no aparezca la flecha circular sobre las cards.

---

## Iconos categorias especificas

**Que hace:** cambia los iconos de Moda, Alimentacion, Educacion y Tecnologia por bolso, pan, borla academica y laptop.
**Por que existe:** esos iconos debian representar mejor la categoria correspondiente.
**Archivos creados o modificados:**
- `app/page.tsx` - agrega `CategoryIcon` con SVG lineales para las categorias solicitadas.
- `BITACORA.md` - documenta el ajuste realizado.
**Decisiones tomadas:** se usan SVG con `currentColor` en lugar de emoji para mantener el trazo burgundy consistente con la franja.
**Como probarlo:** `npm run dev` -> abrir `/` y revisar los iconos del rail de categorias.

---

## Carpeta iconos categorias

**Que hace:** mueve todos los iconos del rail de categorias a `components/icons/categories` y unifica su grosor.
**Por que existe:** los iconos estaban mezclando simbolos de texto y SVG, lo que producia pesos visuales distintos y dificultaba reutilizarlos.
**Archivos creados o modificados:**
- `components/icons/categories/CategoryIcon.tsx` - nuevo componente con los diez iconos SVG y `strokeWidth` compartido.
- `components/icons/categories/index.ts` - exporta el componente y la lista ordenada de categorias.
- `app/page.tsx` - consume `CategoryIcon` y `CATEGORY_NAMES` en lugar de definir iconos inline.
- `BITACORA.md` - documenta el ajuste realizado.
**Decisiones tomadas:** se centraliza la lista de categorias junto a sus iconos para mantener orden y evitar que nuevos iconos se creen sueltos en la landing.
**Como probarlo:** `npm run dev` -> abrir `/` y confirmar que todos los iconos tengan el mismo trazo.

---

## Quitar iconos metricas

**Que hace:** elimina los iconos del bloque de metricas del hero.
**Por que existe:** las metricas debian quedar mas limpias y centradas en numero + etiqueta.
**Archivos creados o modificados:**
- `app/page.tsx` - quita el render de iconos en `Metrics`.
- `BITACORA.md` - documenta el ajuste realizado.
**Decisiones tomadas:** se mantienen los separadores internos para conservar estructura sin agregar ruido visual.
**Como probarlo:** `npm run dev` -> abrir `/` y confirmar que las metricas no muestren iconos.

---

## Ajuste arte comunidad

**Que hace:** reemplaza el trazo figurativo del card `Comunidad SW` por una forma abstracta de ondas.
**Por que existe:** la ilustracion anterior se veia demasiado informal para el tono del hero.
**Archivos creados o modificados:**
- `app/page.tsx` - cambia los paths del SVG decorativo del card de comunidad.
- `app/globals.css` - ajusta posicion, tamano, grosor y opacidad del trazo.
- `BITACORA.md` - documenta el ajuste realizado.
**Decisiones tomadas:** se usa una abstraccion de red/movimiento en lugar de figuras humanas para mantener calidez sin verse caricaturesco.
**Como probarlo:** `npm run dev` -> abrir `/` y revisar el card `Comunidad SW`.

---

## Sello comunidad superpuesto

**Que hace:** cambia el sello `11.svg` del card `Comunidad SW` para que se vea superpuesto y parcialmente fuera del contenedor.
**Por que existe:** el sello dentro del card deformaba la composicion visual.
**Archivos creados o modificados:**
- `app/page.tsx` - permite overflow visible en el card oscuro.
- `app/globals.css` - reposiciona el sello como capa superpuesta sin filtro ni opacidad reducida.
- `BITACORA.md` - documenta el ajuste realizado.
**Decisiones tomadas:** se mantiene el sello absoluto y con `pointer-events: none` para que no interfiera con enlaces.
**Como probarlo:** `npm run dev` -> abrir `/` y revisar que el sello este por encima del card sin deformarlo.

---

## Mejor contraste sello comunidad

**Que hace:** reposiciona el sello `11.svg` y aumenta su visibilidad sobre el card `Comunidad SW`.
**Por que existe:** el sello quedaba demasiado fuera del card y con poco contraste.
**Archivos creados o modificados:**
- `app/globals.css` - ajusta posicion, tamano, opacidad y sombra del sello.
- `BITACORA.md` - documenta el ajuste realizado.
**Decisiones tomadas:** se mantiene parcialmente superpuesto, pero con mas area dentro del card para que el sello sea reconocible.
**Como probarlo:** `npm run dev` -> abrir `/` y revisar el sello en el card `Comunidad SW`.

---

## Ajuste posicion columna hero

**Que hace:** desplaza ligeramente a la izquierda la columna derecha del hero.
**Por que existe:** el card de comunidad y las metricas estaban demasiado pegados al borde derecho visual.
**Archivos creados o modificados:**
- `app/page.tsx` - agrega `translateX(-28px)` al stack derecho del hero.
- `BITACORA.md` - documenta el ajuste realizado.
**Decisiones tomadas:** se mueve la columna completa para mantener alineados el card y las metricas.
**Como probarlo:** `npm run dev` -> abrir `/` y revisar la posicion del card `Comunidad SW`.

---

## Ajuste horizontal sello comunidad

**Que hace:** mueve el sello `11.svg` del card `Comunidad SW` un poco hacia la derecha.
**Por que existe:** el sello necesitaba quedar mas superpuesto al borde sin cambiar su altura.
**Archivos creados o modificados:**
- `app/globals.css` - ajusta solo la propiedad `right` del sello.
- `BITACORA.md` - documenta el ajuste realizado.
**Decisiones tomadas:** no se modifica `bottom`, `width`, `height` ni `transform` para conservar altura, tamano y rotacion.
**Como probarlo:** `npm run dev` -> abrir `/` y revisar la posicion horizontal del sello.

---

## Quitar decoracion comunidad

**Que hace:** elimina la forma decorativa del card `Comunidad SW`.
**Por que existe:** ninguna de las variaciones de forma estaba funcionando visualmente.
**Archivos creados o modificados:**
- `app/page.tsx` - quita el SVG decorativo del card.
- `app/globals.css` - elimina los estilos asociados a la forma.
- `BITACORA.md` - documenta el ajuste realizado.
**Decisiones tomadas:** se deja el card tipografico y limpio para evitar ruido visual.
**Como probarlo:** `npm run dev` -> abrir `/` y confirmar que el card `Comunidad SW` no tenga decoracion.

---

## Sello comunidad

**Que hace:** coloca el sello `11.svg` en la esquina inferior derecha del card `Comunidad SW`.
**Por que existe:** se reemplaza la mancha decorativa por un elemento de marca ya existente.
**Archivos creados o modificados:**
- `app/page.tsx` - agrega el `Image` decorativo del sello.
- `app/globals.css` - posiciona el sello recortado y lo vuelve sutil sobre el fondo oscuro.
- `BITACORA.md` - documenta el ajuste realizado.
**Decisiones tomadas:** se usa `aria-hidden` y `alt=""` porque el sello es decorativo y el card ya comunica la marca con texto.
**Como probarlo:** `npm run dev` -> abrir `/` y revisar el card `Comunidad SW`.

---

## Icono busqueda en CTA

**Que hace:** quita la lupa izquierda del buscador y reemplaza la flecha del boton derecho por una lupa.
**Por que existe:** el campo debe quedar mas limpio y el boton debe comunicar explicitamente accion de busqueda.
**Archivos creados o modificados:**
- `components/icons/ui/SearchIcon.tsx` - nuevo icono SVG reutilizable de busqueda.
- `components/icons/ui/index.ts` - exporta iconos UI.
- `app/page.tsx` - usa `SearchIcon` en el boton del buscador y elimina la lupa inicial.
- `BITACORA.md` - documenta el ajuste realizado.
**Decisiones tomadas:** se guarda la lupa en `components/icons/ui` para separar iconos de interfaz de los iconos de categorias.
**Como probarlo:** `npm run dev` -> abrir `/` y revisar el buscador del hero.

---

## Ajuste tamano mancha comunidad

**Que hace:** agranda la mancha organica del card `Comunidad SW` y la desplaza para que se recorte en la esquina inferior derecha.
**Por que existe:** la forma debia sentirse mas integrada al card y menos como un icono flotante.
**Archivos creados o modificados:**
- `app/globals.css` - ajusta ancho y posicion del SVG decorativo.
- `BITACORA.md` - documenta el ajuste realizado.
**Decisiones tomadas:** se aprovecha el `overflow: hidden` existente del card para lograr el recorte sin agregar wrappers.
**Como probarlo:** `npm run dev` -> abrir `/` y revisar el card `Comunidad SW`.

---

## Borde de cards solo en hover

**Que hace:** oculta el borde en reposo de las `PreviewCard` y lo muestra al hacer hover.
**Por que existe:** se pidio un ajuste visual simple para que las tarjetas se vean mas limpias sin perder feedback interactivo.
**Archivos creados o modificados:**
- `app/globals.css`
- `BITACORA.md`
**Decisiones tomadas:** se mantiene el borde de 1px con color transparente en reposo para evitar cambios de tamano o saltos visuales al hacer hover.
**Como probarlo:** `npm run dev` -> abrir `/` o `/directorio` y pasar el mouse sobre las cards.

---

## Mancha organica comunidad

**Que hace:** reemplaza el trazo abstracto del card `Comunidad SW` por una mancha organica rosada con linea fluida y detalles pequenos.
**Por que existe:** se pidio probar una forma mas cercana a la referencia visual compartida.
**Archivos creados o modificados:**
- `app/page.tsx` - cambia el SVG decorativo del card de comunidad por una forma tipo blob.
- `app/globals.css` - agrega estilos de relleno, trazo y puntos para la nueva forma.
- `BITACORA.md` - documenta el ajuste realizado.
**Decisiones tomadas:** se mantiene como SVG local para poder ajustar color, posicion y grosor sin depender de assets externos.
**Como probarlo:** `npm run dev` -> abrir `/` y revisar el card `Comunidad SW`.

---

## Hover invertido en categorias

**Que hace:** invierte fondo, texto e icono del recuadro de categoria al pasar el mouse o enfocar con teclado.
**Por que existe:** hace visible el estado interactivo del rail de categorias en la landing.
**Archivos creados o modificados:**
- `app/page.tsx`
- `app/globals.css`
- `BITACORA.md`
**Decisiones tomadas:** el estado se aplica al `li` completo para que pinte todo el recuadro, mientras el `Link` conserva el area clicable completa y el foco accesible.
**Como probarlo:** abrir `/`, pasar el mouse sobre una categoria y verificar fondo borgona con texto e icono crema.

---

## Contexto operativo inicial para IA

**Que hace:** crea tres documentos base en `context/` para orientar a futuras IAs sobre reglas operativas, producto y posicionamiento publico.
**Por que existe:** reduce contradicciones entre documentos antiguos y evita que una IA invente reglas, copy, arquitectura o alcance fuera del MVP.
**Archivos creados o modificados:**
- `context/00_AI_OPERATING_RULES.md`
- `context/01_PRODUCT_BRIEF.md`
- `context/02_PUBLIC_POSITIONING.md`
- `BITACORA.md`
**Decisiones tomadas:** los documentos de contexto para IA quedan en ingles, pero conservan CTAs y frases publicas en espanol; `profile_reviews` queda documentado como revision/importaciones, no visibilidad; la landing prioriza compradoras que quieren ver negocios confiables.
**Como probarlo:** leer los tres archivos nuevos y verificar que no modifican codigo ni cambian `CLAUDE.md`.

---

## Reglas de dominio, arquitectura y schema para IA

**Que hace:** agrega tres documentos de contexto con reglas definitivas de dominio, arquitectura tecnica real y referencia de schema actual.
**Por que existe:** separa decisiones vigentes de planes antiguos y marca diferencias entre producto decidido, codigo actual y documentos obsoletos.
**Archivos creados o modificados:**
- `context/03_DOMAIN_RULES.md`
- `context/04_TECH_ARCHITECTURE.md`
- `context/05_DATABASE_SCHEMA.md`
- `BITACORA.md`
**Decisiones tomadas:** se documenta `applications.status = 'aprobado'` como parte de visibilidad publica; `profile_reviews` queda fuera de visibilidad; se marca la contradiccion actual entre lanzamiento gratuito sin comprobante y `applications.receipt_path` requerido por schema/codigo; se prioriza Next.js 16 + Nodemailer/Gmail sobre docs viejos de Next 14/Resend.
**Como probarlo:** leer los tres archivos nuevos y verificar que solo agregan contexto, sin borrar docs antiguos ni modificar `CLAUDE.md`.

---

## Ajuste de schema en contexto IA

**Que hace:** actualiza `context/05_DATABASE_SCHEMA.md` contra el schema SQL compartido por la duena del proyecto.
**Por que existe:** deja tipos, nullability, constraints y relaciones criticas mas precisas para evitar que una IA asuma campos incorrectos.
**Archivos creados o modificados:**
- `context/05_DATABASE_SCHEMA.md`
- `BITACORA.md`
**Decisiones tomadas:** se marca `business_profiles.stats_token` como `uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE`; se deja `applications.receipt_path` como `text NOT NULL`; se aclara que tracking usa `profile_id` y no `business_profile_id`; se marca `rate_limit_attempts` como tabla del SQL versionado del repo, pero no presente en el snapshot pegado.
**Como probarlo:** comparar `context/05_DATABASE_SCHEMA.md` con el SQL compartido y verificar que no se propone ejecutar SQL de contexto como migracion.

---

## Rutas, estado actual y workflow de agentes

**Que hace:** agrega documentos de contexto para mapear rutas/modulos, estado real del proyecto y flujo de trabajo esperado para agentes IA.
**Por que existe:** cualquier IA necesita distinguir pantallas reales, APIs placeholder, features implementadas, riesgos pendientes y formato de cierre antes de tocar codigo.
**Archivos creados o modificados:**
- `context/06_ROUTES_AND_MODULES.md`
- `context/07_CURRENT_STATE.md`
- `context/08_AGENT_WORKFLOW.md`
- `BITACORA.md`
**Decisiones tomadas:** se marca `app/api/perfiles`, `app/api/membresias` y `app/api/email` como placeholders; se documenta la diferencia entre estado deseado y estado real del flujo sin comprobante; se marca como `to verify` lo que no fue probado en vivo.
**Como probarlo:** leer los tres archivos nuevos y confirmar que no borran docs antiguos ni modifican `CLAUDE.md`.

---

## Reescritura operativa de CLAUDE

**Que hace:** reemplaza el `CLAUDE.md` largo por una guia operativa corta para agentes IA.
**Por que existe:** `CLAUDE.md` debe decir como trabajar en el repo y delegar historia, producto, schema y rutas a los archivos de `context/`.
**Archivos creados o modificados:**
- `CLAUDE.md`
- `BITACORA.md`
**Decisiones tomadas:** se conserva la regla definitiva de visibilidad, stack real, auth OTP, Nodemailer/Gmail, workflow obligatorio y formato final; las contradicciones no resueltas quedan en `Open Questions / To Verify`.
**Como probarlo:** leer `CLAUDE.md` y verificar que apunta a `context/`, no reabre reglas antiguas ni contiene narrativa larga del proyecto.

---

## Quita placeholder de video en tarjetas

**Que hace:** evita renderizar el video de `PreviewCard` cuando no existe `videoSrc`.
**Por que existe:** elimina el 404 de `/preview-placeholder.mp4` y evita ocultar la imagen en hover cuando no hay video real.
**Archivos creados o modificados:**
- `components/directorio/PreviewCard.tsx`
- `app/globals.css`
- `BITACORA.md`
**Decisiones tomadas:** el hover expansivo queda limitado a tarjetas con la clase `swpc-has-video`, para mantener estable la tarjeta sin video.
**Como probarlo:** `npm.cmd exec eslint components/directorio/PreviewCard.tsx` y abrir el directorio verificando que no aparezca `GET /preview-placeholder.mp4 404`.

---

## Canvas publico limpio para redisenio

**Que hace:** crea la rama de trabajo con paginas publicas neutralizadas, componentes publicos base, laboratorio `/dev/components` y mapa frontend/backend.
**Por que existe:** permite reconstruir el frontend publico desde un canvas limpio sin tocar `/admin` ni borrar la logica backend existente.
**Archivos creados o modificados:**
- `app/page.tsx`
- `app/directorio/page.tsx`
- `app/directorio/[slug]/page.tsx`
- `app/inscripcion/page.tsx`
- `app/aliadas/page.tsx`
- `app/estadisticas/[token]/page.tsx`
- `app/dev/components/page.tsx`
- `src/components/public/index.ts`
- `src/components/public/cards/BusinessCard.tsx`
- `src/components/public/layout/SectionShell.tsx`
- `src/components/public/navigation/PublicNavbar.tsx`
- `src/components/public/search/SearchBar.tsx`
- `src/components/public/search/SmartSearchButton.tsx`
- `src/components/public/ui/CategoryChip.tsx`
- `src/components/public/ui/PagePlaceholder.tsx`
- `docs/public-frontend-backend-map.md`
- `BITACORA.md`
**Decisiones tomadas:** las conexiones a `profilesService`, `trackingService` y `supabasePublic` se conservaron con UI minima; no se modifico `app/layout.tsx` porque afectaria tambien a `/admin`; los componentes antiguos de `components/directorio` quedaron aislados, no borrados.
**Como probarlo:** ejecutar `npm run lint` y `npm run build`; abrir `/`, `/directorio`, un `/directorio/[slug]` existente, `/inscripcion`, `/aliadas`, `/estadisticas/[token]` valido y `/dev/components`.

---

## Logo en navbar publica

**Que hace:** reemplaza el texto `DirectorioSW` de la navbar publica por el asset `principal_basic.svg`, aumenta ligeramente el logo, aplica el color profundo de marca y elimina el divisor inferior.
**Por que existe:** la cabecera debe reservar el espacio de marca para el logo en lugar de mostrar el nombre textual anterior, con una apariencia mas limpia.
**Archivos creados o modificados:**
- `src/components/public/navigation/PublicNavbar.tsx`
- `public/principal_basic.svg`
- `BITACORA.md`
**Decisiones tomadas:** se usa el SVG existente desde `public/` dentro de un enlace con dimensiones estables para evitar saltos de layout; el relleno negro del asset se cambia a `#391125`, alineado con `--sw-negro-profundo`.
**Como probarlo:** `npm run dev` -> abrir `/` y revisar que la navbar muestre el logo en el extremo izquierdo.

---

## Motion de SearchBar publica

**Que hace:** cambia el panel de sugerencias de la SearchBar a un dropdown flotante en foco, reduce sombras y micro-movimientos, corrige el boton IA en mobile y desactiva el autocompletado nativo del navegador.
**Por que existe:** la animacion anterior abria el panel por hover con `max-height`, empujaba el layout de la navbar y el autocompletado nativo podia mostrar un recuadro oscuro que competia con las sugerencias de marca.
**Archivos creados o modificados:**
- `app/globals.css`
- `src/components/public/search/SearchBar.tsx`
- `BITACORA.md`
**Decisiones tomadas:** el componente conserva su API; la variacion visual vive en las clases propias de la SearchBar, sin selectores dependientes de navbar/home. Se evita animar altura, se respeta `prefers-reduced-motion` y se declara `autocomplete` apagado en form/input.
**Como probarlo:** `npm run lint`; abrir `/`, enfocar la SearchBar en desktop y mobile, y verificar que las sugerencias aparezcan sin mover la cabecera ni mostrar el dropdown nativo del navegador.

---
