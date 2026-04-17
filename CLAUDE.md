# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

---

## What this project does

**DirectorioSW** is a women entrepreneurs directory for the SW Mujeres community — a private Facebook group of 13,500 verified women in Medellín, Colombia.

The product solves a real problem: commercial posts in the Facebook group get rejected at a 46%+ rate due to ad fatigue. The directory flips the context — women arrive *looking* for products and services instead of being interrupted.

**Three actors, three jobs:**

- **Compradora** (buyer) — browses the directory without logging in, filters by category or city, clicks straight to WhatsApp to contact the entrepreneur.
- **Empresaria** (entrepreneur) — submits an enrollment form, waits for manual approval, gets a public profile with a verified SW badge once approved and membership is active.
- **Administradora** (admin) — reviews applications, approves/rejects, manages memberships, monitors finances, and controls what's visible.

**Critical rule:** a profile appears in the directory *only* when `memberships.status = 'active'` AND `profile_reviews.status = 'aprobada'` AND `memberships.end_at > now()`. This logic lives exclusively in the backend — never in the frontend.

**Launch model:** first 90 days are free for existing members (product `plan-lanzamiento-gratis`, $0 COP). Paid subscriptions start once real traffic data justifies a price.

---

## Where things live

```
directorio-sw/
├── app/
│   ├── page.tsx                          # Landing — swmujeres.com/
│   ├── directorio/
│   │   ├── page.tsx                      # Directory grid with search + filters
│   │   └── [slug]/page.tsx               # Individual business profile
│   ├── inscripcion/page.tsx              # Public enrollment form (no login)
│   ├── estadisticas/[token]/page.tsx     # Private stats page (token-gated, no login)
│   ├── admin/
│   │   ├── login/page.tsx                # Admin login (checked against admin_allowlist)
│   │   └── (panel)/                      # Route group — doesn't appear in URL
│   │       ├── layout.tsx                # Verifies admin session on every route
│   │       ├── page.tsx                  # Admin dashboard
│   │       ├── solicitudes/              # Application review: list + [id] detail
│   │       ├── perfiles/                 # Profile management: list + [id] editor
│   │       ├── membresias/               # Membership activation/deactivation
│   │       └── finanzas/                 # Ledger: income, expenses, loans
│   └── api/
│       ├── perfiles/route.ts             # Returns visible profiles (visibility rule applied here)
│       ├── solicitudes/route.ts          # Handles form submission + cascading inserts
│       ├── membresias/route.ts           # Activate/deactivate memberships
│       ├── tracking/route.ts             # Records profile views and contact clicks
│       └── email/route.ts               # Triggers Nodemailer emails
│
├── components/
│   ├── ui/                               # Small reusable pieces: buttons, badges, inputs
│   └── directorio/                       # Domain-specific: business cards, filter bars
│
├── lib/
│   ├── supabase.ts                       # Two clients: supabasePublic + supabaseAdmin
│   ├── email.ts                          # All transactional email (Nodemailer + Gmail SMTP)
│   └── utils.ts                          # slugify(), formatPhone(), shared helpers
│
├── public/images/                        # Static site assets
├── .env.local                            # Credentials — never committed to git
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

Current business-logic layout (DDD tactical):

```
src/
├── features/
│   ├── profiles/
│   ├── enrollment/
│   ├── admin/
│   └── tracking/
└── shared/
    ├── lib/
    └── utils/
```

### Key files explained

**`lib/supabase.ts`** — exports two clients. `supabasePublic` uses the anon key and is safe for client components. `supabaseAdmin` uses the service role key and must only be used in API routes. Never use `supabaseAdmin` in anything that runs on the client.

**`lib/email.ts`** — all outbound email goes through here. Two triggers: new application received (→ admin) and application approved/rejected (→ entrepreneur). Add new templates here as named exports.

**`src/shared/utils/*`** — `slugify()` converts business names to URL-safe slugs (`"Moda Élite & Más"` → `"moda-elite-mas"`). `formatPhone()` builds WhatsApp links (`wa.me/57...`). These utilities are shared across features without coupling to HTTP.

**`src/features/profiles/repository/profiles.repository.ts`** — source of truth for visibility filtering. Returns only profiles where membership is active, review is approved, and `end_at > now()`. API routes/pages delegate here.

**`app/admin/(panel)/layout.tsx`** — wraps every admin route. Checks for a valid admin session before rendering. If the session is invalid, redirects to `/admin/login`. The `(panel)` parentheses make this a route group — it organizes code without adding a URL segment.

### Database tables (Supabase / PostgreSQL)

| Table | What it stores |
|---|---|
| `entrepreneurs` | Personal data of the entrepreneur. `cedula` is UNIQUE — prevents duplicate enrollments. |
| `business_profiles` | Business data. 1:1 with `entrepreneurs`. Holds name, description, category, phone, socials, image path. |
| `products` | Membership plans (`plan-lanzamiento-gratis` is the free 90-day launch plan). |
| `applications` | Each enrollment request. Status: `pendiente` → `aprobada` / `rechazada`. |
| `memberships` | Current membership state per entrepreneur. One row per entrepreneur. |
| `membership_periods` | Source of truth for membership payments. One row per approved period. The finances view reads income from here — do NOT duplicate these entries into `ledger_entries`. |
| `profile_reviews` | Editorial review state per entrepreneur: `pendiente` / `aprobada` / `rechazada`. |
| `ledger_entries` | Manual financial entries only: egresos operativos e ingresos manuales puntuales. `direction` is enum `ledger_direction` with values `income` / `expense`. `amount_cop` must be > 0. `description` is NOT NULL. |
| `account_settings` | Single-row global config. Opening balance and date. |
| `admin_allowlist` | Emails that can log in to the admin panel. Checked on login. |

**Tables created in Sprint 3 (not yet in DB):**

| Table | What it stores |
|---|---|
| `profile_views` | One row per page visit to a business profile. |
| `contact_clicks` | One row per click on WhatsApp, Instagram, or website. |

### Supabase Storage buckets

| Bucket | Used for |
|---|---|
| `recipts` | Payment receipts (`applications.receipt_path`). **Note: the bucket was created with this typo. Use this exact name in code.** |
| `post_screenshots` | Optional Facebook post screenshots (`applications.post_screenshot_path`). |

---

## How work gets done

### Review and commit workflow

After completing each task, stop and ask for review before moving on. Do not chain tasks together without a checkpoint.

The flow for every task:

1. Complete the task.
2. Summarize what was done: which files were created or modified, what the change does, and anything the reviewer should pay attention to.
3. Ask explicitly: **"¿Lo revisas y me confirmas para hacer commit?"**
4. Wait. Do not proceed to the next task.
5. If the review surfaces issues, fix them and repeat from step 2.
6. Once the reviewer says it's good (any affirmative: "sí", "dale", "aprobado", "lgtm", etc.), run:

```bash
git add .
git commit -m "<concise description of what was done>"
```

Commit messages follow the conventional commits format: `type(scope): description`. Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`. Description in English, present tense, lowercase. Examples:
- `feat(lib): add data access layer with getProfiles and getProfileBySlug`
- `feat(directorio): build directory page with search and category filters`
- `fix(api): enforce visibility rule in perfiles route`

**Never mention Claude, Claude Code, or any AI tool in commit messages or commit bodies.** No `Co-Authored-By: Claude` trailers. Commits must look like they were written by a human engineer.

Never commit without explicit approval. Never batch multiple tasks into one commit.

### Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

No test suite is configured.

### Environment variables

Required in `.env.local` (never committed to git):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
EMAIL_FROM=           # Gmail address used as sender
EMAIL_APP_PASSWORD=   # Gmail App Password (not the account password)
EMAIL_ADMIN=          # Comma-separated admin emails for notifications
```

### Architecture rules (enforced, not negotiable)

1. **Frontend represents. Backend decides.** The frontend renders what the API returns. It never filters by membership status, never decides who is visible, never validates business rules.

2. **Visibility rule lives in the profiles repository**, not in a component. If `profiles.repository.ts` returns a profile, it's visible. If it doesn't, it isn't.

3. **Multi-table writes use transactions.** Enrolling a new entrepreneur creates records in `entrepreneurs`, `business_profiles`, `applications`, `profile_reviews`, and `memberships` — all in one atomic operation. Never sequential inserts without error handling.

4. **`supabaseAdmin` is server-only.** It uses the service role key which bypasses Row Level Security. Never import it in a client component or expose it to the browser.

5. **Types reflect the real schema.** No `any`. Every type is derived from the actual Supabase tables. If a field doesn't exist in the DB, it doesn't exist in a TypeScript type.

6. **Slug generation is deterministic.** `slugify()` in `src/shared/utils` is the single source of slug logic. Used in both the directory listing (to build URLs) and the profile page (to match URLs). They must produce identical output.

### Data flow: new enrollment

```
/inscripcion (form) 
  → POST /api/solicitudes 
  → validates input server-side
  → uploads receipt to Supabase Storage ("recipts" bucket)
  → atomic insert into 5 tables
  → sends email notification to EMAIL_ADMIN via lib/email.ts
  → returns success to form
  → admin sees request in /admin/solicitudes
  → admin approves → membership activated → email sent to entrepreneur
  → profile becomes visible in /directorio
```

### Data flow: directory browsing

```
/directorio (page)
  → GET /api/perfiles?categoria=...&q=...&ciudad=...
  → profiles service/repository applies visibility rule in data query
  → returns only active, approved, non-expired profiles
  → page renders grid of cards
  → user clicks card → /directorio/[slug]
  → click on WhatsApp → POST /api/tracking (contact_clicks)
```

### Module build order

Modules must be built in sequence. Don't start a new module until the previous one is validated with real data.

```
M0 (Foundations: env, supabase connection, folder structure, Vercel deploy)
 └→ M1 (Directory + Landing: P1, P2, P3 with real data, visibility rule active)
     ├→ M2 (Enrollment form: P4, file uploads, transactional inserts, email)
     │   └→ M3 (Admin panel: P5, login, review flow, membership management)
     │       └→ M4 (Finances: unified view of ledger_entries + membership_periods, monthly summaries, manual entries)
     └→ M5 (Tracking: profile_views, contact_clicks, stats page P6)
         └→ M6 (Launch: SEO, JSON-LD, Lighthouse >90, swmujeres.com live)
```

### Seed data required before M1

Before starting M1, verify these rows exist in Supabase. If not, insert manually:

```sql
-- Launch product (free 90-day plan)
INSERT INTO products (slug, name, type, price_cop, duration_days, is_active)
VALUES ('plan-lanzamiento-gratis', 'Plan Lanzamiento Gratuito', 'lanzamiento', 0, 90, true);

-- Admin email
INSERT INTO admin_allowlist (email) VALUES ('admin@swmujeres.com');

-- Account settings (one row, singleton)
INSERT INTO account_settings (name, opening_balance_cop, opening_balance, opening_date)
VALUES ('sw_account', 0, 0, CURRENT_DATE);
```

### Known quirks

- **Bucket typo:** the receipts bucket was created as `recipts` (missing an 'e'). Every storage call that uploads payment receipts must use this exact string.
- **Slug matching:** `getProfileBySlug()` compares the URL slug against `business_name` run through `slugify()`. The function in `src/shared/utils` must handle accents, special characters, and ampersands.
- **Admin route group:** `app/admin/(panel)/` uses Next.js route groups. The parentheses are load-bearing — they apply the shared admin layout without adding `panel` to the URL. `/admin/solicitudes` is correct, `/admin/panel/solicitudes` is not.

Archivos de contexto en: /context

Crea un bloque de documentacion en BITACORA.md por cada tarea que completes. El bloque debe seguir este formato exacto:

---
## [Nombre de la tarea]

**Qué hace:** una línea.
**Por qué existe:** una línea.
**Archivos creados o modificados:** lista con ruta exacta y una línea por archivo.
**Decisiones tomadas:** solo lo que no es obvio — por qué se eligió X sobre Y.
**Cómo probarlo:** comando o URL exacta para verificar que funciona.
---

Este bloque va AL FINAL de tu respuesta, después del resumen técnico y antes de preguntarme si hago commit.
