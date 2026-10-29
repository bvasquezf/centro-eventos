import { notify } from '../_shared/server.ts';
Deno.serve(async req => {
  const secret = Deno.env.get('RETRY_SECRET');
  if (!secret || secret.length < 32 || req.headers.get('authorization') !== `Bearer ${secret}`) return new Response(null, { status: 401 });
  if (req.method !== 'POST') return new Response(null, { status: 405 });
  try {
    // One job per invocation; invoke every minute. No request data or errors exposed.
    await notify(); return new Response(null, { status: 204 });
  } catch { return new Response(null, { status: 503 }); }
});
