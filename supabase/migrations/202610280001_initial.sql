begin;
create table public.managers (
  slot smallint primary key check (slot in (1,2)),
  user_id uuid not null unique references auth.users(id) on delete cascade
);
alter table public.managers enable row level security;
revoke all on public.managers from anon, authenticated;
grant select on public.managers to authenticated;
create policy manager_self on public.managers for select to authenticated using (user_id = auth.uid());
create function public.is_manager() returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.managers where user_id = (select auth.uid()));
$$;
revoke all on function public.is_manager() from public, anon;
grant execute on function public.is_manager() to authenticated;
create table public.requests (
  id uuid primary key,
  created_at timestamptz not null default now(),
  request_type text not null check (request_type in ('cotizacion','visita')),
  name text not null check (length(name) between 2 and 100),
  company text not null default '' check (length(company) <= 150),
  email text not null check (length(email) between 3 and 254),
  phone text not null check (length(phone) between 7 and 30),
  event_type text not null check (length(event_type) between 2 and 100),
  tentative_date date not null,
  attendees integer not null check (attendees between 1 and 100000),
  message text not null check (length(message) between 10 and 3000)
);
create index requests_received on public.requests(created_at desc, id);
create index requests_type_received on public.requests(request_type, created_at desc);
alter table public.requests enable row level security;
revoke all on public.requests from anon, authenticated;
grant select on public.requests to authenticated;
create policy managers_read on public.requests for select to authenticated using ((select public.is_manager()));
create table public.notification_jobs (
  request_id uuid primary key references public.requests(id) on delete cascade,
  state text not null default 'pending' check (state in ('pending','sending','sent','failed','review')),
  attempts integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  locked_until timestamptz,
  sent_at timestamptz
);
create table public.rate_limits (
  fingerprint text primary key,
  window_start timestamptz not null,
  hits integer not null
);
alter table public.notification_jobs enable row level security;
alter table public.rate_limits enable row level security;
revoke all on public.notification_jobs, public.rate_limits from anon, authenticated;
-- Only the server's service role may mutate these tables or execute intake/queue functions.
grant all on public.requests, public.notification_jobs, public.rate_limits, public.managers to service_role;
create function public.accept_request(payload jsonb, p_fingerprint text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare saved_id uuid; hits_now integer; rate_key text; ceiling integer;
begin
  -- The global ceiling cannot be bypassed by spoofing or rotating IP headers.
  -- The per-IP HMAC bucket is supplemental and depends on gateway normalization.
  foreach rate_key in array array['global', 'ip:' || p_fingerprint] loop
    ceiling := case when rate_key = 'global' then 60 else 5 end;
    insert into public.rate_limits as r values (rate_key, now(), 1)
    on conflict (fingerprint) do update set
      hits = case when r.window_start < now() - interval '15 minutes' then 1 else r.hits + 1 end,
      window_start = case when r.window_start < now() - interval '15 minutes' then now() else r.window_start end
    returning hits into hits_now;
    if hits_now > ceiling then raise exception 'rate_limited'; end if;
  end loop;
  saved_id := (payload->>'request_id')::uuid;
  insert into public.requests(id, request_type, name, company, email, phone, event_type, tentative_date, attendees, message)
  values(saved_id, payload->>'request_type', payload->>'name', payload->>'company', payload->>'email', payload->>'phone', payload->>'event_type', (payload->>'tentative_date')::date, (payload->>'attendees')::integer, payload->>'message')
  on conflict (id) do nothing;
  if exists (
    select 1 from public.requests r where r.id = saved_id
    and (to_jsonb(r) - array['id','created_at']) <> (payload - array['request_id','website'])
  ) then raise exception 'idempotency_conflict'; end if;
  insert into public.notification_jobs(request_id) values(saved_id) on conflict do nothing;
  -- Short retention for hashed rate-limit entries.
  delete from public.rate_limits where window_start < now() - interval '1 day';
  return saved_id;
end $$;
create function public.claim_notification(target uuid default null) returns setof public.notification_jobs
language plpgsql security definer set search_path = '' as $$
begin
  -- Resend deduplicates for 24h. Stop automatic retries before that window expires.
  update public.notification_jobs set state = 'review', last_error = 'retry_window_expired'
  where state in ('pending','failed','sending') and created_at < now() - interval '23 hours';
  return query
  update public.notification_jobs set state = 'sending', attempts = attempts + 1, locked_until = now() + interval '2 minutes'
  where request_id = (
    select j.request_id from public.notification_jobs j
    where (target is null or j.request_id = target)
      and j.created_at >= now() - interval '23 hours'
      and (j.state in ('pending','failed') or (j.state = 'sending' and j.locked_until < now()))
    order by j.created_at for update skip locked limit 1
  ) returning *;
end $$;
revoke all on function public.accept_request(jsonb,text), public.claim_notification(uuid) from public, anon, authenticated;
grant execute on function public.accept_request(jsonb,text), public.claim_notification(uuid) to service_role;
commit;
