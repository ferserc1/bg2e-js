
# Light

Defines the properties of a light. The final result of the rendering and the concrete meaning of each parameter may vary depending on the rendering method. At the `bg2e-base` library level, the `Light` class is only used as a data container and to handle data serialization and deserialization.

```js
import Light, { LightType } from 'bg2e/base/Light';
import Color from 'bg2e/base/Color';

const light = new Light();
light.ambient = new Color({ rgb: 0.1 });
light.diffuse = new Color({ rgb: 0.77 });
light.type = LightType.POINT;
```

## `LightType`

Defines the available kinds of lights:

```js
const LightType = {
    DIRECTIONAL: 4,
    SPOT: 1,
    POINT: 5,
    DISABLED: 10
}
```


## Functions

**`l.clone()`**: returns a copy of `l`.

**`l.assign(l2)`**: copy the attributes of `l2` into `l`.

## Properties

**`l.enabled`**: (read/write) `boolean`

**`l.type`**: (read/write) `LightType`

**`l.direction`**: (read/write) [`bg2e-math.Vec`](../../bg2e-math/doc/vector.md) with three components.

**`l.ambient`**: (read/write) [`Color`](color.md)

**`l.diffuse`**: (read/write) [`Color`](color.md)

**`l.specular`**: (read/write) [`Color`](color.md)

**`l.intensity`**: (read/write) `number`

**`l.spotCutoff`**: (read/write) `number`

**`l.spotExponent`**: (read/write) `number`

**`l.shadowStrength`**: (read/write) `number`

**`l.castShadows`**: (read/write) `boolean`

**`l.shadowBias`**: (read/write) `number`

**`l.projection`**: (read/write) [`bg2e-math.Mat4`](../../bg2e-math/doc/mat4.md) (projection matrix)

    
## Serialize/Deserialize

See the [serialization protocol](serialization.md).
