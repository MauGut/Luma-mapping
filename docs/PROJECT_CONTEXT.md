# Contexto y continuidad

Actualizado: 13 de noviembre de 2026. Estado: beta 0.2.

## Decisiones acordadas con Mauricio

El producto se utilizará en un workshop artístico con varios proyectos y varias notebooks, mayormente Windows. Se busca una experiencia parecida a Map Club, con edición visual sencilla y consola de performance. Cada equipo lleva su proyecto. La foto de referencia se tomará alineada con la perspectiva del proyector.

La intención a futuro es una aplicación distribuible y utilizable sin conexión. La entrega actual es una web estática portable; **todavía no es una PWA instalable**. No hay requisitos confirmados de cantidad simultánea de videos, GPU mínima ni fecha del taller.

## Implementado

- Ejemplo inicial con tres superficies y tres fuentes generativas.
- Superficies poligonales, nodos móviles, tiradores Bézier, inserción de puntos en bordes rectos, duplicado, orden de capas, huecos y visibilidad.
- Foto local con opacidad y corrección de cuatro esquinas, sólo visible en el editor.
- Detección de regiones contiguas por similitud de color, tolerancia configurable y contorno editable.
- Importación de imágenes y videos; reproducción compartida por recurso, en bucle y sin audio.
- Color sólido independiente por superficie, selector, muestras y entrada hexadecimal. **Aplicar color** confirma el cambio con corte o fundido de 0,5, 1 o 2 segundos; también funciona al cambiar entre color y clip. Respeta huecos, curvas, opacidad, filtros y modos de mezcla.
- Colores incluidos en escenas, duplicado, undo/redo y exportación/importación `.luma`. Los archivos de beta 0.1 siguen abriendo; los proyectos que usan `media: "solid"` requieren beta 0.2 o posterior.
- Opacidad, brillo, saturación, tono y mezcla de capas.
- Perspectiva para cuadriláteros convexos rectos; recorte por contorno para las otras formas.
- Corte/fundido de 0,5, 1 o 2 segundos; escenas con estado de superficies.
- Ventana de salida 1280 × 720 con fullscreen, negro y vista de performance.
- Exportación/importación `.luma` con medios embebidos; validación antes de reemplazar estado.
- Deshacer/rehacer de superficies, filtros, capas, nombres y escenas.
- Diálogos HTML para guardar escenas y confirmar reemplazo de proyectos.

## Límites conocidos

- No hay autoguardado: guardar `.luma` antes de cerrar.
- La foto y las importaciones no están incluidas en undo/redo.
- Hasta 40 MB por archivo y 120 MB de medios por proyecto; hasta 80 clips y 50 escenas. Proyectos grandes pueden consumir bastante RAM por las data URLs.
- Silueta por color a resolución reducida: no reconoce objetos complejos con IA ni extrae automáticamente huecos.
- Los fundidos usan una captura del estado anterior, no dos escenas de video vivas en paralelo.
- No hay ciclo automático de colores. La duración de fundido se elige durante la sesión, no se guarda en el proyecto.
- La reproducción puede perder cuadros si el navegador limita el editor en segundo plano/minimizado.
- No hay audio, MIDI/OSC, sincronización entre notebooks, mezcla de bordes entre proyectores, malla avanzada ni decodificador propio.
- `app.js` y `style.css` tienen formato compacto. Una futura mejora de mantenibilidad puede formatear/separar módulos sin romper el uso desde `file://`.
- `responsive.css` duplica reglas presentes en `style.css` y no está enlazado. Conviene consolidar esto en una tarea de limpieza.

## Validación realizada

- Seis tests de core: homografía y rectas; cuadriláteros cruzados/degenerados; contorno rectangular; concavidad/transparencia; round trip de curvas y huecos; rechazo de proyectos incompatibles.
- Comprobación de sintaxis de ambos archivos JS.
- Navegador: diseño de escritorio y adaptación a panel angosto; importación de PNG; detección de una silueta rectangular; alternancia de calibración; edición de nombres; asignación y reproducción de MP4 H.264 sintético; arrastre y conversión de nodo a curva; deshacer; creación/recuperación de escenas; botón de negro.
- Se exportó y reabrió un proyecto con cuatro superficies, foto y video; se verificó una exportación posterior con una escena.
- Se invocó la apertura de la ventana de salida, pero no se verificó un proyector físico ni un segundo monitor real. Pendiente verificar fullscreen y rendimiento en Chrome/Edge de las notebooks del taller.
- No hay CI remota configurada todavía.

### Validación de colores sólidos (beta 0.2)

- Nueve pruebas de core aprobadas: las seis originales más persistencia de colores por superficie/escena, rechazo de colores inválidos y compatibilidad con archivos previos/ID reservado.
- UI probada a 1366 × 768: naranja y celeste en superficies independientes junto a una fuente animada; entrada hex; corte; fundido de celeste a violeta; undo; hueco triangular sobre color; cambio a fuente generativa y recuperación mediante escena.
- Proyecto exportado y reabierto con dos colores distintos, un hueco y una escena. Rechazo de hexadecimal inválido y consola sin errores en esta prueba.
- Sin prueba nueva con proyector físico. El renderer de salida comparte el mismo lienzo de escena donde se dibujan los colores.

### Idea conversada, todavía pendiente

Mauricio propuso usar la foto como velo semitransparente para trazar y eligió poder ocultarla/mostrarla sin perder la alineación. La conversación quedó en pausa antes de implementar esa mejora. La beta conserva el control de opacidad y ajuste de esquinas, pero todavía no tiene un botón dedicado de mostrar/ocultar ni modo de trazado/bloqueo adicional.

## Prioridades propuestas para continuar

1. Probar un montaje real: Windows en modo Extender, foto alineada, contornos, fullscreen, negro, reabrir proyecto. Medir rendimiento con los clips y equipos reales.
2. Agregar recuperación/autoguardado local con IndexedDB, respetando límites y fallos de almacenamiento.
3. Mejorar gestión de medios: borrar recursos no usados, miniaturas de videos, errores de codec, progreso de carga y memoria.
4. Completar undo/redo de foto/calibración y pruebas de interacción automatizadas cuando haya infraestructura.
5. Mejorar precisión del trazado (zoom/pan, selección de puntos, simplificación y edición de huecos).
6. Evaluar segmentación real de objetos por IA con presupuesto de memoria y funcionamiento local. Preservar siempre el editor manual.
7. Evaluar PWA o empaquetado de escritorio si las pruebas justifican ese paso.

Estas son propuestas de continuidad, no compromisos ni funcionalidades entregadas.

## Alojamiento y repositorio

La primera beta se publicó con acceso privado en Sites. El repositorio GitHub permite continuar el código desde otra PC y no contiene su configuración de alojamiento. No hay despliegue automático desde GitHub.

El repositorio no guarda las fotos ni los clips de los participantes. Para transferir un montaje entre equipos, exportar su `.luma` y copiarlo por separado.
