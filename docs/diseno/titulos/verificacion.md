# Ajuste de títulos y distribución

28 de octubre de 2026. Corrección de presentación solicitada tras revisar la página de Espacios.

- Se eliminaron saltos `<br>` dentro de títulos públicos, encabezados de sección, invitación de visita y presentación del acceso. El navegador distribuye las palabras según el ancho disponible, con `text-wrap: balance` y medidas limitadas.
- Los títulos usan tokens fluidos: `--title-page` (36–58,4 px) y `--title-home` (39,2–68 px). Se retiraron los cambios bruscos de tamaño de los breakpoints anteriores.
- Las cabeceras interiores comparten una grilla: título e introducción en la misma fila en escritorio; una columna hasta 900 px. La galería usa la misma composición.
- Se redujeron rellenos de cabecera, separación entre secciones y márgenes acumulados de avisos. En Espacios a 1440 px la primera fotografía comienza cerca de y=380 px, frente a unos 632 px en la captura del diseño anterior.
- No se cambiaron contenido de negocio, contratos, validación, servicios, dependencias ni configuración protegida.

## Verificación

`npm run check`: 34 archivos, cero errores, warnings o hints. `npm run build`: correcto, siete páginas generadas.

En Chrome se midieron siete rutas (cinco públicas, panel y muestra visual) en **13 anchos**: 320, 375, 430, 600, 601, 768, 900, 901, 1024, 1200, 1440, 1920 y 2560 px. Se esperó la carga del formulario de acceso y del selector de la muestra antes de medir esas vistas.

Las **91 combinaciones** no mostraron desbordamiento horizontal de documento ni títulos con contenido desbordado. El registro está en `responsive.json`. Se inspeccionó visualmente Espacios en escritorio/tableta, Inicio y Galería en móvil, Contacto en 1024 px, Galería en escritorio y Eventos en pantalla grande. Las capturas de esta carpeta documentan la corrección.

Guía aplicada: UI UX Pro Max, consulta `heading line balance whitespace --domain ux` (equilibrio de líneas, medida limitada y evitar saltos forzados). Las búsquedas específicas de tipografía en los stacks Astro y HTML/Tailwind no devolvieron coincidencias; la implementación usa la recomendación UX verificada y CSS nativo.
