# Tokens de diseño: look A · Cómic (decidido por Manu, D15)

Fuente: el prototipo `docs/diseno/look-a-comico.dc.html` (formato del editor de Artifacts: es solo referencia visual y no corre en la app) y el Artifact https://claude.ai/artifact/Jt48RNP9nibJrKxnxWVTSD (privado). Los datos del prototipo son de ejemplo.

**NO VERIFICADO:** nadie abrió el prototipo en un navegador. Los contrastes están calculados a mano, no con una herramienta.

## Colores
| Token | Valor | Uso |
|---|---|---|
| `--azul-heroe` | #2A3FE8 | Fondo de pantalla, relleno de la barra de XP, chip Repo |
| `--tinta` | #111111 | Bordes, sombras duras, texto sobre claro, barra de navegación |
| `--amarillo` | #FFD60A | Tarjeta de héroe, marca, botón +, chip Oportunidad, navegación activa |
| `--rosa` | #FF4FA3 | Etiqueta "Misión del equipo" y avatares |
| `--menta` | #19C37D | Chip Skill, "Lo probé" hecho, segmentos de misión completos |
| `--rojo` | #D92D20 | Pastilla de vencimiento |
| `--blanco` | #FFFFFF | Paneles; texto sobre azul y sobre tinta |
| `--gris-texto` | #4B5563 | Metadatos |

Contrastes calculados a mano (WCAG): blanco sobre azul ≈ 7,1:1; amarillo sobre azul ≈ 5,0:1; blanco sobre rojo ≈ 4,8:1; tinta sobre rosa ≈ 6,9:1, sobre menta ≈ 9,1:1 y sobre amarillo ≈ 14,9:1; gris sobre blanco ≈ 7,6:1.

## Tipografía
- **Display: Lilita One (400).** Marca 28px, número de nivel 38px, clase 24px, título de misión 24px, "3/5" 22px, títulos de sección 26px.
- **Texto: Nunito 600, 700 y 800.** Título de tarjeta 17px con línea de 22px (800), metadatos 13px (700), chips 12px (800, 1px de espaciado), botones 14px (800), navegación 12px (800).
- Licencia y forma de cargar las fuentes: **NO VERIFICADO** (pregunta Q7 del Investigador).

## Formas y espaciado
- **Panel:** borde 3px tinta, radio 18px, sombra dura 5px 5px 0 tinta, padding 16px (tarjetas de aporte: 14px 16px).
- **Chip de tipo:** borde 3px tinta, radio 8px, línea de 20px.
- **Botón / pastilla:** alto 44px (mínimo táctil), borde 3px tinta, radio 999px, sombra 3px 3px 0 tinta.
- **Barra de XP:** alto 22px, borde 3px, radio 999px, relleno azul (sobre la tarjeta amarilla).
- **Segmentos de misión:** alto 24px, borde 3px, radio 8px; completos menta, vacíos blancos.
- **Avatares:** 34px, borde 3px, solapados −8px.
- **Navegación inferior:** barra tinta de 84px; ítem activo amarillo; botón + de 56px amarillo con borde blanco de 3px; íconos de trazo de 24px.
- **Pantalla:** padding 16px; separación entre bloques 16px; ancho de diseño 390px.
- Sin degradados ni emojis; íconos SVG de trazo.

## Componentes del prototipo
Marca · TarjetaHéroe (nivel, clase, XP, récord) · TarjetaMisión (etiqueta, título, segmentos, avatares, Copiar resumen) · EncabezadoSección · TarjetaAporte (chip de tipo, meta, título, prueba social, acción) · NavegaciónInferior (Inicio, Explorar, +, Perfil).

## Tipos de aporte
- **Skill:** chip menta; acción "Lo probé".
- **Repo:** chip azul con texto blanco; acción "Lo probé".
- **Oportunidad:** chip amarillo, pastilla roja "Vence en N días"; acción "Me interesa".
- **Noticia y Proyecto no están en el prototipo.** El Builder les da un chip con estos mismos tokens (propuesta: Proyecto rosa, Noticia blanco) y Manu lo confirma en el checklist manual.

## Regla
Los tokens van como variables CSS en un solo archivo, para poder suavizar el look después sin rehacer las pantallas (riesgo asumido en D15).
