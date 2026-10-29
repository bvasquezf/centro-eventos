import test from 'node:test';
import assert from 'node:assert/strict';
import { validateRequest, type RequestInput } from '../shared/request.ts';
import { handleIntake, type IntakeDependencies } from '../supabase/functions/_shared/intake.ts';
export const valid: RequestInput = { request_id: 'a83ecee0-4720-4f77-9123-22ed2457fb21', request_type: 'cotizacion', name: 'Persona de prueba', company: '', email: 'prueba@example.com', phone: '+56912345678', event_type: 'Encuentro', tentative_date: '2099-11-01', attendees: 50, message: 'Solicitud ficticia para pruebas automáticas.', website: '' };
const origin = 'http://localhost:4321';
function request(body: unknown = valid, options: RequestInit = {}) {
  return new Request(origin, { method: 'POST', headers: { origin, 'content-type': 'application/json', 'x-forwarded-for': '192.0.2.1' }, body: JSON.stringify(body), ...options });
}
function dependencies(overrides: Partial<IntakeDependencies> = {}): IntakeDependencies {
  return { allowedOrigins: [origin], fingerprint: async () => 'hashed', save: async () => valid.request_id, notify: async () => {}, ...overrides };
}
test('shared validation accepts valid input and normalizes text', () => {
  const result = validateRequest({ ...valid, name: '  Persona  ', email: 'PRUEBA@example.com' });
  assert.equal(result.data?.name, 'Persona'); assert.equal(result.data?.email, 'prueba@example.com');
});
test('rejects malformed fields, honeypot, impossible/past dates and fractional attendees', () => {
  for (const patch of [{ email: 'wrong' }, { phone: 'letters' }, { tentative_date: '2099-02-30' }, { tentative_date: '2000-01-01' }, { attendees: 0 }, { attendees: 2.5 }, { attendees: '20' }, { website: 'bot' }, { message: '' }, { request_type: 'reserva' }, { request_id: 'bad' }, { message: 'a'.repeat(3001) }]) {
    assert.equal(validateRequest({ ...valid, ...patch }).data, undefined, JSON.stringify(patch));
  }
  assert.equal(validateRequest(null).data, undefined);
});
test('saves before notification and confirms storage', async () => {
  const order: string[] = [];
  const response = await handleIntake(request(), dependencies({ save: async () => { order.push('save'); return valid.request_id; }, notify: async () => { order.push('notify'); } }));
  assert.equal(response.status, 201); assert.deepEqual(await response.json(), { saved: true }); assert.deepEqual(order, ['save', 'notify']);
});
test('notification outage retains successful saved result', async () => {
  let saved = 0;
  const response = await handleIntake(request(), dependencies({ save: async () => { saved++; return valid.request_id; }, notify: async () => { throw new Error('mail down'); } }));
  assert.equal(response.status, 201); assert.equal(saved, 1); assert.equal((await response.json()).saved, true);
});
test('save failure never notifies or claims success', async () => {
  let notified = false;
  const response = await handleIntake(request(), dependencies({ save: async () => { throw new Error('database down'); }, notify: async () => { notified = true; } }));
  assert.equal(response.status, 503); assert.equal(notified, false); assert.equal((await response.json()).saved, undefined);
});
test('validation, rate limit and malformed JSON have explicit failure responses', async () => {
  assert.equal((await handleIntake(request({ ...valid, email: 'x' }), dependencies())).status, 422);
  assert.equal((await handleIntake(request(), dependencies({ save: async () => { throw new Error('rate_limited'); } }))).status, 429);
  assert.equal((await handleIntake(request(valid, { body: '{' }), dependencies())).status, 400);
});
test('rejects foreign origins, GET queries, missing gateway IP and oversized bodies', async () => {
  const foreign = request(valid, { headers: { origin: 'https://foreign.invalid', 'content-type': 'application/json' } });
  assert.equal((await handleIntake(foreign, dependencies())).status, 403);
  assert.equal((await handleIntake(new Request(origin, { headers: { origin } }), dependencies())).status, 405);
  assert.equal((await handleIntake(request(valid, { headers: { origin, 'content-type': 'application/json' } }), dependencies())).status, 503);
  assert.equal((await handleIntake(request({ ...valid, message: 'a'.repeat(20000) }), dependencies())).status, 413);
});
test('CORS preflight succeeds only for allowed origin', async () => {
  const response = await handleIntake(new Request(origin, { method: 'OPTIONS', headers: { origin } }), dependencies());
  assert.equal(response.status, 204); assert.equal(response.headers.get('access-control-allow-origin'), origin);
});
