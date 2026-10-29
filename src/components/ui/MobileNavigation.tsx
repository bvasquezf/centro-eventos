import { withBase } from '../../lib/paths';
import { useRef } from 'react';
import { containDialogFocus } from './dialogFocus';
import { navigation } from '../../content/site';
export default function MobileNavigation({ currentPath }: { currentPath: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return <div className="mobile-navigation"><button className="menu-toggle secondary" aria-label="Abrir menú de navegación" aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}><span>Menú</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16M4 16h16" /></svg></button><dialog ref={dialog} className="menu-dialog" onKeyDown={containDialogFocus} aria-label="Menú de navegación" onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}><div className="menu-top"><span className="eyebrow">Centro de eventos</span><button className="icon-button secondary" aria-label="Cerrar menú" onClick={() => dialog.current?.close()}>×</button></div><nav aria-label="Navegación móvil">{navigation.map(([href, label], index) => <a key={href} href={withBase(href)} aria-current={currentPath === href ? 'page' : undefined}><span className="small">0{index + 1}</span>{label}<span aria-hidden="true">↗</span></a>)}</nav><p className="muted small">Fiestas y encuentros corporativos.<br />Tu próxima idea empieza aquí.</p></dialog></div>;
}
