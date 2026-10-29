import { withBase } from '../../lib/paths';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { containDialogFocus } from './dialogFocus';
import type { DesignPhoto } from '../../content/design';
export default function Gallery({ photos }: { photos: DesignPhoto[] }) {
  const [active, setActive] = useState(0); const dialog = useRef<HTMLDialogElement>(null);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]); const opened = useRef(0);
  const image = photos[active];
  useEffect(() => {
    const element = dialog.current;
    const close = () => triggers.current[opened.current]?.focus();
    element?.addEventListener('close', close); return () => element?.removeEventListener('close', close);
  }, []);
  if (!photos.length) return <p className="notice">Las fotografías del recinto estarán disponibles próximamente.</p>;
  function open(index: number) { opened.current = index; setActive(index); dialog.current?.showModal(); }
  function step(delta: number) { setActive(old => (old + delta + photos.length) % photos.length); }
  function onKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    containDialogFocus(event);
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); step(event.key === 'ArrowRight' ? 1 : -1); }
  }
  return <><div className="gallery-grid">{photos.slice(0, 30).map((photo, index) => <figure key={photo.id}><button className="gallery-trigger" ref={element => { triggers.current[index] = element; }} onClick={() => open(index)} aria-label={`Ampliar: ${photo.caption}`} aria-haspopup="dialog"><img src={withBase(photo.illustrative ? `/images/${photo.id}-640.webp` : photo.src)} srcSet={photo.illustrative ? `${withBase(`/images/${photo.id}-640.webp`)} 640w, ${withBase(`/images/${photo.id}-1280.webp`)} 1280w` : undefined} sizes="(min-width: 1000px) 45vw, 100vw" width="1280" height="900" alt={photo.alt} loading="lazy" decoding="async" /><span className="zoom-hint" aria-hidden="true">↗</span></button><figcaption><span>{photo.caption}</span><span className="photo-note">{photo.illustrative ? 'Fotografía ilustrativa · no corresponde al recinto.' : 'Fotografía del recinto'}</span></figcaption></figure>)}</div><dialog className="lightbox" ref={dialog} aria-label="Fotografía ampliada" onKeyDown={onKeyDown} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}><div className="lightbox-inner"><div className="lightbox-top"><span className="small">Galería / {String(active + 1).padStart(2, '0')}</span><button className="icon-button light" onClick={() => dialog.current?.close()} aria-label="Cerrar fotografía">×</button></div><img key={image.id} className="lightbox-image" src={withBase(image.illustrative ? `/images/${image.id}-1920.webp` : image.src)} alt={image.alt} width="1920" height="1280" /><div className="lightbox-bottom"><div aria-live="polite" aria-atomic="true"><p>{image.caption} · {active + 1} de {photos.length}</p><p className="small">{image.illustrative ? 'Ilustrativa. No corresponde al recinto. ' : ''}{image.author && <a href={image.source} target="_blank" rel="noreferrer">Foto: {image.author} / Unsplash ↗</a>}</p></div><div className="actions"><button className="icon-button light" aria-label="Fotografía anterior" onClick={() => step(-1)}>←</button><button className="icon-button light" aria-label="Fotografía siguiente" onClick={() => step(1)}>→</button></div></div></div></dialog></>;
}
