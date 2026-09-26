
create type public.app_role as enum ('STUDENT','MESS_MANAGER','ADMIN');
create type public.account_status as enum ('ACTIVE','INACTIVE','SUSPENDED');
create type public.record_status as enum ('ACTIVE','INACTIVE');
create type public.plan_type as enum ('WEEKLY','MONTHLY');
create type public.meal_type as enum ('BREAKFAST','LUNCH','DINNER');
create type public.subscription_status as enum ('ACTIVE','EXPIRED','PAUSED','CANCELLED','PENDING');
create type public.selection_status as enum ('SELECTED','SKIPPED','LOCKED','UNSELECTED');
create type public.payment_status as enum ('PAID','UNPAID','PENDING','VOID');
create type public.payment_method as enum ('DEMO','CASH','OTHER');
create type public.complaint_status as enum ('OPEN','IN_PROGRESS','RESOLVED');
create type public.notification_type as enum ('SUCCESS','WARNING','ERROR','INFO');

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

-- ============ TABLES ============
create table public.profiles (
  id uuid primary key,
  full_name text not null,
  email text not null,
  phone text,
  status public.account_status not null default 'ACTIVE',
  profile_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index profiles_email_idx on public.profiles(email);
create index profiles_status_idx on public.profiles(status);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
create index user_roles_role_idx on public.user_roles(role);

create table public.messes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text,
  address text,
  operating_hours text,
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.mess_managers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mess_id uuid not null references public.messes(id),
  assigned_at timestamptz not null default now(),
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, mess_id)
);
create index mess_managers_mess_idx on public.mess_managers(mess_id);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type public.plan_type not null,
  price numeric(10,2) not null check (price >= 0),
  duration_days int not null check (duration_days > 0),
  included_meals int not null check (included_meals >= 0),
  breakfast_included boolean not null default true,
  lunch_included boolean not null default true,
  dinner_included boolean not null default true,
  description text not null default '',
  status public.record_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create sequence public.subscription_code_seq start 1;
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default ('SUB-' || lpad(nextval('public.subscription_code_seq')::text, 4, '0')),
  student_id uuid not null references public.profiles(id),
  plan_id uuid not null references public.plans(id),
  mess_id uuid not null references public.messes(id),
  plan_name text not null,
  price numeric(10,2) not null check (price >= 0),
  breakfast_included boolean not null,
  lunch_included boolean not null,
  dinner_included boolean not null,
  start_date date not null,
  end_date date not null,
  total_meals int not null check (total_meals >= 0),
  meals_used int not null default 0 check (meals_used >= 0),
  meals_remaining int generated always as (greatest(total_meals - meals_used, 0)) stored,
  status public.subscription_status not null default 'ACTIVE',
  cancellation_requested boolean not null default false,
  pause_requested boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date)
);
create unique index subscriptions_one_active_per_student on public.subscriptions(student_id) where status = 'ACTIVE';
create index subscriptions_student_idx on public.subscriptions(student_id);
create index subscriptions_status_idx on public.subscriptions(status);
create index subscriptions_mess_status_idx on public.subscriptions(mess_id, status);
create index subscriptions_dates_idx on public.subscriptions(start_date, end_date);

create table public.menus (
  id uuid primary key default gen_random_uuid(),
  mess_id uuid not null references public.messes(id),
  meal_date date not null,
  meal_type public.meal_type not null,
  menu_items text not null,
  is_special boolean not null default false,
  is_festival boolean not null default false,
  status public.record_status not null default 'ACTIVE',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index menus_mess_date_idx on public.menus(mess_id, meal_date, meal_type);

create table public.meals (
  id uuid primary key default gen_random_uuid(),
  mess_id uuid not null references public.messes(id),
  meal_date date not null,
  meal_type public.meal_type not null,
  menu_id uuid references public.menus(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (mess_id, meal_date, meal_type)
);
create index meals_date_idx on public.meals(meal_date);
create index meals_type_idx on public.meals(meal_type);

create table public.meal_selections (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id),
  meal_id uuid not null references public.meals(id),
  status public.selection_status not null default 'SELECTED',
  selected_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, meal_id)
);
create index meal_selections_meal_idx on public.meal_selections(meal_id, status);

create table public.meal_consumption (
  id uuid primary key default gen_random_uuid(),
  mess_id uuid not null references public.messes(id),
  meal_id uuid not null unique references public.meals(id),
  expected_quantity int not null default 0 check (expected_quantity >= 0),
  prepared_quantity int not null check (prepared_quantity >= 0),
  consumed_quantity int not null check (consumed_quantity >= 0),
  wasted_quantity int generated always as (prepared_quantity - consumed_quantity) stored,
  wastage_percentage numeric(6,2) generated always as (
    case when prepared_quantity = 0 then 0 else round((prepared_quantity - consumed_quantity) * 100.0 / prepared_quantity, 2) end
  ) stored,
  recorded_by uuid references public.profiles(id),
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (consumed_quantity <= prepared_quantity)
);
create index meal_consumption_mess_idx on public.meal_consumption(mess_id);

create sequence public.invoice_seq start 1;
create or replace function public.next_invoice_number() returns text language sql volatile set search_path = public as $$
  select 'FP-' || to_char(now() at time zone 'Asia/Kolkata', 'YYYY') || '-' || lpad(nextval('public.invoice_seq')::text, 6, '0')
$$;

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique default public.next_invoice_number(),
  student_id uuid not null references public.profiles(id),
  subscription_id uuid not null references public.subscriptions(id),
  mess_id uuid not null references public.messes(id),
  base_amount numeric(10,2) not null check (base_amount >= 0),
  adjustment numeric(10,2) not null default 0,
  amount numeric(10,2) not null check (amount >= 0),
  payment_date date not null default ((now() at time zone 'Asia/Kolkata')::date),
  status public.payment_status not null default 'UNPAID',
  payment_method public.payment_method not null default 'DEMO',
  transaction_reference text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index payments_student_idx on public.payments(student_id);
create index payments_status_idx on public.payments(status);
create index payments_date_idx on public.payments(payment_date);
create index payments_mess_status_idx on public.payments(mess_id, status);

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id),
  meal_id uuid not null references public.meals(id),
  rating smallint not null check (rating between 1 and 5),
  category text not null default 'General',
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, meal_id)
);
create index feedback_meal_idx on public.feedback(meal_id);

create sequence public.complaint_code_seq start 1001;
create table public.complaints (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default ('FP-' || nextval('public.complaint_code_seq')::text),
  student_id uuid not null references public.profiles(id),
  mess_id uuid not null references public.messes(id),
  meal_id uuid references public.meals(id),
  meal_type public.meal_type not null,
  complaint_date date not null,
  category text not null check (category in ('Food Quality','Hygiene','Service','Quantity','Suggestion')),
  description text not null check (char_length(description) between 5 and 2000),
  status public.complaint_status not null default 'OPEN',
  manager_response text,
  responded_by uuid references public.profiles(id),
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index complaints_student_idx on public.complaints(student_id);
create index complaints_status_idx on public.complaints(status);
create index complaints_mess_idx on public.complaints(mess_id);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type public.notification_type not null default 'INFO',
  title text not null,
  message text not null,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_user_read_idx on public.notifications(user_id, is_read, created_at desc);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid,
  actor_name text not null default 'System',
  action text not null,
  module text not null,
  entity_type text,
  entity_id text,
  description text not null,
  old_value jsonb,
  new_value jsonb,
  status text not null default 'Success' check (status in ('Success','Failed')),
  created_at timestamptz not null default now()
);
create index audit_logs_created_idx on public.audit_logs(created_at desc);

create table public.system_settings (
  id uuid primary key default gen_random_uuid(),
  mess_id uuid unique references public.messes(id),
  mess_name text not null,
  contact text not null default '',
  address text not null default '',
  operating_hours text not null default '',
  breakfast_time text not null default '07:30 - 09:30',
  lunch_time text not null default '12:30 - 14:30',
  dinner_time text not null default '19:30 - 21:30',
  cutoff_time time not null default '22:00',
  notify_subscription_expiry boolean not null default true,
  notify_payment_reminder boolean not null default true,
  notify_meal_deadline boolean not null default true,
  notify_complaint_update boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index system_settings_single_global on public.system_settings((mess_id is null)) where mess_id is null;

-- updated_at triggers
do $$ declare t text; begin
  foreach t in array array['profiles','messes','mess_managers','plans','subscriptions','menus','meals','meal_selections','meal_consumption','payments','feedback','complaints','system_settings'] loop
    execute format('create trigger %I_touch before update on public.%I for each row execute function public.touch_updated_at()', t, t);
  end loop;
end $$;

-- ============ HELPERS ============
create or replace function public.has_role(_user_id uuid, _role public.app_role) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(auth.uid(), 'ADMIN')
$$;
create or replace function public.managed_mess_ids() returns setof uuid language sql stable security definer set search_path = public as $$
  select mess_id from public.mess_managers where user_id = auth.uid() and status = 'ACTIVE'
$$;
create or replace function public.is_manager_of(_mess uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.mess_managers where user_id = auth.uid() and mess_id = _mess and status = 'ACTIVE')
$$;
create or replace function public.student_mess_ids() returns setof uuid language sql stable security definer set search_path = public as $$
  select distinct mess_id from public.subscriptions where student_id = auth.uid()
$$;
create or replace function public.manager_sees_student(_student uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.subscriptions s join public.mess_managers mm on mm.mess_id = s.mess_id
                 where s.student_id = _student and mm.user_id = auth.uid() and mm.status = 'ACTIVE')
$$;
create or replace function public.today_ist() returns date language sql stable set search_path = public as $$
  select (now() at time zone 'Asia/Kolkata')::date
$$;
create or replace function public.cutoff_at(_mess uuid, _date date) returns timestamptz language sql stable security definer set search_path = public as $$
  select ((_date - 1) + coalesce(
      (select cutoff_time from public.system_settings where mess_id = _mess),
      (select cutoff_time from public.system_settings where mess_id is null),
      '22:00'::time)) at time zone 'Asia/Kolkata'
$$;
create or replace function public.assert_active_user() returns void language plpgsql stable security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'You must be signed in to do that.'; end if;
  if not exists (select 1 from public.profiles where id = auth.uid() and status = 'ACTIVE') then
    raise exception 'Your account is not active. Please contact the administrator.';
  end if;
end $$;
create or replace function public.log_audit(_action text, _module text, _etype text, _eid text, _desc text, _old jsonb, _new jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.audit_logs(actor_user_id, actor_name, action, module, entity_type, entity_id, description, old_value, new_value)
  values (auth.uid(), coalesce((select full_name from public.profiles where id = auth.uid()), 'System'), _action, _module, _etype, _eid, _desc, _old, _new);
end $$;
create or replace function public.notify(_user uuid, _type public.notification_type, _title text, _msg text, _link text default null)
returns void language sql security definer set search_path = public as $$
  insert into public.notifications(user_id, type, title, message, link) values (_user, _type, _title, _msg, _link)
$$;
create or replace function public.meal_included(_s public.subscriptions, _t public.meal_type) returns boolean language sql immutable as $$
  select case _t when 'BREAKFAST' then _s.breakfast_included when 'LUNCH' then _s.lunch_included else _s.dinner_included end
$$;

-- Expected demand for a mess/date/meal: active-period subscribers who include the meal and did not skip it.
create or replace function public.expected_demand(_mess uuid, _date date, _type public.meal_type) returns int
language sql stable security definer set search_path = public as $$
  select count(*)::int from public.subscriptions s
  where s.mess_id = _mess and s.status in ('ACTIVE','EXPIRED')
    and _date between s.start_date and s.end_date
    and public.meal_included(s, _type)
    and not exists (select 1 from public.meal_selections ms join public.meals m on m.id = ms.meal_id
                    where ms.student_id = s.student_id and m.mess_id = _mess and m.meal_date = _date
                      and m.meal_type = _type and ms.status = 'SKIPPED')
$$;

-- Keeps subscription status/usage in line with dates (called on load and before business operations).
create or replace function public.refresh_subscriptions() returns void language plpgsql security definer set search_path = public as $$
begin
  update public.subscriptions set status = 'EXPIRED', pause_requested = false, cancellation_requested = false
   where status in ('ACTIVE','PAUSED') and end_date < public.today_ist();
  update public.subscriptions s set meals_used = least(s.total_meals, (
      select count(*) from generate_series(s.start_date, least(s.end_date, public.today_ist() - 1), interval '1 day') g(d)
      cross join unnest(enum_range(null::public.meal_type)) t(mt)
      where public.meal_included(s, t.mt)
        and not exists (select 1 from public.meal_selections ms join public.meals m on m.id = ms.meal_id
                        where ms.student_id = s.student_id and m.mess_id = s.mess_id and m.meal_date = g.d::date
                          and m.meal_type = t.mt and ms.status = 'SKIPPED')))
   where s.status = 'ACTIVE';
end $$;

create or replace function public.ensure_meal(_mess uuid, _date date, _type public.meal_type) returns uuid
language plpgsql security definer set search_path = public as $$
declare v uuid;
begin
  select id into v from public.meals where mess_id = _mess and meal_date = _date and meal_type = _type;
  if v is null then
    insert into public.meals(mess_id, meal_date, meal_type,  menu_id)
    values (_mess, _date, _type, (select id from public.menus where mess_id = _mess and meal_date = _date and meal_type = _type and status = 'ACTIVE' order by updated_at desc limit 1))
    on conflict (mess_id, meal_date, meal_type) do update set updated_at = now() returning id into v;
  end if;
  return v;
end $$;

-- ============ BUSINESS OPERATIONS (RPC) ============
create or replace function public.ensure_my_profile(p_full_name text default null, p_phone text default null)
returns public.app_role language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_email text := auth.jwt() ->> 'email'; v_role public.app_role;
begin
  if v_uid is null then raise exception 'You must be signed in to do that.'; end if;
  insert into public.profiles(id, full_name, email, phone)
  values (v_uid, coalesce(nullif(trim(p_full_name), ''), split_part(v_email, '@', 1)), v_email, nullif(trim(p_phone), ''))
  on conflict (id) do nothing;
  if not exists (select 1 from public.user_roles where user_id = v_uid) then
    insert into public.user_roles(user_id, role) values (v_uid, 'STUDENT');
    perform public.notify(v_uid, 'SUCCESS', 'Welcome to FoodPulse', 'Your account is ready. Pick a plan to start managing your meals.', '/student/plans');
  end if;
  select role into v_role from public.user_roles where user_id = v_uid
   order by case role when 'ADMIN' then 1 when 'MESS_MANAGER' then 2 else 3 end limit 1;
  return v_role;
end $$;

create or replace function public.update_my_profile(p_full_name text, p_phone text) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public.assert_active_user();
  if char_length(trim(coalesce(p_full_name, ''))) < 2 then raise exception 'Please enter your full name.'; end if;
  if p_phone is not null and trim(p_phone) <> '' and trim(p_phone) !~ '^[0-9+\s-]{10,15}$' then raise exception 'Enter a valid contact number.'; end if;
  update public.profiles set full_name = trim(p_full_name), phone = nullif(trim(p_phone), '') where id = auth.uid();
end $$;

create or replace function public.subscribe_to_plan(p_plan_id uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_plan public.plans; v_mess uuid; v_sub uuid; v_start date := public.today_ist();
begin
  perform public.assert_active_user();
  if not public.has_role(v_uid, 'STUDENT') then raise exception 'Only students can subscribe to plans.'; end if;
  select * into v_plan from public.plans where id = p_plan_id;
  if not found then raise exception 'The selected plan was not found.'; end if;
  if v_plan.status <> 'ACTIVE' then raise exception 'This plan is no longer available.'; end if;
  perform public.refresh_subscriptions();
  if exists (select 1 from public.subscriptions where student_id = v_uid and status = 'ACTIVE') then
    raise exception 'You already have an active subscription. Cancel or wait for it to end before subscribing again.';
  end if;
  select mess_id into v_mess from public.subscriptions where student_id = v_uid order by created_at desc limit 1;
  if v_mess is null then select id into v_mess from public.messes where status = 'ACTIVE' order by created_at, name limit 1; end if;
  insert into public.subscriptions(student_id, plan_id, mess_id, plan_name, price, breakfast_included, lunch_included, dinner_included,
                                   start_date, end_date, total_meals, status)
  values (v_uid, v_plan.id, v_mess, v_plan.name, v_plan.price, v_plan.breakfast_included, v_plan.lunch_included, v_plan.dinner_included,
          v_start, v_start + v_plan.duration_days - 1, v_plan.included_meals, 'ACTIVE')
  returning id into v_sub;
  insert into public.payments(student_id, subscription_id, mess_id, base_amount, amount, status)
  values (v_uid, v_sub, v_mess, v_plan.price, v_plan.price, 'UNPAID');
  perform public.notify(v_uid, 'SUCCESS', 'Subscription created',
    format('Your %s subscription is active until %s. A bill of ₹%s has been generated.', v_plan.name, to_char(v_start + v_plan.duration_days - 1, 'DD Mon YYYY'), v_plan.price), '/student/subscription');
  perform public.log_audit('Subscription created', 'Subscriptions', 'subscription', v_sub::text, format('Subscribed to %s', v_plan.name), null,
    jsonb_build_object('plan', v_plan.name, 'price', v_plan.price));
  return v_sub;
end $$;

create or replace function public.renew_subscription() returns uuid
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_sub public.subscriptions; v_plan public.plans; v_last public.subscriptions;
begin
  perform public.assert_active_user();
  perform public.refresh_subscriptions();
  select * into v_sub from public.subscriptions where student_id = v_uid and status = 'ACTIVE';
  if found then
    select * into v_plan from public.plans where id = v_sub.plan_id;
    if v_plan.status <> 'ACTIVE' then raise exception 'This plan is no longer available for renewal.'; end if;
    update public.subscriptions set end_date = end_date + v_plan.duration_days, total_meals = total_meals + v_plan.included_meals
     where id = v_sub.id;
    insert into public.payments(student_id, subscription_id, mess_id, base_amount, amount, status)
    values (v_uid, v_sub.id, v_sub.mess_id, v_plan.price, v_plan.price, 'UNPAID');
    perform public.notify(v_uid, 'SUCCESS', 'Subscription renewed', format('%s extended by %s days.', v_plan.name, v_plan.duration_days), '/student/subscription');
    perform public.log_audit('Subscription renewed', 'Subscriptions', 'subscription', v_sub.id::text, format('Renewed %s', v_plan.name), null, null);
    return v_sub.id;
  end if;
  select * into v_last from public.subscriptions where student_id = v_uid order by created_at desc limit 1;
  if not found then raise exception 'No previous subscription to renew. Choose a plan instead.'; end if;
  return public.subscribe_to_plan(v_last.plan_id);
end $$;

create or replace function public.request_subscription_change(p_kind text) returns void
language plpgsql security definer set search_path = public as $$
declare v_sub public.subscriptions; r record;
begin
  perform public.assert_active_user();
  select * into v_sub from public.subscriptions where student_id = auth.uid() and status = 'ACTIVE';
  if not found then raise exception 'You have no active subscription.'; end if;
  if p_kind = 'cancel' then update public.subscriptions set cancellation_requested = true where id = v_sub.id;
  elsif p_kind = 'pause' then update public.subscriptions set pause_requested = true where id = v_sub.id;
  else raise exception 'Invalid request type.'; end if;
  for r in select user_id from public.mess_managers where mess_id = v_sub.mess_id and status = 'ACTIVE' loop
    perform public.notify(r.user_id, 'WARNING', case when p_kind = 'cancel' then 'Cancellation request' else 'Pause request' end,
      format('%s requested to %s subscription %s.', (select full_name from public.profiles where id = auth.uid()), p_kind, v_sub.code), '/manager/subscribers');
  end loop;
  perform public.notify(auth.uid(), 'INFO', 'Request submitted', format('Your %s request has been sent to the mess manager.', p_kind), '/student/subscription');
  perform public.log_audit(initcap(p_kind) || ' requested', 'Subscriptions', 'subscription', v_sub.id::text, format('Student requested to %s %s', p_kind, v_sub.code), null, null);
end $$;

create or replace function public.manage_subscription(p_id uuid, p_status public.subscription_status, p_clear_requests boolean default true) returns void
language plpgsql security definer set search_path = public as $$
declare v_sub public.subscriptions;
begin
  perform public.assert_active_user();
  select * into v_sub from public.subscriptions where id = p_id;
  if not found then raise exception 'Subscription not found.'; end if;
  if not (public.is_admin() or public.is_manager_of(v_sub.mess_id)) then raise exception 'You are not allowed to manage this subscription.'; end if;
  if p_status = 'ACTIVE' and v_sub.status <> 'ACTIVE' and exists (select 1 from public.subscriptions where student_id = v_sub.student_id and status = 'ACTIVE' and id <> p_id) then
    raise exception 'This student already has another active subscription.';
  end if;
  update public.subscriptions set status = coalesce(p_status, status),
    cancellation_requested = case when p_clear_requests then false else cancellation_requested end,
    pause_requested = case when p_clear_requests then false else pause_requested end
   where id = p_id;
  perform public.notify(v_sub.student_id, 'INFO', 'Subscription updated', format('Your subscription %s is now %s.', v_sub.code, initcap(coalesce(p_status, v_sub.status)::text)), '/student/subscription');
  perform public.log_audit('Subscription updated', 'Subscriptions', 'subscription', p_id::text, format('%s: %s → %s', v_sub.code, v_sub.status, coalesce(p_status, v_sub.status)),
    jsonb_build_object('status', v_sub.status), jsonb_build_object('status', coalesce(p_status, v_sub.status)));
end $$;

create or replace function public.set_meal_selection(p_meal_date date, p_meal_type public.meal_type, p_status public.selection_status) returns void
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_sub public.subscriptions; v_meal uuid;
begin
  perform public.assert_active_user();
  if p_status not in ('SELECTED','SKIPPED') then raise exception 'Invalid meal selection.'; end if;
  perform public.refresh_subscriptions();
  select * into v_sub from public.subscriptions where student_id = v_uid and status = 'ACTIVE';
  if not found then raise exception 'You need an active subscription to select or skip meals.'; end if;
  if p_meal_date < v_sub.start_date or p_meal_date > v_sub.end_date then raise exception 'This meal is outside your subscription period.'; end if;
  if not public.meal_included(v_sub, p_meal_type) then raise exception 'This meal type is not included in your plan.'; end if;
  if now() >= public.cutoff_at(v_sub.mess_id, p_meal_date) then
    raise exception 'Meal selection deadline has passed. This meal can no longer be changed.';
  end if;
  v_meal := public.ensure_meal(v_sub.mess_id, p_meal_date, p_meal_type);
  if exists (select 1 from public.meal_consumption where meal_id = v_meal) then raise exception 'This meal has already been served and is closed.'; end if;
  insert into public.meal_selections(student_id, meal_id, status, selected_at) values (v_uid, v_meal, p_status, now())
  on conflict (student_id, meal_id) do update set status = excluded.status, selected_at = now();
end $$;

create or replace function public.submit_feedback(p_meal_date date, p_meal_type public.meal_type, p_rating int, p_comment text default null) returns void
language plpgsql security definer set search_path = public as $$
declare v_sub public.subscriptions; v_meal uuid;
begin
  perform public.assert_active_user();
  if p_rating is null or p_rating < 1 or p_rating > 5 then raise exception 'Rating must be between 1 and 5.'; end if;
  if p_meal_date > public.today_ist() then raise exception 'You can only rate meals that have been served.'; end if;
  select * into v_sub from public.subscriptions where student_id = auth.uid() and p_meal_date between start_date and end_date
    and status not in ('PENDING','CANCELLED') order by created_at desc limit 1;
  if not found then raise exception 'You did not have a subscription covering this meal.'; end if;
  v_meal := public.ensure_meal(v_sub.mess_id, p_meal_date, p_meal_type);
  insert into public.feedback(student_id, meal_id, rating, description) values (auth.uid(), v_meal, p_rating, nullif(trim(p_comment), ''))
  on conflict (student_id, meal_id) do update set rating = excluded.rating, description = coalesce(excluded.description, public.feedback.description);
end $$;

create or replace function public.submit_complaint(p_date date, p_meal_type public.meal_type, p_category text, p_description text) returns text
language plpgsql security definer set search_path = public as $$
declare v_mess uuid; v_id uuid; v_code text; r record;
begin
  perform public.assert_active_user();
  if not public.has_role(auth.uid(), 'STUDENT') then raise exception 'Only students can raise complaints.'; end if;
  if char_length(trim(coalesce(p_description, ''))) < 5 then raise exception 'Please describe the issue (at least 5 characters).'; end if;
  select mess_id into v_mess from public.subscriptions where student_id = auth.uid() order by (status = 'ACTIVE') desc, created_at desc limit 1;
  if v_mess is null then raise exception 'You need a subscription to raise a complaint.'; end if;
  insert into public.complaints(student_id, mess_id, meal_id, meal_type, complaint_date, category, description)
  values (auth.uid(), v_mess, (select id from public.meals where mess_id = v_mess and meal_date = p_date and meal_type = p_meal_type), p_meal_type, p_date, p_category, trim(p_description))
  returning id, code into v_id, v_code;
  for r in select user_id from public.mess_managers where mess_id = v_mess and status = 'ACTIVE' loop
    perform public.notify(r.user_id, 'WARNING', 'New complaint', format('%s (%s) raised by %s.', v_code, p_category, (select full_name from public.profiles where id = auth.uid())), '/manager/feedback');
  end loop;
  return v_code;
end $$;

create or replace function public.update_complaint(p_id uuid, p_status public.complaint_status, p_response text default null) returns void
language plpgsql security definer set search_path = public as $$
declare v_c public.complaints;
begin
  perform public.assert_active_user();
  select * into v_c from public.complaints where id = p_id;
  if not found then raise exception 'Complaint not found.'; end if;
  if not (public.is_admin() or public.is_manager_of(v_c.mess_id)) then raise exception 'You are not allowed to update this complaint.'; end if;
  update public.complaints set status = coalesce(p_status, status),
    manager_response = coalesce(nullif(trim(p_response), ''), manager_response),
    responded_by = auth.uid(), responded_at = now()
   where id = p_id;
  if p_status is distinct from v_c.status then
    perform public.notify(v_c.student_id, case when p_status = 'RESOLVED' then 'SUCCESS' else 'INFO' end::public.notification_type,
      'Complaint ' || case p_status when 'RESOLVED' then 'resolved' when 'IN_PROGRESS' then 'in progress' else 'reopened' end,
      format('Your complaint #%s has been marked as %s.', v_c.code, initcap(replace(p_status::text, '_', ' '))), '/student/complaints');
  elsif nullif(trim(p_response), '') is not null then
    perform public.notify(v_c.student_id, 'INFO', 'Complaint response', format('The mess team responded to complaint #%s.', v_c.code), '/student/complaints');
  end if;
  perform public.log_audit('Complaint updated', 'Complaints', 'complaint', v_c.code, format('%s: %s → %s', v_c.code, v_c.status, coalesce(p_status, v_c.status)),
    jsonb_build_object('status', v_c.status), jsonb_build_object('status', coalesce(p_status, v_c.status), 'response', p_response));
end $$;

create or replace function public.update_payment_status(p_id uuid, p_status public.payment_status) returns void
language plpgsql security definer set search_path = public as $$
declare v_p public.payments;
begin
  perform public.assert_active_user();
  if p_status is null then raise exception 'Invalid payment status.'; end if;
  select * into v_p from public.payments where id = p_id;
  if not found then raise exception 'Payment not found.'; end if;
  if not (public.is_admin() or public.is_manager_of(v_p.mess_id)) then raise exception 'You are not allowed to update this payment.'; end if;
  if v_p.status = p_status then return; end if;
  update public.payments set status = p_status,
    paid_at = case when p_status = 'PAID' then now() else null end,
    payment_method = case when p_status = 'PAID' and payment_method = 'DEMO' then 'CASH' else payment_method end,
    transaction_reference = case when p_status = 'PAID' then coalesce(transaction_reference, 'TXN-' || upper(substr(md5(random()::text), 1, 10))) else transaction_reference end
   where id = p_id;
  perform public.notify(v_p.student_id, case when p_status = 'PAID' then 'SUCCESS' else 'WARNING' end::public.notification_type,
    case when p_status = 'PAID' then 'Payment received' else 'Payment status updated' end,
    format('Invoice %s (₹%s) is now marked %s.', v_p.invoice_number, v_p.amount, initcap(p_status::text)), '/student/payments');
  perform public.log_audit('Payment status changed', 'Payments', 'payment', v_p.invoice_number,
    format('%s: %s → %s', v_p.invoice_number, initcap(v_p.status::text), initcap(p_status::text)),
    jsonb_build_object('status', v_p.status), jsonb_build_object('status', p_status));
end $$;

create or replace function public.save_consumption(p_date date, p_meal_type public.meal_type, p_prepared int, p_consumed int, p_mess uuid default null) returns void
language plpgsql security definer set search_path = public as $$
declare v_mess uuid := p_mess; v_meal uuid; v_old public.meal_consumption;
begin
  perform public.assert_active_user();
  if v_mess is null then select mess_id into v_mess from public.mess_managers where user_id = auth.uid() and status = 'ACTIVE' order by assigned_at limit 1; end if;
  if v_mess is null or not (public.is_admin() or public.is_manager_of(v_mess)) then raise exception 'Only the mess manager can record consumption.'; end if;
  if p_prepared is null or p_prepared < 0 or p_consumed is null or p_consumed < 0 then raise exception 'Quantities cannot be negative.'; end if;
  if p_consumed > p_prepared then raise exception 'Consumed quantity cannot be greater than prepared quantity.'; end if;
  if p_date > public.today_ist() then raise exception 'Consumption can only be recorded for today or past meals.'; end if;
  v_meal := public.ensure_meal(v_mess, p_date, p_meal_type);
  select * into v_old from public.meal_consumption where meal_id = v_meal;
  insert into public.meal_consumption(mess_id, meal_id, expected_quantity, prepared_quantity, consumed_quantity, recorded_by, recorded_at)
  values (v_mess, v_meal, public.expected_demand(v_mess, p_date, p_meal_type), p_prepared, p_consumed, auth.uid(), now())
  on conflict (meal_id) do update set prepared_quantity = excluded.prepared_quantity, consumed_quantity = excluded.consumed_quantity,
    expected_quantity = excluded.expected_quantity, recorded_by = excluded.recorded_by, recorded_at = now();
  perform public.log_audit('Consumption recorded', 'Consumption', 'meal', v_meal::text,
    format('%s %s: prepared %s, consumed %s', to_char(p_date, 'DD Mon'), initcap(p_meal_type::text), p_prepared, p_consumed),
    case when v_old.id is null then null else jsonb_build_object('prepared', v_old.prepared_quantity, 'consumed', v_old.consumed_quantity) end,
    jsonb_build_object('prepared', p_prepared, 'consumed', p_consumed));
end $$;

create or replace function public.upsert_menu(p_id uuid, p_date date, p_meal_type public.meal_type, p_items text, p_special boolean, p_festival boolean, p_active boolean) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_mess uuid; v_id uuid := p_id; v_old public.menus; r record;
begin
  perform public.assert_active_user();
  if char_length(trim(coalesce(p_items, ''))) < 2 then raise exception 'Menu items are required.'; end if;
  if v_id is not null then
    select * into v_old from public.menus where id = v_id;
    if not found then raise exception 'Menu not found.'; end if;
    v_mess := v_old.mess_id;
  else
    select mess_id into v_mess from public.mess_managers where user_id = auth.uid() and status = 'ACTIVE' order by assigned_at limit 1;
  end if;
  if v_mess is null or not (public.is_admin() or public.is_manager_of(v_mess)) then raise exception 'You are not allowed to manage menus for this mess.'; end if;
  if v_id is null then
    insert into public.menus(mess_id, meal_date, meal_type, menu_items, is_special, is_festival, status, created_by)
    values (v_mess, p_date, p_meal_type, trim(p_items), p_special, p_festival, case when p_active then 'ACTIVE' else 'INACTIVE' end::public.record_status, auth.uid())
    returning id into v_id;
  else
    update public.menus set meal_date = p_date, meal_type = p_meal_type, menu_items = trim(p_items), is_special = p_special, is_festival = p_festival,
      status = case when p_active then 'ACTIVE' else 'INACTIVE' end::public.record_status where id = v_id;
  end if;
  if p_active then
    perform public.ensure_meal(v_mess, p_date, p_meal_type);
    update public.meals set menu_id = v_id where mess_id = v_mess and meal_date = p_date and meal_type = p_meal_type;
    if p_date >= public.today_ist() then
      for r in select distinct student_id from public.subscriptions where mess_id = v_mess and status = 'ACTIVE' and p_date between start_date and end_date loop
        perform public.notify(r.student_id, 'INFO', 'Menu updated', format('%s on %s: %s', initcap(p_meal_type::text), to_char(p_date, 'DD Mon'), left(trim(p_items), 80)), '/student/meal-calendar');
      end loop;
    end if;
  else
    update public.meals set menu_id = null where menu_id = v_id;
  end if;
  perform public.log_audit(case when p_id is null then 'Menu added' when not p_active then 'Menu deactivated' else 'Menu updated' end, 'Menu', 'menu', v_id::text,
    format('%s %s: %s', to_char(p_date, 'DD Mon'), initcap(p_meal_type::text), left(trim(p_items), 80)),
    case when v_old.id is null then null else jsonb_build_object('items', v_old.menu_items, 'status', v_old.status) end,
    jsonb_build_object('items', p_items, 'active', p_active));
  return v_id;
end $$;

create or replace function public.upsert_plan(p_id uuid, p_name text, p_type public.plan_type, p_price numeric, p_duration int, p_meals int,
  p_breakfast boolean, p_lunch boolean, p_dinner boolean, p_description text, p_status public.record_status) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_old public.plans; v_id uuid := p_id;
begin
  perform public.assert_active_user();
  if not public.is_admin() then raise exception 'Only administrators can manage plans.'; end if;
  if char_length(trim(coalesce(p_name, ''))) < 2 then raise exception 'Plan name is required.'; end if;
  if p_price is null or p_price < 0 then raise exception 'Price cannot be negative.'; end if;
  if p_duration is null or p_duration <= 0 then raise exception 'Duration must be greater than zero.'; end if;
  if p_meals is null or p_meals < 0 then raise exception 'Included meals cannot be negative.'; end if;
  if not (p_breakfast or p_lunch or p_dinner) then raise exception 'Select at least one meal type.'; end if;
  if v_id is not null then select * into v_old from public.plans where id = v_id; end if;
  if v_old.id is null then
    insert into public.plans(name, type, price, duration_days, included_meals, breakfast_included, lunch_included, dinner_included, description, status)
    values (trim(p_name), p_type, p_price, p_duration, p_meals, p_breakfast, p_lunch, p_dinner, coalesce(p_description, ''), p_status) returning id into v_id;
    perform public.log_audit('Plan created', 'Plans', 'plan', v_id::text, format('Created %s at ₹%s', p_name, p_price), null, jsonb_build_object('price', p_price));
  else
    update public.plans set name = trim(p_name), type = p_type, price = p_price, duration_days = p_duration, included_meals = p_meals,
      breakfast_included = p_breakfast, lunch_included = p_lunch, dinner_included = p_dinner, description = coalesce(p_description, ''), status = p_status
     where id = v_id;
    perform public.log_audit(case when v_old.status <> p_status then case when p_status = 'ACTIVE' then 'Plan reactivated' else 'Plan deactivated' end else 'Plan edited' end,
      'Plans', 'plan', v_id::text,
      case when v_old.price <> p_price then format('%s price ₹%s → ₹%s', p_name, v_old.price, p_price) else format('Updated %s', p_name) end,
      jsonb_build_object('price', v_old.price, 'status', v_old.status), jsonb_build_object('price', p_price, 'status', p_status));
  end if;
  return v_id;
end $$;

create or replace function public.admin_update_user(p_id uuid, p_full_name text, p_phone text, p_status public.account_status, p_mess uuid default null) returns void
language plpgsql security definer set search_path = public as $$
declare v_old public.profiles;
begin
  perform public.assert_active_user();
  if not public.is_admin() then raise exception 'Only administrators can manage users.'; end if;
  select * into v_old from public.profiles where id = p_id;
  if not found then raise exception 'User not found.'; end if;
  if p_id = auth.uid() and p_status <> 'ACTIVE' then raise exception 'You cannot deactivate your own account.'; end if;
  if char_length(trim(coalesce(p_full_name, ''))) < 2 then raise exception 'Full name is required.'; end if;
  update public.profiles set full_name = trim(p_full_name), phone = nullif(trim(p_phone), ''), status = p_status where id = p_id;
  if p_mess is not null and public.has_role(p_id, 'MESS_MANAGER') then
    update public.mess_managers set status = 'INACTIVE' where user_id = p_id and mess_id <> p_mess;
    insert into public.mess_managers(user_id, mess_id, status) values (p_id, p_mess, 'ACTIVE')
    on conflict (user_id, mess_id) do update set status = 'ACTIVE', assigned_at = now();
  end if;
  if public.has_role(p_id, 'MESS_MANAGER') then
    update public.mess_managers set status = case when p_status = 'ACTIVE' then status else 'INACTIVE' end where user_id = p_id;
  end if;
  perform public.log_audit(case when v_old.status <> p_status then case when p_status = 'ACTIVE' then 'User activated' else 'User deactivated' end else 'User edited' end,
    'Users', 'profile', p_id::text, format('%s (%s)', p_full_name, v_old.email),
    jsonb_build_object('status', v_old.status, 'name', v_old.full_name), jsonb_build_object('status', p_status, 'name', p_full_name));
end $$;

create or replace function public.update_settings(p jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare v_old public.system_settings;
begin
  perform public.assert_active_user();
  if not public.is_admin() then raise exception 'Only administrators can change system settings.'; end if;
  select * into v_old from public.system_settings where mess_id is null;
  update public.system_settings set
    mess_name = coalesce(p->>'messName', mess_name), contact = coalesce(p->>'contact', contact), address = coalesce(p->>'address', address),
    operating_hours = coalesce(p->>'operatingHours', operating_hours), breakfast_time = coalesce(p->>'breakfastTime', breakfast_time),
    lunch_time = coalesce(p->>'lunchTime', lunch_time), dinner_time = coalesce(p->>'dinnerTime', dinner_time),
    cutoff_time = coalesce((p->>'cutoffTime')::time, cutoff_time),
    notify_subscription_expiry = coalesce((p->>'notifySubscriptionExpiry')::boolean, notify_subscription_expiry),
    notify_payment_reminder = coalesce((p->>'notifyPaymentReminder')::boolean, notify_payment_reminder),
    notify_meal_deadline = coalesce((p->>'notifyMealDeadline')::boolean, notify_meal_deadline),
    notify_complaint_update = coalesce((p->>'notifyComplaintUpdate')::boolean, notify_complaint_update)
  where mess_id is null;
  perform public.log_audit('Settings changed', 'Settings', 'system_settings', v_old.id::text, 'Updated system settings', to_jsonb(v_old) - 'id', p);
end $$;

-- Student's meal plan view: every included meal in their subscription periods joined with menu, selection and rating.
create or replace function public.my_meals(p_from date default null, p_to date default null)
returns table(meal_id uuid, meal_date date, meal_type public.meal_type, menu text, status public.selection_status, locked boolean, served boolean, rating smallint, comment text)
language sql stable security definer set search_path = public as $$
  with subs as (
    select * from public.subscriptions where student_id = auth.uid() and status not in ('PENDING','CANCELLED')
  ), slots as (
    select distinct s.mess_id, g.d::date as d, t.mt, s.student_id
    from subs s
    cross join lateral generate_series(greatest(s.start_date, coalesce(p_from, public.today_ist() - 60)), least(s.end_date, coalesce(p_to, public.today_ist() + 14)), interval '1 day') g(d)
    cross join unnest(enum_range(null::public.meal_type)) t(mt)
    where public.meal_included(s, t.mt)
  )
  select m.id, sl.d, sl.mt,
    coalesce(mn.menu_items, (select menu_items from public.menus x where x.mess_id = sl.mess_id and x.meal_date = sl.d and x.meal_type = sl.mt and x.status = 'ACTIVE' order by updated_at desc limit 1), 'Menu to be announced'),
    coalesce(ms.status, 'SELECTED'),
    now() >= public.cutoff_at(sl.mess_id, sl.d),
    sl.d < public.today_ist() or exists (select 1 from public.meal_consumption c where c.meal_id = m.id),
    f.rating, f.description
  from slots sl
  left join public.meals m on m.mess_id = sl.mess_id and m.meal_date = sl.d and m.meal_type = sl.mt
  left join public.menus mn on mn.id = m.menu_id and mn.status = 'ACTIVE'
  left join public.meal_selections ms on ms.meal_id = m.id and ms.student_id = sl.student_id
  left join public.feedback f on f.meal_id = m.id and f.student_id = sl.student_id
  order by sl.d, sl.mt
$$;

-- Aggregated demand and consumption for the caller's mess (manager) or all/selected mess (admin).
create or replace function public.mess_demand(p_from date, p_to date, p_mess uuid default null)
returns table(meal_date date, meal_type public.meal_type, expected int, prepared int, consumed int, has_record boolean)
language sql stable security definer set search_path = public as $$
  with scope as (
    select id from public.messes
    where (public.is_admin() and (p_mess is null or id = p_mess)) or id in (select public.managed_mess_ids())
  )
  select g.d::date, t.mt,
    (select coalesce(sum(public.expected_demand(sc.id, g.d::date, t.mt)), 0) from scope sc)::int,
    coalesce(sum(c.prepared_quantity), 0)::int, coalesce(sum(c.consumed_quantity), 0)::int, count(c.id) > 0
  from generate_series(p_from, p_to, interval '1 day') g(d)
  cross join unnest(enum_range(null::public.meal_type)) t(mt)
  left join public.meals m on m.meal_date = g.d::date and m.meal_type = t.mt and m.mess_id in (select id from scope)
  left join public.meal_consumption c on c.meal_id = m.id
  where (p_to - p_from) <= 400
  group by g.d, t.mt
  order by g.d, t.mt
$$;

-- 7-day rolling average forecast for tomorrow (rule-based, not machine learning).
create or replace function public.demand_forecast(p_mess uuid default null)
returns table(meal_type public.meal_type, predicted_quantity int, prediction_method text, period_from date, period_to date, std_deviation numeric)
language sql stable security definer set search_path = public as $$
  select d.meal_type, round(avg(d.expected))::int, '7-day rolling average', public.today_ist() - 7, public.today_ist() - 1, round(coalesce(stddev_pop(d.expected), 0), 2)
  from public.mess_demand(public.today_ist() - 7, public.today_ist() - 1, p_mess) d
  group by d.meal_type order by d.meal_type
$$;

-- ============ GRANTS & RLS ============
grant usage on schema public to anon, authenticated;
grant select on public.profiles, public.user_roles, public.messes, public.mess_managers, public.plans, public.subscriptions, public.menus,
  public.meals, public.meal_selections, public.meal_consumption, public.payments, public.feedback, public.complaints, public.notifications,
  public.audit_logs, public.system_settings to authenticated;
grant update (is_read) on public.notifications to authenticated;
grant select on public.plans to anon;
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.messes enable row level security;
alter table public.mess_managers enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.menus enable row level security;
alter table public.meals enable row level security;
alter table public.meal_selections enable row level security;
alter table public.meal_consumption enable row level security;
alter table public.payments enable row level security;
alter table public.feedback enable row level security;
alter table public.complaints enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.system_settings enable row level security;

create policy "profiles_read" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin() or public.manager_sees_student(id));
create policy "roles_read" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "messes_read" on public.messes for select to authenticated
  using (public.is_admin() or id in (select public.managed_mess_ids()) or id in (select public.student_mess_ids()));
create policy "mess_managers_read" on public.mess_managers for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "plans_read_active" on public.plans for select to anon, authenticated using (status = 'ACTIVE' or public.is_admin());
create policy "subscriptions_read" on public.subscriptions for select to authenticated
  using (student_id = auth.uid() or public.is_admin() or public.is_manager_of(mess_id));
create policy "menus_read" on public.menus for select to authenticated
  using (public.is_admin() or public.is_manager_of(mess_id) or (status = 'ACTIVE' and mess_id in (select public.student_mess_ids())));
create policy "meals_read" on public.meals for select to authenticated
  using (public.is_admin() or public.is_manager_of(mess_id) or mess_id in (select public.student_mess_ids()));
create policy "selections_read" on public.meal_selections for select to authenticated
  using (student_id = auth.uid() or public.is_admin() or exists (select 1 from public.meals m where m.id = meal_id and public.is_manager_of(m.mess_id)));
create policy "consumption_read" on public.meal_consumption for select to authenticated using (public.is_admin() or public.is_manager_of(mess_id));
create policy "payments_read" on public.payments for select to authenticated
  using (student_id = auth.uid() or public.is_admin() or public.is_manager_of(mess_id));
create policy "feedback_read" on public.feedback for select to authenticated
  using (student_id = auth.uid() or public.is_admin() or exists (select 1 from public.meals m where m.id = meal_id and public.is_manager_of(m.mess_id)));
create policy "complaints_read" on public.complaints for select to authenticated
  using (student_id = auth.uid() or public.is_admin() or public.is_manager_of(mess_id));
create policy "notifications_read_own" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "notifications_mark_read_own" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "audit_admin_read" on public.audit_logs for select to authenticated using (public.is_admin());
create policy "settings_read" on public.system_settings for select to authenticated using (true);

revoke execute on all functions in schema public from public, anon;
grant execute on all functions in schema public to authenticated, service_role;

alter publication supabase_realtime add table public.notifications, public.complaints, public.payments, public.menus;

-- ============ SEED DATA ============
do $seed$
declare
  m1 uuid := md5('fp-mess-1')::uuid; m2 uuid := md5('fp-mess-2')::uuid; m3 uuid := md5('fp-mess-3')::uuid;
  u_student uuid := '00000000-0000-4000-8000-000000000001';
  u_manager uuid := '00000000-0000-4000-8000-000000000002';
  u_admin uuid := '00000000-0000-4000-8000-000000000003';
  p1 uuid := md5('fp-plan-1')::uuid; p2 uuid := md5('fp-plan-2')::uuid; p3 uuid := md5('fp-plan-3')::uuid; p4 uuid := md5('fp-plan-4')::uuid; p5 uuid := md5('fp-plan-5')::uuid;
  names text[] := array['Aarav Sharma','Priya Nair','Rahul Verma','Ananya Iyer','Vikram Singh','Sneha Patel','Arjun Reddy','Kavya Menon','Rohit Gupta','Isha Kulkarni',
    'Aditya Joshi','Meera Pillai','Karan Malhotra','Divya Rao','Siddharth Das','Pooja Hegde','Nikhil Jain','Riya Chatterjee','Harsh Agarwal','Tanvi Desai',
    'Manish Yadav','Shreya Bose','Varun Kapoor','Neha Mishra'];
  bf text[] := array['Poha, Boiled Eggs, Masala Chai','Idli, Sambar, Coconut Chutney','Aloo Paratha, Curd, Pickle','Upma, Banana, Filter Coffee','Masala Dosa, Chutney','Bread Omelette, Tea','Chole Bhature, Lassi'];
  ln text[] := array['Rajma Chawal, Salad, Roti','Veg Pulao, Raita, Papad','Dal Tadka, Jeera Rice, Aloo Gobi','Sambar Rice, Rasam, Poriyal','Chole, Rice, Roti, Salad','Kadhi Pakora, Rice, Roti','Veg Biryani, Mirchi Salan, Raita'];
  dn text[] := array['Paneer Butter Masala, Naan, Dal','Mixed Veg, Roti, Dal Fry, Rice','Egg Curry, Rice, Roti','Palak Paneer, Roti, Jeera Rice','Dal Makhani, Naan, Salad','Chicken Curry / Paneer Tikka, Rice','Veg Kofta, Pulao, Gulab Jamun'];
  today date := (now() at time zone 'Asia/Kolkata')::date;
  i int; d int; sid uuid; mess uuid; plan uuid; st public.subscription_status; sd date; ed date; sub uuid; pl public.plans; mt public.meal_type;
  menu_id uuid; meal_id uuid; exp int; prep int; cons int; email text; pay_status public.payment_status; r record; mx uuid;
begin
  insert into public.messes(id, name, contact, address, operating_hours) values
    (m1, 'FoodPulse Central Mess', '+91 80 4123 5566', 'Block A, University Campus, Bengaluru', '07:00 - 22:00'),
    (m2, 'North Block Mess', '+91 80 4123 7788', 'North Hostel, University Campus, Bengaluru', '07:00 - 21:30'),
    (m3, 'Lakeside Hostel Mess', '+91 80 4123 9900', 'Lakeside Hostel, University Campus, Bengaluru', '07:00 - 21:30');

  insert into public.system_settings(mess_id, mess_name, contact, address, operating_hours)
  values (null, 'FoodPulse Central Mess', '+91 80 4123 5566', 'Block A, University Campus, Bengaluru', 'Mon–Sun, 07:00 – 22:00');

  insert into public.plans(id, name, type, price, duration_days, included_meals, breakfast_included, lunch_included, dinner_included, description, status) values
    (p1, 'Weekly Full Board', 'WEEKLY', 1200, 7, 21, true, true, true, 'Breakfast, lunch and dinner for 7 days. Ideal for short stays.', 'ACTIVE'),
    (p2, 'Monthly Full Board', 'MONTHLY', 4200, 30, 90, true, true, true, 'All three meals every day for 30 days. Best value.', 'ACTIVE'),
    (p3, 'Monthly Lunch & Dinner', 'MONTHLY', 3000, 30, 60, false, true, true, 'Lunch and dinner for 30 days.', 'ACTIVE'),
    (p4, 'Monthly Lunch Only', 'MONTHLY', 1650, 30, 30, false, true, false, 'Weekday-friendly lunch plan for 30 days.', 'ACTIVE'),
    (p5, 'Weekend Special', 'WEEKLY', 700, 7, 14, false, true, true, 'Retired weekend plan kept for history.', 'INACTIVE');

  -- staff
  insert into public.profiles(id, full_name, email, phone, created_at) values
    (u_admin, 'Admin Demo', 'admin.demo@foodpulse.demo', '+91 98450 10001', now() - interval '120 days'),
    (u_manager, 'Rohan Mehta', 'manager.demo@foodpulse.demo', '+91 98450 10002', now() - interval '110 days'),
    (md5('fp-mgr-2')::uuid, 'Kavita Rao', 'kavita.rao@foodpulse.demo', '+91 98450 10003', now() - interval '100 days'),
    (md5('fp-mgr-3')::uuid, 'Suresh Iyer', 'suresh.iyer@foodpulse.demo', '+91 98450 10004', now() - interval '90 days');
  insert into public.user_roles(user_id, role) values (u_admin, 'ADMIN'), (u_manager, 'MESS_MANAGER'), (md5('fp-mgr-2')::uuid, 'MESS_MANAGER'), (md5('fp-mgr-3')::uuid, 'MESS_MANAGER');
  insert into public.mess_managers(user_id, mess_id, assigned_at) values (u_manager, m1, now() - interval '110 days'), (md5('fp-mgr-2')::uuid, m2, now() - interval '100 days'), (md5('fp-mgr-3')::uuid, m3, now() - interval '90 days');

  -- menus + meals for every mess
  foreach mx in array array[m1, m2, m3] loop
    for d in -40..10 loop
      foreach mt in array enum_range(null::public.meal_type) loop
        insert into public.menus(mess_id, meal_date, meal_type, menu_items, is_special, is_festival, created_by)
        values (mx, today + d, mt,
          case mt when 'BREAKFAST' then bf[1 + ((d + 40) % 7)] when 'LUNCH' then ln[1 + ((d + 40) % 7)] else dn[1 + ((d + 40) % 7)] end,
          mt = 'DINNER' and (d + 40) % 7 = 5, mt = 'LUNCH' and d = 4, u_manager)
        returning id into menu_id;
        insert into public.meals(mess_id, meal_date, meal_type, menu_id) values (mx, today + d, mt, menu_id);
      end loop;
    end loop;
  end loop;

  -- students
  for i in 1..24 loop
    sid := case when i = 1 then u_student else md5('fp-student-' || i)::uuid end;
    email := case when i = 1 then 'student.demo@foodpulse.demo' else lower(replace(names[i], ' ', '.')) || '@campus.edu.in' end;
    insert into public.profiles(id, full_name, email, phone, status, created_at)
    values (sid, names[i], email, '+91 9' || lpad((845012200 + i * 37)::text, 9, '0'), case when i = 23 then 'INACTIVE' else 'ACTIVE' end::public.account_status,
            now() - make_interval(days => 100 - i * 3));
    insert into public.user_roles(user_id, role) values (sid, 'STUDENT');
    mess := case when i <= 16 then m1 when i <= 20 then m2 else m3 end;

    if i = 1 then
      -- previous expired cycle
      select * into pl from public.plans where id = p2;
      insert into public.subscriptions(student_id, plan_id, mess_id, plan_name, price, breakfast_included, lunch_included, dinner_included, start_date, end_date, total_meals, meals_used, status, created_at)
      values (sid, p2, mess, pl.name, 4000, true, true, true, today - 46, today - 17, 90, 84, 'EXPIRED', now() - interval '46 days') returning id into sub;
      insert into public.payments(student_id, subscription_id, mess_id, base_amount, amount, payment_date, status, payment_method, transaction_reference, paid_at, created_at)
      values (sid, sub, mess, 4000, 4000, today - 46, 'PAID', 'CASH', 'TXN-DEMO0001', now() - interval '45 days', now() - interval '46 days');
    end if;

    plan := case when i = 1 then p2 when i % 5 = 0 then p1 when i % 3 = 0 then p3 when i % 7 = 0 then p4 else p2 end;
    select * into pl from public.plans where id = plan;
    st := case when i in (5, 12) then 'EXPIRED' when i = 8 then 'PAUSED' when i = 15 then 'CANCELLED' when i = 21 then 'PENDING' else 'ACTIVE' end;
    sd := case when i = 1 then today - 16
               when st = 'EXPIRED' then today - 40
               when st = 'PENDING' then today + 1
               when pl.type = 'WEEKLY' then today - 3
               else today - (8 + (i * 7) % 18) end;
    ed := sd + pl.duration_days - 1;
    insert into public.subscriptions(student_id, plan_id, mess_id, plan_name, price, breakfast_included, lunch_included, dinner_included, start_date, end_date, total_meals, status,
                                     pause_requested, cancellation_requested, created_at)
    values (sid, plan, mess, pl.name, pl.price, pl.breakfast_included, pl.lunch_included, pl.dinner_included, sd, ed, pl.included_meals, st,
            i = 11, i = 17, sd::timestamptz) returning id into sub;
    pay_status := case when i = 1 then 'UNPAID' when st = 'CANCELLED' then 'VOID' when st = 'PENDING' then 'PENDING' when st = 'EXPIRED' then 'PAID'
                       when i % 4 = 0 then 'UNPAID' when i % 7 = 0 then 'PENDING' else 'PAID' end;
    insert into public.payments(student_id, subscription_id, mess_id, base_amount, adjustment, amount, payment_date, status, payment_method, transaction_reference, paid_at, created_at)
    values (sid, sub, mess, pl.price, case when i = 6 then -150 else 0 end, pl.price + case when i = 6 then -150 else 0 end, sd, pay_status,
            case when pay_status = 'PAID' then 'CASH' else 'DEMO' end::public.payment_method,
            case when pay_status = 'PAID' then 'TXN-' || upper(substr(md5(sub::text), 1, 10)) end,
            case when pay_status = 'PAID' then sd::timestamptz + interval '1 day' end, sd::timestamptz);

    -- skipped meals and demo student selections
    if st in ('ACTIVE','EXPIRED') then
      for d in 0..(least(ed, today + 6) - sd) loop
        foreach mt in array enum_range(null::public.meal_type) loop
          continue when not (case mt when 'BREAKFAST' then pl.breakfast_included when 'LUNCH' then pl.lunch_included else pl.dinner_included end);
          select id into meal_id from public.meals where mess_id = mess and meal_date = sd + d and meal_type = mt;
          continue when meal_id is null;
          if (random() < (case when extract(isodow from sd + d) in (6, 7) and mt = 'DINNER' then 0.3 else 0.1 end)) then
            insert into public.meal_selections(student_id, meal_id, status, selected_at) values (sid, meal_id, 'SKIPPED', (sd + d - 2)::timestamptz);
          elsif i = 1 then
            insert into public.meal_selections(student_id, meal_id, status, selected_at) values (sid, meal_id, 'SELECTED', (sd + d - 2)::timestamptz);
          end if;
        end loop;
      end loop;
    end if;
  end loop;

  -- consumption for past days and todays breakfast
  foreach mx in array array[m1, m2, m3] loop
    for d in -30..0 loop
      foreach mt in array enum_range(null::public.meal_type) loop
        continue when d = 0 and mt <> 'BREAKFAST';
        select id into meal_id from public.meals where mess_id = mx and meal_date = today + d and meal_type = mt;
        exp := public.expected_demand(mx, today + d, mt);
        prep := exp + greatest(1, ceil(exp * (0.05 + random() * 0.1))::int);
        cons := least(prep, greatest(0, exp - floor(exp * random() * 0.08)::int));
        insert into public.meal_consumption(mess_id, meal_id, expected_quantity, prepared_quantity, consumed_quantity, recorded_by, recorded_at)
        values (mx, meal_id, exp, prep, cons, case when mx = m1 then u_manager when mx = m2 then md5('fp-mgr-2')::uuid else md5('fp-mgr-3')::uuid end,
                (today + d)::timestamptz + interval '15 hours');
      end loop;
    end loop;
  end loop;

  -- feedback: demo student + others
  for r in select m.id, m.meal_date, s.student_id from public.meals m
           join public.subscriptions s on s.mess_id = m.mess_id and m.meal_date between s.start_date and s.end_date and s.status in ('ACTIVE','EXPIRED')
           where m.meal_date between today - 20 and today - 1 and m.meal_type <> 'BREAKFAST' and random() < case when s.student_id = u_student then 0.35 else 0.06 end loop
    insert into public.feedback(student_id, meal_id, rating, category, description, created_at)
    values (r.student_id, r.id, 2 + floor(random() * 4)::int, 'General',
            (array['Tasty and fresh.','A bit too spicy today.','Portion size was good.','Could be warmer.','Loved it!', null])[1 + floor(random() * 6)::int],
            r.meal_date::timestamptz + interval '14 hours')
    on conflict do nothing;
  end loop;

  -- complaints
  insert into public.complaints(student_id, mess_id, meal_type, complaint_date, category, description, status, manager_response, responded_by, responded_at, created_at) values
    (u_student, m1, 'LUNCH', today - 9, 'Food Quality', 'The dal was undercooked and cold during lunch.', 'RESOLVED', 'Thanks for flagging — we have adjusted cooking times and added a warmer.', u_manager, now() - interval '8 days', now() - interval '9 days'),
    (u_student, m1, 'DINNER', today - 2, 'Quantity', 'Rotis ran out before 9 PM on the second dinner shift.', 'OPEN', null, null, null, now() - interval '2 days'),
    (md5('fp-student-2')::uuid, m1, 'BREAKFAST', today - 5, 'Hygiene', 'Plates at the counter were not properly dried.', 'IN_PROGRESS', 'We are retraining the dishwashing staff this week.', u_manager, now() - interval '4 days', now() - interval '5 days'),
    (md5('fp-student-3')::uuid, m1, 'LUNCH', today - 3, 'Service', 'Long queue at lunch — only one serving counter was open.', 'OPEN', null, null, null, now() - interval '3 days'),
    (md5('fp-student-4')::uuid, m1, 'DINNER', today - 12, 'Suggestion', 'Please add a fruit option to dinner twice a week.', 'RESOLVED', 'Great idea — fruit is now served on Wednesdays and Sundays.', u_manager, now() - interval '10 days', now() - interval '12 days'),
    (md5('fp-student-18')::uuid, m2, 'LUNCH', today - 6, 'Food Quality', 'Rice was sticky and overcooked.', 'OPEN', null, null, null, now() - interval '6 days'),
    (md5('fp-student-22')::uuid, m3, 'BREAKFAST', today - 1, 'Service', 'Breakfast started 20 minutes late.', 'IN_PROGRESS', 'Noted, staff schedule has been revised.', md5('fp-mgr-3')::uuid, now() - interval '12 hours', now() - interval '1 day');
  update public.complaints c set meal_id = m.id from public.meals m where m.mess_id = c.mess_id and m.meal_date = c.complaint_date and m.meal_type = c.meal_type;

  -- notifications
  insert into public.notifications(user_id, type, title, message, link, is_read, created_at) values
    (u_student, 'WARNING', 'Payment pending', 'Your invoice for Monthly Full Board is unpaid. Please pay at the mess office.', '/student/payments', false, now() - interval '3 hours'),
    (u_student, 'INFO', 'Meal cutoff reminder', 'Select or skip tomorrow meals before 10:00 PM tonight.', '/student/meal-calendar', false, now() - interval '5 hours'),
    (u_student, 'SUCCESS', 'Complaint resolved', 'Your complaint about undercooked dal has been marked as Resolved.', '/student/complaints', true, now() - interval '8 days'),
    (u_student, 'INFO', 'Special dinner this week', 'A special dinner is on the menu this week. Check the meal calendar.', '/student/meal-calendar', true, now() - interval '2 days'),
    (u_manager, 'WARNING', 'New complaint', 'A quantity complaint was raised for dinner.', '/manager/feedback', false, now() - interval '2 days'),
    (u_manager, 'INFO', 'Pending payments', 'Several subscribers have unpaid invoices this cycle.', '/manager/payments', false, now() - interval '1 day'),
    (u_manager, 'WARNING', 'Pause request', 'Aditya Joshi requested to pause their subscription.', '/manager/subscribers', true, now() - interval '3 days'),
    (u_admin, 'INFO', 'Weekly summary ready', 'Organisation reports for last week are ready to review.', '/admin/reports', false, now() - interval '6 hours'),
    (u_admin, 'WARNING', 'Inactive account', 'The account of Varun Kapoor was deactivated.', '/admin/users', true, now() - interval '4 days'),
    (u_admin, 'SUCCESS', 'Plan updated', 'Monthly Full Board price updated to ₹4,200.', '/admin/plans', true, now() - interval '20 days');

  -- audit history
  insert into public.audit_logs(actor_user_id, actor_name, action, module, entity_type, description, old_value, new_value, status, created_at) values
    (u_admin, 'Admin Demo', 'Plan edited', 'Plans', 'plan', 'Monthly Full Board price ₹4000 → ₹4200', '{"price":4000}', '{"price":4200}', 'Success', now() - interval '20 days'),
    (u_admin, 'Admin Demo', 'User deactivated', 'Users', 'profile', 'Varun Kapoor (varun.kapoor@campus.edu.in)', '{"status":"ACTIVE"}', '{"status":"INACTIVE"}', 'Success', now() - interval '4 days'),
    (u_admin, 'Admin Demo', 'Plan deactivated', 'Plans', 'plan', 'Weekend Special deactivated', '{"status":"ACTIVE"}', '{"status":"INACTIVE"}', 'Success', now() - interval '30 days'),
    (u_admin, 'Admin Demo', 'Settings changed', 'Settings', 'system_settings', 'Updated meal timings', null, null, 'Success', now() - interval '15 days'),
    (u_manager, 'Rohan Mehta', 'Complaint updated', 'Complaints', 'complaint', 'Complaint resolved: undercooked dal', '{"status":"OPEN"}', '{"status":"RESOLVED"}', 'Success', now() - interval '8 days'),
    (u_manager, 'Rohan Mehta', 'Menu updated', 'Menu', 'menu', 'Special dinner added for the weekend', null, null, 'Success', now() - interval '2 days'),
    (u_manager, 'Rohan Mehta', 'Payment status changed', 'Payments', 'payment', 'Invoice marked Unpaid → Paid', '{"status":"UNPAID"}', '{"status":"PAID"}', 'Success', now() - interval '6 days'),
    (u_manager, 'Rohan Mehta', 'Consumption recorded', 'Consumption', 'meal', 'Lunch: prepared 16, consumed 15', null, null, 'Success', now() - interval '1 day'),
    (null, 'System', 'Subscriptions expired', 'Subscriptions', 'subscription', '2 subscriptions reached their end date', null, null, 'Success', now() - interval '10 days'),
    (u_manager, 'Rohan Mehta', 'Payment status changed', 'Payments', 'payment', 'Attempted update on another mess invoice', null, null, 'Failed', now() - interval '12 days');
end $seed$;

select public.refresh_subscriptions();
