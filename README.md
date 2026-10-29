# Centro de Eventos [Nombre]

Base funcional local: cinco páginas públicas Astro, formulario y panel React, Tailwind, PostgreSQL/Auth/Edge Functions Supabase, notificaciones Resend y medición GA4 con consentimiento. Incluye publicación automática en GitHub Pages; los servicios reales se configuran por separado.

## Repositorio y GitHub Pages

- Código: https://github.com/bvasquezf/centro-eventos
- Web: https://bvasquezf.github.io/centro-eventos/

Cada push a `main` ejecuta las comprobaciones y publica mediante GitHub Actions. Ver [configuración de Pages](docs/github-pages.md). La versión sin variables de Supabase es una demostración claramente identificada, sin envío real de solicitudes.

## Ejecutar

Requiere Node **22.23.4 o superior** (probado con 24.14.1) y npm. El lockfile fija las versiones instaladas.

```sh
npm ci
cp .env.example .env
npm run dev
```

Abrir http://localhost:4321. Sin variables públicas de Supabase, el sitio funciona como **demostración identificada**: permite probar validaciones, muestra un error explícito al enviar y no inventa guardados, notificaciones, usuarios ni solicitudes. El panel no admite acceso ficticio. Para la vista estática compilada: `npm run build` y `npm run preview`.

## Arquitectura

- `src/pages`, `src/layouts`, `src/components/ui`, `src/styles`: presentación.
- `src/components/containers`: conecta las vistas con la lógica.
- `src/lib`: autenticación, datos, estado del panel y Analytics.
- `shared/request.ts`: contrato y validación compartidos entre cliente y servidor.
- `src/content/site.ts`: información tipada del centro, tres espacios provisionales y lista de hasta 30 fotos. Añadir solo fotografías reales autorizadas; la lista real empieza vacía y la interfaz muestra referencias ilustrativas rotuladas mientras no haya fotografías reales.
- `supabase/migrations`: esquema, índices, RLS, permisos, límite de dos encargados, ingreso atómico y cola técnica de notificaciones.
- `supabase/functions`: ingreso público y reintento privado; ninguna clave privilegiada llega al navegador.
- `tests`: pruebas del handler HTTP, entrega de correo y SQL real con PostgreSQL embebido PGlite. PGlite se usa solo al probar, nunca como backend de la web.

Guía para el siguiente diseñador: [docs/diseno-handoff.md](docs/diseno-handoff.md). Resultados y límites de las comprobaciones: [docs/verificacion.md](docs/verificacion.md).

## Revisar el diseño implementado

El rediseño conserva la lógica funcional y usa UI UX Pro Max. Ver [sistema visual y consultas](docs/diseno/sistema-visual.md), [recursos y licencias](docs/diseno/recursos.md), [contratos de interfaz](docs/diseno-handoff.md) y [verificación del diseño](docs/diseno/verificacion.md).

Para revisar la interfaz en un puerto independiente, incluso si otro servidor del proyecto sigue abierto:

```sh
npm run dev -- --ignore-lock --port 4322
```

Abrir la URL que muestra Astro, normalmente `http://localhost:4322`. Las cinco páginas están en `/`, `/espacios/`, `/eventos/`, `/galeria/` y `/contacto/`; el acceso real sigue en `/panel/`.

En desarrollo, `/revision-diseno/estados/` permite inspeccionar listado, detalle, carga, error, vacío, acceso y formulario con **datos ficticios**, sin sesión o envío real. Sus filtros y paginación operan solo sobre fixtures. La ruta no genera HTML en el build de producción. El panel real mantiene su autorización original y no usa fixtures.

Las fotografías ilustrativas están rotuladas y autoalojadas en variantes WebP, con fuentes locales. Sustituirlas por material autorizado del recinto antes de la entrega definitiva de contenido. No se agregaron dependencias ni se desplegó el sitio. Si se usa el puerto alternativo con servicios reales, agregar ese origen a la configuración privada de funciones; en demostración no se hacen envíos.

## Variables

| Variable | Dónde | Uso |
| --- | --- | --- |
| `PUBLIC_SUPABASE_URL` | `.env` local / Netlify, al compilar | URL del proyecto Supabase |
| `PUBLIC_SUPABASE_ANON_KEY` | `.env` local / Netlify, al compilar | Clave pública `anon` o publishable; nunca service role |
| `PUBLIC_GA4_ID` | `.env` / Netlify | ID `G-…`; vacío desactiva medición |
| `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` | Solo Edge Functions | Las inyecta Supabase; acceso de servidor |
| `ALLOWED_ORIGINS` | Secrets de Edge Functions | Orígenes exactos separados por coma, sin ruta ni barra final |
| `RATE_LIMIT_SECRET` | Secrets de Edge Functions | Secreto aleatorio de al menos 32 caracteres para HMAC |
| `RESEND_API_KEY` | Secrets de Edge Functions | API key de Resend con permiso de envío |
| `NOTIFICATION_FROM` | Secrets de Edge Functions | Remitente de dominio verificado, p. ej. `Centro <solicitudes@tu-dominio.cl>` |
| `NOTIFICATION_TO` | Secrets de Edge Functions | Buzón real del centro |
| `RETRY_SECRET` | Secrets de Edge Functions + programador privado | Secreto aleatorio de al menos 32 caracteres, exclusivo para reintentos |

`.env` y variantes están ignoradas. Crear secretos con el gestor de Supabase o un archivo local ignorado; no pegarlos en código, argumentos compartidos, logs o repositorio. El archivo `.env.example` es una plantilla y no contiene credenciales. Las variables `PUBLIC_*` se incrustan en el build; cambiar una requiere recompilar. Las claves públicas no conceden lectura: los permisos y RLS lo impiden.

## Supabase: desarrollo local y migraciones

Instalar la CLI oficial y Docker para usar el stack local. Este proyecto no incluye esos binarios.

```sh
supabase start
supabase db reset
supabase functions serve --env-file .env
```

`db reset` recrea **solo el stack local** y borra sus datos: usarlo exclusivamente en desarrollo. Copiar URL y clave pública de `supabase status` a `.env`. En local, las claves de servidor las inyecta el runtime. Si usas `127.0.0.1:4321` en vez de `localhost:4321`, añadir ese origen a `ALLOWED_ORIGINS`.

Para preparar un proyecto remoto de staging, iniciar sesión con la CLI, vincularlo y aplicar las migraciones:

```sh
supabase login
supabase link --project-ref TU_REFERENCIA_DE_STAGING
supabase db push
supabase secrets set --env-file .env
supabase functions deploy submit-request
supabase functions deploy retry-notifications
```

Usar preferentemente un archivo ignorado exclusivo de secretos de funciones, en vez de `.env`, para no subir variables públicas innecesarias. Los comandos de despliegue son instrucciones para más adelante: **no se ejecutaron**. Las funciones tienen `verify_jwt = false` por motivos diferentes: el ingreso es público y no proporciona lectura; el reintento exige su propio Bearer `RETRY_SECRET`. No cambiar esa autenticación ni exponer el secreto en el frontend.

### Encargados y autenticación

1. Desactivar el registro público en Supabase Auth, incluido cualquier proveedor social no utilizado. `supabase/config.toml` lo desactiva para el stack local; en un proyecto alojado configurar también el Dashboard.
2. Crear o invitar manualmente hasta dos usuarios desde Supabase Auth. No hay pantalla ni llamada de registro en la web.
3. Añadir sus UUID desde el SQL Editor administrativo (sustituir los marcadores):

```sql
insert into public.managers(slot, user_id) values
  (1, 'UUID_DEL_PRIMER_ENCARGADO'),
  (2, 'UUID_DEL_SEGUNDO_ENCARGADO');
```

La restricción de slots 1/2 impide un tercero. Ambos tienen idéntico permiso de lectura, sin edición, borrado o facultad para autorizar usuarios. Para revocar acceso, retirar su fila de `managers` desde una sesión administrativa. RLS comprueba la autorización en cada consulta, sin confiar en ocultar el panel.

4. En Auth URL Configuration configurar Site URL con el dominio HTTPS definitivo y permitir exactamente `https://TU_DOMINIO/panel/` y `https://TU_DOMINIO/panel/?recovery=1`. Añadir el dominio de staging solo mientras se use; evitar comodines amplios.
5. Configurar SMTP de producción en Supabase Auth, remitente/dominio y plantillas de invitación/recuperación. El correo de Auth es independiente de la API Resend que usa la función de solicitudes. Si se usa Resend para SMTP de Auth, configurar también sus credenciales SMTP en Auth.
6. La recuperación redirige a `/panel/?recovery=1`; una sesión de recuperación válida permite cambiar la contraseña (mínimo 12 caracteres), cierra sesión y pide iniciar de nuevo. Establecer en Auth una política equivalente o más exigente. Probar invitación, enlace vencido, cambio, salida y revocación en staging antes de publicar.

## Ingreso, antispam y notificaciones

`POST /functions/v1/submit-request` admite JSON del contrato `shared/request.ts`. Rechaza métodos de lectura, origen no permitido, JSON inválido, cuerpo mayor de 16 KB, campos incorrectos y honeypot no vacío. Valida en cliente y servidor. No devuelve registros ni permite consultarlos.

La transacción `accept_request` limita **5 intentos válidos por huella en 15 minutos** y **60 globales en 15 minutos**, guarda la solicitud y crea su trabajo de correo juntos. Los reintentos también consumen cuota. El techo global es independiente de las cabeceras de IP y evita que rotarlas eluda toda la protección. La cuota por IP es complementaria: depende de la normalización del gateway. Se prefiere `CF-Connecting-IP` y, en su ausencia, `X-Forwarded-For`; comprobar esa normalización en la infraestructura elegida antes de confiar en esa cuota individual. Sin cabecera disponible se rechaza el ingreso. Solo se almacena HMAC, no IP cruda; las huellas antiguas se purgan durante ingresos posteriores. Los límites son conservadores para esta base y se ajustan en la migración según el volumen real.

El UUID generado en el cliente se conserva durante los reintentos de ese formulario. La base impide duplicar la fila o el trabajo. Reutilizar el UUID con contenido diferente devuelve conflicto y no modifica el original; el usuario puede restaurar los datos o iniciar una nueva solicitud recargando. Recargar o abrir otro formulario genera un ingreso nuevo intencional: no se deduplican personas por correo.

Primero se confirma PostgreSQL y después se intenta Resend. Un error de correo mantiene el éxito **de guardado**, conserva la fila y marca el trabajo `failed`, con un código técnico sanitizado. No se registran cuerpos, correos, teléfonos ni respuestas completas del proveedor. La notificación incluye solo una referencia, para que el encargado consulte el panel protegido. La respuesta pública no expone IDs ni fallos internos de correo.

### Reintentos operativos

Configurar un programador privado (p. ej., Supabase Cron con secreto en Vault) que haga **cada minuto** un POST a:

```text
https://TU_REFERENCIA.supabase.co/functions/v1/retry-notifications
Authorization: Bearer <RETRY_SECRET almacenado de forma privada>
```

No enviar este secreto desde el navegador. El worker toma un trabajo por llamada, usa `FOR UPDATE SKIP LOCKED` y un lease de dos minutos. Un envío interrumpido puede recuperarse al vencer el lease. `Idempotency-Key: request/<uuid>` mantiene la misma clave al reintentar en Resend; el payload debe mantenerse estable durante ese ciclo.

Resend conserva sus claves de idempotencia **24 horas**. Los reintentos automáticos se detienen a las **23 horas** y pasan a `review` para evitar un duplicado después de expirar esa garantía. Los encargados no gestionan estos estados en el panel: son estados técnicos, no comerciales. Un operador puede revisar la cola con el SQL Editor administrativo, sin añadir un CRM:

```sql
select request_id, state, attempts, last_error, created_at, sent_at
from public.notification_jobs
where state <> 'sent'
order by created_at;
```

Para `review`, comprobar primero los registros del proveedor. Si no consta entrega y el destinatario confirma no haberla recibido, un operador puede organizar una nueva notificación de forma controlada. No reabrir automáticamente trabajos vencidos ni volver a insertar contactos. Si se cambia destinatario/remitente en un trabajo ya intentado, revisar el conflicto de idempotencia antes de reintentarlo.

### Dominio Resend

Dar de alta un dominio de envío propio, publicar los registros DNS SPF y DKIM indicados por Resend y comprobar su verificación. Configurar DMARC de acuerdo con la política del dominio y revisar alineación con el remitente. Usar ese dominio en `NOTIFICATION_FROM`, cargar `RESEND_API_KEY` y probar la recepción real en el buzón configurado. Los remitentes de prueba de Resend no sustituyen un dominio propio de producción.

## GA4 y consentimiento

Modo de consentimiento **básico**: hasta aceptar no se carga Google, no hay eventos, ni pings sin consentimiento. Aceptar activa `page_view` por carga de página; rechazar permite usar el sitio normalmente. Se puede cambiar o retirar la aceptación desde el pie público; al retirarla se deniega la medición, se eliminan cookies `_ga*` accesibles y se recarga para descargar el script. La decisión se guarda en almacenamiento local. El panel nunca carga Analytics.

En el flujo web de GA4 **desactivar Medición mejorada completa**, especialmente interacción con formularios y clics salientes. No añadir Google Tag Manager ni etiquetado automático sobre los campos. El código emite únicamente `page_view`, `solicitud_enviada` (solo después de confirmar guardado, con `tipo_solicitud`) y `whatsapp_click` (independiente, sin URL ni teléfono). Las URL enviadas eliminan query y fragmento; se omite el referrer. No se envían nombres, correos, teléfonos, mensajes ni UUID de solicitudes. Configurar en GA4 la retención y las preferencias de privacidad definitivas del centro. Las estadísticas se consultan en Google Analytics, sin dashboard propio.

## Netlify (alternativa de hosting)

`netlify.toml` prepara build estático `npm run build`, carpeta `dist`, Node 24 y cabeceras de seguridad. No necesita un adaptador SSR: las páginas son estáticas y la lógica privada vive en Supabase con RLS. No configurar un fallback SPA a `index.html`, porque hay rutas reales generadas por Astro.

Cuando se autorice la publicación: vincular el repositorio en Netlify, configurar solo `PUBLIC_*`, conectar dominio HTTPS, ajustar orígenes de funciones y URLs de Auth, migrar/desplegar Supabase y activar el worker de reintentos. Si se usan dominios personalizados de Supabase, adaptar `connect-src` de la CSP. No habilitar automáticamente todos los deploy previews como orígenes/redirects de autenticación.

Antes de publicar completar nombre, dirección, contactos, fotos, capacidades y servicios confirmados, responsable de datos y política de conservación. Confirmar formularios y acceso con usuarios reales de staging, fallo/reintento de Resend y medición/consentimiento en GA4. Esas comprobaciones externas requieren servicios configurados y no se sustituyen por las pruebas locales.

## Verificación

```sh
npm run check
npm test
npm run build
# Todo lo anterior:
npm run verify
# Si Deno está instalado:
deno check supabase/functions/submit-request/index.ts supabase/functions/retry-notifications/index.ts
```

Para entornos restringidos o para no enviar telemetría del framework: anteponer `ASTRO_TELEMETRY_DISABLED=1`. Las pruebas no envían correos ni contactan Supabase; incluyen SQL con roles, RLS y funciones de la migración. La autenticación HTTP real de Supabase, DNS, recepción del correo, programación de reintentos y eventos reales de GA4 quedan pendientes de staging.

## Referencias verificadas

Compatibilidad e integración: [Astro React](https://docs.astro.build/en/guides/integrations-guide/react/), [Tailwind en Astro](https://docs.astro.build/en/guides/styling/#tailwind). Seguridad de funciones: [Supabase](https://supabase.com/docs/guides/functions/auth). Ventana de deduplicación: [Resend](https://resend.com/docs/dashboard/emails/idempotency-keys). Las versiones efectivas están en `package-lock.json`; la instalación final pasa `npm audit` sin vulnerabilidades conocidas en la comprobación realizada.
