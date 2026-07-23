create table if not exists public.app_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

drop policy if exists "read shared app state" on public.app_state;
drop policy if exists "insert shared app state" on public.app_state;
drop policy if exists "update shared app state" on public.app_state;

create policy "read shared app state"
  on public.app_state
  for select
  to anon
  using (id = 'global');

create policy "insert shared app state"
  on public.app_state
  for insert
  to anon
  with check (id = 'global');

create policy "update shared app state"
  on public.app_state
  for update
  to anon
  using (id = 'global')
  with check (id = 'global');
