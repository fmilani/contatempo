-- contatempo: labels, time entries, and the link between them.
-- All timestamps are timestamptz (UTC). A running timer is an entry with ended_at null.

create table public.labels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (name = btrim(name) and char_length(name) between 1 and 50),
  color text not null check (color ~ '^#[0-9a-f]{6}$'),
  created_at timestamptz not null default now(),
  unique (id, user_id)
);

create unique index labels_user_name_key on public.labels (user_id, lower(name));

create table public.time_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  description text not null default '' check (char_length(description) <= 500),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  unique (id, user_id),
  check (ended_at is null or ended_at >= started_at)
);

-- At most one running timer per user.
create unique index time_entries_one_running_key on public.time_entries (user_id) where ended_at is null;
create index time_entries_user_started_idx on public.time_entries (user_id, started_at desc);

-- The composite foreign keys keep an entry and its labels under the same user.
create table public.time_entry_labels (
  entry_id uuid not null,
  label_id uuid not null,
  user_id uuid not null default auth.uid(),
  primary key (entry_id, label_id),
  foreign key (entry_id, user_id) references public.time_entries (id, user_id) on delete cascade,
  foreign key (label_id, user_id) references public.labels (id, user_id) on delete cascade
);

create index time_entry_labels_label_idx on public.time_entry_labels (label_id);

alter table public.labels enable row level security;
alter table public.time_entries enable row level security;
alter table public.time_entry_labels enable row level security;

create policy "Users manage their own labels" on public.labels
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users manage their own entries" on public.time_entries
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users manage their own entry labels" on public.time_entry_labels
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

revoke all on public.labels, public.time_entries, public.time_entry_labels from anon;
grant select, insert, update, delete on public.labels, public.time_entries, public.time_entry_labels to authenticated;

-- The functions run as the caller, so the policies above apply inside them.

create function public.start_timer(p_description text, p_label_ids uuid[])
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid;
begin
  update public.time_entries
    set ended_at = now()
    where user_id = auth.uid() and ended_at is null;

  insert into public.time_entries (description, started_at)
    values (coalesce(p_description, ''), now())
    returning id into v_id;

  insert into public.time_entry_labels (entry_id, label_id)
    select v_id, label_id from unnest(coalesce(p_label_ids, '{}')) as label_id
    on conflict do nothing;

  return v_id;
end;
$$;

create function public.stop_timer()
returns uuid
language sql
security invoker
set search_path = ''
as $$
  update public.time_entries
    set ended_at = now()
    where user_id = auth.uid() and ended_at is null
    returning id;
$$;

-- Creates an entry when p_id is null, otherwise replaces the entry and its labels.
-- A null p_ended_at leaves the entry running.
create function public.save_entry(
  p_description text,
  p_started_at timestamptz,
  p_label_ids uuid[],
  p_ended_at timestamptz default null,
  p_id uuid default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid;
  v_label_ids uuid[] := coalesce(p_label_ids, '{}');
begin
  if p_id is null then
    insert into public.time_entries (description, started_at, ended_at)
      values (coalesce(p_description, ''), p_started_at, p_ended_at)
      returning id into v_id;
  else
    update public.time_entries
      set description = coalesce(p_description, ''),
          started_at = p_started_at,
          ended_at = p_ended_at
      where id = p_id
      returning id into v_id;

    if v_id is null then
      raise exception 'Entry not found' using errcode = 'P0002';
    end if;

    delete from public.time_entry_labels
      where entry_id = v_id and label_id <> all (v_label_ids);
  end if;

  insert into public.time_entry_labels (entry_id, label_id)
    select v_id, label_id from unnest(v_label_ids) as label_id
    on conflict do nothing;

  return v_id;
end;
$$;

revoke all on function public.start_timer(text, uuid[]) from public, anon;
revoke all on function public.stop_timer() from public, anon;
revoke all on function public.save_entry(text, timestamptz, uuid[], timestamptz, uuid) from public, anon;
grant execute on function public.start_timer(text, uuid[]) to authenticated;
grant execute on function public.stop_timer() to authenticated;
grant execute on function public.save_entry(text, timestamptz, uuid[], timestamptz, uuid) to authenticated;
