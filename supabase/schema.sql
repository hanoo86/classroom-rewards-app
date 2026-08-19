-- Run this once in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query).

create table if not exists classroom_state (
  id int primary key default 1,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Only one row ever exists (id = 1). The whole app's data lives in `data`.
insert into classroom_state (id, data)
values (1, '{}'::jsonb)
on conflict (id) do nothing;

alter table classroom_state enable row level security;

-- Everyone (the student kiosk, with no login) can read the class data.
create policy "public read" on classroom_state
  for select using (true);

-- Everyone can write. This matches the trust model of a shared classroom
-- device: the physical kiosk is the security boundary, not a login screen.
-- The Teacher Console is still gated behind Supabase Auth in the app UI.
-- If you want DB-level enforcement instead (e.g. only signed-in teachers can
-- award points or edit rewards), split this single table into per-feature
-- tables and restrict UPDATE/INSERT to `auth.role() = 'authenticated'`.
create policy "public write" on classroom_state
  for update using (true) with check (true);

-- Realtime (optional): lets multiple open tabs/devices see updates live.
alter publication supabase_realtime add table classroom_state;
