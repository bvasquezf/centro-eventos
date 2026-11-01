/** Scroll follows the native document position. No wheel/touch interception or timers. */
const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const root = document.querySelector<HTMLElement>('.immersive-main');
if (root) {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce), (max-height: 620px)');
  const scenes = Array.from(root.querySelectorAll<HTMLElement>('[data-scroll-scene]'));
  const manifesto = root.querySelector<HTMLElement>('[data-manifesto]');
  const words = Array.from(root.querySelectorAll<HTMLElement>('.manifesto-word'));
  const chapterScene = root.querySelector<HTMLElement>('[data-scroll-scene="occasions"]');
  const chapters = Array.from(root.querySelectorAll<HTMLElement>('[data-chapter]'));
  const choices = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-scene-target]'));
  let frame = 0;
  let headerHeight = 72;
  let selected = -1;
  const activeScenes = new Set<HTMLElement>();

  function setChapter(index: number) {
    if (index === selected) return;
    selected = index;
    chapters.forEach((chapter, i) => {
      chapter.dataset.active = String(i === index);
      chapter.inert = i !== index;
      chapter.setAttribute('aria-hidden', String(i !== index));
    });
    choices.forEach((choice,i) => choice.setAttribute('aria-pressed', String(i === index)));
  }

  function render() {
    frame = 0;
    if (preference.matches || document.hidden) return;
    const viewport = window.innerHeight;
    for (const scene of activeScenes) {
      const rect = scene.getBoundingClientRect();
      const progress = clamp((headerHeight - rect.top) / Math.max(1, rect.height - viewport + headerHeight));
      if (scene.dataset.scrollScene === 'hero') {
        scene.style.setProperty('--image-travel', `${(1 - clamp(progress / .55)) * 55}%`);
        scene.style.setProperty('--image-scale', String(.84 + .16 * clamp(progress / .55)));
        scene.style.setProperty('--image-radius', `${32 * (1 - clamp(progress / .55))}px`);
        scene.style.setProperty('--intro-opacity', String(1 - clamp(progress / .24)));
        scene.style.setProperty('--intro-travel', `${-80 * clamp(progress / .3)}px`);
        scene.style.setProperty('--arrival-opacity', String(clamp((progress - .5) / .2)));
        scene.style.setProperty('--arrival-travel', `${24 * (1 - clamp((progress - .5) / .2))}px`);
        // Hidden links must never remain in the keyboard order beneath the photograph.
        const intro = scene.querySelector<HTMLElement>('.experience-intro');
        const arrival = scene.querySelector<HTMLElement>('.hero-arrival');
        if (intro) intro.inert = progress > .25;
        if (arrival) arrival.inert = progress < .5;
      } else {
        const phase = progress * (chapters.length - 1);
        chapters.forEach((chapter,index) => chapter.style.setProperty('--chapter-weight', String(clamp(1 - Math.abs(phase - index)))));
        setChapter(Math.round(phase));
      }
    }
    if (manifesto) {
      const rect = manifesto.getBoundingClientRect();
      if (rect.top < viewport && rect.bottom > 0) {
        const read = clamp((viewport * .9 - rect.top) / Math.max(1, rect.height * .85));
        words.forEach((word,index) => word.style.setProperty('--word-light', String(.24 + .76 * clamp(read * (words.length + 4) - index))));
      }
    }
  }

  function schedule() {
    if (!frame && !preference.matches && !document.hidden) frame = window.requestAnimationFrame(render);
  }

  function measure() {
    headerHeight = document.querySelector('.site-header')?.getBoundingClientRect().height ?? 72;
    root!.style.setProperty('--header-height', `${headerHeight}px`);
    schedule();
  }

  function configure() {
    root!.classList.toggle('motion-ready', !preference.matches);
    if (preference.matches) {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      chapters.forEach(chapter => { chapter.inert = false; chapter.removeAttribute('aria-hidden'); });
      root!.querySelectorAll<HTMLElement>('.experience-intro,.hero-arrival').forEach(element => { element.inert = false; });
      selected = -1;
    } else {
      measure();
      scenes.forEach(scene => activeScenes.add(scene));
      render();
    }
  }

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const element = entry.target as HTMLElement;
      if (entry.isIntersecting) activeScenes.add(element);
      else activeScenes.delete(element);
    }
    schedule();
  }, { rootMargin: '150px 0px' });
  scenes.forEach(scene => observer.observe(scene));
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && frame) { window.cancelAnimationFrame(frame); frame = 0; }
    else schedule();
  });
  preference.addEventListener('change', configure);
  choices.forEach((choice,index) => choice.addEventListener('click', () => {
    if (!chapterScene || preference.matches) return;
    const rect = chapterScene.getBoundingClientRect();
    const range = rect.height - window.innerHeight + headerHeight;
    const progress = .04 + .92 * index / Math.max(1, chapters.length - 1);
    window.scrollTo({ top: window.scrollY + rect.top - headerHeight + range * progress, behavior: 'smooth' });
  }));
  configure();
  document.fonts.ready.then(measure);
  window.addEventListener('pagehide', () => { observer.disconnect(); if (frame) window.cancelAnimationFrame(frame); }, { once: true });
}
