# Sistema visual — Centro de Eventos

Dirección: editorial cálida, marfil y verde profundo. Fotografías protagonistas, títulos serif, información breve y una acción principal por bloque. Se conservan los colores de la base y la arquitectura Astro/React/Tailwind. No se añaden dependencias.

## Skill utilizada y consultas

Skill instalada: `/Users/brian/.codex/skills/ui-ux-pro-max/SKILL.md`.
Script: `/Users/brian/.codex/skills/ui-ux-pro-max/scripts/search.py`.
Origen oficial solicitado: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.

Consultas ejecutadas antes de implementar:

```sh
python3 /Users/brian/.codex/skills/ui-ux-pro-max/scripts/search.py 'hospitality venue editorial luxury' --design-system -p 'Centro de Eventos'
python3 /Users/brian/.codex/skills/ui-ux-pro-max/scripts/search.py 'responsive images navigation' --stack astro
python3 /Users/brian/.codex/skills/ui-ux-pro-max/scripts/search.py 'dialog keyboard focus escape' --domain ux
python3 /Users/brian/.codex/skills/ui-ux-pro-max/scripts/search.py 'editorial minimalism' --domain style
python3 /Users/brian/.codex/skills/ui-ux-pro-max/scripts/search.py 'elegant serif hospitality' --domain typography
```

La generación inicial propuso Liquid Glass, azul/oro y testimonios: no encajan con el encargo ni con la marca provisional y no se aplican. La consulta explícita de estilo devolvió Minimalism & Swiss Style: se adopta su grilla, jerarquía clara, ausencia de decoraciones innecesarias y transiciones de 200–250 ms. La consulta tipográfica devolvió Classic Elegant (Playfair Display + Inter), que se adopta con fuentes autoalojadas. La guía Astro orienta imágenes adaptables y la guía UX, foco visible y nunca oculto por overlays. Los resultados se usan como guía, con el brief del usuario por encima de recomendaciones genéricas.

## Tokens implementados en global.css

| Familia | Decisión |
| --- | --- |
| Papel | Marfil `#f8f7f2`, superficie `#fffefa` |
| Texto | Carbón `#252e29`, secundario `#59645b` |
| Marca | Verde `#213d35`, hover `#345447`, salvia `#d5dfbd` |
| Línea | `#d7d9cf`; bordes de campos más oscuros |
| Estados | Error `#a52525`, éxito verde, aviso de demostración ámbar claro |
| Tipografía | Playfair Display variable / Inter variable; fallback Georgia / Arial |
| Escala | Texto 16 px mínimo, ayudas 13–14 px; títulos interiores fluidos 36–58,4 px y portada 39,2–68 px |
| Espaciado | 4, 8, 12, 16, 24, 32, 48, 64, 96 px |
| Contenedor | Máximo 1280 px, márgenes 20 px móvil / 48 px escritorio |
| Bordes | 2–8 px, sin abuso de tarjetas redondeadas |
| Sombra | Solo overlays y elementos elevados |
| Movimiento | Opacidad y transformaciones sutiles 200–250 ms; desactivadas con movimiento reducido |

## Composición

- Inicio: presentación editorial, foto panorámica, espacios con ritmo visual, servicios sujetos a confirmación, selección de galería y visita.
- Espacios: fichas amplias alternadas con foto, descripción y datos pendientes, sin inventar aforos.
- Eventos: dos usos confirmados; imágenes y texto alternos; prestaciones pendientes señaladas.
- Galería: grilla editorial adaptable y diálogo nativo con Escape, flechas, foco contenido y retorno al disparador.
- Contacto: información en columna lateral y formulario por grupos, campos siempre etiquetados.
- Panel: navegación funcional sin estadísticas, tabla en escritorio y filas adaptadas en móvil; detalle legible.

Las fotos ilustrativas son un conjunto separado del contenido real, están identificadas en cada aparición y tienen procedencia/licencia documentadas. La galería real sigue vacía hasta recibir fotografías autorizadas del recinto.

## Límites

No modificar lógica, Auth, validaciones, backend, variables, correo, Analytics ni consentimiento. Las vistas de muestra se sirven solo en desarrollo desde `/revision-diseno/`, con fixtures ficticios, sin sesión, envío o llamadas a servicios.
