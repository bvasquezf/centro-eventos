export const requestTypes = ['cotizacion', 'visita'] as const;
export interface RequestInput {
  request_type: 'cotizacion' | 'visita'; name: string; company: string; email: string;
  phone: string; event_type: string; tentative_date: string; attendees: number; message: string;
  website: string; request_id: string;
}
export type FieldErrors = Partial<Record<keyof RequestInput, string>>;
export type RequestRecord = Omit<RequestInput, 'website' | 'request_id'> & { id: string; created_at: string };
export function validateRequest(raw: unknown, now = new Date()): { data?: RequestInput; errors: FieldErrors } {
  const r = (raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}) as Record<string, unknown>;
  const errors: FieldErrors = {};
  const str = (key: keyof RequestInput, min: number, max: number) => {
    const value = typeof r[key] === 'string' ? (r[key] as string).trim() : '';
    if (value.length < min || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) errors[key] = `Ingresa entre ${min} y ${max} caracteres.`;
    return value;
  };
  const data: RequestInput = {
    request_type: str('request_type', 1, 20) as RequestInput['request_type'], name: str('name', 2, 100),
    company: str('company', 0, 150), email: str('email', 3, 254).toLowerCase(), phone: str('phone', 7, 30),
    event_type: str('event_type', 2, 100), tentative_date: str('tentative_date', 10, 10),
    attendees: typeof r.attendees === 'number' ? r.attendees : NaN, message: str('message', 10, 3000),
    website: str('website', 0, 0), request_id: str('request_id', 36, 36),
  };
  if (!requestTypes.includes(data.request_type)) errors.request_type = 'Selecciona cotización o visita.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Ingresa un correo válido.';
  if (!/^[+\d\s().-]{7,30}$/.test(data.phone) || data.phone.replace(/\D/g, '').length < 7) errors.phone = 'Ingresa un teléfono válido.';
  const date = new Date(data.tentative_date + 'T12:00:00Z');
  const today = now.toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.tentative_date) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== data.tentative_date || data.tentative_date < today) errors.tentative_date = 'Selecciona una fecha válida, desde hoy (UTC).';
  if (!Number.isInteger(data.attendees) || data.attendees < 1 || data.attendees > 100000) errors.attendees = 'Ingresa una cantidad entre 1 y 100.000; no indica capacidad confirmada.';
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.request_id)) errors.request_id = 'Identificador inválido. Recarga la página.';
  return { data: Object.keys(errors).length ? undefined : data, errors };
}
