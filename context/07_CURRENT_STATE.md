# Current State - DirectorioSW

This file summarizes the current known real project state.

Use `to verify` where behavior has not been fully tested.

## Implemented Foundations

Implemented:
- Next.js app structure.
- Supabase public/admin clients.
- Environment variable pattern.
- Nodemailer/Gmail email helper.
- Shared utilities under `src/shared`.
- Lightweight DDD feature structure under `src/features`.
- Vercel target deployment.

To verify:
- production environment variables in Vercel,
- live RLS policies,
- live storage bucket permissions,
- whether docs/context files are tracked or ignored by `.gitignore`.

## Public Landing

Implemented:
- `app/page.tsx` exists.
- Uses `profilesService.findAll()` where current code indicates.
- Has had multiple visual/editorial iterations.

Current direction:
- Primary visitor is buyer.
- Primary CTA is `Ver directorio`.
- SW is trust backing, not protagonist.
- Enrollment should not dominate navigation.

To verify:
- final copy matches `context/02_PUBLIC_POSITIONING.md`,
- mobile layout,
- latest navbar/searchbar behavior.

## Public Directory

Implemented:
- `app/directorio/page.tsx`.
- Uses profiles service.
- Search/filter support exists by query params.

Current rule:
- Public visibility is centralized in profiles repository.

To verify:
- search/filter behavior with production data,
- inactive/expired/unapproved profiles excluded in production.

## Public Profile Page

Implemented:
- `app/directorio/[slug]/page.tsx`.
- Business profile display.
- Contact links.
- SEO/JSON-LD work referenced in history.
- Tracking hooks/components referenced in history.

To verify:
- actual tracking behavior on live data,
- metadata/structured data output,
- image behavior for all storage path variants.

## Enrollment

Implemented:
- `app/inscripcion/page.tsx`.
- `app/aliadas/page.tsx`.
- `POST /api/solicitudes`.
- Zod validation.
- Enrollment service/repository.
- Rate limiting for submissions.
- Multi-table insert flow with rollback behavior.

Current target truth:
```text
applications.receipt_path is nullable in the target schema
re-enrollment must reuse entrepreneurs/business_profiles by cedula
profile_reviews is out of the flow
paid approval must stop at habilitado_para_pago until real Wompi confirmation
```

## Admin Auth

Implemented:
- `/admin/login`.
- `POST /api/admin/solicitar-acceso`.
- `POST /api/admin/verificar-otp`.
- `POST /api/admin/logout`.
- OTP stored in `admin_magic_links.token`.
- JWT session cookie `sw_admin_session`.
- Rate limiting for OTP request/verify.

To verify:
- email delivery in current environment,
- cookie behavior on production domain,
- `rate_limit_attempts` exists in live DB.

## Admin Panel

Implemented:
- admin dashboard,
- applications list/detail,
- approval/rejection service flow,
- profiles list/detail editor,
- memberships overview/alerts,
- finance page with ledger/summary/manual entries.

Current implementation notes:
- Most admin pages use services.
- Some detail pages may still use `supabaseAdmin` directly for storage or small reads.
- Paid products now stop at `habilitado_para_pago` from admin approval; membership activation waits for backend-confirmed Wompi payment.

To verify:
- every admin page is protected by the admin panel layout/session,
- approval/rejection side effects with real data,
- membership period creation and email side effects,
- `business-images` bucket exists and is configured.

## Finance

Implemented:
- finance page.
- `GET/POST /api/finanzas`.
- `DELETE /api/finanzas/[id]`.
- finance service/repository.
- membership periods + manual ledger entries in summary.

To verify:
- membership-period entries are not deletable through manual delete flow,
- summary math with production data,
- account settings singleton exists.

## Wompi Payments

Current state:
- `payment_transactions` exists in schema
- `applications.status` includes `habilitado_para_pago`
- `profile_reviews` is removed from the target schema
- paid-plan approval is a two-step process:
  - admin approval to payment-enabled state
  - backend payment confirmation to final approval

Implementation status:
- schema target is already prepared
- code includes `src/features/payments` plus Wompi checkout/status/webhook routes
- public payment links use `payment_transactions.id`, not `applicationId`
- `/pago/[token]` starts checkout and `/inscripcion/confirmacion` only reads status

## Tracking And Stats

Implemented:
- `src/features/tracking`.
- `POST /api/tracking`.
- `/estadisticas/[token]`.
- `profile_views`, `contact_clicks`, and `business_profiles.stats_token` exist in known schema.
- Recharts dependency exists.

To verify:
- valid token renders correct page,
- invalid token returns not found,
- event inserts work with live RLS/service-role setup,
- retention/job behavior if any.

## SEO / Launch

Implemented or referenced:
- JSON-LD referenced in history.
- Image optimization referenced in history.

To verify:
- actual existence/current behavior of `app/robots.ts` and `app/sitemap.ts`,
- Lighthouse/performance status,
- production metadata.

## Placeholder / Pending APIs

These routes may still return placeholder messages:

```text
GET /api/perfiles
GET /api/membresias
GET /api/email
```

Do not assume they are production APIs.

## Documentation Consolidation

Desired final structure:

```text
AGENTS.md
context/00_INDEX.md
context/01_PRODUCT_BRIEF.md
context/02_PUBLIC_POSITIONING.md
context/03_DOMAIN_RULES.md
context/04_TECH_ARCHITECTURE.md
context/05_DATABASE_SCHEMA.md
context/06_ROUTES_AND_MODULES.md
context/07_CURRENT_STATE.md
context/08_DESIGN_SYSTEM.md
context/09_AGENT_PROMPTS.md
context/10_WOMPI_INTEGRATION.md
context/11_WOMPI_SQL_TARGET.md
docs/archive/
BITACORA.md
```

Pending:
- remove/stop using `CLAUDE.md`,
- archive old docs into `docs/archive/`,
- decide whether docs/context should be tracked in git,
- move marketing docs out of technical context unless needed.

## Known Risks

- Old docs may contradict current rules.
- Some files may contain mojibake/encoding artifacts.
- Some admin pages may still use `supabaseAdmin` directly.
- `business-images` bucket is used in code but must be verified.
- `rate_limit_attempts` exists in repo SQL but was not in provided schema snapshot.
- Wompi flow still needs sandbox/production verification with real provider events and configured env vars.
- No automated test suite is configured.
- `context/`, `AGENTS.md`, `CLAUDE.md`, `BITACORA.md`, and `docs/` may be ignored by `.gitignore`; verify before assuming documentation changes are committed.

## Current Technical Decisions

- Use Next.js 16.2.3.
- Use Nodemailer + Gmail SMTP, not Resend.
- Use custom admin OTP auth, not Supabase Auth for admin.
- Use `src/features` lightweight DDD structure.
- Keep public visibility in profiles repository.
- Use `applications.status = 'aprobado'` for visibility.
- `profile_reviews` is out of the target schema and must not be reintroduced.
- Keep SW as trust backing in public positioning.
