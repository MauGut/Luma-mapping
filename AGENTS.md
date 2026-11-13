# Luma Mapping — instrucciones para Codex

## Al comenzar

Leé este archivo, `README.md` y `docs/PROJECT_CONTEXT.md`. Revisá `git status` y el código involucrado antes de editar. El código y las pruebas son la fuente de verdad del comportamiento actual; si contradicen estas notas, verificá y actualizá la documentación.

Respondé en español claro. El usuario es Mauricio y está desarrollando una herramienta para un workshop artístico. Priorizá cambios concretos, reversibles y probados. No hace falta repetir preguntas ya resueltas en este contexto. Las instrucciones actuales del usuario tienen prioridad.

## Objetivo del producto

Luma es una herramienta visual de videomapping para varias notebooks, principalmente Windows. Cada participante trabaja con su proyecto; la beta asume una notebook y un proyector, sin sincronización entre equipos. La referencia de experiencia es https://map.club/; no copiar su código ni identidad.

El flujo central es: cargar foto del montaje → dibujar o detectar silueta → corregir nodos y curvas → asignar clips → ajustar filtros/transiciones → proyectar → guardar y recuperar el proyecto.

La foto se toma cerca del lente y con la perspectiva del proyector. Aun así necesita corrección de encuadre; cuatro esquinas sólo corrigen un plano, no distintas profundidades ni distorsión óptica.

## Arquitectura actual

- Aplicación estática, sin compilación, backend, dependencias de runtime ni cuentas.
- `dist/` contiene **el código fuente editable**, no archivos generados. No lo borres como si fuera una salida de build.
- `dist/index.html`: estructura, controles y diálogos.
- `dist/style.css`: estilos activos, incluidos los ajustes responsive.
- `dist/responsive.css`: referencia redundante de ajustes ya incorporados a `style.css`; no está enlazado desde HTML. Cambiarlo solo no cambia la interfaz.
- `dist/app.js`: estado, UI, eventos, Canvas 2D, reproducción, importación/exportación y ventana de salida. Es una IIFE sin framework.
- `dist/core.js`: funciones puras; expone `LumaCore` en el navegador y CommonJS para tests. Incluye homografía, validación de cuadriláteros, extracción de contornos y validación de proyectos.
- `tests/core.test.cjs`: tests con `node:test`, sin instalar paquetes.
- `ABRIR-LUMA.cmd`: abre `dist/index.html` con el navegador predeterminado de Windows.

## Contratos que preservar

- Debe seguir funcionando al abrir `dist/index.html` desde disco sin internet. No introducir CDN, fuentes remotas, módulos que requieran HTTP o llamadas externas sin tratar explícitamente ese cambio.
- El editor y la salida al proyector son diferentes: foto, nodos, guías, etiquetas y controles nunca deben aparecer en la salida.
- Coordenadas de geometría normalizadas; lienzo/salida 1280 × 720. Los tiradores `in`/`out` son desplazamientos relativos al nodo.
- Cada superficie tiene un contorno exterior y anillos de huecos; el recorte utiliza la regla `evenodd`.
- La corrección de perspectiva funciona para cuadriláteros convexos de cuatro nodos sin curvas. Otros contornos recortan el contenido en su caja envolvente.
- `.luma` es JSON con `format: "luma-workshop"` y `version: 1`. Incluye nombre, superficies, escenas, medios en data URLs y foto con su cuadrilátero. Preservar compatibilidad o implementar migración explícita.
- Los medios del usuario permanecen locales; no subirlos al repositorio, servicios ni logs.
- Los videos son compartidos por recurso, en bucle y sin audio. El fundido actual parte de una captura del estado anterior.
- La silueta actual es selección de una región contigua por color a 320 × 180; **no es IA**. Extrae el contorno exterior; los huecos se dibujan manualmente.
- Usar texto seguro para nombres de proyectos/medios; validar archivos antes de reemplazar el estado actual.
- Mantener la interfaz en español, el botón de negro accesible y la posibilidad de deshacer ediciones de geometría.
- Usar diálogos HTML en la UI: `window.prompt()` no está soportado en el navegador integrado donde se probó la beta.

## Ejecución y verificación

Abrir `dist/index.html` con Chrome/Edge. Para desarrollo por HTTP, desde la raíz:

```sh
python -m http.server 4173 --bind 127.0.0.1 --directory dist
```

En Windows se puede usar `py` si `python` no está disponible. URL: http://127.0.0.1:4173.

Checks (Node.js 22 usado en la beta):

```sh
node --check dist/app.js
node --check dist/core.js
node --test tests/core.test.cjs
```

Para cambios de UI/renderizado, además comprobar las interacciones afectadas en navegador: importar foto/video, crear/editar contorno, asignar clip, filtros, guardar/reabrir `.luma`, escenas, negro y salida independiente. Probar un tamaño típico de notebook, por ejemplo 1366 × 768, y revisar consola. No afirmar pruebas físicas con proyector si sólo se verificó el navegador.

Si el formato cambia, testear round trip y entradas inválidas. Para geometría, testear casos degenerados y concavidades. No agregar tests que sólo reproduzcan detalles de implementación.

## Git y continuidad

- Repositorio canónico: https://github.com/MauGut/Luma-mapping.
- Trabajar con ramas `codex/<descripcion>` salvo instrucción distinta. No sobrescribir cambios del usuario ni hacer force push para sincronizar equipos.
- No incluir tokens, `.env`, configuraciones personales de Codex, `.luma`, clips, fotos, ZIPs, descargas o capturas de QA.
- El despliegue original en Sites es independiente de GitHub. No asumir que un push publica la app ni crear otro alojamiento automáticamente al cambiar documentación.
- Al finalizar una tarea sustancial, actualizar `docs/PROJECT_CONTEXT.md` con decisiones, validación y pendientes reales. No inventar funcionalidades terminadas.
- El historial de este chat no viaja con Git. Mantener el contexto necesario dentro de estos archivos.

## Próximos pasos sugeridos, no implementados

Consultar las prioridades de `docs/PROJECT_CONTEXT.md`. No emprender una reescritura, servicio de IA, sincronización multiusuario o framework nuevo sin que lo requiera la tarea. La prioridad inmediata es validar la beta con el montaje real y mejorar estabilidad/usabilidad.
