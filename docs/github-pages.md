# Publicación en GitHub Pages

Repositorio: https://github.com/bvasquezf/centro-eventos

Dirección del sitio: https://bvasquezf.github.io/centro-eventos/

El workflow `.github/workflows/deploy-pages.yml` verifica y publica el sitio cuando se hace push a `main`. GitHub Pages debe usar **GitHub Actions** como origen en Settings → Pages. El sitio es estático; Supabase sigue siendo el backend externo para Auth, datos y funciones.

## Rutas y recursos

Durante el workflow, `DEPLOY_TARGET=github-pages` activa `site` y `base` a partir de `GITHUB_REPOSITORY`. El resto de builds conserva la raíz `/`, incluido el desarrollo local y Netlify. No se fija el nombre de la cuenta en los componentes: el mismo flujo admite otro repositorio o una página de cuenta.

`src/lib/paths.ts` antepone la base a enlaces, fotografías, precargas de fuentes y destinos de recuperación de Auth. Las rutas externas y los fragmentos se conservan. Las fuentes CSS y los archivos de Astro reciben el prefijo desde Vite. La opción `trailingSlash: always` genera rutas compatibles con carpetas `index.html` de Pages.

Para comprobar exactamente la variante de Pages en local:

```sh
DEPLOY_TARGET=github-pages GITHUB_REPOSITORY=bvasquezf/centro-eventos npm run build
DEPLOY_TARGET=github-pages GITHUB_REPOSITORY=bvasquezf/centro-eventos npm run preview
```

Abrir la URL con `/centro-eventos/`. Para desarrollo habitual basta `npm run dev` y se conserva `/`.

## Configuración pública opcional

En Settings → Secrets and variables → Actions → Variables se pueden definir:

- `PUBLIC_SUPABASE_URL`.
- `PUBLIC_SUPABASE_ANON_KEY`: únicamente clave pública `anon` o publishable, nunca service role.
- `PUBLIC_GA4_ID`.

Si permanecen vacías, se publica la demostración identificada: el formulario no guarda ni envía solicitudes, el panel no autentica usuarios y no se carga GA4 sin una propiedad configurada y consentimiento. No hay cuentas de demostración con acceso simulado.

Los secretos `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `RATE_LIMIT_SECRET` y `RETRY_SECRET` permanecen exclusivamente en Supabase Functions; no se suben a Git ni se añaden al workflow de Pages.

Al conectar los servicios reales:

1. Aplicar las migraciones y desplegar las funciones siguiendo README.
2. Añadir `https://bvasquezf.github.io` a `ALLOWED_ORIGINS`. CORS utiliza el origen, sin la ruta del repositorio.
3. Permitir en Supabase Auth `https://bvasquezf.github.io/centro-eventos/panel/` y `https://bvasquezf.github.io/centro-eventos/panel/?recovery=1` como redirects. Ajustar Site URL para este sitio.
4. Crear los encargados autorizados, configurar correo y reintentos privados.
5. Desactivar Medición mejorada en GA4 según README y volver a ejecutar el workflow al cambiar variables públicas.

GitHub Pages no interpreta `netlify.toml`: sus cabeceras de Netlify no se aplican aquí. La protección de los datos sigue en RLS y las funciones, no en las cabeceras o la visibilidad del panel. El registro de cuentas permanece deshabilitado en la configuración prevista de Supabase.

## Comprobaciones previas a subir

- Tipos Astro/React: correctos.
- 24 pruebas correctas, incluidas tres nuevas para prefijos de rutas.
- Compilación habitual y variante de GitHub Pages: correctas.
- 272 enlaces y recursos del HTML compilado comprobados con `/centro-eventos/`.
- Las dos fuentes CSS apuntan a la ruta correcta del repositorio.
- La ruta de fixtures `revision-diseno` no se genera en producción.
- No se incluyen `node_modules`, `dist`, `.astro`, `.env` ni secretos del servidor.

Las fotografías siguen siendo ilustrativas y rotuladas. Completar los datos reales del centro antes de usar el sitio para recibir solicitudes reales.

Referencias oficiales: [Astro en GitHub Pages](https://docs.astro.build/en/guides/deploy/github/) y [configuración de origen de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).
