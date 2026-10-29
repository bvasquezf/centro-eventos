# Verificación del rediseño

28 de octubre de 2026. Implementación local sobre la base existente, sin publicar.

## Preparación y preservación

Se leyeron README, el handoff y UI UX Pro Max instalada en `/Users/brian/.codex/skills/ui-ux-pro-max/SKILL.md`. No hay AGENTS.md aplicable. `git status --short` indicó que el directorio no es un repositorio Git; no se inicializó ni se descartó trabajo existente.

Se registraron hashes SHA-256 antes de editar y se compararon al terminar: **24 archivos protegidos idénticos**, incluidos `src/lib`, controladores existentes, `shared`, `supabase`, variables de ejemplo, dependencias y configuración. El detalle está en [logica-preservada.json](logica-preservada.json). No se modificaron pruebas existentes, Auth, validación de negocio, permisos, correo, medición o decisiones de consentimiento. No hay dependencias nuevas.

## Comandos ejecutados

| Comprobación | Resultado |
| --- | --- |
| `ASTRO_TELEMETRY_DISABLED=1 npm run check` | 34 archivos revisados; cero errores, warnings o hints |
| `npm test`, mediante `npm run verify` | 21 pruebas correctas, cero fallos |
| `ASTRO_TELEMETRY_DISABLED=1 npm run build` | Correcto; cinco páginas públicas, panel y 404 |
| Ruta de fixtures en producción | `dist/revision-diseno` no existe; no genera HTML |
| Comparación SHA-256 | 24 archivos protegidos sin cambios |

La última comprobación de tipos incluye el helper de teclado de los diálogos; la compilación final incluye el rediseño completo. Las pruebas funcionales existentes comprueban validación, ingreso, RLS, límites, idempotencia y fallo/reintento de correo con dependencias de prueba. No se repitió una conexión externa porque no hay credenciales configuradas.

## Navegador y responsive

Revisión mediante Chrome sobre un servidor temporal propio en `http://127.0.0.1:4322`. Se conservó el servidor preexistente del puerto 4321. La revisión incluyó carga de las islas React antes de medir panel y muestra de diseño.

Se comprobaron `/`, `/espacios/`, `/eventos/`, `/galeria/`, `/contacto/`, `/panel/` y `/revision-diseno/estados/` en **375, 768 y 1440 px**: **21 combinaciones sin desbordamiento horizontal**. Los anchos de documento y viewport están en [responsive.json](responsive.json).

Interacciones comprobadas:

- Menú móvil: abrir, enlaces visibles, ciclo de Tab desde el último enlace al botón cerrar, Escape y retorno al botón de apertura.
- Galería: abrir una imagen, cambiar con flecha de teclado y botones, contenido ampliado sin deformar, Tab contenido, Escape y retorno al disparador original. Se corrigió el centrado del visor detectado durante la revisión.
- Formulario real: envío vacío con errores por campo y foco en nombre; datos ficticios válidos con error explícito de demostración, sin simular guardado. Campos de contacto y evento adaptados a una columna en móvil.
- Panel real: acceso no configurado identificado como demostración; cambio a recuperación de acceso. No se muestra un listado privado ni una sesión ficticia desde el panel real.
- Muestra aislada: listado, detalle, filtro por tipo (5 visitas de 13 registros), paginación hasta página 2 de 2, vacío, carga, error, login, nueva contraseña, acceso denegado y comprobación de acceso. Estados del formulario inicial/error/carga/éxito se inspeccionan con un rótulo de ejemplo explícito. Registro de estados en [estados.json](estados.json).
- Detalle: foco en el título al abrir, regreso al botón de fila al cerrar y lectura sin desbordar en móvil.

Las fotografías de referencia y fuentes se sirven localmente. Se reservaron proporciones de imagen, se usó `srcset`, carga diferida y un visor con `object-fit: contain`. Se implementaron controles de al menos 44 px y reglas `prefers-reduced-motion`. No se ejecutó una auditoría integral automatizada de WCAG ni una medición de Core Web Vitals: la revisión fue de funcionamiento, teclado y presentación en navegador.

## Capturas

Las capturas en [capturas/](capturas/) incluyen:

- `inicio-1440.png` e `inicio-375.png`.
- `espacios-1440.png`, `eventos-1440.png`, `galeria-1440.png` y `contacto-1440.png`.
- `menu-375.png`.
- `galeria-ampliada-1440.png` y `galeria-ampliada-375.png`.
- `acceso-375.png`.
- `panel-detalle-1440.png` y `panel-detalle-375.png`, con datos de ejemplo identificados.

## Archivos modificados

Presentación existente:

- `src/layouts/Base.astro`.
- `src/styles/global.css`.
- `src/pages/index.astro`, `espacios.astro`, `eventos.astro`, `galeria.astro`, `contacto.astro` y `panel.astro`.
- `src/components/ui/RequestFormView.tsx` y `PanelView.tsx`.
- `README.md` y `docs/diseno-handoff.md`.

Nuevos componentes y datos de presentación:

- `src/components/design/PhotoFrame.astro`, `VisitCta.astro` y `DesignPreview.tsx`.
- `src/components/ui/Gallery.tsx`, `MobileNavigation.tsx` y `dialogFocus.ts`.
- `src/content/design.ts` y `src/fixtures/design.ts`.
- `src/pages/revision-diseno/[vista].astro` (solo desarrollo).
- `public/images/{celebracion,mesa,encuentro,reunion}-{640,1280,1920}.webp`.
- `public/fonts/inter-latin.woff2`, `playfair-latin.woff2` y sus dos archivos de licencia OFL.
- `docs/diseno/`: sistema visual, recursos, manifiesto de imágenes, informe, registros de revisión y capturas.

## Revisar localmente

```sh
npm ci
npm run dev -- --ignore-lock --port 4322
```

Abrir la URL que muestra Astro, normalmente `http://localhost:4322`. Revisar las cinco rutas públicas y `/panel/`. Para las muestras visuales, abrir `/revision-diseno/estados/`. `--ignore-lock` evita reutilizar un servidor anterior que pueda estar mostrando una versión previa. Detener ese servidor desde su terminal al terminar.

## Pendientes de conexión y contenido

La integración funcional existente se conserva, pero requiere configurar Supabase, encargados, Resend y GA4 según README. Quedan pendientes las pruebas reales de autenticación, guardado, correo y Analytics en staging. El formulario de demostración no confirma envíos y la muestra visual no autentica usuarios.

Completar nombre, contactos, WhatsApp, dirección, capacidades, equipamiento y política de privacidad; sustituir las referencias por fotografías autorizadas del recinto. No se inventaron servicios confirmados, testimonios, clientes ni aforos. No se publicó el sitio.
