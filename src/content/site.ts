export interface Space { id: string; name: string; description: string; capacity: string }
export interface Photo { src: string; alt: string; caption: string }
export const site = {
  name: 'Centro de Eventos [Nombre]', address: '[Dirección pendiente]', email: '[Correo pendiente]',
  phone: '[Teléfono pendiente]', whatsapp: '',
  description: 'Un lugar para reunirnos, celebrar y compartir.',
};
export const spaces: Space[] = [
  { id: 'espacio-1', name: '[Espacio 1 · nombre pendiente]', description: '[Descripción e instalaciones por confirmar]', capacity: '[Capacidad por confirmar]' },
  { id: 'espacio-2', name: '[Espacio 2 · nombre pendiente]', description: '[Descripción e instalaciones por confirmar]', capacity: '[Capacidad por confirmar]' },
  { id: 'espacio-3', name: '[Espacio 3 · nombre pendiente]', description: '[Descripción e instalaciones por confirmar]', capacity: '[Capacidad por confirmar]' },
];
// Incorporar hasta 30 fotos reales autorizadas en public/galeria; sin imágenes ficticias del recinto.
export const photos: Photo[] = [];
export const eventCategories = [
  { title: 'Fiestas y celebraciones', description: 'Cuéntanos qué quieres celebrar y revisaremos tu solicitud.' },
  { title: 'Eventos corporativos', description: 'Comparte las necesidades de tu empresa para evaluar los espacios disponibles.' },
];
export const servicesNote = '[Servicios, equipamiento, accesibilidad y condiciones pendientes de confirmación]';
export const navigation = [['/', 'Inicio'], ['/espacios/', 'Espacios'], ['/eventos/', 'Eventos y servicios'], ['/galeria/', 'Galería'], ['/contacto/', 'Contacto']] as const;
