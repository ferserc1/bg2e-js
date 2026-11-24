# Progreso de DrawableInstance

## Último paso completado

[07 Verificar con escenas nativas](steps.md#07-verificar-con-escenas-nativas) · 2026-11-24

## Siguiente paso

Ninguno — plan completado

## Historial

### 01 Retirar vwglb · 2026-11-24

- `Bg2LoaderPlugin.ts` registra y acepta BG2 por URL y desde buffer, también al invocar el plugin directamente. `Resource.ts` clasifica los binarios por la extensión del archivo, sin contar la consulta ni el fragmento de la URL.
- `Loader.ts` selecciona el primer archivo BG2 del drop y conserva los demás archivos como dependencias. Los ejemplos 26, 30, 32 y 34 usan la firma `setupModelDropZone(dropZone, cb)`.
- `Drawable.ts` carga la ruta declarada o el modelo BG2 derivado de `name`. Se retiraron el módulo `DrawableFormat.ts`, la preferencia global en `VitscnjLoaderPlugin.ts` y sus menciones en `doc/db` y `doc/manipulation`.
- El plano de `samples/resources/furniture` se renombró a `Plane.bg2` para conservar la referencia `Plane` de `furniture.vitscnj`. bg2io decodificó el archivo como BG2 1.2 con geometría y material. La comparación mediante `git show` y `cmp` confirmó que se conservaron los bytes.
- `npm run build` compiló el SDK. `npm --prefix repos/bg2e-js test` completó 28 pruebas con éxito. `npm --prefix samples/<ejemplo> run build` compiló los ejemplos `26_model_load`, `30_bounding_box`, `32_joints`, `34_sofa_reorder` y `25_debug`. Vite avisó del tamaño de los paquetes y del script clásico de depuración en el ejemplo 25.
- Una comprobación con `node --input-type=module` usó el bundle compilado, bg2io WASM y `Plane.bg2`. Confirmó la carga por URL con consulta y fragmento, la referencia `Drawable` por nombre, la carga desde buffer y el drop con una lista mixta de archivos. Comprobó el rechazo de la extensión retirada por URL y buffer, incluido el acceso directo al plugin, y que un drop con solo esa extensión no ejecuta el callback. La respuesta de red y el evento de arrastre se simularon en Node.
- `git diff --check` pasó. La búsqueda de referencias y nombres de archivos presentes mediante `rg` y `git ls-files` quedó vacía fuera del plan.

### 02 Adaptar el lector de escenas y BG2 · 2026-11-24

- `VitscnjLoaderPlugin.ts` comparte la validación de documento y nodos entre ambas extensiones. Cada escena usa un cargador con base propia y comparte la caché y los recursos WASM. Los dos recursos de ejemplo con cabecera histórica ahora usan la variante de cabecera omitida.
- `Component.ts`, `Transform.ts`, `SceneData.ts` y `Drawable.ts` aplican las reglas nativas de prioridad, matrices, nombres y referencias. `Bg2LoaderPlugin.ts` resuelve materiales repetidos en orden, conserva los nombres de la geometría e inicializa grupo, visibilidad y UV1.
- Antes de que el usuario indicara que se encargaría de las pruebas, pasaron `npm run build`, `npm --prefix repos/bg2e-js test` (32 pruebas), `node_modules/.bin/tsc -p repos/bg2e-js/tsconfig.json --pretty false` y `git diff --check`.
- El usuario ejecutó la comprobación de la textura asimétrica en Safari y Brave. Ambos mostraron `PASS BG2 UV0 and UV1, WebGL V=0.25 blue, V=0.75 red`.

### 03 Adaptar la lectura de materiales · 2026-11-24

- `Material.ts` comparte la lectura completa por URL y por dependencias. `withOverrides` aplica los campos válidos a una apariencia independiente. `MaterialTextureSettings.ts` valida y aplica los ajustes de los seis slots. `Texture.ts` comparte imágenes decodificadas por URL o identidad de archivo y retira las cargas fallidas para permitir reintentos.
- El render usa la visibilidad del material además de la de la submalla. WebGL aplica doble lado y unlit, invierte los canales seleccionados del empaquetado y mantiene RGB para baked GI. `doc/base/material.md` recoge los límites de los samplers y de la combinación de canales.
- El usuario ejecutó `npm run build`, `npm --prefix repos/bg2e-js test` (32 pruebas) y `./node_modules/.bin/tsc -p repos/bg2e-js/tsconfig.json` con éxito antes de los últimos ajustes de WebGL. La página de prueba resuelve el PNG respecto de su URL. Los archivos arrastrados comparten el decodificador con las imágenes por URL mediante una URL de objeto temporal.
- Se corrigieron la preparación del destino de dibujo antes del primer empaquetado y la selección de la unidad de textura antes de subir cada fuente. Tras esos cambios, el usuario ejecutó `gpu-materials.html` en Safari y obtuvo `ALL MATERIAL CHECKS PASSED`. El empaquetado devolvió `127, 63, 191, 0`. La página confirmó también la lectura por URL y dependencias, el aislamiento de las capas parciales, el RGB de baked GI, el corte alfa cero, unlit en ambos shaders PBR, el doble lado y la visibilidad independiente. WebGL no informó de errores.

### 04 Crear la caché pública · 2026-11-24

- `DrawableCache.ts` exporta la consulta, alta, carga y eliminación. Deduplica URLs y cargas en curso, permite reintentar fallos e invalida los resultados de peticiones retiradas. Los vínculos explícitos impiden retirar entradas activas, incluso cuando se separa un subárbol.
- `Loader.ts` y `VitscnjLoaderPlugin.ts` crean una caché por escena o usan la indicada por la aplicación. `Drawable.ts` conserva una copia editable por propietario y libera su vínculo al reasignar o destruir el componente. La caché libera la geometría compartida al eliminar una entrada sin consumidores. `doc/db/loader.md` documenta la API y su ciclo de vida.
- El usuario ejecutó `npm run build`, `npm --prefix repos/bg2e-js test` (36 pruebas) y `./node_modules/.bin/tsc -p repos/bg2e-js/tsconfig.json` con éxito. La página `gpu-materials.html` mostró `ALL MATERIAL CHECKS PASSED`. WebGL confirmó que la caché protege la geometría vinculada, que destruir un propietario libera su textura combinada y que retirar una entrada sin vínculos libera sus buffers compartidos.

### 05 Integrar DrawableInstance y retirar Instance · 2026-11-24

- `DrawableInstance.ts` carga BG2 desde la caché de escena, aplica registros por índice y conserva las referencias para reintentar. Cada vínculo comparte geometría y mantiene materiales, metadatos, transformaciones y selección independientes. Una preparación anterior pierde su vínculo al revincular o destruir el componente.
- `RenderQueue.ts`, `RenderState.ts`, `AABoundingBox.ts`, la selección y los gizmos usan la instancia y su matriz por dibujo. El objeto devuelto por la selección identifica el componente dibujado en `drawable`. Se eliminaron el componente `Instance`, su registro y el getter en `Node`. El ejemplo 33 comparte un modelo y permite mover y recolorear la silla seleccionada.
- La primera compilación del SDK pasó y 39 de 40 pruebas pasaron. La prueba de selección detectó que la copia de `PolyList` leía el estado desde el setter `selectable`. Tras cambiar la lectura al getter `isSelectable`, el usuario confirmó que pasaron las 40 pruebas del SDK.
- El usuario comprobó en el ejemplo 33 que podía seleccionar, mover y recolorear una silla de forma independiente y confirmó que las demás conservaban su apariencia y posición.

### 06 Migrar el ejemplo y documentar la API · 2026-11-24

- `33_instances` conserva la cuadrícula, la paleta de materiales, la selección y el gizmo. El panel muestra el color seleccionado y el RGB de otra silla como referencia mientras se edita.
- `doc/db/loader.md` explica la creación programática, el alta manual, la consulta y la eliminación, y cuándo liberan sus vínculos los componentes. `doc/db/vitscnj-loader-plugin.md` muestra el formato de salida C++ e indica las bases de las rutas, el orden de submallas y el reintento.
- Se contrastaron los ejemplos con las exportaciones públicas y se buscaron los nombres retirados en fuentes, ejemplos y documentación. El usuario confirmó que funcionaban las comprobaciones solicitadas con `npm run dev:instances`. El color y los valores RGB de la referencia se mantienen al editar la silla seleccionada, y seleccionar otra silla actualiza el panel.

### 07 Verificar con escenas nativas · 2026-11-24

- `samples/resources/instances/instances.json` es la exportación completa facilitada por el usuario. Incluye un suelo, un cubo, dos instancias con material y lightmap propios, cámara, sol y fuentes. Los archivos originales se conservaron.
- `samples/resources/instances/reference/instances.json` se generó con un ejecutable temporal compilado mediante `clang++ -std=c++20` y enlazado con `bg2e-native/bin/macos/libbg2e.dylib`. El programa cargó un documento de preparación con `bg2e::db::loadScene` y guardó su raíz con `bg2e::db::saveSceneReferences`. La generación terminó con código 0 y sin avisos del informe de guardado. La variante incluye dos propietarios, un suelo sin propietario, un desplazamiento de submalla, una cara oculta, un material de doble lado, inversión de canal, una textura asimétrica en la carpeta de la escena y un rótulo con la fuente exportada.
- El ejemplo independiente `samples/37_instance_load` presenta ambas escenas. La variante de referencias devuelve un 404 intencionado durante la primera carga del suelo. El botón `Retry floor` vuelve a pedir el BG2. El panel explica la cara desplazada y la cara oculta, e informa de geometría compartida, estado de materiales, rutas, orientación mediante lectura WebGL y render inicial. Permite alternar los mapas de luz e inspeccionar la selección. La exportación completa también comprueba el BG2 directo y por buffer con dependencias.
- Las búsquedas de texto con `rg` en fuentes, ejemplos y documentación y de nombres presentes con `git ls-files` no encontraron referencias retiradas. Las rutas del nuevo guardado por referencia son relativas al documento.
- El usuario confirmó que la exportación completa cargó y que las pruebas de Vite pasaron. En el guardado por referencia observó la cara desplazada y la ausencia de la cara trasera del cubo verde. Ambas diferencias proceden de los campos nativos de submalla.
- El usuario confirmó que el ejemplo independiente funciona y que **Retry floor** recupera el suelo. También confirmó que `npm --prefix samples/37_instance_load run build && git diff --check` pasó.

## Trabajo pendiente o bloqueado

Ninguno.
