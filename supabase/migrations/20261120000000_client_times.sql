-- Start and stop now record the moment the person pressed the button, which the app sends,
-- instead of the moment the request arrived. Otherwise the running clock on screen jumps back
-- when the server's later time replaces the one it started counting from. A time more than
-- five minutes from the server's clock is ignored, so a badly set device can't store nonsense.
-- The new parameters are optional, so calls without them keep working.

create function public.client_time(p_at timestamptz)
returns timestamptz
language sql
stable
set search_path = ''
as $$
  select case
    when p_at is null or abs(extract(epoch from p_at - now())) > 300 then now()
    else p_at
  end;
$$;

drop function public.start_timer(text, uuid[], uuid);

create function public.start_timer(
  p_description text,
  p_label_ids uuid[],
  p_id uuid default null,
  p_started_at timestamptz default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_at timestamptz := public.client_time(p_started_at);
  v_id uuid;
begin
  update public.time_entries
    set ended_at = greatest(started_at, v_at)
    where user_id = auth.uid() and ended_at is null;

  insert into public.time_entries (id, description, started_at)
    values (coalesce(p_id, gen_random_uuid()), coalesce(p_description, ''), v_at)
    returning id into v_id;

  perform public.replace_entry_labels(v_id, p_label_ids);
  return v_id;
end;
$$;

drop function public.stop_timer();

create function public.stop_timer(p_ended_at timestamptz default null)
returns uuid
language sql
security invoker
set search_path = ''
as $$
  update public.time_entries
    set ended_at = greatest(started_at, public.client_time(p_ended_at))
    where user_id = auth.uid() and ended_at is null
    returning id;
$$;

revoke all on function public.client_time(timestamptz) from public, anon;
revoke all on function public.start_timer(text, uuid[], uuid, timestamptz) from public, anon;
revoke all on function public.stop_timer(timestamptz) from public, anon;
grant execute on function public.client_time(timestamptz) to authenticated;
grant execute on function public.start_timer(text, uuid[], uuid, timestamptz) to authenticated;
grant execute on function public.stop_timer(timestamptz) to authenticated;
