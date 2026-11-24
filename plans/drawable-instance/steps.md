# Pasos de implementación

Sigue el orden de [summary.md](summary.md#cómo-continuar) y actualiza `progress.md` al cerrar cada paso. El repositorio no tiene infraestructura general de pruebas. Usa el build existente y comprobaciones específicas de los casos de este plan.

## 01 Retirar vwglb

- Busca referencias en código, documentación, ejemplos y nombres de archivos versionados. Incluye `DrawableFormat`, `preferredDrawableFormat`, `PreferredDrawableFormat()` y `preferedDrawableFormat`.
- Limita a BG2 el registro de extensiones del plugin, la clasificación de recursos y la selección de modelos en el drop zone. Retira el fallback de `Drawable` y la configuración que administraba la preferencia entre formatos. Revisa la ruta de carga desde buffer y cualquier entrada que pueda terminar tratando un fichero antiguo como BG2.
- Actualiza las llamadas de arrastre en los ejemplos 26, 30, 32 y 34, y la documentación bajo `doc/db` y `doc/manipulation`. Comprueba las referencias al recurso `samples/resources/furniture/Plane.vwglb` y retira ese recurso obsoleto.
- **Cierre.** BG2 sigue cargando por URL y desde el drop zone. La extensión retirada se rechaza en las entradas de carga de modelos. La búsqueda de referencias y archivos en fuentes, ejemplos y documentación del SDK queda vacía, excluyendo este plan y su registro de progreso.

## 02 Adaptar el lector de escenas y BG2

- En `VitscnjLoaderPlugin`, comparte las reglas de validación entre las extensiones de escena admitidas. Exige el array `scene`, acepta `fileType` omitido y exige `bg2e::scene` cuando esté presente. Trata la versión como informativa. Conserva la raíz sintética y los atributos de nodo. Rechaza una entrada raíz malformada y omite hijos o componentes malformados con diagnóstico. Conserva la preparación de fuentes y texto que ya realiza el importador.
- Lee la prioridad común como entero sin signo de 32 bits con valor inicial cero. Lee `Transform.transformMatrix` como 16 números finitos en orden column-major, con identidad como fallback. Prepara una validación específica para las matrices de submalla que exija además una matriz afín con determinante absoluto finito de al menos `1e-12`.
- En `Drawable`, usa `path` cuando sea una cadena no vacía y aplica `resourceName` si es una cadena válida. Un `path` vacío es un error. Si `path` no es una cadena, usa un `name` no vacío y sustituye su extensión por `.bg2`. Usa el nombre base del modelo como fallback de `resourceName`. Resuelve las referencias respetando las URLs absolutas y preservando una base de escena estable durante cargas concurrentes.
- En `Bg2LoaderPlugin`, conserva el orden de las listas de polígonos y asigna materiales por coincidencia exacta de nombre. Consume primero las entradas coincidentes sin usar, reutiliza la primera cuando se agoten y diagnostica la ausencia de coincidencias. Conserva los nombres de la geometría y toma del material el grupo y la visibilidad inicial nativos. Usa UV0 cuando UV1 esté vacía. Comprueba la orientación de las UV con una textura asimétrica y aplica una sola compensación de V en el recorrido web.
- **Cierre.** Comprueba cabecera presente, ausente e inválida, nodos malformados, prioridad, matrices, rutas y nombres legados. Verifica asignación de materiales repetidos y fallback UV1. Conserva el callback de importación y las entradas de carga BG2 actuales.

## 03 Adaptar la lectura de materiales

- Reutiliza los recorridos existentes de `Material.deserialize` y `deserializeWithDependencies` para materiales completos. Comparte la interpretación de campos cuando ambas entradas lo permitan. Conserva los atributos y firmas públicas de `Material`, los callbacks y la compatibilidad con campos legados.
- Asigna `isUnlit` a `material.unlit` con fallback al booleano legado `unlit`. Respeta `alphaCutoff` explícito, incluido cero, y conserva los valores por defecto aplicables. Comprueba que WebGL aplique el estado unlit en las rutas de dibujo correspondientes.
- Conserva el significado de `doubleSided`, `visible`, `metalnessInvert`, `roughnessInvert` y `lightEmissionInvert` en estado interno asociado a la apariencia. Traduce el doble lado a la política existente de descarte de caras. Aplica las inversiones al canal seleccionado durante la combinación de texturas. Conserva aparte la visibilidad de material y la de submalla. Asegura que el estado interno se copie al crear una apariencia independiente.
- Implementa la aplicación parcial de los campos nativos sobre originales. Trata los valores inválidos como ausentes con diagnóstico. En cada slot, la ausencia conserva la textura, `null` la elimina y una cadena no vacía reemplaza la fuente. Resuelve las imágenes relativas al documento que las declara. Conserva los controles UV y los ajustes heredados según el contrato nativo, y usa valores iniciales de textura nueva cuando se sustituya la fuente. Aplica los ajustes sin mutar las texturas compartidas y permite reutilizar los datos de imagen.
- Usa la correspondencia documentada de los seis slots, incluida la grafía `ambientOcclussion`. Valida enums y valores finitos. Resuelve el modo indirecto antes de preparar AO y conserva el RGB de bakedGI. Documenta las diferencias de ajustes que impongan WebGL y las APIs existentes. Mantén la carga HDR actual del entorno y el recorrido actual de imágenes de material.
- **Cierre.** Verifica las rutas por URL y dependencias, `isUnlit: false`, `alphaCutoff: 0`, visibilidad, descarte de caras, inversiones y una instancia que hereda, elimina y reemplaza texturas en slots diferentes. Comprueba que editar ajustes de una apariencia deja intactas las demás.

## 04 Crear la caché pública

- Exporta `DrawableCache` desde la API habitual del SDK. Define operaciones tipadas de consulta, alta por código y eliminación, además de la carga BG2 que usará el importador. Documenta la identidad de altas manuales, la respuesta ante claves duplicadas y cómo se obtiene o proporciona la caché de una escena.
- Usa URLs normalizadas para modelos cargados. Mantén una entrada compartida para solicitudes concurrentes y retira el intento fallido para permitir reintentos. La publicación o eliminación durante una carga debe dejar un estado coherente cuando la promesa se resuelva.
- Conserva originales de apariencia independientes de los propietarios vivos y define quién libera la geometría y los recursos WebGL compartidos. Destruir una instancia debe liberar su apariencia y su vínculo. La geometría se libera cuando termina su uso según el contrato elegido. Evita que un propietario editable pueda alterar los originales o que destruirlo invalide otras instancias.
- Intenta registrar vínculos mediante operaciones explícitas de asociación, cambio y liberación. Usa un recuento de vínculos activos y describe qué cuenta, incluidos los componentes de un subárbol separado que conserva su recurso. Rechaza la eliminación mientras existan vínculos activos si las rutas de ciclo de vida permiten mantener ese estado con sencillez. Si adoptas la variante sin contador, registra el motivo en `progress.md`. Define en ese caso la eliminación como retirada de la entrada de búsqueda y garantiza que los consumidores ya vinculados conserven recursos válidos.
- **Cierre.** Comprueba alta, consulta, claves equivalentes, dos cargas simultáneas, fallo y reintento, eliminación durante o después de una carga y la semántica de eliminación con consumidores vivos. Documenta cualquier diferencia con los handles y la retención del SDK nativo.

## 05 Integrar DrawableInstance y retirar Instance

- Crea y exporta el componente `DrawableInstance`, regístralo con ese nombre exacto y añade el acceso equivalente en `Node`. Permite vincular por código un recurso de la caché, también para el ejemplo. Usa la caché de escena para resolver el `path` del JSON, incluso si no hay un propietario o aparece después de la instancia. Los propietarios repetidos deben conservar estado independiente y la instancia debe partir de los originales.
- Aplica `submeshes` por índice, con el número real de submallas BG2. Conserva originales en registros ausentes o inválidos y diagnostica discrepancias de longitud. Mantén matrices locales, nombre, grupo, visibilidad y material por instancia. Una exportación completa ya trae matrices ajustadas a la geometría publicada. Compón `nodeWorld * submeshLocal` respetando el orden de la API `Mat4.Mult`. Ignora los campos de ray tracing.
- Conserva el componente y los datos declarados si falla el modelo o una textura necesaria. Emite un diagnóstico con nodo y referencia, permite reintentar y evita dibujar la instancia hasta que pueda prepararse. Comprueba que otros nodos válidos sigan importándose. Coordina reintentos, revinculación y liberación para que una carga anterior no sobrescriba un vínculo más reciente.
- Migra la cola y el estado de render, límites, picking, visitantes de selección y gizmos. Aplica los estados por dibujo y conserva la identificación por instancia en todas las pasadas que la necesiten. Revisa clonación, reasignación y destrucción para que la apariencia sea independiente y la geometría siga compartida.
- Migra la entrada del ejemplo al nuevo componente para mantener el ejemplo compilable. Retira la clase antigua, su registro, el getter y las rutas internas exclusivas del componente antiguo. Conserva la capacidad de selección individual que usaban esas rutas.
- **Cierre.** Dos instancias pueden compartir geometría y mostrar distintas apariencias y transformaciones. Comprueba selección, límites, movimiento mediante gizmos, destrucción de una instancia y recuperación tras un fallo en la carga. Verifica que el tipo nuevo se deserializa desde la entrada normal de escenas.

## 06 Migrar el ejemplo y documentar la API

- Completa `samples/33_instances` para construir la cuadrícula a partir de un recurso de caché y asignar materiales visiblemente diferentes. Conserva la interacción de selección individual. Incluye una forma visible de verificar que cambiar una apariencia deja intactas las demás.
- Documenta creación programática, consulta, alta y eliminación de recursos, ciclo de vida y semántica de vínculos. Añade un ejemplo corto de JSON producido por C++ con `DrawableInstance` y explica las bases de las rutas, la correspondencia de submallas y el diagnóstico de recursos.
- Retira las menciones obsoletas en documentación, ejemplos y comentarios. Conserva las demás referencias a métodos de instancia en su sentido general.
- **Cierre.** Ejecuta `npm run dev:instances` y revisa la cuadrícula y su selección en WebGL. Comprueba que los ejemplos de documentación usan las exportaciones definitivas y reflejan el alcance de deserialización.

## 07 Verificar con escenas nativas

- Ejecuta `npm run build`, el build del ejemplo mediante `npm --prefix samples/33_instances run build` y las comprobaciones de los ejemplos afectados por la retirada del formato obsoleto. Revisa `git diff --check` y busca restos del componente antiguo y del formato retirado en código, ejemplos, documentación y archivos versionados.
- Carga en el navegador escenas producidas mediante guardado de referencias y exportación completa de C++. Usa un modelo compartido, una instancia sin propietario, propietarios repetidos, materiales distintos por instancia, una matriz de submalla y rutas de texturas procedentes de ambos directorios. Comprueba selección, visibilidad, doble lado, alpha cutoff cero, inversiones y orientación de UV.
- Prueba una referencia fallida junto a un nodo válido y verifica el reintento. Revisa regresiones en BG2 directo, carga por dependencias, cámara, luz, texto y entorno HDR. Los mapas HDR de material conservan el comportamiento previo y los campos de ray tracing carecen de efecto.
- **Cierre.** Registra los comandos, los resultados y las escenas usadas. Si no se dispone de una exportación nativa necesaria o el entorno impide una comprobación, deja constancia del bloqueo en `progress.md` y conserva este paso como siguiente.

## Referencias del SDK nativo

- [DrawableSceneFormat.md](../../../bg2e-native/doc/api/db/DrawableSceneFormat.md) para campos, validación, materiales, rutas y exportación completa.
- [DrawableCache.md](../../../bg2e-native/doc/api/draw/DrawableCache.md) y [drawable_caches_and_instances.md](../../../bg2e-native/doc/architecture/drawable_caches_and_instances.md) para identidad, geometría compartida, originales y ciclo de vida.
- [DrawableInstanceComponent.md](../../../bg2e-native/doc/api/scene/DrawableInstanceComponent.md) y [SceneReferences.md](../../../bg2e-native/doc/api/db/SceneReferences.md) para asociación, preparación y recuperación.
