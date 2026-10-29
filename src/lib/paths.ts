/** Prefix same-origin root paths with Astro's deployment base, without changing external URLs or fragments. */
export function withBase(path: string, base = import.meta.env.BASE_URL): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  const prefix = '/' + base.split('/').filter(Boolean).join('/');
  if (prefix === '/') return path;
  if (path === prefix || path.startsWith(prefix + '/') || path.startsWith(prefix + '?') || path.startsWith(prefix + '#')) return path;
  return prefix + path;
}
/** Compare navigation entries using their root-relative route in every hosting environment. */
export function withoutBase(path: string, base = import.meta.env.BASE_URL): string {
  const prefix = '/' + base.split('/').filter(Boolean).join('/');
  if (prefix === '/') return path;
  if (path === prefix) return '/';
  return path.startsWith(prefix + '/') ? path.slice(prefix.length) : path;
}
