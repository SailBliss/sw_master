# Wompi SQL Target

This file records the database state already prepared for the Wompi integration.

It is documentation only, not a migration runner.

## Prepared Schema State

### `entrepreneurs`

Relevant fields:

- `id uuid primary key`
- `cedula text not null unique`
- `full_name text`
- `email text`
- `phone text`
- `fb_profile_url text`
- `consent_accepted boolean not null default false`
- `consent_accepted_at timestamptz`
- `is_blocked boolean not null default false`
- `blocked_reason text`
- `blocked_at timestamptz`
- `blocked_by uuid`

### `applications`

Relevant fields:

- `id uuid primary key`
- `entrepreneur_id uuid not null`
- `product_id uuid not null`
- `status application_status not null default 'pendiente'`
- `notes text`
- `amount_cop integer not null`
- `receipt_path text null`
- `post_screenshot_path text`
- `submitted_at timestamptz not null default now()`
- `reviewed_at timestamptz`
- `reviewed_by uuid`
- `description_review_id uuid`
- `description_reviewed boolean default false`
- `description_editorial_status text`

Official states:

- `pendiente`
- `rechazado`
- `habilitado_para_pago`
- `aprobado`

### `memberships`

Relevant fields:

- `entrepreneur_id uuid not null unique`
- `status membership_status not null default 'inactive'`
- `start_at timestamptz`
- `end_at timestamptz`
- `last_application_id uuid`

### `membership_periods`

Relevant fields:

- `id uuid primary key`
- `entrepreneur_id uuid not null`
- `application_id uuid unique`
- `start_at timestamptz not null`
- `end_at timestamptz not null`
- `amount_cop integer not null`
- `paid_at timestamptz`

### `payment_transactions`

Relevant fields:

- `id uuid primary key default gen_random_uuid()`
- `application_id uuid not null`
- `entrepreneur_id uuid not null`
- `product_id uuid not null`
- `provider text not null`
- `provider_reference text not null`
- `provider_transaction_id text`
- `status text not null`
- `amount_cop integer not null`
- `currency text not null default 'COP'`
- `checkout_url text`
- `raw_provider_payload jsonb`
- `expires_at timestamptz not null`
- `invalidated_at timestamptz`
- `paid_at timestamptz`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Allowed statuses:

- `pending`
- `paid`
- `declined`
- `failed`
- `expired`
- `invalidated`
- `error`

### Removed From Target Schema

`profile_reviews` is not part of the target schema anymore.

## Confirmation Function

The prepared database also includes:

```text
public.confirm_wompi_payment(
  p_payment_transaction_id uuid,
  p_provider_transaction_id text,
  p_raw_provider_payload jsonb
)
```

Purpose:

- confirm real Wompi payments atomically
- approve the application only after real payment
- activate membership only after real payment
- create financial/membership history only after real payment
