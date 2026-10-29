import { useRef, useState, type SubmitEvent } from 'react';
import RequestFormView, { type RequestFormViewProps } from '../ui/RequestFormView';
import { validateRequest, type FieldErrors } from '../../../shared/request';
import { demoMode } from '../../lib/supabase';
import { submitRequest } from '../../lib/requests';
import { trackRequest } from '../../lib/analytics';
export default function RequestForm() {
  const [status, setStatus] = useState<RequestFormViewProps['status']>('idle');
  const [errors, setErrors] = useState<FieldErrors>({}); const [message, setMessage] = useState('');
  const requestId = useRef(''); const busy = useRef(false);
  async function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy.current) return;
    const form = event.currentTarget;
    if (!requestId.current) requestId.current = crypto.randomUUID();
    const raw = Object.fromEntries(new FormData(form));
    const result = validateRequest({ ...raw, attendees: Number(raw.attendees), request_id: requestId.current });
    setErrors(result.errors);
    if (!result.data) {
      setStatus('error'); setMessage('Revisa los campos indicados. No se ha enviado la solicitud.');
      const first = Object.keys(result.errors)[0]; form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus(); return;
    }
    busy.current = true; setStatus('sending'); setMessage('Guardando tu solicitud…');
    try {
      await submitRequest(result.data);
      trackRequest(result.data.request_type);
      setStatus('success'); setMessage('Solicitud guardada. El equipo la revisará y responderá manualmente. La fecha aún no está reservada.');
      form.reset(); requestId.current = '';
    } catch (error) { setStatus('error'); setMessage(error instanceof Error ? error.message : 'No se pudo confirmar el guardado. Reintenta.'); }
    finally { busy.current = false; }
  }
  return <RequestFormView status={status} errors={errors} message={message} demo={demoMode} onSubmit={onSubmit} />;
}
