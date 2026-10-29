import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
const pages = process.env.DEPLOY_TARGET === 'github-pages';
const [owner, repository] = (process.env.GITHUB_REPOSITORY || '').split('/');
if (pages && (!owner || !repository)) throw new Error('GitHub Pages requiere GITHUB_REPOSITORY=propietario/repositorio.');
const isAccountSite = repository?.toLowerCase() === `${owner?.toLowerCase()}.github.io`;
export default defineConfig({
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
  output: 'static',
  site: pages ? `https://${owner.toLowerCase()}.github.io` : undefined,
  base: pages && !isAccountSite ? `/${repository}/` : '/',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
});
