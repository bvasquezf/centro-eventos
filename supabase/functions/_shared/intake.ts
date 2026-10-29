import { validateRequest, type RequestInput } from '../../../shared/request.ts';
export interface IntakeDependencies {
  allowedOrigins: string[];
  fingerprint: (ip: string) => Promise<string>;
  save: (data: RequestInput, fingerprint: string) => Promise<string>;
  notify: (id: string) => Promise<void>;
}
export async function handleIntake(req: Request, deps: IntakeDependencies): Promise<Response> {
  const origin = req.headers.get('origin') ?? '';
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin, 'Vary': 'Origin', 'Access-Control-Allow-Headers': 'content-type, authorization, apikey, x-client-info', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
  const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers });
  if (!deps.allowedOrigins.includes(origin)) return new Response(null, { status: 403 });
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (req.method !== 'POST') return reply(405, { code: 'method_not_allowed' });
  if (!req.headers.get('content-type')?.includes('application/json')) return reply(415, { code: 'json_required' });
  try {
    // Stream-limited body, including callers that omit Content-Length.
    const reader = req.body?.getReader();
    if (!reader) return reply(400, { code: 'invalid_body' });
    let size = 0; const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > 16000) { await reader.cancel(); return reply(413, { code: 'body_too_large' }); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    const raw = JSON.parse(new TextDecoder().decode(bytes));
    const { data, errors } = validateRequest(raw);
    if (!data) return reply(422, { code: 'validation_error', errors });
    // Supplemental IP bucket. SQL also enforces an independent global ceiling.
    const ip = req.headers.get('cf-connecting-ip')?.trim() || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    if (!ip || ip.length > 100) return reply(503, { code: 'gateway_ip_missing' });
    const fingerprint = await deps.fingerprint(ip);
    const id = await deps.save(data, fingerprint);
    // Saving is the success criterion. Notification failure never rolls back intake.
    try { await deps.notify(id); } catch { /* queue remains available for retry */ }
    return reply(201, { saved: true });
  } catch (error) {
    if (error instanceof SyntaxError) return reply(400, { code: 'invalid_json' });
    if (error instanceof Error && error.message === 'idempotency_conflict') return reply(409, { code: 'idempotency_conflict' });
    if (error instanceof Error && error.message === 'rate_limited') return reply(429, { code: 'rate_limited' });
    return reply(503, { code: 'temporarily_unavailable' });
  }
}
