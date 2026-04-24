# CLAUDE.md

This file is the single source of truth for working in this repository. Keep it accurate — if the code diverges from what's written here, update this file.

---

## What this project does

**DirectorioSW** is a women entrepreneurs directory for the SW Mujeres community — a private Facebook group of 13,500 verified women in Medellín, Colombia.

The product flips the ad-fatigue problem: instead of interrupting women with commercial posts (46%+ rejection rate in the group), the directory lets buyers arrive *looking* for products and services.

**Three actors, three jobs:**

- **Compradora** (buyer) — browses without logging in, filters by category or city, contacts via WhatsApp in one click.
- **Empresaria** (entrepreneur) — submits an enrollment form, waits for manual approval, gets a public profile with a verified SW badge once approved and membership is active.
- **Administradora** (admin) — reviews applications, approves/rejects, manages memberships, monitors finances.

**Visibility rule (critical — enforced in backend only):**

```
memberships.status = 'active'
AND memberships.end_at > now()
AND applications.status = 'aprobado'
```

`profile_reviews` does NOT control visibility. It is a staging area for CSV imports only.

**Launch model:** first 90 days are free (`plan-lanzamiento-gratis`, $0 COP). Paid subscriptions start once real traffic data justifies a price.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.3 (App Router, TypeScript strict) |
| Database | Supabase (PostgreSQL + Storage + RLS) |
| Auth | Custom OTP (6-digit code via Gmail, JWT session cookie) |
| Email | Nodemailer + Gmail SMTP (not Resend) |
| Styling | Tailwind CSS |
| Hosting | Vercel |
| Domain | swmujeres.com |

---

## Where things live

```
sw_master/
├── app/
│   ├── page.tsx                          # Landing — swmujeres.com/
│   ├── robots.ts                         # SEO: robots.txt generation
│   ├── sitemap.ts                        # SEO: sitemap generation
│   ├── directorio/
│   │   ├── page.tsx                      # Directory grid with search + filters
│   │   └── [slug]/page.tsx               # Individual business profile
│   ├── inscripcion/page.tsx              # Public enrollment form (no login)
│   ├── aliadas/page.tsx                  # Private: SW group rules + enrollment for existing members
│   │                                     #   URL shared manually by admin. NOT linked publicly.
│   ├── estadisticas/[token]/page.tsx     # Token-gated stats page for each empresaria (no login)
│   ├── admin/
│   │   ├── login/page.tsx                # Admin login (email → OTP code)
│   │   └── (panel)/                      # Route group — doesn't appear in URL
│   │       ├── layout.tsx                # Verifies JWT session cookie on every admin route
│   │       ├── page.tsx                  # Admin dashboard
│   │       ├── solicitudes/              # Application review: list + [id] detail
│   │       ├── perfiles/                 # Profile management: list + [id] editor
│   │       ├── membresias/               # Membership alerts + full table
│   │       └── finanzas/                 # Ledger: income (membership_periods) + manual entries
│   └── api/
│       ├── admin/
│       │   ├── solicitar-acceso/route.ts # POST: generate OTP + send email
│       │   ├── verificar-otp/route.ts    # POST: validate OTP → set session cookie
│       │   ├── auth/route.ts             # Legacy magic link callback (kept, not in use)
│       │   └── logout/route.ts           # POST: clear session cookie
│       ├── perfiles/route.ts             # GET: visible profiles (visibility rule applied here)
│       ├── solicitudes/route.ts          # POST: form submission + cascading inserts
│       ├── membresias/route.ts           # Activate/deactivate memberships
│       ├── finanzas/route.ts             # Financial entries CRUD
│       ├── tracking/route.ts             # POST: record profile views and contact clicks
│       └── email/route.ts               # Utility email endpoint
│
├── src/
│   ├── features/
│   │   ├── profiles/                     # Directory public-facing logic
│   │   │   └── repository/profiles.repository.ts  # Visibility rule lives here
│   │   ├── enrollment/                   # Inscription form types + logic
│   │   ├── admin/                        # Admin panel logic
│   │   │   ├── repository/               # Data access (reads)
│   │   │   ├── services/                 # Business logic (applications, memberships, finances, profiles)
│   │   │   └── types.ts
│   │   └── tracking/                     # Profile views + contact clicks
│   │       └── services/tracking.service.ts
│   └── shared/
│       ├── lib/                          # Shared Supabase clients (re-exported from lib/)
│       └── utils/                        # slugify, formatPhone, CATEGORIES, getPublicImageUrl
│
├── lib/                                  # Server-only utilities — never import in Client Components
│   ├── supabase.ts                       # supabasePublic (anon key, safe for client)
│   ├── supabase-admin.ts                 # supabaseAdmin (service role key, bypasses RLS)
│   ├── auth.ts                           # OTP creation/verification + JWT session (createOtp, verifyOtp, createSession, verifySession)
│   ├── email.ts                          # All transactional email via Nodemailer + Gmail SMTP
│   └── storage.ts                        # File upload helpers (uploadReceipt, uploadScreenshot)
│
├── components/
│   ├── ui/                               # Reusable primitives: buttons, badges, inputs
│   └── directorio/                       # Domain-specific: business cards, filter bars
│
├── context/specs/                        # Internal specs and references
├── docs/                                 # Product and marketing docs
├── public/images/                        # Static site assets
├── BITACORA.md                           # Chronological implementation log (required — see below)
├── AGENTS.md                             # Next.js-specific agent rules
├── .env.local                            # Credentials — never committed to git
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## Key files explained

**`lib/supabase.ts`** — exports `supabasePublic` (anon key). Safe for Client Components and server reads that respect RLS.

**`lib/supabase-admin.ts`** — exports `supabaseAdmin` (service role key). Bypasses RLS. Only import from `app/api/*` or `lib/*`. Never from Client Components or page components.

**`lib/auth.ts`** — owns all admin authentication logic:
- `isEmailAllowed(email)` — checks `admin_allowlist`
- `createOtp(email)` — generates 6-digit code, stores in `admin_magic_links.token`, expires in 10 min
- `verifyOtp(email, code)` — validates code, marks as used
- `createSession(email)` — returns a signed JWT (7 days, signed with `JWT_SECRET`)
- `verifySession(token)` — decodes JWT, returns email or null

**`lib/email.ts`** — all outbound email. Nodemailer + Gmail SMTP. Functions: `notifyAdminNewApplication`, `notifyEntrepreneurApproved`, `notifyEntrepreneurRejected`, `sendOtpEmail`. Add new templates here as named exports.

**`lib/storage.ts`** — wraps Supabase Storage uploads. `uploadReceipt(file, entrepreneurId)` → path in `recipts` bucket. `uploadScreenshot(file, entrepreneurId)` → path in `post_screenshots` bucket.

**`src/features/profiles/repository/profiles.repository.ts`** — single source of truth for visibility filtering. Returns only profiles where `memberships.status = 'active'` AND `memberships.end_at > now()` AND `applications.status = 'aprobado'`. All public-facing pages delegate here.

**`src/shared/utils/getPublicImageUrl.ts`** — converts raw `directory_image_path` stored in DB to a full Supabase Storage URL. Guards against double-prefixing (if path already starts with `http`, returns as-is).

**`app/admin/(panel)/layout.tsx`** — protects every admin route. Reads the `sw_admin_session` cookie, calls `verifySession()`, redirects to `/admin/login` if invalid. The `(panel)` group doesn't add a URL segment.

---

## Database tables (Supabase / PostgreSQL)

| Table | What it stores |
|---|---|
| `entrepreneurs` | Personal data. `cedula` is UNIQUE — prevents duplicate enrollments. |
| `business_profiles` | Business data. 1:1 with `entrepreneurs`. Holds name, description, category, phone, socials, image path, `stats_token` (UUID, UNIQUE, NOT NULL — gates `/estadisticas/[token]`). |
| `products` | Membership plans. `plan-lanzamiento-gratis`: free, 90 days. |
| `applications` | Enrollment requests. Status enum: `pendiente` → `aprobado` / `rechazado`. |
| `memberships` | Current membership state per entrepreneur. One row per entrepreneur. |
| `membership_periods` | Paid periods history. One row per approved period. Finances reads income from here — do NOT duplicate into `ledger_entries`. |
| `profile_reviews` | Staging area for CSV imports. NOT used for directory visibility. States: `pendiente` / `aprobada` / `rechazada`. |
| `ledger_entries` | Manual financial entries only (operating expenses + one-off manual income). `direction` enum `ledger_direction`: `income` / `expense`. `amount_cop` > 0. `description` NOT NULL. |
| `account_settings` | Singleton global config. Opening balance and date. |
| `admin_allowlist` | Emails allowed in the admin panel. Primary key is `email`. |
| `admin_magic_links` | OTP auth tokens. Columns: `id`, `email`, `token` (6-digit string), `expires_at`, `used_at`. Reused from original magic link system. |
| `profile_views` | One row per visit to a business profile page. References `business_profiles.id`. |
| `contact_clicks` | One row per click on WhatsApp, Instagram, or website. References `business_profiles.id`. `click_type` is a USER-DEFINED enum. |

### Critical Supabase join pattern

All foreign keys originate from `entrepreneurs` as the root table:

```
entrepreneurs (id)
  ← business_profiles (entrepreneur_id)
  ← memberships      (entrepreneur_id)
  ← applications     (entrepreneur_id)
  ← profile_reviews  (entrepreneur_id)
```

There is NO direct FK between `business_profiles` and `memberships`. Queries always join through `entrepreneurs`.

### Supabase returns 1:1 relations as object, not array

When a table has one related row (e.g. `memberships`, which is 1:1 with `entrepreneurs`), Supabase JS client returns `{}` not `[]`. Normalize both cases:

```typescript
const memberships = Array.isArray(row.memberships)
  ? row.memberships
  : row.memberships ? [row.memberships] : []
```

Apply to `memberships` and `business_profiles`. `applications` returns an array (there can be multiple).

### RLS policies

All tables have RLS enabled. Public SELECT policies (USING true) exist on:
- `business_profiles`, `entrepreneurs`, `memberships`, `applications`

Financial and admin tables (`ledger_entries`, `account_settings`, `admin_allowlist`, `membership_periods`, `admin_magic_links`) have NO public policy — admin-only access. Correct.

### Supabase Storage buckets

| Bucket | Used for |
|---|---|
| `recipts` | Payment receipts (`applications.receipt_path`). **Typo is intentional — bucket was created this way. Use exactly `recipts` in all code.** |
| `post_screenshots` | Optional Facebook post screenshots (`applications.post_screenshot_path`). |

---

## Environment variables

Required in `.env.local` (never committed to git):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=              # Signing secret for admin session JWTs (any strong random string)
EMAIL_FROM=              # Gmail address used as sender
EMAIL_APP_PASSWORD=      # Gmail App Password (not the Gmail account password)
EMAIL_ADMIN=             # Comma-separated admin emails for notifications
NEXT_PUBLIC_SITE_URL=    # Full URL (https://swmujeres.com or http://localhost:3000 for dev)
```

---

## How work gets done

### Review and commit workflow

After completing each task, stop and ask for review before moving on.

1. Complete the task.
2. Summarize: which files changed, what the change does, anything to pay attention to.
3. Ask explicitly: **"¿Lo revisas y me confirmas para hacer commit?"**
4. Wait. Do not proceed.
5. Fix any issues and repeat from step 2.
6. On approval (any affirmative: "sí", "dale", "aprobado", "lgtm", etc.):

```bash
git add .
git commit -m "<type(scope): description>"
```

Commit message format: `type(scope): description` — present tense, lowercase, English.
Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`.

**Never mention Claude, AI, or any tool in commit messages.** No `Co-Authored-By` trailers. Commits look like they were written by a human engineer.

Never commit without explicit approval. Never batch multiple tasks into one commit.

### Commands

```bash
npm run dev      # Development server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
```

No test suite is configured.

---

## Architecture rules (non-negotiable)

1. **Frontend represents. Backend decides.** The frontend renders what the API returns. It never filters by membership status, never decides visibility, never validates business rules.

2. **Visibility rule lives in `profiles.repository.ts`** — not in components, not in pages. One place, one implementation.

3. **Multi-table writes use rollback.** Enrolling a new entrepreneur touches 5 tables. If any insert fails, the previous inserts are rolled back manually. Never silent failures.

4. **`supabaseAdmin` is server-only.** Service role key bypasses RLS. Never import `lib/supabase-admin.ts` in Client Components or page components.

5. **No `any`.** Every type is derived from the actual Supabase schema. If a field doesn't exist in the DB, it doesn't exist in a TypeScript type.

6. **Slug generation is deterministic.** `slugify()` in `src/shared/utils` is the single source. Used in listing (builds URLs) and profile page (matches URLs). They must produce identical output.

---

## Data flows

### New enrollment

```
/inscripcion or /aliadas (form)
  → POST /api/solicitudes
  → validate server-side
  → upload receipt to Storage ("recipts" bucket)
  → insert into 5 tables (entrepreneurs, business_profiles, applications, profile_reviews, memberships)
  → notify admin via lib/email.ts
  → return success
  → admin reviews in /admin/solicitudes
  → approve → memberships.status = 'active', membership_periods created, email to entrepreneur
  → profile visible in /directorio
```

### Admin authentication

```
/admin/login (email input)
  → POST /api/admin/solicitar-acceso
  → isEmailAllowed() checks admin_allowlist
  → createOtp() → 6-digit code stored in admin_magic_links
  → sendOtpEmail() → email with code
  → /admin/login (OTP input)
  → POST /api/admin/verificar-otp
  → verifyOtp() validates + marks used
  → createSession() → JWT
  → Set-Cookie: sw_admin_session (httpOnly, 7 days)
  → client: window.location.href = '/admin'  ← intentional (guarantees cookie commit before navigation)
```

---

## Module status (Abril 2026)

| Module | Status | What it covers |
|---|---|---|
| M0 — Foundations | ✅ Complete | Folder structure, env, Supabase connection, email setup |
| M1 — Directory + Landing | ✅ Complete | P1 landing, P2 directory with search/filters, P3 profile pages, visibility rule |
| M2 — Enrollment form | ✅ Complete | P4 multi-step form, file uploads, 5-table insert, email notification |
| M3 — Admin panel | ✅ Complete | OTP auth, solicitudes review, perfiles editor, membresías alerts, dashboard |
| M4 — Finances | ✅ Complete | Ledger view combining membership_periods + ledger_entries, monthly summaries, manual entries |
| M5 — Tracking | 🔄 In progress | profile_views, contact_clicks tables, tracking service, P6 stats page |
| M6 — Launch | 🔄 In progress | robots.ts, sitemap.ts, Next.js Image optimization done; JSON-LD, Lighthouse audit pending |

---

## Known quirks

- **Bucket typo:** receipts bucket was created as `recipts`. Use this exact string everywhere.
- **Slug matching:** `getProfileBySlug()` compares URL slug against `business_name` run through `slugify()`. The function must handle accents, ampersands, and special characters consistently.
- **Admin route group:** `app/admin/(panel)/` — parentheses are load-bearing. `/admin/solicitudes` is correct, `/admin/panel/solicitudes` is not.
- **OTP in admin_magic_links:** the `token` column stores the 6-digit numeric code (as string). The table was originally designed for magic links — it was repurposed, not replaced.
- **`window.location.href` after OTP verification:** intentional. `router.push()` can navigate before the cookie is committed in some browsers. `window.location.href` forces a full page load, guaranteeing the cookie is present on the next request.
- **`instagram_handle` in DB:** existing data may contain full URLs instead of just handles. Clean on display or in the admin editor.

---

## BITACORA.md

Add a documentation block to `BITACORA.md` for every task you complete. Format:

```
---
## [Task name]

**Qué hace:** one line.
**Por qué existe:** one line.
**Archivos creados o modificados:** exact paths, one line each.
**Decisiones tomadas:** only non-obvious choices — why X over Y.
**Cómo probarlo:** exact command or URL.
---
```

This block goes at the END of your response, after the technical summary and before asking for commit approval.
