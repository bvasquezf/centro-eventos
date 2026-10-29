import { site } from '../../content/site';
import { trackWhatsApp } from '../../lib/analytics';
export default function WhatsApp() {
  return /^\d{8,15}$/.test(site.whatsapp) ? <a className="button secondary" href={`https://wa.me/${site.whatsapp}`} onClick={trackWhatsApp} target="_blank" rel="noopener noreferrer">Consultar por WhatsApp ↗</a> : <p className="muted">WhatsApp · [Número pendiente]</p>;
}
