# Verificación de la base funcional

Fecha: 28 de octubre de 2026. Trabajo local, sin publicación ni credenciales de servicios reales.

## Comprobaciones ejecutadas

| Comprobación | Resultado | Alcance |
| --- | --- | --- |
| `npm run check` | Correcto, cero errores, warnings o hints | Astro, React, TypeScript y pruebas |
| `npm test` | 21 pruebas correctas, cero fallos | HTTP, validación, SQL y notificación con transporte sustituido |
| `npm run build` | Correcto | 5 páginas públicas, panel y 404 estáticos en `dist` |
| `deno check` sobre las dos funciones | Correcto | Tipos del backend con runtime Deno, incluidas dependencias npm |
| `npm audit --omit=dev` | Cero vulnerabilidades conocidas | Dependencias de producción al verificar |
| Auditoría de la instalación completa | Cero vulnerabilidades conocidas | Resultado de la instalación final, incluidas dependencias de desarrollo |
| Formulario vacío en Chrome | Correcto | Errores por campo, mensaje general y foco en nombre |
| Formulario válido en demostración | Correcto | Error explícito: no se guardó ni envió; no simula éxito |
| Panel sin configuración | Correcto | Login y recuperación visibles, sin filas ni cuentas ficticias |
| Consentimiento rechazado | Correcto | Se oculta el aviso y se mantiene la decisión al navegar |
| Formulario a 375 px | Correcto | Ancho del documento 375 px, sin scroll horizontal |
| Espacios a 768 px | Correcto | Ancho del documento 768 px, sin scroll horizontal |
| Inicio de escritorio y galería | Correcto | Presentación, navegación y fotografías pendientes explícitas |

La captura [inicio.png](verificacion/inicio.png) corresponde al navegador local, con datos pendientes visibles.

## Pruebas de base de datos

Las pruebas cargan la **misma migración** en PostgreSQL embebido PGlite. Se recrean los roles `anon`, `authenticated`, `service_role` y una función mínima `auth.uid()` para ejercer RLS con distintos UUID. No es una comprobación del servicio Auth HTTP de Supabase.

Se verificó que:

- Anónimos no pueden leer solicitudes ni ejecutar el RPC de ingreso privilegiado.
- Un usuario autenticado sin autorización recibe cero solicitudes y no puede enumerar encargados, leer la cola o borrar solicitudes.
- Ambos encargados autorizados pueden leer, pero no modificar solicitudes ni autorizar a terceros.
- El límite estructural de dos encargados rechaza un tercer slot.
- Un fallo de correo conserva una solicitud y un trabajo de notificación al reintentar.
- La limitación individual se aplica al sexto intento de la ventana y la global se mantiene al rotar huellas.
- La cola bloquea doble reclamación simultánea, no reenvía trabajos `sent` y deriva trabajos vencidos a `review`.
- Reutilizar el UUID con datos diferentes no sobrescribe ni duplica el original.
- Un error de restricción revierte ingreso y trabajo de correo juntos.

## Pruebas de ingreso y entrega

El handler HTTP se prueba con peticiones reales de la API estándar `Request` y dependencias controladas. Incluye orden guardado→notificación, fallo de almacenamiento sin correo, correo caído con guardado confirmado, validación, honeypot, JSON malformado, método/origen incorrectos, preflight, cuota y límite de bytes aun sin `Content-Length`.

El adaptador de entrega se prueba con un transporte `fetch` sustituido: respuesta 500 seguida de éxito, conservación de la misma clave Resend, fin de reintentos tras éxito, errores de transporte/configuración sanitizados y notificación sin datos del formulario. Ninguna prueba envió un correo externo.

## Pendiente al configurar staging

1. Crear proyecto Supabase, aplicar migración, configurar secretos y desplegar funciones en staging. Ejecutar allí el flujo HTTP con su gateway real y comprobar RLS vía API con anon, usuario no autorizado y los dos encargados.
2. Crear/invitar encargados, configurar SMTP y URLs de Auth, y verificar login, recuperación válida/vencida, cambio de contraseña, salida y revocación real.
3. Verificar dominio DNS en Resend y recepción de una notificación real. Provocar fallo de correo de forma controlada, confirmar la fila persistida, restaurar el servicio y ejecutar el worker sin nuevo contacto. Probar el lease ante interrupción.
4. Activar y observar el programador privado del worker. Revisar el comportamiento de cabeceras del gateway; el techo global no depende de su identidad IP.
5. Configurar GA4, desactivar Medición mejorada y probar en el flujo real que antes de aceptar/rechazando no hay peticiones Google, que aceptar permite los tres eventos previstos y que retirar el permiso detiene la medición. Los eventos reales no se verificaron porque falta el ID de propiedad.
6. Completar datos, fotografías, política de privacidad y conservación. Confirmar que la CSP coincide con los dominios definitivos y verificar las cabeceras servidas por Netlify.

No se ejecutaron migraciones remotas, despliegues, envíos de correo, cambios de cuentas o alteraciones de DNS. La instalación local y las pruebas no necesitan credenciales privadas.
