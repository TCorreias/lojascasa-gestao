create table if not exists public.lc_batches (id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(), source text not null, items jsonb not null);
create table if not exists public.lc_audit (id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(), batch_id uuid not null references public.lc_batches(id), item_id text not null, decision text not null check(decision in ('approved','rejected')), snapshot jsonb not null, fingerprint text not null);
alter table public.lc_batches enable row level security;
alter table public.lc_audit enable row level security;
revoke all on public.lc_batches, public.lc_audit from anon, authenticated;
