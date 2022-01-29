# Constants

## Example

```js
import { math } from 'bg2e-math';

console.log(math.PI_4);
```

## Reference

### Axis

It is used in various parts of the graphics engine to label coordinate axes. It can also be used to obtain a text string with the axis name from its numeric value.

```js
const xAxis = math.Axis.X;
const yAxis = math.Axis.Y;
const zAxis = math.Axis.Z;
console.log(`Axis: ${ math.Axis.name(xAxis) }, ${ math.Axis.name(yAxis) }, ${ math.Axis.name(zAxis) }`);
```

### Numeric constants

**`math.PI`** = π

**`math.PI_2`** = π / 2 (1.5707963267948966)

**`math.PI_4`** = π / 4 (0.785398163397448)

**`math.PI_8`** = π / 8 (0.392699081698724)

**`math.TWO_PI`** = 2 * π (6.283185307179586)

**`math.DEG_TO_RAD`** and **`math.RAD_TO_DEG`**: you can use these constants to make conversions between degrees and radians:

```js
const deg = 90;
const rad = math.PI_2;

console.log(`${deg}º = ${math.DEG_TO_RAD * deg} radians.`);
console.log(`${rad} radians = ${math.RAD_TO_DEG * rad} degrees.`);
```

**`math.EPSILON`** = 0.0000001

**`math.FLOAT_MAX`** = Maximum floating point 32 bits representable number (3.402823e38)

### Array types

**`math.NumericArray`**: Default array type for high efficiency and low precision operations. By default is 32 bits. This type is used by all the array based objects in the graphic engine (vector, matrixes, etc.). The precision can be changed to 64 bits in configuration.

**`math.NumericArrayHighP`**: Default array type for high precission operations. This type is implemented with a Float64Array type.

