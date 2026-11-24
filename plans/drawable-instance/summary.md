# Plan de implementación de DrawableInstance

El SDK TypeScript importará las escenas publicadas por C++ con componentes `DrawableInstance`. Las instancias compartirán geometría y tendrán materiales, transformaciones y metadatos de submalla independientes. La caché tendrá una API pública para consultar, añadir y eliminar recursos. El SDK nativo seguirá siendo responsable de toda la serialización.

El lector seguirá el contrato nativo de documento, componentes y BG2, adaptando la realización de recursos a promesas y URLs web. Los nombres de los campos JSON seguirán el formato nativo y los atributos existentes de `Material` conservarán su API. Se ignorarán los campos de ray tracing. Se mantendrá el soporte actual de HDR de entorno. Las texturas HDR de materiales quedan fuera del trabajo.

Se retirarán el componente `Instance` y el soporte del formato `.vwglb`. El ejemplo `33_instances` mostrará diferencias de material y selección individual con geometría compartida. La documentación describirá el nuevo componente y la caché.

| Paso | Resultado |
| --- | --- |
| [01](steps.md#01-retirar-vwglb) | Carga de modelos limitada a BG2 y retirada del formato obsoleto. |
| [02](steps.md#02-adaptar-el-lector-de-escenas-y-bg2) | Lectura de documento, propietarios, transformaciones y datos BG2 conforme al contrato nativo. |
| [03](steps.md#03-adaptar-la-lectura-de-materiales) | Lectura compatible de materiales completos y aplicación de cambios parciales sobre originales. |
| [04](steps.md#04-crear-la-caché-pública) | API pública, reutilización asíncrona y protección de recursos vinculados cuando resulte viable. |
| [05](steps.md#05-integrar-drawableinstance-y-retirar-instance) | Nuevo componente, integración con el renderer y migración de consumidores de `Instance`. |
| [06](steps.md#06-migrar-el-ejemplo-y-documentar-la-api) | Ejemplo actualizado y documentación de carga y uso. |
| [07](steps.md#07-verificar-con-escenas-nativas) | Verificación integrada con exportaciones C++ y comprobación de las retiradas. |

## Cómo continuar

1. Lee este archivo, [steps.md](steps.md), las instrucciones del repositorio y `progress.md` si ya existe. Si todavía no existe, empieza en el paso 01.
2. Ejecuta el paso indicado en **Siguiente paso** de `progress.md`. Revisa los cambios existentes, completa los criterios del paso y registra la evidencia. Si el paso está en curso o bloqueado, retómalo desde la última tarea pendiente.
3. Al completar el primer paso, crea `progress.md` en este directorio. Al terminar cada paso posterior, actualiza ese mismo archivo, conserva el historial y señala el siguiente paso por número, título y enlace. Si se interrumpe el trabajo antes de completar un paso, guarda un punto de reanudación en el mismo archivo y deja ese paso como siguiente.
4. Después de actualizar el registro, continúa con el siguiente paso si el encargo en curso lo autoriza. Al cerrar el último paso, escribe `Ninguno — plan completado` solo si se cumplen sus criterios.

### Contenido de progress.md

- **Último paso completado** con número, título y fecha, o `Ninguno`.
- **Siguiente paso** con número, título, enlace a `steps.md` y primera acción concreta.
- **Historial** con una entrada por paso completado. Incluye archivos principales, decisiones que condicionan los pasos siguientes, comandos ejecutados y resultados.
- **Trabajo pendiente o bloqueado** con el criterio pendiente, la causa, el estado de los cambios parciales y cómo retomarlos. Distingue las comprobaciones realizadas de las pendientes.
