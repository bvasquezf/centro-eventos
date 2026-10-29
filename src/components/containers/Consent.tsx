import { useEffect, useState } from 'react';
import { activateAnalytics, getConsent, setConsent } from '../../lib/analytics';
export default function Consent() {
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(!getConsent()); activateAnalytics(); }, []);
  const choose = (accepted: boolean) => { setConsent(accepted ? 'accepted' : 'rejected'); setOpen(false); };
  return <><button className="text-button" onClick={() => setOpen(true)}>Preferencias de medición</button>{open && <section className="consent surface" aria-label="Preferencias de privacidad"><h2>Tu privacidad</h2><p>Con tu permiso usamos Google Analytics para medir visitas, solicitudes enviadas y clics en WhatsApp. El formulario funciona sin aceptar.</p><div className="actions"><button onClick={() => choose(true)}>Aceptar medición</button><button className="secondary" onClick={() => choose(false)}>Rechazar medición</button></div></section>}</>;
}
