import test from 'node:test';
import assert from 'node:assert/strict';
import { deliverNotification, type DeliveryDependencies } from '../supabase/functions/_shared/delivery.ts';
test('Resend outage is recorded, retries reuse provider key and successful jobs stop being sent', async () => {
  let state = 'pending'; let failure: string | null = null; let attempts = 0;
  const keys: string[] = [];
  const deps: DeliveryDependencies = {
    config: { key: 'fake-key', from: 'sender@example.com', to: 'team@example.com' },
    claim: async () => state === 'sent' ? null : { request_id: 'reference-id' },
    finish: async (_id, error) => { failure = error; state = error ? 'failed' : 'sent'; },
    fetch: async (_url, options) => {
      attempts++; keys.push(new Headers(options?.headers).get('Idempotency-Key')!);
      const payload = JSON.parse(String(options?.body));
      assert.equal(payload.text.includes('reference-id'), true);
      assert.deepEqual(Object.keys(payload).sort(), ['from', 'subject', 'text', 'to']);
      return new Response(null, { status: attempts === 1 ? 500 : 200 });
    },
  };
  assert.equal(await deliverNotification(deps), true); assert.equal(state, 'failed'); assert.equal(failure, 'resend_http_500');
  assert.equal(await deliverNotification(deps), true); assert.equal(state, 'sent'); assert.equal(failure, null);
  assert.equal(await deliverNotification(deps), false); assert.equal(attempts, 2);
  assert.deepEqual(keys, ['request/reference-id', 'request/reference-id']);
});
test('transport/configuration errors are sanitized and persisted', async () => {
  const errors: (string | null)[] = [];
  const deps: DeliveryDependencies = { config: {}, claim: async () => ({ request_id: 'id' }), finish: async (_, error) => { errors.push(error); }, fetch: async () => { throw new Error('sensitive provider details'); } };
  await deliverNotification(deps);
  deps.config = { key: 'fake', from: 'a@example.com', to: 'b@example.com' };
  await deliverNotification(deps);
  assert.deepEqual(errors, ['notification_transport_or_config', 'notification_transport_or_config']);
});
