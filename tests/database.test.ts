import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { handleIntake } from '../supabase/functions/_shared/intake.ts';
import type { RequestInput } from '../shared/request.ts';
const input: RequestInput = { request_id: '19c8e122-5d19-4495-80d5-0516f664510a', request_type: 'visita', name: 'Prueba SQL', company: '', email: 'sql@example.com', phone: '+56912345678', event_type: 'Fiesta', tentative_date: '2099-11-01', attendees: 25, message: 'Datos ficticios de prueba SQL.', website: '' };
test('PostgreSQL: RLS, two-manager cap, atomic rate limit, storage/mail failure and retry deduplication', async t => {
  const db = new PGlite();
  await db.exec(`
    create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema public, auth to anon, authenticated, service_role;
    grant execute on function auth.uid() to anon, authenticated, service_role;
    insert into auth.users values ('11111111-1111-4111-8111-111111111111'), ('22222222-2222-4222-8222-222222222222'), ('33333333-3333-4333-8333-333333333333');
  `);
  await db.exec(await readFile(new URL('../supabase/migrations/202610280001_initial.sql', import.meta.url), 'utf8'));
  await db.exec(`insert into public.managers values (1,'11111111-1111-4111-8111-111111111111'), (2,'22222222-2222-4222-8222-222222222222');`);
  const count = async (table: string) => Number((await db.query<{ count: number }>(`select count(*) as count from public.${table}`)).rows[0].count);
  await t.test('save and failed mail preserve one request and job on retry', async () => {
    const deps = {
      allowedOrigins: ['http://localhost:4321'], fingerprint: async () => 'testhash',
      save: async (data: RequestInput, fingerprint: string) => {
        const result = await db.query<{ id: string }>('select public.accept_request($1::jsonb, $2) as id', [JSON.stringify(data), fingerprint]); return result.rows[0].id;
      },
      notify: async () => {
        const result = await db.query<{ request_id: string }>('select * from public.claim_notification($1::uuid)', [input.request_id]);
        if (result.rows[0]) await db.query("update public.notification_jobs set state='failed', last_error='resend_http_500' where request_id=$1", [input.request_id]);
      },
    };
    for (let i = 0; i < 2; i++) {
      const response = await handleIntake(new Request('http://localhost:4321', { method: 'POST', headers: { origin: 'http://localhost:4321', 'content-type': 'application/json', 'x-forwarded-for': '192.0.2.1' }, body: JSON.stringify(input) }), deps);
      assert.equal(response.status, 201);
    }
    assert.equal(await count('requests'), 1); assert.equal(await count('notification_jobs'), 1);
    const job = (await db.query<{ state: string; attempts: number }>('select * from public.notification_jobs')).rows[0];
    assert.equal(job.state, 'failed'); assert.equal(job.attempts, 2);
  });
  await t.test('anon cannot read requests or call privileged RPC', async () => {
    await db.exec('set role anon');
    await assert.rejects(db.query('select * from public.requests'), /permission denied/);
    await assert.rejects(db.query('select public.accept_request($1::jsonb,$2)', [JSON.stringify(input), 'anon']), /permission denied/);
    await db.exec('reset role');
  });
  await t.test('authenticated unauthorized account sees no requests or manager list', async () => {
    await db.exec("set role authenticated; set request.jwt.claim.sub = '33333333-3333-4333-8333-333333333333'");
    assert.equal(await count('requests'), 0); assert.equal(await count('managers'), 0);
    await assert.rejects(db.query('select * from public.notification_jobs'), /permission denied/);
    await assert.rejects(db.query('delete from public.requests'), /permission denied/);
    await db.exec('reset role');
  });
  await t.test('both authorized managers can read but cannot change requests or grant permissions', async () => {
    for (const id of ['11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222']) {
      await db.exec(`set role authenticated; set request.jwt.claim.sub = '${id}'`);
      assert.equal(await count('requests'), 1); assert.equal(await count('managers'), 1);
      await assert.rejects(db.query("update public.requests set name='changed'"), /permission denied/);
      await assert.rejects(db.query('insert into public.managers values (3,$1)', ['33333333-3333-4333-8333-333333333333']), /permission denied/);
      await db.exec('reset role');
    }
    await assert.rejects(db.query('insert into public.managers values (3,$1)', ['33333333-3333-4333-8333-333333333333']), /check constraint/);
  });
  await t.test('service role RPC persists atomically and limits to five per window', async () => {
    await db.exec('set role service_role');
    for (let i = 0; i < 5; i++) await db.query('select public.accept_request($1::jsonb,$2)', [JSON.stringify({ ...input, request_id: crypto.randomUUID() }), 'limit-test']);
    await assert.rejects(db.query('select public.accept_request($1::jsonb,$2)', [JSON.stringify({ ...input, request_id: crypto.randomUUID() }), 'limit-test']), /rate_limited/);
    assert.equal(await count('requests'), 6);
    await db.exec('reset role');
  });
  await t.test('queue lease prevents concurrent delivery and sent jobs are not retried', async () => {
    const result = await db.query<{ request_id: string }>('select * from public.claim_notification($1)', [input.request_id]);
    assert.equal(result.rows.length, 1);
    assert.equal((await db.query('select * from public.claim_notification($1)', [input.request_id])).rows.length, 0);
    await db.query("update public.notification_jobs set state='sent', sent_at=now() where request_id=$1", [input.request_id]);
    assert.equal((await db.query('select * from public.claim_notification($1)', [input.request_id])).rows.length, 0);
    assert.equal(await count('requests'), 6);
  });
  await t.test('expired retry window enters review instead of risking a duplicate email', async () => {
    await db.query("update public.notification_jobs set state='failed',created_at=now()-interval '24 hours' where request_id=$1", [input.request_id]);
    assert.equal((await db.query('select * from public.claim_notification($1)', [input.request_id])).rows.length, 0);
    assert.equal((await db.query<{ state: string }>('select state from public.notification_jobs where request_id=$1', [input.request_id])).rows[0].state, 'review');
  });
  await t.test('reused ID with changed content is rejected without overwriting the original', async () => {
    await assert.rejects(db.query('select public.accept_request($1::jsonb,$2)', [JSON.stringify({ ...input, message: 'Otro mensaje modificado para verificar conflicto.' }), 'conflict-test']), /idempotency_conflict/);
    assert.equal((await db.query<{message: string}>('select message from public.requests where id=$1', [input.request_id])).rows[0].message, input.message);
    assert.equal(await count('requests'), 6);
  });
  await t.test('constraint failure rolls back request and outbox together', async () => {
    await assert.rejects(db.query('select public.accept_request($1::jsonb,$2)', [JSON.stringify({ ...input, request_id: crypto.randomUUID(), attendees: 0 }), 'invalid-test']), /check constraint/);
    assert.equal(await count('requests'), 6); assert.equal(await count('notification_jobs'), 6);
  });
  await t.test('global ceiling cannot be bypassed by rotating fingerprints', async () => {
    for (let i = 0; i < 53; i++) await db.query('select public.accept_request($1::jsonb,$2)', [JSON.stringify({ ...input, request_id: crypto.randomUUID() }), `rotating-${i}`]);
    await assert.rejects(db.query('select public.accept_request($1::jsonb,$2)', [JSON.stringify({ ...input, request_id: crypto.randomUUID() }), 'yet-another-IP']), /rate_limited/);
    assert.equal(await count('requests'), 59);
  });
  await db.close();
});
