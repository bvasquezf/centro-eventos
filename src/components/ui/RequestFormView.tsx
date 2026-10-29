import type { SubmitEvent } from 'react';
import type { FieldErrors } from '../../../shared/request';
export interface RequestFormViewProps {
  status: 'idle' | 'sending' | 'success' | 'error'; errors: FieldErrors; message: string; demo: boolean;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
}
const contactFields = [
  ['name', 'Nombre', 'text', true, 100], ['company', 'Empresa', 'text', false, 150],
  ['email', 'Correo electrónico', 'email', true, 254], ['phone', 'Teléfono', 'tel', true, 30],
] as const;
const eventFields = [
  ['event_type', 'Tipo de evento', 'text', true, 100], ['tentative_date', 'Fecha tentativa', 'date', true, undefined],
  ['attendees', 'Asistentes aproximados', 'number', true, undefined],
] as const;
export default function RequestFormView({ status, errors, message, demo, onSubmit }: RequestFormViewProps) {
  function field([name, label, type, required, maxLength]: (typeof contactFields)[number] | (typeof eventFields)[number]) {
    return <div className="form-field" key={name}><label htmlFor={name}>{label} <span className="optional">{required ? '*' : '(opcional)'}</span></label><input id={name} name={name} type={type} required={required} maxLength={maxLength} min={type === 'number' ? 1 : undefined} max={type === 'number' ? 100000 : undefined} step={type === 'number' ? 1 : undefined} autoComplete={({ name: 'name', email: 'email', phone: 'tel', company: 'organization' } as Record<string,string>)[name]} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${name}-error` : undefined} disabled={status === 'sending'} />{errors[name] && <p className="field-error" id={`${name}-error`}>{errors[name]}</p>}</div>;
  }
  return <form onSubmit={onSubmit} noValidate aria-describedby="request-note" aria-busy={status === 'sending'} className="request-form surface">
    <div className="form-heading"><p className="eyebrow">Tu próximo encuentro</p><h2>Una idea para empezar.</h2><p className="muted small">Los campos con * son obligatorios.</p></div>
    {demo && <p className="notice demo-notice">Demostración local · Los servicios no están conectados. No se guardarán solicitudes.</p>}
    <div className="form-field request-type-field"><label htmlFor="request_type">¿Cómo podemos ayudarte?</label><select id="request_type" name="request_type" defaultValue="cotizacion" disabled={status === 'sending'}><option value="cotizacion">Quiero una cotización</option><option value="visita">Quiero coordinar una visita</option></select></div>
    <fieldset><legend><span>01</span> Tus datos de contacto</legend><div className="form-grid">{contactFields.map(field)}</div></fieldset>
    <fieldset><legend><span>02</span> Cuéntanos sobre el evento</legend><div className="form-grid">{eventFields.map(field)}<div className="form-field full"><label htmlFor="message">Mensaje <span className="optional">*</span></label><textarea id="message" name="message" rows={4} required minLength={10} maxLength={3000} placeholder="Comparte tu idea, necesidades o preguntas…" aria-invalid={!!errors.message} aria-describedby={errors.message ? 'message-error' : undefined} disabled={status === 'sending'} />{errors.message && <p id="message-error" className="field-error">{errors.message}</p>}</div></div></fieldset>
    <div className="honeypot" aria-hidden="true"><label htmlFor="website">Dejar vacío</label><input id="website" name="website" tabIndex={-1} autoComplete="off" /></div>
    <div id="request-note" className="request-disclaimer"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v6m0 3v1"/></svg><div><p><strong>La fecha solicitada está sujeta a disponibilidad y confirmación del centro.</strong></p><p>Enviar esta solicitud no constituye una reserva. Usaremos tus datos para responder manualmente. <a href="#privacidad">Información de privacidad</a>.</p></div></div>
    <div className="form-submit"><button disabled={status === 'sending'} type="submit">{status === 'sending' ? <><span className="spinner" aria-hidden="true" /> Enviando…</> : <>Enviar solicitud <span aria-hidden="true">↗</span></>}</button><span className="muted small">Una persona de nuestro equipo te responderá.</span></div>
    <div role={status === 'error' ? 'alert' : 'status'} aria-live="polite" aria-atomic="true">{message && <p className={`form-feedback ${status === 'error' ? 'feedback-error' : status === 'success' ? 'feedback-success' : ''}`}><span className="feedback-symbol" aria-hidden="true">{status === 'success' ? '✓' : status === 'error' ? '!' : '…'}</span>{message}</p>}</div>
  </form>;
}
