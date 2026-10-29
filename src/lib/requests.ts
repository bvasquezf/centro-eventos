import { supabase } from './supabase';
import type { RequestInput, RequestRecord } from '../../shared/request';
export async function submitRequest(input: RequestInput): Promise<void> {
  if (!supabase) throw new Error('Demostración local: no hay conexión a Supabase. No se ha guardado ni enviado tu solicitud.');
  const { data, error } = await supabase.functions.invoke('submit-request', { body: input });
  if (error && 'context' in error && error.context instanceof Response) {
    const detail = await error.context.json().catch(() => null);
    if (detail?.code === 'rate_limited') throw new Error('Se alcanzó el límite de solicitudes. Intenta más tarde.');
    if (detail?.code === 'idempotency_conflict') throw new Error('El intento anterior usó otros datos. Restaura los datos originales para reintentarlo, o recarga la página para crear una nueva solicitud.');
  }
  if (error || data?.saved !== true) throw new Error('No pudimos confirmar el guardado. Reintenta con los mismos datos; no duplicaremos la solicitud.');
}
export interface Filters { from: string; to: string; type: string; page: number }
export const pageSize = 10;
export async function listRequests(filters: Filters) {
  if (!supabase) throw new Error('Supabase no configurado.');
  let query = supabase.from('requests').select('*', { count: 'exact' }).order('created_at', { ascending: false }).order('id');
  if (filters.from) query = query.gte('created_at', filters.from + 'T00:00:00Z');
  if (filters.to) query = query.lt('created_at', new Date(new Date(filters.to + 'T00:00:00Z').getTime() + 86400000).toISOString());
  if (filters.type) query = query.eq('request_type', filters.type);
  const { data, count, error } = await query.range(filters.page * pageSize, (filters.page + 1) * pageSize - 1);
  if (error) throw new Error('No se pudo cargar el listado.');
  return { rows: data as RequestRecord[], count: count ?? 0 };
}
