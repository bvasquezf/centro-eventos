import test from 'node:test';
import assert from 'node:assert/strict';
import { withBase, withoutBase } from '../src/lib/paths';
test('project-site routes, assets and recovery URLs stay inside the repository', () => {
  const base = '/centro-eventos/';
  for (const path of ['/', '/contacto/#formulario', '/panel/?recovery=1', '/images/mesa-640.webp', '/fonts/inter-latin.woff2']) assert.equal(withBase(path, base), '/centro-eventos' + path);
  assert.equal(withBase('/centro-eventos/contacto/', base), '/centro-eventos/contacto/');
  assert.equal(withBase('/centro-eventos-otro/', base), '/centro-eventos/centro-eventos-otro/');
});
test('root hosting, external URLs and fragment links remain valid', () => {
  assert.equal(withBase('/panel/', '/'), '/panel/');
  for (const path of ['https://wa.me/123', '//example.com/image.webp', '#privacidad', 'mailto:example@example.com']) assert.equal(withBase(path, '/centro-eventos/'), path);
});
test('navigation strips only its own base path boundary', () => {
  assert.equal(withoutBase('/centro-eventos/espacios/', '/centro-eventos/'), '/espacios/');
  assert.equal(withoutBase('/centro-eventos/', '/centro-eventos/'), '/');
  assert.equal(withoutBase('/centro-eventos-otro/', '/centro-eventos/'), '/centro-eventos-otro/');
  assert.equal(withoutBase('/espacios/', '/'), '/espacios/');
});
