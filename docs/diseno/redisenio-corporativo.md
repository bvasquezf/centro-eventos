# Rediseño para fiestas de empresa

1 de noviembre de 2026. Dirección solicitada: priorizar fiestas de empresas y eliminar la estética de matrimonios.

## Sistema visual

- Azul noche `#101629`: fondo principal.
- Índigo `#19223a`: formularios, tarjetas y panel.
- Azul escenario `#293c68`: llamada a coordinar una visita.
- Ámbar `#ffbd69`: acciones, foco e identidad.
- Blanco frío `#f2f4ff`: títulos.
- Gris azulado `#b5bfd5`: texto secundario.

Barlow Condensed Bold autoalojada en títulos; Inter autoalojada para lectura y controles. Se retiran del diseño las serif, las cursivas ornamentales y el arco del símbolo provisional. El nuevo símbolo geométrico alude a personas reunidas y ritmo.

## Composición y criterio

Portada con título grande a la izquierda y fotografía de ambiente a la derecha; un degradado sobre la fotografía mantiene legibilidad. En móvil, la imagen sirve de fondo y el texto ocupa todo el ancho. Debajo: motivos de celebración, presentación del recinto, espacios, bloque de fiesta de empresa, requisitos y galería. Los textos se alinean a la izquierda.

Se revisó la propuesta frente al pedido: una estética de consultora con azul corporativo y tarjetas blancas habría perdido la energía de una fiesta. Se eligieron fotografía de público, confeti y luces, títulos condensados y superficies nocturnas. El ámbar sirve a las acciones sin convertir todas las secciones en anuncios.

El diseño afecta inicio, espacios, eventos, galería, contacto, acceso y los estados del panel. Se conserva el contrato del formulario, autenticación, datos, RLS, correo y consentimiento. No se agregan dependencias.

## Imágenes y fuentes

Las referencias anteriores de flores y mesas de boda dejan de usarse. Se conservan las imágenes de salón y sala de reuniones; se agregan:

- Ambiente: Pablo Heimplatz, https://images.unsplash.com/photo-1492684223066-81342ee5ff30
- Fiesta en blanco y negro: Brooke Balentine, https://unsplash.com/photos/3Xbl9Rgf6hY

Uso bajo licencia Unsplash: https://unsplash.com/license. Son referencias ilustrativas, identificadas como tales, y no representan el recinto ni servicios confirmados. Variantes WebP de 640, 1280 y 1920 píxeles servidas localmente.

Barlow Condensed: Google Fonts, https://github.com/google/fonts/tree/main/ofl/barlowcondensed. Licencia OFL incluida en `public/fonts/BarlowCondensed-OFL.txt`.

El nombre, dirección, contactos, aforos, equipamiento y fotos reales siguen pendientes. El rediseño no publica el sitio ni conecta servicios remotos.

## Verificación realizada

Se ejecutó la validación en `/tmp/eventos-redesign-validation` con copias idénticas de `src`, `shared`, `supabase` y `tests`, el mismo `package-lock.json` y una instalación limpia. La lectura de las dependencias existentes en iCloud detenía el arranque; no se modificaron dependencias ni configuración para resolverlo.

- `npm run verify`: 36 archivos sin errores, advertencias ni hints; 24 pruebas correctas; compilación estática correcta.
- Compilación de GitHub Pages con `DEPLOY_TARGET=github-pages` y base `/centro-eventos/`: correcta después del ajuste final de CSS.
- Playwright: siete vistas (`/`, espacios, eventos, galería, contacto, panel y estados de diseño) en 375, 768 y 1440 píxeles: 21 combinaciones HTTP 200 y sin desbordamiento horizontal.
- Menú móvil: abrir, cerrar con Escape. Galería: ampliar, siguiente, flecha de teclado y cerrar.
- Formulario vacío: siete campos inválidos y foco en nombre. Formulario válido ficticio: error explícito de demostración, sin guardado ni envío. Panel: cambio a recuperación de acceso.
- Todas las imágenes del inicio decodificadas correctamente, incluidas las de carga diferida.
- Inspección visual de inicio, contacto, eventos y panel; se corrigió el alto excesivo de la fotografía vertical en el bloque de celebración.
- Sin errores de consola en la revisión final de contacto. Una captura prematura había introducido estilos de caret antes de hidratar React; no se reproduce esperando a que finalice la hidratación.
- `git diff --check`: correcto.

Capturas en [corporativo/](corporativo/), con inicio móvil y las seis vistas principales de escritorio. No se ejecutó una auditoría integral WCAG, pruebas con servicios reales ni publicación remota.
