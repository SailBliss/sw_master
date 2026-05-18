# Wompi Integration Source Of Truth

This file is the current source of truth for the Wompi payment integration in DirectorioSW.

Use it for:
- payment architecture,
- application approval flow,
- membership activation rules,
- payment confirmation rules,
- database truth for Wompi-related entities,
- and implementation maintenance.

If this file conflicts with older docs or old code paths, trust:

1. current code after implementation,
2. current real schema,
3. this file.

## Closed Functional Decisions

### Official `applications.status` values

The official application states are:

- `pendiente`
- `rechazado`
- `habilitado_para_pago`
- `aprobado`

Meaning:

- `pendiente`: application was submitted and awaits admin review.
- `rechazado`: admin rejected the application.
- `habilitado_para_pago`: admin approved the review step for a paid plan and the application is waiting for real payment confirmation.
- `aprobado`: application is fully approved.

Admin UI may show `habilitado_para_pago` with the label:

```text
Esperando pago
```

This is only a visual label. The database value stays `habilitado_para_pago`.

## Public Visibility Rule

A profile is public only when:

```text
applications.status = 'aprobado'
AND memberships.status = 'active'
AND memberships.end_at > now()
```

This rule stays centralized in backend/data access.

Frontend must not decide visibility.

## Enrollment And Re-enrollment

### Initial enrollment

The system creates or reuses:

- `entrepreneurs`
- `business_profiles`
- `applications`
- `memberships`

The initial application is stored as:

```text
applications.status = 'pendiente'
memberships.status = 'inactive'
```

### Re-enrollment

Re-enrollment is allowed unless the entrepreneur is blocked.

The form first asks for `cedula`.

If the `cedula` already exists:

- do not ask again for the base entrepreneur data,
- reuse the existing `entrepreneurs` row,
- reuse the existing `business_profiles` row,
- create a new `applications` row,
- keep `memberships` as the single current-membership row for that entrepreneur.

If:

```text
entrepreneurs.is_blocked = true
```

the person cannot re-enroll without manual admin intervention.

## Blocking

Manual blocking lives in `entrepreneurs`, not in `applications`.

Current fields:

- `is_blocked boolean not null default false`
- `blocked_reason text null`
- `blocked_at timestamptz null`
- `blocked_by uuid null`

`blocked_by` intentionally has no FK yet.

## Free Plan Flow

For a free product:

1. application is created as `pendiente`
2. membership exists as `inactive`
3. admin approves
4. backend updates:
   - `applications.status = 'aprobado'`
   - `memberships.status = 'active'`
   - `memberships.start_at`
   - `memberships.end_at`
5. backend creates `membership_periods`
6. profile becomes public

Wompi does not participate in the free flow.

## Paid Plan Flow

For a paid product:

1. application is created as `pendiente`
2. membership exists as `inactive`
3. admin approves the review step
4. backend updates:
   - `applications.status = 'habilitado_para_pago'`
5. admin UI shows `Esperando pago`
6. system sends a payment link
7. entrepreneur pays in Wompi
8. only backend-confirmed Wompi payment can update:
   - `applications.status = 'aprobado'`
   - `memberships.status = 'active'`
   - `memberships.start_at`
   - `memberships.end_at`
   - `membership_periods`
9. profile becomes public

Frontend never confirms payment.

## Payment Link Rule

Rules:

- the payment link is sent immediately after the application moves to `habilitado_para_pago`
- only one active payment intention can exist per application
- if the link is resent, the previous one must be invalidated
- the link expires after 7 days
- the link itself does not approve anything
- frontend does not confirm payments
- backend confirmation is required

## Wompi Architecture

Wompi must live in:

```text
src/features/payments/
app/api/payments/wompi/*
```

Recommended split:

```text
src/features/payments/types.ts
src/features/payments/services/wompi.service.ts
src/features/payments/repository/payments.repository.ts
app/api/payments/wompi/checkout/route.ts
app/api/payments/wompi/webhook/route.ts
app/api/payments/wompi/status/route.ts
```

### Layer responsibilities

`app/api/payments/wompi/*`
- parse request
- validate request shape
- call service
- return `NextResponse`

`src/features/payments/services/*`
- orchestrate checkout creation
- orchestrate webhook processing
- validate allowed transitions
- coordinate repository access

`src/features/payments/repository/*`
- own Supabase reads/writes for payment transactions
- resolve application/product/payment rows
- call RPCs where applicable

## Security Rules

Never:

- confirm a payment from frontend
- trust browser query params as proof of payment
- activate membership before backend confirmation
- create public visibility before confirmed payment
- duplicate visibility rules in UI
- mix `profile_reviews` into payments

Required:

- backend-first flow
- signed webhook validation
- amount and currency verification
- idempotent payment confirmation
- single active payment intention per application
- safe resend behavior

## Database Truth

### `applications`

Current relevant truths:

- `receipt_path` is nullable
- `status` supports `habilitado_para_pago`
- `description_review_id` still points to `profile_description_reviews`
- `reviewed_by` exists but is not yet part of the closed payment design

### `entrepreneurs`

Current relevant truths:

- `cedula` is unique
- blocking fields exist
- this is the root identity row reused by re-enrollment

### `memberships`

Current relevant truths:

- one row per entrepreneur
- current visibility state lives here
- do not activate from frontend

### `membership_periods`

Current relevant truths:

- stores membership/payment history
- `application_id` is unique
- used as a guardrail against duplicate period creation

### `payment_transactions`

This table is the source of truth for Wompi payment intentions and transaction history.

Relevant fields:

- `application_id`
- `entrepreneur_id`
- `product_id`
- `provider`
- `provider_reference`
- `provider_transaction_id`
- `status`
- `amount_cop`
- `currency`
- `checkout_url`
- `raw_provider_payload`
- `expires_at`
- `invalidated_at`
- `paid_at`
- timestamps

Status values:

- `pending`
- `paid`
- `declined`
- `failed`
- `expired`
- `invalidated`
- `error`

## Atomic Confirmation

Real payment confirmation must happen through:

```text
public.confirm_wompi_payment(...)
```

This function is expected to:

- lock the payment transaction row
- reject non-pending states
- reject expired rows
- reject stale rows invalidated by a newer pending transaction
- verify the application is still `habilitado_para_pago`
- mark the transaction as `paid`
- move the application to `aprobado`
- activate membership
- create `membership_periods`
- remain idempotent for duplicate webhook deliveries

## `profile_reviews`

`profile_reviews` is no longer part of the enrollment, approval, payment, membership, or visibility flow.

It has been removed from the target schema and must not be reintroduced.

Do not:

- insert into `profile_reviews`
- read from `profile_reviews` for approvals
- use it to determine visibility
- use it in Wompi flows

`profile_description_reviews` is different and remains part of editorial-review workflows only.

## Admin UX Truth

The approve action remains the approve action.

Behavior depends on product type:

- free plan:
  - approve activates the profile flow immediately
- paid plan:
  - approve moves the application to `habilitado_para_pago`
  - admin sees `Esperando pago`
  - payment link is sent
  - final approval happens only after confirmed payment

## Recommended Public Payment Link Strategy

Do not use frontend payment callbacks to mutate the database.

Recommended public payment identifier:

- use `payment_transactions.id` as the public payment identifier,
- do not expose raw `applicationId` as the public-facing payment handle.

This is a security and encapsulation recommendation for implementation.

## Current Code Integration

The database schema is already prepared for this flow. The code integration lives in:

```text
src/features/payments/
app/api/payments/wompi/*
app/pago/[token]
app/inscripcion/confirmacion
```

Current public contract:

- payment link token is `payment_transactions.id`
- checkout receives `paymentTransactionId`
- status receives `paymentTransactionId`
- frontend never confirms payments
- webhook confirmation goes through `public.confirm_wompi_payment(...)`
