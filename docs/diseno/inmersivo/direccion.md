# Dirección inmersiva · 1 de noviembre de 2026

Referencia solicitada por el usuario: https://www.apple.com/macbook-pro/proled-xdr-display/ (revisada en navegador). La inspiración es el ritmo de presentación de producto: títulos centrados, foco en las imágenes, escenas amplias y transformaciones progresivas al desplazarse.

## Plan antes de implementar

Paleta: negro escenario #000000, grafito #151517, blanco plata #f5f5f7, gris #a1a1aa, violeta luz #c6b5ff y azul hielo #8edcff. Los colores de las fotografías dan el carácter de fiesta; la interfaz permanece silenciosa.

Tipografía: Manrope variable para títulos y marca, Inter para lectura y controles. Sustituir los títulos condensados por formas amplias, peso 600–700, tracking negativo moderado y líneas cortas. Sin serif ni cursivas.

Composición:

    navegación discreta, fija al avanzar
    título centrado / fotografía que se expande con scroll
    frase editorial iluminada progresivamente
    secuencia de tres ambientes con imágenes y texto cruzados
    espacios del recinto / detalles a confirmar
    contacto y visita

Principios: el movimiento cuenta cómo se pasa de la rutina al encuentro; el contenido mantiene el foco en fiestas de empresa. Desplazamiento nativo, reversible y sin capturar la rueda. Fotografías locales, ninguna reproducción automática de video, controles accesibles y alternativa sin movimiento. Los formularios y el panel conservan sus contratos.

## Revisión del plan

Repetir el azul corporativo y añadir apariciones de tarjetas no resolvería el pedido. Se reemplaza esa dirección por escenas fotográficas de gran formato y una tipografía más abierta. No se copia contenido, marca, código, fuentes ni imágenes de Apple. Se reutilizan las referencias fotográficas autorizadas del proyecto, rotuladas como ilustrativas.

## Implementación

- `src/styles/global.css`: tokens, tipografía, navegación translúcida, páginas interiores, formularios, panel y pie.
- `src/styles/experience.css`: composición de portada y escenas; presentación estática por defecto y mejoras bajo `.motion-ready`.
- `src/scripts/experience.ts`: progreso calculado desde la posición real del documento; `requestAnimationFrame` solo al desplazarse, redimensionar o reentrar a una escena; observación de visibilidad y preferencias.
- `src/layouts/Base.astro`: variante de ancho completo y precarga de Manrope.

Dos escenas fijadas: expansión de la fotografía inicial y tres ambientes con mezcla de imágenes. Los botones Celebrar / Conectar / Reunirse permiten recorrerlos sin depender exclusivamente del scroll. Solo el capítulo activo recibe foco. La frase editorial se ilumina progresivamente y conserva un texto accesible completo.

El modo sin movimiento elimina escenas fijadas e inercia visual. En alturas de 620 px o menos también se usa la composición estática para no cortar contenidos en orientación horizontal. No hay video automático, captura de rueda, librería de animación, servicios nuevos ni dependencias nuevas.

## Recursos

Manrope variable se autoaloja en `public/fonts/manrope-variable.ttf`, desde Google Fonts: https://github.com/google/fonts/tree/main/ofl/manrope. Licencia SIL OFL en `public/fonts/Manrope-OFL.txt`. Inter conserva su licencia y alojamiento local. Las fotografías conservan las atribuciones de `src/content/design.ts` y las variantes responsive existentes; no muestran el recinto.

## Verificación

Validación con el mismo código y lockfile en una copia temporal fuera de iCloud, con las dependencias fijadas. El workspace conserva los cambios fuente; no se modifica su instalación para superar los bloqueos de lectura de iCloud.

- Tipos: 37 archivos, sin errores, warnings ni hints.
- 24 pruebas funcionales existentes aprobadas.
- Compilación estática correcta; ruta de fixtures excluida de producción.
- Playwright: siete vistas en 375, 768 y 1440 px, 21 combinaciones HTTP 200 y sin desbordamiento; comprobación adicional de inicio a 320 px.
- Scroll inicial: expansión, desvanecimiento del título y aparición del segundo mensaje comprobados en cuatro posiciones.
- Ambientes: selección por botones, avance y retroceso; se corrigió la superposición transitoria de textos manteniendo solo un mensaje visible durante la mezcla de fotografías.
- Movimiento reducido: los tres capítulos están visibles, sin `inert`, sin `aria-hidden` y sin posición sticky. Comprobado cambio de preferencia durante la sesión.
- Sin JavaScript: tres capítulos con contenido y enlaces accesibles, sin desbordamiento. Orientación horizontal a 844 × 390: modo estático y sin desbordamiento.
- Menú móvil abre y cierra con Escape. Galería abre, avanza y cierra. Formulario vacío muestra siete errores y enfoca el nombre. Panel cambia a recuperación de acceso.

Las capturas de este directorio muestran el inicio y estados concretos de las escenas; una captura completa no representa por sí sola la experiencia ligada al desplazamiento. No se midieron FPS, Core Web Vitals ni una auditoría integral WCAG. La configuración y validación de servicios reales siguen pendientes según README.

La verificación final incluyó la compilación de GitHub Pages y navegación real bajo `/centro-eventos/`: fuentes Manrope e Inter cargadas, imágenes sin errores, enlaces internos con la base correcta, movimiento reducido, validación de contacto y navegación móvil hacia el visor de galería. No se detectaron errores de consola en esa revisión de la versión de producción.
