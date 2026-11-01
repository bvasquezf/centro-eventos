# Contacto: composición completa y verificación

1 de noviembre de 2026. El usuario señaló que contacto conservaba la composición anterior. La actualización previa había aplicado tokens y tipografía compartidos, sin rediseñar específicamente esta vista.

## Dirección y cambios

Se conserva el sistema vigente (negro, grafito, plata, violeta; Manrope e Inter). La entrada combina título a la izquierda y fotografía ilustrativa a la derecha; en móvil se apilan. La fotografía mantiene un encuadre estable. El formulario pasa a ser el bloque principal, con acompañamiento de próximos pasos y canales de contacto a la derecha en escritorio. En tablet y móvil, el formulario ocupa todo el ancho y aparece antes que la información secundaria.

La propuesta se revisó antes de implementarla: repetir una cabecera centrada y el formulario anterior no atendía la observación. Se eligió una composición propia con entrada fotográfica y jerarquía de solicitud. No se trasladan escenas fijadas al formulario, para mantener accesibles sus campos durante el desplazamiento.

La elección entre cotización y visita se presenta con dos controles radio nativos, agrupados con `fieldset` y `legend`. Se conservan `name="request_type"`, los valores `cotizacion` / `visita` y la selección predeterminada. Se mantienen los campos, nombres, validación, errores, estados, honeypot, UUID e integración existentes. El controlador y backend no se modifican.

Estilos de página aislados en `src/styles/contact.css`. Estilos de la elección nativa en `src/styles/request-intent.css`; la muestra de estados reutiliza el mismo componente actualizado.

## Verificado

- `npm run verify` para GitHub Pages: 37 archivos sin errores, 24 pruebas aprobadas y compilación correcta.
- Playwright sobre la compilación con `/centro-eventos/contacto/`: 1440, 768, 375 y 320 px sin desbordamiento horizontal.
- En 768 px, el formulario ocupa una columna completa; en 1440 px, el formulario precede a la información complementaria.
- Fotografía cargada y revisada en escritorio y móvil. Capturas completas y captura específica del formulario.
- Selección por click y por flecha de teclado: `FormData` conserva `request_type=visita`. Reiniciar restaura `cotizacion`.
- Formulario vacío: siete errores, foco en nombre. Datos válidos ficticios: mensaje explícito de demostración; sin guardado ni envío externo.
- Anclas a formulario y privacidad; cabecera no tapa el inicio del formulario. Pregunta de visita expandible.
- Movimiento reducido: sin animaciones en la fotografía o en el formulario. Sin errores de consola durante la revisión.

Capturas actualizadas: `contacto-desktop.png`, `contacto-tablet.png`, `contacto-mobile.png` y `contacto-formulario-mobile.png` en este directorio. Nombre, contactos, fotos reales y política definitiva continúan pendientes; se conservan los rótulos correspondientes.
