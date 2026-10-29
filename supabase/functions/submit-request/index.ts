import { handleIntake } from '../_shared/intake.ts';
import { db, fingerprint, notify } from '../_shared/server.ts';
Deno.serve(req => handleIntake(req, {
  allowedOrigins: (Deno.env.get('ALLOWED_ORIGINS') ?? '').split(',').map(s => s.trim()).filter(Boolean), fingerprint,
  async save(payload, fingerprint) {
    const { data, error } = await db.rpc('accept_request', { payload, p_fingerprint: fingerprint });
    if (error) throw new Error(error.message.includes('rate_limited') ? 'rate_limited' : error.message.includes('idempotency_conflict') ? 'idempotency_conflict' : 'save_failed');
    return data as string;
  }, async notify(id) { await notify(id); },
}));
