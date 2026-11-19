-- Lets the app choose the ids of new timers and entries, so it can show them before the
-- server answers. The new parameters are optional, so calls without them keep working.

drop function public.start_timer(text, uuid[]);

create function public.start_timer(p_description text, p_label_ids uuid[], p_id uuid default null)
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

  insert into public.time_entries (id, description, started_at)
    values (coalesce(p_id, gen_random_uuid()), coalesce(p_description, ''), now())
    returning id into v_id;

  insert into public.time_entry_labels (entry_id, label_id)
    select v_id, label_id from unnest(coalesce(p_label_ids, '{}')) as label_id
    on conflict do nothing;

  return v_id;
end;
$$;

drop function public.save_entry(text, timestamptz, uuid[], timestamptz, uuid);

-- Creates an entry when p_id is null or p_create is set, otherwise replaces the entry and its labels.
-- A null p_ended_at leaves the entry running.
create function public.save_entry(
  p_description text,
  p_started_at timestamptz,
  p_label_ids uuid[],
  p_ended_at timestamptz default null,
  p_id uuid default null,
  p_create boolean default false
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if p_id is null or p_create then
    insert into public.time_entries (id, description, started_at, ended_at)
      values (coalesce(p_id, gen_random_uuid()), coalesce(p_description, ''), p_started_at, p_ended_at)
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
  end if;

  perform public.replace_entry_labels(v_id, p_label_ids);
  return v_id;
end;
$$;

-- Changes what an entry is about without touching its times, which the server set.
create function public.set_entry_details(p_id uuid, p_description text, p_label_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.time_entries
    set description = coalesce(p_description, '')
    where id = p_id;

  if not found then
    raise exception 'Entry not found' using errcode = 'P0002';
  end if;

  perform public.replace_entry_labels(p_id, p_label_ids);
end;
$$;

create function public.replace_entry_labels(p_entry_id uuid, p_label_ids uuid[])
returns void
language sql
security invoker
set search_path = ''
as $$
  delete from public.time_entry_labels
    where entry_id = p_entry_id and label_id <> all (coalesce(p_label_ids, '{}'));
  insert into public.time_entry_labels (entry_id, label_id)
    select p_entry_id, label_id from unnest(coalesce(p_label_ids, '{}')) as label_id
    on conflict do nothing;
$$;

revoke all on function public.start_timer(text, uuid[], uuid) from public, anon;
revoke all on function public.save_entry(text, timestamptz, uuid[], timestamptz, uuid, boolean) from public, anon;
revoke all on function public.set_entry_details(uuid, text, uuid[]) from public, anon;
revoke all on function public.replace_entry_labels(uuid, uuid[]) from public, anon;
grant execute on function public.start_timer(text, uuid[], uuid) to authenticated;
grant execute on function public.save_entry(text, timestamptz, uuid[], timestamptz, uuid, boolean) to authenticated;
grant execute on function public.set_entry_details(uuid, text, uuid[]) to authenticated;
grant execute on function public.replace_entry_labels(uuid, uuid[]) to authenticated;
