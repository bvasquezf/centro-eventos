import type { RequestRecord } from '../../shared/request';
// Solo datos ficticios para la ruta de revisión de diseño en desarrollo.
export const previewRequests: RequestRecord[] = Array.from({ length: 13 }, (_, index) => ({
  id: `muestra-${String(index+1).padStart(2,'0')}`, created_at: `2026-10-${String(28-Math.floor(index/2)).padStart(2,'0')}T${index%2?'14':'10'}:30:00Z`,
  request_type: index%3===0?'visita':'cotizacion', name: `Persona de ejemplo ${String(index+1).padStart(2,'0')}`,
  company: index%2?'Empresa ficticia de demostración':'', email: `ejemplo${index+1}@example.com`, phone: '[Teléfono de muestra]',
  event_type: index%2?'Encuentro corporativo de muestra':'Celebración de muestra', tentative_date: '2026-12-15', attendees: 40+index*10,
  message: 'Este es un mensaje ficticio para revisar la composición del detalle. No corresponde a una persona o solicitud real. Nos gustaría conocer los espacios y conversar sobre las posibilidades para nuestro encuentro.',
}));
export const previewStates = [
 ['listado','Panel · Listado'],['detalle','Panel · Detalle'],['vacio','Panel · Vacío'],['carga','Panel · Carga'],['error','Panel · Error'],['login','Acceso · Inicio de sesión'],['recuperacion','Acceso · Nueva contraseña'],['denegado','Acceso · Sin autorización'],['verificando','Acceso · Comprobando'],['formulario','Formulario · Inicial'],['form-error','Formulario · Error'],['form-carga','Formulario · Carga'],['form-exito','Formulario · Éxito visual'],
] as const;
