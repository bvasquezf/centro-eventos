import { photos, type Photo } from './site';
export interface DesignPhoto extends Photo { id: string; illustrative: boolean; author?: string; source?: string }
// Referencias de diseño, separadas de las fotografías reales del centro.
export const illustrativePhotos: DesignPhoto[] = [
  { id: 'celebracion', src: '/images/celebracion-1280.webp', alt: 'Fotografía ilustrativa de una recepción al aire libre bajo telas y flores.', caption: 'Una celebración al aire libre', illustrative: true, author: 'Vidit Goswami', source: 'https://unsplash.com/photos/Zi_NOBHIk9A' },
  { id: 'mesa', src: '/images/mesa-1280.webp', alt: 'Fotografía ilustrativa de una mesa preparada para una celebración en un jardín.', caption: 'Detalles de un encuentro', illustrative: true, author: 'engin akyurt', source: 'https://unsplash.com/photos/i3rFV6ULk-o' },
  { id: 'encuentro', src: '/images/encuentro-1280.webp', alt: 'Fotografía ilustrativa de un salón con mesas redondas para un evento corporativo.', caption: 'Ideas para reunir a un equipo', illustrative: true, author: 'CHUTTERSNAP', source: 'https://unsplash.com/photos/Q_KdjKxntH8' },
  { id: 'reunion', src: '/images/reunion-1280.webp', alt: 'Fotografía ilustrativa de una sala de reuniones con sillas y mesa.', caption: 'Conversaciones que conectan', illustrative: true, author: 'David Kristianto', source: 'https://unsplash.com/photos/6jpbs2ykacU' },
];
export const galleryPhotos: DesignPhoto[] = photos.length
  ? photos.slice(0, 30).map((photo, index) => ({ ...photo, id: `recinto-${index}`, illustrative: false }))
  : illustrativePhotos;
export const serviceReferences = [
  { number: '01', title: 'Espacios e instalaciones', description: 'Conversemos sobre el lugar y las necesidades de tu evento.', pending: 'Capacidades e instalaciones por confirmar' },
  { number: '02', title: 'Equipamiento y montaje', description: 'Cuéntanos qué necesitas para evaluar las opciones contigo.', pending: 'Equipamiento y prestaciones por confirmar' },
  { number: '03', title: 'Una visita al recinto', description: 'Solicita conocer el lugar antes de dar el siguiente paso.', pending: 'Fecha sujeta a coordinación con el equipo' },
];
