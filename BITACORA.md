# Bitácora — DirectorioSW

Registro cronológico de decisiones, implementaciones y resultados por módulo y tarea.

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
