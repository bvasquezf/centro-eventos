export interface NotificationJob { request_id: string }
export interface DeliveryDependencies {
  claim: (target?: string) => Promise<NotificationJob | null>;
  finish: (id: string, failure: string | null) => Promise<void>;
  config: { key?: string; from?: string; to?: string };
  fetch: typeof fetch;
}
export async function deliverNotification(deps: DeliveryDependencies, target?: string): Promise<boolean> {
  const job = await deps.claim(target); if (!job) return false;
  let failure: string | null = null;
  try {
    const { key, from, to } = deps.config;
    if (!key || !from || !to) throw new Error('configuration');
    // A fixed payload + reference key makes transport retries idempotent at Resend.
    const response = await deps.fetch('https://api.resend.com/emails', {
      method: 'POST', signal: AbortSignal.timeout(10000),
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Idempotency-Key': `request/${job.request_id}` },
      body: JSON.stringify({ from, to: [to], subject: 'Nueva solicitud del centro de eventos', text: `Se recibió una solicitud. Referencia: ${job.request_id}. Ingresa al panel privado para revisar los detalles.` }),
    });
    if (!response.ok) failure = `resend_http_${response.status}`;
  } catch { failure = 'notification_transport_or_config'; }
  await deps.finish(job.request_id, failure);
  return true;
}
