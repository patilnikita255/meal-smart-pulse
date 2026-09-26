
alter function public.meal_included(public.subscriptions, public.meal_type) set search_path = public;
revoke execute on function public.notify(uuid, public.notification_type, text, text, text) from authenticated;
revoke execute on function public.log_audit(text, text, text, text, text, jsonb, jsonb) from authenticated;
revoke execute on function public.ensure_meal(uuid, date, public.meal_type) from authenticated;
revoke execute on function public.expected_demand(uuid, date, public.meal_type) from authenticated;
revoke execute on function public.next_invoice_number() from authenticated;
