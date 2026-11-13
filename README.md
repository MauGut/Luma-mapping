# Luma — Mapping Workshop · beta 0.2

Aplicación de videomapping local para talleres artísticos. No requiere cuenta ni conexión al abrir la copia portable. No usa librerías externas, analítica ni subidas de archivos.

[Abrir beta web 0.2 (acceso privado)](https://luma-mapping-workshop-beta.hillyden8.chatgpt.site). Actualizada el 13 de noviembre de 2026 con colores sólidos por superficie y transiciones. Para el workshop sin conexión, usar la copia local.

## Continuar desde otra PC con Codex

```sh
git clone https://github.com/MauGut/Luma-mapping.git
cd Luma-mapping
```

Abrir esta carpeta como proyecto en Codex y comenzar un chat. `AGENTS.md` contiene las instrucciones del proyecto; [docs/PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md) conserva las decisiones, el estado de la beta, sus límites y los siguientes pasos. No hace falta copiar la conversación anterior.

Prompt sugerido: «Leé AGENTS.md y docs/PROJECT_CONTEXT.md. Continuemos Luma desde la beta actual. Primero revisá el estado del repositorio y las pruebas».

Para actualizar una copia existente sin cambios locales pendientes: `git pull --ff-only`. Antes de cambiar de computadora, guardar el trabajo en Git con commit y push. Los proyectos `.luma` y sus medios se transfieren por separado, no mediante este repositorio.

## Abrir en Windows

Extraer el ZIP completo. Abrir `dist/index.html` con Chrome o Edge, o hacer doble clic en `ABRIR-LUMA.cmd`. Mantener juntos `index.html`, `style.css`, `core.js` y `app.js`.

La aplicación publicada requiere conexión para cargar. Para usar sin internet, llevar la carpeta portable; esta beta todavía no es una PWA instalable.

## Primer montaje

1. Conectar el proyector y usar Windows + P → Extender.
2. Cargar una foto tomada lo más cerca posible del lente del proyector. Ajustar sus cuatro esquinas con **Ajustar encuadre**. La foto sólo aparece en el editor.
3. Crear superficies rectangulares o usar **Pluma**. Clic agrega puntos; Enter o clic en el primer punto cierra; Escape cancela.
4. En **Mover**, arrastrar nodos o el interior de una superficie. Doble clic en un borde recto agrega un nodo. Seleccionar un nodo y **Curvar nodo** crea dos tiradores Bézier independientes. **Hueco** crea una exclusión dentro de la superficie seleccionada.
5. **Silueta** selecciona una región contigua de color similar en la foto. Ajustar tolerancia y corregir los nodos generados. Es segmentación por color a 320 × 180, no reconocimiento de objetos con IA; extrae el contorno exterior y los huecos se dibujan manualmente.
6. Importar videos o imágenes, seleccionar una superficie y pulsar un clip. También se puede elegir **Color sólido**: preparar un color con el selector, una muestra o un hexadecimal de seis dígitos y pulsar **Aplicar color**. Cada superficie conserva su propio color. Incluye tres fuentes generativas para probar sin archivos.
7. Ajustar opacidad, brillo, saturación, tono y mezcla. Activar perspectiva para cuadriláteros convexos de cuatro puntos sin curvas. Las demás superficies recortan el contenido sobre su caja envolvente.
8. Guardar escenas y elegir fundido: corte, 0,5, 1 o 2 segundos. Esta selección se usa al aplicar un nuevo color, cambiar entre color y clip o recuperar una escena. El fundido parte de una captura del estado anterior. Los clips son compartidos por las superficies y se reproducen en bucle, sin audio.
9. **Proyectar** abre una ventana aparte. Moverla al proyector y activar pantalla completa con su botón o doble clic. El editor debe seguir abierto y sin minimizar. **Negro** apaga visualmente la salida.
10. **Guardar proyecto** descarga un archivo `.luma` que incluye medios, foto, superficies y escenas. No hay guardado automático. **Abrir** recupera ese archivo en otra notebook.

## Alcance y límites

- Un proyector por notebook; salida fija 1280 × 720, conservando 16:9 con franjas negras si cambia la relación de aspecto.
- Renderizado Canvas 2D: el rendimiento depende de la GPU, resolución y número de videos. El contador FPS describe el editor, no mide físicamente la salida del proyector.
- 40 MB por archivo; 120 MB de medios en total; hasta 80 clips y 50 escenas. Videos MP4 H.264 o WebM según soporte del navegador.
- No incluye IA, mezcla de bordes entre proyectores, sincronización de notebooks, MIDI/OSC, audio ni malla de deformación avanzada.
- Deshacer/rehacer cubre superficies, filtros, capas, nombres y escenas; la foto de referencia y las importaciones no se deshacen.
- Los colores sólidos respetan curvas, huecos, opacidad, filtros y mezcla. El selector prepara el próximo color; **Aplicar color** dispara el cambio. Los colores se guardan en las escenas y en `.luma`; no hay secuencia automática de colores. La duración de fundido es un control de la sesión y no se guarda en el proyecto.
- La beta 0.2 abre proyectos anteriores. Los proyectos que utilicen colores sólidos requieren la beta 0.2 o posterior.
- La calibración de cuatro puntos corrige un plano. Objetos a distintas profundidades pueden necesitar ajustes por superficie.
- Probar con el proyector y las notebooks del taller antes de utilizarla en una actividad en vivo.

## Desarrollo y comprobación

Sin compilación ni dependencias. Servir `dist` con cualquier servidor estático. Por ejemplo: `python -m http.server 4173 --directory dist`.

Comprobar sintaxis con `node --check dist/app.js` y ejecutar `node --test tests/core.test.cjs`. Las pruebas verifican homografía, cuadriláteros válidos, contornos, formato de proyecto y rechazo de entradas incompatibles.

El alojamiento original en Sites es independiente. Este repositorio no necesita configuración de Sites y un push a GitHub no despliega la aplicación.
