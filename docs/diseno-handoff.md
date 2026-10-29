# Handoff de diseño para Gemini

El proyecto contiene una base ejecutable y sencilla. Rediseñar la presentación conservando los contratos y los mecanismos de seguridad. No publicar como parte de este handoff.

## Estructura y responsabilidad

```text
src/
  pages/                 Composición de las cinco páginas públicas y panel
  layouts/Base.astro     Documento, navegación, pie y montaje del consentimiento
  components/ui/         Vistas React: formulario y panel
  components/containers/ Conexión entre vistas y lógica, consentimiento y WhatsApp
  styles/global.css      Tokens, Tailwind y clases de presentación
  content/site.ts        Contenido inicial tipado, marcadores y fotos
  lib/                   Datos, Auth, estado del panel y Analytics
shared/request.ts        Contrato y validación única cliente/servidor
supabase/
  migrations/            Tablas, permisos, RLS, límites y cola
  functions/             HTTP público, cola, notificaciones y worker privado
  config.toml            Auth sin registro y configuración de funciones
tests/                   Handler, entrega y PostgreSQL con RLS
docs/                    Configuración y handoff
```

## Archivos que puede modificar Gemini

- `src/styles/global.css`: colores, tipografía, espacios, responsive y componentes. Los tokens actuales son `--color-ink`, `--color-paper`, `--color-accent`, `--border`, `--muted`, `--error`. Tailwind se importa aquí mediante su plugin Vite.
- `src/components/ui/RequestFormView.tsx` y `PanelView.tsx`: estructura y apariencia, preservando props, labels, nombres de campos, eventos y estados.
- `src/pages/*.astro` y `src/layouts/Base.astro`: composición visual y navegación. Mantener todas las rutas, `privatePage`, `noscript`, `client:*`, montaje de islas y ausencia de Analytics en panel.
- `public/`: favicon y fotografías reales proporcionadas/autorizadas. No reemplazar las fotos del recinto por imágenes generadas o ajenas presentadas como reales.
- `src/content/site.ts`: texto y datos **solo cuando el centro confirme los datos pendientes**. Conservar tipos, hasta tres espacios y treinta fotos. Mantener los avisos de fecha sujeta a confirmación y ausencia de reserva.

Los marcadores son deliberados: no inventar aforo, servicios, empresas clientes, testimonios, dirección o contactos. El diseño puede mejorar el estado vacío de la galería; no necesita rellenarla con contenido ficticio.

## Lógica que debe preservar

- `shared/request.ts`.
- `src/lib/*`, en particular `auth.ts`, `requests.ts`, `usePanel.ts` y `analytics.ts`.
- Los controladores de `src/components/containers/*`. Para rediseñar consentimiento o WhatsApp, extraer una vista de presentación manteniendo las llamadas y la semántica existentes.
- `supabase/**` y `tests/**`.
- La configuración de dependencias, TypeScript, Astro y Netlify salvo necesidad técnica demostrada y verificada. No añadir claves, un backend alternativo o llamadas directas de escritura a tablas desde el navegador.

La separación es funcional: una vista solo recibe datos y despacha eventos; la validación, Auth, acceso a Supabase y medición permanecen fuera. El estado local de `PanelView` solo alterna visualmente entre login y recuperación.

## Contrato del formulario

Contenedor: `RequestForm`. Vista: `RequestFormView`.

| Prop | Tipo | Responsabilidad |
| --- | --- | --- |
| `status` | `idle \| sending \| success \| error` | Estado de la operación |
| `errors` | `FieldErrors` | Mensajes por campo, asociados mediante `aria-describedby` |
| `message` | `string` | Estado global accesible; `alert` en error |
| `demo` | `boolean` | Aviso visible de falta de conexión real |
| `onSubmit` | `(SubmitEvent<HTMLFormElement>) => void` | Entregar el submit al contenedor, sin hacer fetch en la vista |

Los controles deben mantener los `name`: `request_type`, `name`, `company`, `email`, `phone`, `event_type`, `tentative_date`, `attendees`, `message`, `website`. `website` es un honeypot, oculto visualmente y fuera del tabulador. La solicitud usa `cotizacion` o `visita`; `attendees` se convierte a entero en el contenedor. El UUID se genera y conserva en el controlador, nunca en la vista. No implementar una respuesta de éxito por temporizador.

Estados visuales obligatorios: inicial, campos inválidos, foco en el primer error, envío bloqueado para evitar doble submit, guardado confirmado, error de red/servidor, cuota excedida, conflicto de reintento y demostración sin conexión. El éxito significa **guardado**, no correo entregado ni fecha reservada. Mantener el aviso antes de enviar.

## Contrato del panel

Contenedor `Panel` → hook `usePanel` → vista `PanelView`, con `PanelContract` exportado en `src/lib/usePanel.ts`.

| Prop / evento | Contrato |
| --- | --- |
| `access` | `loading \| login \| authorized \| denied \| recovery` |
| `rows`, `count`, `pageSize` | Datos de la página actual, total y tamaño de página (10) |
| `selected` | `RequestRecord \| null`, detalle seleccionado |
| `filters` | `{from, to, type, page}`; fechas de recepción en UTC, página base cero |
| `loading`, `loadError` | Estado independiente de consulta |
| `busy`, `message`, `demo` | Estado de Auth y feedback visible |
| `onAuth(event, action)` | Acción `login`, `recover` o `password`; conservar `name=email/password` |
| `logout()` | Cierre de sesión y limpieza de datos |
| `filter(key, value)` | `from`, `to` o `type`; reinicia la página a cero |
| `page(index)` | Página base cero |
| `select(recordOrNull)` | Abrir/cerrar detalle |
| `retry()` | Recargar una consulta fallida |

Diseñar: comprobación de acceso, login, recuperación por correo, nueva contraseña, error, cuenta sin permisos, sesión cerrada, carga de listado, listado vacío, resultados filtrados, paginación deshabilitada en extremos y detalle. No renderizar filas privadas antes de autorización. No añadir registro, CRM, estados comerciales, reservas, pagos, exportación o edición de contenido. Las fechas de recepción del listado se presentan en `America/Santiago`; la fecha tentativa se conserva como fecha de calendario.

## Medición y consentimiento

Conservar `activateAnalytics`, `getConsent`, `setConsent`, `trackRequest` y `trackWhatsApp`. `solicitud_enviada` solo se emite desde el controlador después de respuesta `saved: true`; los rediseños no deben emitirlo al pulsar el botón. WhatsApp usa un evento independiente. No pasar el objeto formulario ni datos personales a eventos, URLs, logs o atributos de seguimiento.

El consentimiento tiene aceptar/rechazar con opciones igualmente claras y una vía de cambio en el pie. Antes de aceptar no se debe montar un script Google ni cargar fuentes externas de Google por conveniencia visual. Fuentes de sistema o autoalojadas evitan dependencia de terceros antes del consentimiento. No añadir tracking al panel. Desactivar la Medición mejorada en la configuración externa de GA4 (README).

## Accesibilidad y responsive

Mantener `lang=es`, enlace de salto, jerarquía de títulos, labels visibles, ayudas vinculadas al campo, regiones de estado y navegación con `aria-current`. Contraste de texto suficiente, foco visible, controles de al menos 44 px y estados distinguibles sin depender solo de color. Respetar `prefers-reduced-motion`. Comprobar 375, 768 y escritorio, sin scroll horizontal; mantener contenido largo y mensajes del usuario con salto de línea seguro. React debe seguir escapando texto: no usar `dangerouslySetInnerHTML` para solicitudes.

## Ejecutar y verificar

```sh
npm ci
npm run dev
npm run verify
# Si está instalado:
deno check supabase/functions/submit-request/index.ts supabase/functions/retry-notifications/index.ts
```

`npm run verify` incluye tipos Astro/React, pruebas HTTP/SQL/Resend simulado y compilación estática. Para desactivar telemetría del framework: `ASTRO_TELEMETRY_DISABLED=1 npm run verify`. Ver `README.md` para Supabase local y staging. Las pruebas locales no necesitan secretos ni enviarán correos reales.

Probar otra vez en navegador después del rediseño: navegación de las cinco páginas, teclado, campos vacíos e inválidos, envío válido en demo con error explícito, consentimiento y rechazo persistente, login/recuperación, responsive y listado/detalle al conectar staging. La validación funcional y los límites externos se detallan en `docs/verificacion.md`.

## Actualización: interfaz implementada

El rediseño aplica el encargo UX/UI posterior. Se conserva el contrato funcional anterior y se permiten fotografías **ilustrativas claramente rotuladas**, separadas del contenido real. Esta sección actualiza la restricción anterior sobre imágenes de referencia; no autoriza a presentarlas como imágenes reales del recinto.

Sistema visual y consultas de UI UX Pro Max: [diseno/sistema-visual.md](diseno/sistema-visual.md). Procedencia de fotos y fuentes: [diseno/recursos.md](diseno/recursos.md). Resultados de navegador y capturas: [diseno/verificacion.md](diseno/verificacion.md).

### Nuevos componentes de presentación

| Componente | Props / eventos | Comportamiento |
| --- | --- | --- |
| `PhotoFrame.astro` | `photo: DesignPhoto`, `eager?: boolean`, `class?: string`, `sizes?: string`, `caption?: boolean` | Reserva aspecto, carga diferida salvo portada, srcset WebP. Identifica las fotografías ilustrativas |
| `VisitCta.astro` | Sin props | Invitación a visitar; enlaza al formulario existente |
| `MobileNavigation.tsx` | `currentPath: string` | Menú en diálogo nativo; Escape, foco contenido y retorno al botón; enlaces de la navegación tipada existente |
| `Gallery.tsx` | `photos: DesignPhoto[]` | Cuadrícula y ampliación; botón abre imagen; flechas y botones anterior/siguiente; Escape o cerrar; retorno al disparador original |
| `DesignPreview.tsx` | Sin props | Selector de estados y fixtures ficticios. No importa servicios ni hooks de Auth en runtime |

`DesignPhoto` se define en `src/content/design.ts` y extiende `Photo` con `id`, `illustrative`, `author?` y `source?`. `galleryPhotos` escoge fotos reales si están configuradas; si no, referencias ilustrativas de `illustrativePhotos`. No modificar esa distinción al reemplazar recursos.

### Contratos conservados

`RequestFormViewProps` sigue teniendo exactamente `status`, `errors`, `message`, `demo` y `onSubmit`. Los diez nombres de controles y su honeypot permanecen iguales. La vista agrupa contacto y evento en fieldsets, bloquea controles durante envío y muestra los avisos y mensajes del controlador. El aviso solicitado aparece literalmente: “La fecha solicitada está sujeta a disponibilidad y confirmación del centro”.

`PanelView` sigue recibiendo `PanelContract` de `usePanel` sin cambiar el hook. Presenta filas como tabla en escritorio y composición compacta en móvil, con filtros y paginación existentes. Abrir un detalle mueve el foco a su título; cerrarlo devuelve el foco al botón de esa fila. No se agregaron estados comerciales ni acciones sobre los datos.

Los controladores de formulario, panel, WhatsApp y consentimiento no se editaron. Tampoco se editaron `src/lib`, `shared`, `supabase`, variables de entorno o dependencias. El consentimiento solo recibe el estilo global de superficie en el pie: su lógica, decisiones y activación permanecen intactas. No se carga Analytics en las vistas privadas o de revisión.

### Revisar estados sin servicios

Con `npm run dev`, abrir **`/revision-diseno/estados/`**. La ruta dinámica devuelve paths únicamente en `import.meta.env.DEV`, por lo que no genera HTML en `npm run build`. Usa solo `src/fixtures/design.ts`, sin lecturas ni escrituras de Supabase. La muestra permanece rotulada como ficticia; “Cerrar sesión” e “Ingresar” solo muestran un aviso de que no se ejecutó una acción real.

El selector permite revisar listado, detalle, vacío, carga, error, login, nueva contraseña, acceso denegado, comprobación de acceso y estados del formulario. La recuperación por correo se revisa desde “Olvidé mi contraseña” en la vista de login. El ejemplo de éxito del formulario indica explícitamente que no hubo guardado ni envío. Los filtros y paginación de la muestra operan únicamente sobre los trece registros ficticios.

El panel real sigue en `/panel/`, con Auth y RLS existentes. No conectar la ruta de revisión a servicios ni sustituir el hook real por fixtures.

### Ajuste posterior de títulos

Las cabeceras públicas ahora colocan título e introducción en una fila de escritorio y una columna hasta 900 px. Mantener los tokens `--title-page` y `--title-home`, medidas acotadas y saltos naturales; no reintroducir `<br>` para imponer líneas en los títulos. Se redujeron márgenes y rellenos acumulados. La revisión de 13 anchos está en [diseno/titulos/verificacion.md](diseno/titulos/verificacion.md).

Las tres fichas de espacios de Inicio deben compartir la misma alineación superior: se retiró el desplazamiento de la segunda ficha. Imágenes y títulos se verificaron alineados en 768 y 1440 px; en 375 px se apilan en una columna sin desbordamiento.
