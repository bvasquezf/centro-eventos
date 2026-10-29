// Basic consent: no Google request, cookie or event before explicit acceptance.
type Consent = 'accepted' | 'rejected';
declare global { interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void } }
const id = import.meta.env.PUBLIC_GA4_ID;
const key = 'eventos.analytics-consent';
export function getConsent(): Consent | null {
  try { const value = localStorage.getItem(key); return value === 'accepted' || value === 'rejected' ? value : null; } catch { return null; }
}
function analyticsId() { return typeof id === 'string' && /^G-[A-Z0-9]+$/.test(id) ? id : null; }
export function activateAnalytics() {
  const measurement = analyticsId();
  if (!measurement || getConsent() !== 'accepted' || window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer!.push(arguments); };
  window.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  window.gtag('js', new Date());
  // Strip query/hash (including recovery tokens). No enhanced automatic form/outbound tracking.
  window.gtag('config', measurement, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false });
  window.gtag('event', 'page_view', { page_location: location.origin + location.pathname, page_title: document.title, page_referrer: '' });
  const script = document.createElement('script'); script.id = 'ga4-loader'; script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurement}`; document.head.append(script);
}
export function setConsent(value: Consent) {
  try { localStorage.setItem(key, value); } catch { return; }
  if (value === 'accepted') activateAnalytics();
  else {
    window.gtag?.('consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    // Clear GA cookies at host and parent domain scopes, then reload to unload Google.
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.split('=')[0].trim(); if (!/^_ga($|_)/.test(name)) continue;
      const parts = location.hostname.split('.');
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
      for (let i = 0; i < parts.length - 1; i++) document.cookie = `${name}=; Max-Age=0; path=/; domain=.${parts.slice(i).join('.')}; SameSite=Lax`;
    }
    if (window.gtag) location.reload();
  }
}
export function trackRequest(type: 'cotizacion' | 'visita') {
  if (getConsent() === 'accepted') window.gtag?.('event', 'solicitud_enviada', { tipo_solicitud: type });
}
export function trackWhatsApp() {
  if (getConsent() === 'accepted') window.gtag?.('event', 'whatsapp_click');
}
