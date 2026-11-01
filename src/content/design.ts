import { photos, type Photo } from './site';
export interface DesignPhoto extends Photo { id: string; illustrative: boolean; author?: string; source?: string }
// Referencias de diseño, separadas de las fotografías reales del centro.
export const illustrativePhotos: DesignPhoto[] = [
  { id: 'ambiente', src: '/images/ambiente-1280.webp', alt: 'Referencia ilustrativa de un público celebrando entre confeti y luces azules.', caption: 'La energía de una gran celebración', illustrative: true, author: 'Pablo Heimplatz', source: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30' },
  { id: 'encuentro', src: '/images/encuentro-1280.webp', alt: 'Referencia ilustrativa de un salón preparado para un encuentro de empresa.', caption: 'Un encuentro de equipos', illustrative: true, author: 'CHUTTERSNAP', source: 'https://unsplash.com/photos/Q_KdjKxntH8' },
  { id: 'reunion', src: '/images/reunion-1280.webp', alt: 'Referencia ilustrativa de una sala para reuniones de equipo.', caption: 'Ideas que reúnen al equipo', illustrative: true, author: 'David Kristianto', source: 'https://unsplash.com/photos/6jpbs2ykacU' },
  { id: 'fiesta', src: '/images/fiesta-1280.webp', alt: 'Referencia ilustrativa en blanco y negro de personas celebrando bajo luces de escenario.', caption: 'Un momento para celebrar juntos', illustrative: true, author: 'Brooke Balentine', source: 'https://unsplash.com/photos/3Xbl9Rgf6hY' },
];
export const galleryPhotos: DesignPhoto[] = photos.length
  ? photos.slice(0, 30).map((photo, index) => ({ ...photo, id: `recinto-${index}`, illustrative: false }))
  : illustrativePhotos;
export const serviceReferences = [
  { number: '01', title: 'Espacios e instalaciones', description: 'Conversemos sobre el lugar y las necesidades de tu evento.', pending: 'Capacidades e instalaciones por confirmar' },
  { number: '02', title: 'Equipamiento y montaje', description: 'Cuéntanos qué necesitas para evaluar las opciones contigo.', pending: 'Equipamiento y prestaciones por confirmar' },
  { number: '03', title: 'Una visita al recinto', description: 'Solicita conocer el lugar antes de dar el siguiente paso.', pending: 'Fecha sujeta a coordinación con el equipo' },
];
