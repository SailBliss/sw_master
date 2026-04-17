# DirectorioSW — Product Requirements Document (PRD)

**Versión 2.0 · Abril 2026**

> Este documento define qué se construye, para quién, por qué, y cómo se prioriza. Es la referencia única durante todo el desarrollo de DirectorioSW. Se pega al inicio de cada chat junto con `context_sw.md` y `SW_contexto_maestro.md`.

---

## 01. Resumen ejecutivo

### Qué es DirectorioSW

DirectorioSW es una web app que organiza y hace buscables todos los emprendimientos administrados por miembras verificadas de la comunidad SW Mujeres. Es la infraestructura digital que convierte la confianza de 13.500 mujeres en un activo de negocio sostenible.

### Por qué existe

Las miembras del grupo de Facebook ven publicaciones comerciales y las ignoran por fatiga publicitaria. El ratio de rechazo de posts en el grupo es superior al 46%, lo que confirma el volumen de contenido comercial no autorizado. DirectorioSW cambia el contexto: en el directorio, la mujer llega buscando, no siendo interrumpida.

### Objetivos del producto

- Dar a las empresarias SW un canal de venta con más impacto que las publicaciones en el grupo de Facebook.
- Ofrecer a las miembras del grupo un lugar confiable donde encontrar productos y servicios de mujeres verificadas.
- Generar ingresos recurrentes para SW a través de suscripciones de empresarias.
- Establecer swmujeres.com como destino digital de la marca SW, más allá del grupo de Facebook.

### Métricas de éxito

- 50 empresarias con suscripción activa en los primeros 6 meses.
- 500+ visitas mensuales al directorio en el primer mes post-lanzamiento.
- Al menos 3 empresarias reportando ventas directas atribuidas al directorio en el primer mes.
- Tasa de renovación de suscripción superior al 70%.

---

## 02. Usuarios

### La compradora

Miembra del grupo SW Mujeres (o mujer que llega por redes sociales o buscadores). Busca productos o servicios confiables de otras mujeres. No necesita registrarse ni autenticarse.

Necesidades: encontrar rápido por categoría o keyword, saber que el negocio es real y verificado, contactar directo sin intermediarios, ver información completa sin crear cuenta.

### La empresaria

Miembra verificada de SW con un emprendimiento propio. Solicita ingreso al directorio, es evaluada por la administradora, y si es aprobado y tiene membresía activa, su perfil se muestra públicamente.

Necesidades: perfil visible con información completa del negocio, saber cuánta gente ve su perfil, llegar a mujeres que ya confían en SW, badge de verificación que dé credibilidad, beneficiarse de SEO para aparecer en buscadores y en resultados de IA.

### La administradora

Fundadora y administradora de SW. Gestiona el directorio, aprueba empresarias, controla membresías, y monitorea el negocio.

Necesidades: aprobar o rechazar solicitudes de ingreso, activar y desactivar suscripciones, ver métricas generales del directorio, editar cualquier perfil, controlar ingresos y egresos del negocio.

### Fuera de alcance

DirectorioSW no es marketplace (no procesa pagos entre compradora y empresaria), no es red social (no hay feed ni comentarios entre empresarias), no incluye servicios de terceros no miembras, y no reemplaza el grupo de Facebook.

---

## 03. Requisitos funcionales por actor

### Para la compradora

- Buscar emprendimientos por categoría.
- Buscar por nombre o palabra clave.
- Ver un listado público de emprendimientos.
- Ver la tarjeta de cada emprendimiento con nombre, categoría, ciudad, descripción corta y badge de verificación SW.
- Ver el perfil completo del emprendimiento con toda su información.
- Ver información básica de la dueña del emprendimiento.
- Contactar a la empresaria por WhatsApp en un clic.
- Ver Instagram y sitio web cuando existan.
- Filtrar por ciudad o zona de Medellín y por categoría.
- Ver únicamente perfiles aprobados y con membresía activa. El directorio muestra perfiles donde `memberships.status = 'active'` y ` applications.status = 'aprobado'`.

### Para la empresaria

- Inscribirse al directorio mediante formulario público.
- Enviar información personal (guardada en `entrepreneurs`) e información del negocio (guardada en `business_profiles`) de forma separada.
- Leer y aceptar términos de uso. El consentimiento se persiste con `consent_accepted` y `consent_accepted_at` en la tabla `entrepreneurs`.
- Subir comprobante de pago al enviar la solicitud (`applications.receipt_path`, obligatorio).
- Subir captura del post en Facebook cuando aplique (`applications.post_screenshot_path`, opcional).
- Tener un perfil visible con toda la información del negocio una vez aprobado y con membresía activa.
- Tener badge de verificación SW si cumple condiciones de aprobación y membresía activa.
- Ver estadísticas de su perfil mediante una página accesible por link privado con token (sin login): visualizaciones del perfil y clics en WhatsApp, Instagram y web.
- Beneficiarse de SEO para aparecer en Google y en resultados de búsquedas de IA.

### Para la administradora

- Autenticarse con login seguro basado en `admin_allowlist`.
- Ver solicitudes de inscripción. Una solicitud involucra datos de `applications`, `entrepreneurs`, `business_profiles` y `profile_reviews`.
- Aprobar solicitudes desde el panel.
- Rechazar solicitudes con nota opcional (`applications.notes` y `profile_reviews.notes`).
- Editar cualquier perfil.
- Ver notificación cuando una membresía esté próxima a vencer o haya vencido. La notificación se elimina manualmente cuando la admin confirma que todo está en orden.
- Mantener historial de períodos pagados (`membership_periods`).
- Ocultar el perfil cuando la membresía vence (basado en `memberships.end_at` y la regla de visibilidad).
- Controlar la revisión del perfil con estados `pendiente`, `aprobada`, `rechazada`.
- Recibir notificación por email cuando llega una solicitud nueva (vía Resend).
- Ver métricas generales del directorio: total perfiles activos, total solicitudes del mes, perfiles más vistos.
- Ver tabla unificada de finanzas: los pagos de membresía vienen de `membership_periods`; los egresos e ingresos manuales vienen de `ledger_entries`. Resúmenes mensuales, botones para registrar ingreso manual y gasto manual.

---

## 04. Pantallas del MVP

El MVP tiene 5 pantallas públicas, 1 panel de administración, y 1 página de estadísticas por token. No hay login para compradoras ni para empresarias.

### P1 — Landing page (swmujeres.com)

Página de entrada a toda la plataforma. Cumple cuatro funciones: presentar qué es SW, dirigir tráfico al directorio, invitar a empresarias a inscribirse, y existir como presencia digital de la marca.

Secciones obligatorias:

1. Hero con tagline de SW + CTA principal al directorio.
2. Métricas de la comunidad (13.500 miembras, años de existencia, emprendimientos activos).
3. Qué es SW — descripción breve de la comunidad y la historia.
4. Vista previa del directorio — 3 o 4 tarjetas de ejemplo con botón «ver todo».
5. Sección para empresarias — cómo inscribirse, qué incluye, CTA al formulario.
6. Footer con links a redes sociales y grupo de Facebook.

Tono: la landing no invita a pedir entrada al grupo. El objetivo es que conozcan SW y vayan al directorio. La exclusividad del grupo se comunica como dato, no como invitación.

### P2 — Directorio (swmujeres.com/directorio)

La pantalla principal del producto. Una mujer llega, filtra por categoría o busca por nombre, y encuentra perfiles de emprendimientos verificados SW.

Elementos de la pantalla:

- Barra de búsqueda por nombre o keyword.
- Filtros por categoría (tabs o dropdown).
- Filtro por ciudad o zona.
- Grid de tarjetas de emprendimiento.
- Cada tarjeta muestra: logo o avatar (iniciales si no hay imagen), nombre del negocio, categoría, ciudad, descripción corta (máx 80 chars), badge SW verificada.
- Paginación o infinite scroll.

Categorías iniciales: Moda y accesorios, Salud y bienestar, Hogar y decoración, Comida y bebidas, Servicios profesionales, Belleza, Viajes y turismo, Otros.

Regla de visibilidad: solo se muestran perfiles donde `memberships.status = 'active'` AND ` applications.status = 'aprobado'`.

### P3 — Perfil de emprendimiento (swmujeres.com/directorio/[slug])

Página individual de cada negocio. URL amigable con slug.

Campos visibles:

| Campo | Fuente | Requerido | Notas |
|---|---|---|---|
| Logo / foto de portada | `business_profiles.directory_image_path` | No | Si no hay, avatar con iniciales |
| Nombre del negocio | `business_profiles.business_name` | Sí | Máx 60 caracteres |
| Nombre de la empresaria | `entrepreneurs.full_name` | Sí | |
| Categoría | `business_profiles.category` | Sí | De la lista de categorías |
| Descripción | `business_profiles.description` | Sí | Máx 300 caracteres |
| Instagram | `business_profiles.instagram_handle` | No | Link directo al perfil |
| WhatsApp | `business_profiles.business_phone` | Sí | Botón de contacto directo |
| Sitio web | `business_profiles.website_url` | No | Si tiene |
| Otras redes | `business_profiles.other_socials` | No | Si tiene |
| Descuento SW | `business_profiles.offers_discount` + `discount_details` | No | Solo si aplica |
| Badge verificada SW | Calculado | Automático | Membresía activa + perfil aprobado |

### P4 — Formulario de inscripción (swmujeres.com/inscripcion)

Formulario público donde una empresaria solicita entrar al directorio. No crea cuenta. Los datos se envían a la base de datos para aprobación manual.

Campos del formulario:

| Campo | Tabla destino | Tipo | Requerido |
|---|---|---|---|
| Cédula | `entrepreneurs.cedula` | Texto | Sí |
| Nombre completo | `entrepreneurs.full_name` | Texto | Sí |
| Email personal | `entrepreneurs.email` | Email | Sí |
| Teléfono personal | `entrepreneurs.phone` | Teléfono | Sí |
| Perfil de Facebook | `entrepreneurs.fb_profile_url` | URL | Sí |
| Nombre del negocio | `business_profiles.business_name` | Texto | Sí |
| Descripción del negocio | `business_profiles.description` | Textarea | Sí (máx 300) |
| Categoría | `business_profiles.category` | Select | Sí |
| WhatsApp del negocio | `business_profiles.business_phone` | Teléfono | Sí |
| Instagram del negocio | `business_profiles.instagram_handle` | Texto | No |
| Sitio web | `business_profiles.website_url` | URL | No |
| Logo del negocio | `business_profiles.directory_image_path` | Imagen | No |
| ¿Ofrece descuento SW? | `business_profiles.offers_discount` | Booleano | Sí |
| Detalle del descuento | `business_profiles.discount_details` | Texto | Condicional |
| Producto/plan | `applications.product_id` | Select | Sí |
| Comprobante de pago | `applications.receipt_path` | Imagen | Sí |
| Captura del post en FB | `applications.post_screenshot_path` | Imagen | No |
| Consentimiento | `entrepreneurs.consent_accepted` | Checkbox | Sí |

Flujo al enviar el formulario:

1. Los datos se persisten en la base de datos: se crea o actualiza registro en `entrepreneurs`, se crea `business_profiles`, se crea `applications` con status `pendiente`, se crea `profile_reviews` con status `pendiente`, se crea `memberships` con status `inactive`.
2. Se envía email automático a la administradora notificando la nueva solicitud (vía Resend).
3. Se muestra mensaje de confirmación a la empresaria.
4. La administradora revisa desde el panel de admin.
5. Si aprueba: `' applications.status = 'aprobado'`, `memberships.status = 'active'` con fechas, se crea `membership_periods`, se envía email a la empresaria confirmando aprobación.
6. Si rechaza: `applications.status = 'rechazado'` con nota opcional, se envía email a la empresaria informando.

### P5 — Panel de administración (swmujeres.com/admin)

Acceso exclusivo de la administradora. Protegido con autenticación basada en `admin_allowlist`.

**Solicitudes:** Lista de solicitudes pendientes con todos los datos del formulario. Aprobar solicitud (activa perfil, crea período de membresía, envía email). Rechazar solicitud (con campo opcional de motivo).

**Perfiles:** Todos los perfiles con estado de membresía y revisión. Editor de cualquier campo de cualquier perfil. Detalle completo de cada empresaria y su negocio.

**Membresías:** Activar / desactivar membresía (desactivar oculta el perfil). Notificaciones de membresías próximas a vencer o vencidas, que se cierran manualmente tras verificación. Historial de períodos pagados por empresaria.

**Finanzas:** Tabla unificada por mes que combina pagos de membresía (`membership_periods`, fuente de verdad de ingresos por suscripción) y entradas manuales (`ledger_entries`, para egresos e ingresos puntuales). Resúmenes mensuales de ingresos y egresos. Formulario para registrar ingreso manual o gasto. Las entradas de membresía son de solo lectura en esta vista.

**Métricas:** Total de perfiles activos, total de solicitudes del mes, perfiles más vistos.

### P6 — Página de estadísticas para la empresaria

Accesible vía link único privado con token. La admin genera el link desde el panel y se lo envía a la empresaria. No requiere login.

Contenido: total de visualizaciones (historial mensual), clics en WhatsApp, clics en Instagram y sitio web, posición en su categoría.

### Futuro (post-MVP)

- Dashboard general de estadísticas de todo el directorio para la admin.
- Login y dashboard para empresarias con edición de perfil self-service.
- Sistema de rating con estrellas.
- Filtro por rango de precios.

---

## 05. Historias de usuario

### Sprint 1 — Cimientos y directorio

| ID | Historia de usuario | Criterio de aceptación |
|---|---|---|
| HU-L01 | Como usuaria, quiero ver una landing page clara que explique el propósito del directorio y permita acceder a sus funcionalidades principales. | Landing con todas las secciones de P1, responsive, CTAs funcionales. |
| HU-C03 | Como compradora, quiero visualizar un listado público de emprendimientos disponibles en el directorio. | Grid de tarjetas desde Supabase, solo perfiles con visibilidad válida. |
| HU-C04 | Como compradora, quiero ver cada emprendimiento en una tarjeta con nombre, categoría, ciudad, descripción corta y badge. | Tarjeta con todos los campos, badge visible si aplica. |
| HU-C01 | Como compradora, quiero filtrar los emprendimientos por categoría. | Filtro funcional, resultados se actualizan sin recarga. |
| HU-C02 | Como compradora, quiero buscar emprendimientos por nombre o palabra clave. | Búsqueda contra `business_name` y `description`. |
| HU-C05 | Como compradora, quiero acceder a la página de detalle de un emprendimiento. | Página P3 con todos los campos, URL con slug. |
| HU-C06 | Como compradora, quiero contactar a la empresaria por WhatsApp en un clic. | Botón `wa.me`, clic registrado para tracking. |
| HU-C07 | Como compradora, quiero ver enlaces a Instagram y sitio web en el perfil. | Links visibles cuando existen, ocultos cuando no. |
| HU-C11 | Como compradora, quiero ver información básica de la dueña del emprendimiento. | Nombre de la empresaria visible en el perfil. |
| HU-E01 | Como empresaria, quiero que mi emprendimiento tenga un perfil visible en el directorio. | Perfil con todos los campos de `business_profiles`. |
| HU-S01 | Como sistema, quiero aplicar visibilidad basada en membresía y revisión. | Query: `memberships.status = 'active'` AND `applications.status = 'aprobado'`. |
| HU-S05 | Como usuaria, quiero usar la plataforma desde diferentes dispositivos. | Diseño 100% responsive. |

### Sprint 2 — Flujo completo

| ID | Historia de usuario | Criterio de aceptación |
|---|---|---|
| HU-E02 | Como empresaria, quiero completar y enviar un formulario de inscripción. | Formulario P4 con todos los campos, validación client y server. |
| HU-E03 | Como sistema, quiero persistir los datos del formulario en múltiples entidades. | Datos en `entrepreneurs`, `business_profiles`, `applications`, `profile_reviews`, `memberships`. Sin duplicados por cédula. |
| HU-E04 | Como empresaria, quiero aceptar los términos de uso antes de enviar mi solicitud. | Checkbox obligatorio, `consent_accepted = true` y `consent_accepted_at`. |
| HU-E05 | Como empresaria, quiero adjuntar un comprobante de pago. | Upload a Storage, path en `applications.receipt_path`. |
| HU-E06 | Como empresaria, quiero subir una captura de mi post en Facebook. | Upload opcional, path en `applications.post_screenshot_path`. |
| HU-C08 | Como compradora, quiero filtrar por ciudad o zona y categoría. | Filtros combinables, actualización en tiempo real. |
| HU-C09 | Como compradora, quiero que el directorio muestre solo perfiles aprobados y activos. | Visibilidad en backend, no en frontend. |
| HU-E07 | Como empresaria, quiero que mi perfil se publique automáticamente al ser aprobado. | Al aprobar, perfil visible sin intervención adicional. |
| HU-E08 | Como empresaria, quiero badge de verificación cuando cumpla las condiciones. | Badge cuando membresía activa + perfil aprobado. |
| HU-A16 | Como administradora, quiero iniciar sesión para acceder al panel. | Login, validación contra `admin_allowlist`, sesión persistente. |
| HU-A01 | Como administradora, quiero ver solicitudes para revisarlas. | Lista con datos de `applications` + `entrepreneurs` + `business_profiles`. |
| HU-A02 | Como administradora, quiero aprobar una solicitud. | Review aprobado, membresía activa, período creado, email enviado. |
| HU-A03 | Como administradora, quiero rechazar una solicitud con motivo. | Status rechazado, nota guardada, email a empresaria. |
| HU-A04 | Como administradora, quiero editar cualquier perfil. | Editor para todos los campos de `entrepreneurs` y `business_profiles`. |
| HU-A05 | Como administradora, quiero gestionar el estado de membresía. | Toggle activación/desactivación, efecto inmediato en visibilidad. |
| HU-S02 | Como sistema, quiero gestionar solicitudes, membresías y períodos correctamente. | Relaciones entre tablas consistentes. |

### Sprint 3 — Medición y lanzamiento

| ID | Historia de usuario | Criterio de aceptación |
|---|---|---|
| HU-S03 | Como sistema, quiero registrar visualizaciones y clics. | Inserciones en `profile_views` y `contact_clicks`. |
| HU-S04 | Como sistema, quiero mostrar analítica en la interfaz. | Página P6 funcional con datos y gráficos. |
| HU-E12 | Como empresaria, quiero ver estadísticas de mi perfil. | Página accesible por token, datos correctos. |
| HU-E13 | Como empresaria, quiero ver visualizaciones de mi perfil. | Contador de views, desglose mensual. |
| HU-E14 | Como empresaria, quiero ver clics en mis enlaces. | Contadores por tipo (WhatsApp, Instagram, web). |
| HU-A06 | Como administradora, quiero que perfiles se oculten al vencer membresía. | `end_at < now()` → perfil no visible. |
| HU-A07 | Como administradora, quiero gestionar estados de revisión. | Estados pendiente/aprobada/rechazada en el panel. |
| HU-A08 | Como administradora, quiero notificaciones de membresías vencidas. | Notificación en panel para vencidas o por vencer. |
| HU-A09 | Como administradora, quiero cerrar notificaciones tras verificación. | Botón para dismissar manualmente. |
| HU-A10 | Como administradora, quiero ver métricas generales. | Perfiles activos, solicitudes del mes, más vistos. |
| HU-A11 | Como administradora, quiero tabla de ingresos. | Vista unificada: pagos de membresía desde `membership_periods` + entradas manuales desde `ledger_entries`, agrupados por mes. |
| HU-A12 | Como administradora, quiero resúmenes financieros mensuales. | Ingresos, egresos, balance por mes. |
| HU-A13 | Como administradora, quiero registrar ingresos manuales. | → `ledger_entries` con `direction = 'income'`. |
| HU-A14 | Como administradora, quiero registrar gastos. | → `ledger_entries` con `direction = 'expense'`. |
| HU-E15 | Como empresaria, quiero SEO para buscadores y resultados de IA. | Meta tags, OG tags, sitemap, JSON-LD por perfil. |
| HU-S06 | Como sistema, quiero optimizar carga y consultas. | Lighthouse > 90, queries con índices. |
| HU-S07 | Como equipo, queremos deploy en producción. | Vercel, dominio swmujeres.com, SSL. |
| HU-Q01 | Como equipo, queremos validar el flujo completo. | E2E: inscripción → aprobación → visibilidad → tracking. |
| HU-Q02 | Como equipo, queremos pruebas completas antes del lanzamiento. | Testing móvil/desktop, datos reales, usuarios de prueba. |

### Backlog (post-MVP)

| ID | Historia de usuario | Notas |
|---|---|---|
| HU-C10 | Sistema de rating con estrellas. | Definir quién califica, anti-manipulación, tabla nueva. |
| HU-C12 | Filtro por rango de precios. | Campo de precio en `business_profiles` no existe aún. |
| HU-E09 | Login de empresaria. | Sistema de cuentas completo. |
| HU-E10 | Dashboard de aliada. | Depende de HU-E09. |
| HU-E11 | Editar perfil self-service. | Depende de HU-E09. |
| — | Dashboard general de estadísticas para la admin. | Analítica avanzada del directorio completo. |
| — | Pasarela de pagos (Wompi o similar). | Automatiza cobro y activación. |
| — | Reseñas verificadas. | Solo miembras SW pueden dejar reseña. |
| — | Notificación automática de renovación por email. | Antes de vencimiento. |
| — | Sección "destacados de la semana". | Curada por admin, ingreso adicional. |
| — | Expansión a Bogotá. | Categoría de ciudad adicional. |
| — | App móvil nativa. | Solo con tracción suficiente. |
| — | Integración con Instagram para importar fotos. | Enriquecimiento automático de perfil. |

---

## 06. Modelo de datos

### Schema vigente en Supabase

Fuente única de verdad. La interfaz se deriva de este modelo, no al contrario.

**`entrepreneurs`** — Datos personales de la empresaria.

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| id | uuid PK | Auto | |
| cedula | text UNIQUE | Sí | Previene duplicados |
| full_name | text | — | |
| email | text | — | |
| phone | text | — | |
| fb_profile_url | text | — | Para verificar membresía |
| consent_accepted | boolean | Sí | Default false |
| consent_accepted_at | timestamp | — | |
| created_at / updated_at | timestamp | Auto | |

**`business_profiles`** — Datos del emprendimiento. 1:1 con `entrepreneurs`.

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| id | uuid PK | Auto | |
| entrepreneur_id | uuid FK UNIQUE | Sí | → `entrepreneurs` |
| business_name | text | — | |
| business_phone | text | — | WhatsApp del negocio |
| website_url | text | — | |
| instagram_handle | text | — | |
| other_socials | text | — | |
| description | text | — | Máx 300 chars |
| category | text | — | Lista predefinida |
| offers_discount | boolean | Sí | Default false |
| discount_details | text | — | |
| wants_directory | boolean | Sí | Default true |
| directory_image_path | text | — | Path en Storage |
| created_at / updated_at | timestamp | Auto | |

**`products`** — Planes configurables.

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| id | uuid PK | Auto | |
| slug | text UNIQUE | Sí | Ej: `plan-lanzamiento-gratis` |
| name | text | Sí | |
| type | enum | Sí | |
| price_cop | integer | Sí | 0 para lanzamiento |
| duration_days | integer | — | 90 para lanzamiento |
| is_active | boolean | Sí | Default true |
| created_at / updated_at | timestamp | Auto | |

**`applications`** — Solicitudes de inscripción.

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| id | uuid PK | Auto | |
| entrepreneur_id | uuid FK | Sí | → `entrepreneurs` |
| product_id | uuid FK | Sí | → `products` |
| status | enum | Sí | pendiente / aprobado / rechazado |
| notes | text | — | Nota de admin |
| amount_cop | integer | Sí | 0 si gratuito |
| receipt_path | text | Sí | Comprobante en Storage |
| post_screenshot_path | text | — | |
| submitted_at | timestamp | Auto | |
| reviewed_at | timestamp | — | |
| reviewed_by | uuid | — | |
| created_at / updated_at | timestamp | Auto | |

**`memberships`** — Estado actual de membresía. Una por empresaria.

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| id | uuid PK | Auto | |
| entrepreneur_id | uuid FK UNIQUE | Sí | → `entrepreneurs` |
| status | enum | Sí | active / inactive |
| start_at | timestamp | — | |
| end_at | timestamp | — | |
| fb_preapproval_removed | boolean | Sí | Default false |
| fb_preapproval_removed_at | timestamp | — | |
| last_application_id | uuid FK | — | → `applications` |
| created_at / updated_at | timestamp | Auto | |

**`membership_periods`** — Historial de vigencias.

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| id | uuid PK | Auto | |
| entrepreneur_id | uuid FK | Sí | → `entrepreneurs` |
| application_id | uuid FK UNIQUE | — | → `applications` |
| start_at | timestamp | Sí | |
| end_at | timestamp | Sí | |
| amount_cop | integer | Sí | |
| paid_at | timestamp | — | |
| created_at | timestamp | Auto | |

**`profile_reviews`** — COnfirmacion de perfiles importados

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| id | uuid PK | Auto | |
| entrepreneur_id | uuid FK UNIQUE | Sí | → `entrepreneurs` |
| status | enum | Sí | pendiente / aprobada / rechazada |
| notes | text | — | |
| last_checked_at | timestamp | — | |
| last_checked_by | uuid | — | |
| last_imported_at | timestamp | — | |
| created_at / updated_at | timestamp | Auto | |

**`ledger_entries`** — Ingresos y egresos.

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| id | uuid PK | Auto | |
| entry_date | date | Sí | |
| direction | enum `ledger_direction` | Sí | `income` / `expense` |
| amount_cop | integer | Sí | CHECK > 0 |
| description | text | Sí | |
| counterparty | text | — | |
| created_by | uuid | — | |
| created_at / updated_at | timestamp | Auto | |

**`account_settings`** — Configuración global.

| Campo | Tipo | Notas |
|---|---|---|
| id | uuid PK | Auto |
| name | text UNIQUE | Default `sw_account` |
| opening_balance_cop | integer | Default 0 |
| opening_balance | integer | Default 0 |
| opening_date | date | Default hoy |
| created_at / updated_at | timestamp | Auto |

**`admin_allowlist`** — Acceso al panel admin.

| Campo | Tipo |
|---|---|
| email | text PK |
| created_at | timestamp (Auto) |

### Tablas por crear (tracking — Sprint 3)

**`profile_views`**

| Campo | Tipo | Notas |
|---|---|---|
| id | uuid PK | Auto |
| business_profile_id | uuid FK | → `business_profiles` |
| viewed_at | timestamp | Auto |
| source | text | direct / search / category |

**`contact_clicks`**

| Campo | Tipo | Notas |
|---|---|---|
| id | uuid PK | Auto |
| business_profile_id | uuid FK | → `business_profiles` |
| click_type | enum | whatsapp / instagram / website |
| clicked_at | timestamp | Auto |

### Regla de visibilidad (crítica)

Un perfil es visible en el directorio si y solo si:

```
memberships.status = 'active'
AND memberships.end_at > now()
AND applications.status = 'aprobado'
```

Esta lógica se ejecuta exclusivamente en backend. El frontend nunca decide visibilidad.

---

## 07. Reglas de negocio

1. Solo pueden entrar emprendimientos de miembras verificadas del grupo SW.
2. Ser miembra del grupo no da derecho automático a salir en el directorio.
3. El directorio funciona con productos/planes pagados (o gratuitos durante lanzamiento).
4. Si la membresía vence, el perfil se oculta automáticamente.
5. El proceso de ingreso es: solicitud → aprobación manual → activación. El dinero no garantiza la entrada.
6. Debe existir control de ingresos y egresos del negocio del directorio.
7. Debe existir curaduría manual del contenido de los perfiles.
8. Durante la fase de lanzamiento (meses 1-2), las empresarias existentes reciben membresía gratuita de 90 días mediante un producto en `products` con `price_cop = 0` y `duration_days = 90`.

---

## 08. Modelo de negocio

### Lo definido

- Suscripción mensual o anual pagada por empresarias.
- Directorio separado del grupo de Facebook.
- Membresía del grupo ≠ derecho al directorio.
- Suscripción vencida = perfil oculto.

### Por definir con datos reales

- Precio exacto mensual y anual.
- Niveles de plan o plan único.
- Cobro por visibilidad adicional.

### Plan por fase

**Meses 1-2:** Directorio gratuito para aliadas existentes (producto de lanzamiento: 90 días, $0 COP). Acumular datos de tráfico.

**Mes 3:** Métricas reales. Mostrar números a cada empresaria. Recopilar feedback.

**Mes 4:** Lanzar suscripción con datos en la mano. "Tu perfil tuvo X vistas y Y clicks a WhatsApp. Mantenerlo visible cuesta Z al mes."

### Proyección de ingresos (referencia)

| Fuente | Supuesto | Proyección mensual |
|---|---|---|
| 50 empresarias × 80K COP/mes | Meta a 6 meses | 4.000.000 COP |
| 20 empresarias plan anual × 700K | Descuento ~27% | 1.167.000 COP equiv. |
| 2 spots destacados × 150K | Visibilidad | 300.000 COP |
| Evento anual (80 × 120K) | 1/año | 800.000 COP equiv. |
| **Total realista mes 6** | | **~5.5M COP/mes** |

La métrica clave es la tasa de renovación. Meta: >80%. Debajo del 60% = problema de valor percibido.

---

## 09. Stack tecnológico

| Capa | Tecnología | Propósito |
|---|---|---|
| Frontend | Next.js 14 | Renderizado, rutas, SEO |
| Base de datos | Supabase (PostgreSQL) | Persistencia, auth, storage, RLS |
| Hosting | Vercel | Deploy, dominio, CDN |
| Email | Resend | Notificaciones transaccionales |
| Dominio | swmujeres.com | Presencia digital |
| Storage | Supabase Storage | Imágenes, comprobantes |

---

## 10. Riesgos y mitigaciones

| Riesgo | Prob. | Mitigación |
|---|---|---|
| Empresarias no ven valor para pagar | Media | 90 días gratuitos para acumular datos de tráfico antes de cobrar. |
| Poco tráfico sin redes activas | Alta | Lanzar Instagram antes del directorio. Tráfico = contenido. |
| Aliadas existentes no migran | Media | Contacto personal, demostrar valor del directorio digital. |
| Perfiles desactualizados | Alta | Verificar datos con cada empresaria antes de lanzar. |
| Grupo de FB sin interacción | Media | Estrategia de activación paralela e independiente. |

---

*DirectorioSW · PRD v2.0 · Abril 2026*
