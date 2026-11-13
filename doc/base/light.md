
# Light

Defines the properties of a light. The final result of the rendering and the concrete meaning of each parameter may vary depending on the rendering method. At the `bg2e-base` library level, the `Light` class is only used as a data container and to handle data serialization and deserialization.

```js
import Light, { LightType } from 'bg2e-js/ts/base/Light';
import Color from 'bg2e-js/ts/base/Color';

const light = new Light();
light.color = new Color({ rgb: 0.77 });
light.type = LightType.POINT;
```

## `LightType`

Defines the available kinds of lights:

```js
const LightType = {
    DIRECTIONAL: 4,
    SPOT: 1,
    POINT: 5,
    SUN: 6,
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

**`l.color`**: (read/write) linear RGB [`Color`](color.md) or a three/four-component array.

**`l.intensity`**: (read/write) `number`

**`l.spotCutoff`**: (read/write) `number`

**`l.spotExponent`**: (read/write) `number`

**`l.shadowStrength`**: (read/write) `number`

**`l.castShadows`**: (read/write) `boolean`

**`l.shadowBias`**: (read/write) `number`

**`l.projection`**: (read/write) [`bg2e-math.Mat4`](../../bg2e-math/doc/mat4.md) (projection matrix)

    
## Serialize/Deserialize

See the [serialization protocol](serialization.md).

## Native solar properties

`LightType.SUN` imports `kTypeSun` and acts as a directional emitter. `solarSize` defaults to 1 solar radius and `solarDistanceMillionKm` to 149.6 million km; both require finite positive values. `sourceSize` (default 0.5), `shadowSamples` (8), `affectsReflections` (true) and `spotAngle` (22) are retained when importing and cloning lights. `affectsReflections` is retained metadata; the WebGL renderer does not implement native per-light reflection exclusions.

See [Environment and Sun](../render/Environment.md) for same-node association, atmospheric evaluation, image import and optional soft shadows.

For a Sun, emitted rays follow node-local +Z transformed into world space; `direction` does not override that convention. Ordinary directional lights use their authored `direction`. `sourceSize` is an angular radius in degrees for directional shadows; solar shadows derive their angle from size and distance. Zero source size or at most one sample selects hard shadows. These values affect PCSS only when `sceneRenderer.softShadows` is enabled.
