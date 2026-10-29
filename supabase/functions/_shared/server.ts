import { deliverNotification } from './delivery.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.118.0';
export const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false, autoRefreshToken: false } });
export async function fingerprint(ip: string) {
  const secret = Deno.env.get('RATE_LIMIT_SECRET');
  if (!secret || secret.length < 32) throw new Error('configuration');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(digest), n => n.toString(16).padStart(2, '0')).join('');
}
export async function notify(target?: string) {
  return deliverNotification({
    config: { key: Deno.env.get('RESEND_API_KEY'), from: Deno.env.get('NOTIFICATION_FROM'), to: Deno.env.get('NOTIFICATION_TO') },
    fetch,
    async claim(target) {
      const { data, error } = await db.rpc('claim_notification', { target: target ?? null });
      if (error) throw new Error('queue_unavailable');
      return data?.[0] ?? null;
    },
    async finish(id, failure) {
      const { error } = await db.from('notification_jobs').update({ state: failure ? 'failed' : 'sent', last_error: failure, sent_at: failure ? null : new Date().toISOString(), locked_until: null }).eq('request_id', id);
      if (error) throw new Error('queue_update_failed');
    },
  }, target);
}
