# Recursos visuales

Las fotografías se descargaron de las páginas gratuitas verificadas de Unsplash, bajo su [licencia](https://unsplash.com/license). Son **referencias de diseño**: no muestran el centro de eventos del proyecto. Se identifican en las fotos y sus pies; nunca se usan para afirmar instalaciones o equipamiento reales.

| Archivo base | Autor | Página de origen |
| --- | --- | --- |
| `celebracion` | Vidit Goswami | https://unsplash.com/photos/Zi_NOBHIk9A |
| `mesa` | engin akyurt | https://unsplash.com/photos/i3rFV6ULk-o |
| `encuentro` | CHUTTERSNAP | https://unsplash.com/photos/Q_KdjKxntH8 |
| `reunion` | David Kristianto | https://unsplash.com/photos/6jpbs2ykacU |

Variantes WebP de 640, 1280 y 1920 px de ancho en `public/images/`, generadas por el CDN de origen. Cada variante conserva su proporción original; la interfaz usa contenedores con aspecto reservado y `object-fit: cover` para miniaturas, `contain` para imágenes ampliadas. `srcset`/`sizes` adaptan la descarga y las fotos bajo el pliegue usan carga diferida. El visor carga la versión grande al abrirse. El manifiesto de procedencia está en `imagenes.json`.

Las imágenes reales se incorporan en la lista tipada `photos` de `src/content/site.ts`: al haber fotos reales, la galería deja de usar las referencias. Para reemplazar las fotos de portada y fichas, actualizar también las selecciones en las páginas y sus descripciones de `src/content/design.ts` y retirar las banderas ilustrativas solo cuando corresponda. Mantener un máximo de 30 imágenes y documentar autorización del material definitivo.

Fuentes autoalojadas en `public/fonts/`:

- **Inter**, variable 400–700, subconjunto latino WOFF2. Licencia SIL Open Font License guardada en `Inter-OFL.txt`.
- **Playfair Display**, variable 400–600, subconjunto latino WOFF2. Licencia SIL Open Font License guardada en `Playfair-OFL.txt`.
- Los énfasis en cursiva usan Georgia del sistema. No hay peticiones a Google Fonts al visitar el sitio.

Los dos WOFF2 suman aproximadamente 85 KB. Los SVG del logotipo provisional y controles se dibujaron directamente en el proyecto. No se agregaron paquetes de iconos, animación o galería.
