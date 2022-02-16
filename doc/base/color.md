
# Color

Defined as:

```js
import Vec from 'bg2e/math/Vec'

class Color extends Vec { ... }
```

Implements an specific constructor and static functions to treat vectors as colors.

## Constructor

`Color` class provides four kinds of initializers:

- An array of four elements, corresponding with the RGBA values of a color.
- An array of three elements, corresponding with the RGB values of a color. In this case, the alpha value will be set to one.
- An object with, any of the following attributes:
    * `r`: numeric value for the red component.
    * `g`: numeric value for the green component.
    * `b`: numeric value for the blue component.
    * `a`: numeric value for the alpha component.
    * `rgb`: numeric value for the red, green and blue components. This is usefull to define a grey color. The `r`, `g` and `b` parameters are more prioritary than `rgb`, in case that you specify both.
- None: the color will be initialized as black [0, 0, 0, 1].

All of the following initializers are valid:

```js
import Color from 'bg2e/base/Color';

new Color([1, 1, 0.3, 0.5]);    // r: 1, g: 1, b: 0.3, a: 0.5
new Color([0, 0, 0.3]);         // r: 0, g: 0, b: 0.3, a: 1
new Color({ rgb: 0.4, r: 1});   // r: 1, g: 0.4, b: 0.4, a: 1
new Color({ a: 0.1 });          // r: 0, g: 0, b: 0, a: 0.1
new Color({});                  // r: 0, g: 0, b: 0, a: 1
new Color();                    // r: 0, g: 0, b: 0, a: 1
```

## Static functions

The `Color` class provides a series of factory methods to build predefined colors:

**`Color.Yellow()`**: (1.0,1.0,0.0,1.0)

**`Color.Orange()`**: (1.0,0.5,0.0,1.0)

**`Color.Red()`**: (1.0,0.0,0.0,1.0)

**`Color.Violet()`**: (0.5,0.0,1.0,1.0)

**`Color.Blue()`**: (0.0,0.0,1.0,1.0)

**`Color.Green()`**: (0.0,1.0,0.0,1.0)

**`Color.White()`**: (1.0,1.0,1.0,1.0)

**`Color.LightGray()`**: (0.8,0.8,0.8,1.0)

**`Color.Gray()`**: (0.5,0.5,0.5,1.0)

**`Color.DarkGray()`**: (0.2,0.2,0.2,1.0)

**`Color.Black()`**: (0.0,0.0,0.0,1.0)

**`Color.Brown()`**: (0.4,0.2,0.0,1.0)

**`Color.Transparent()`**: (0,0,0,0)

## Properties

The `Color` class adds the following properties to the `bg2e-math.Vec` base class:

**`c.r`**: (read/write) sets or gets the red component of `c`.

**`c.g`**: (read/write) sets or gets the green component of `c`.

**`c.b`**: (read/write) sets or gets the blue component of `c`.

**`c.a`**: (read/write) sets or gets the alpha component of `c`.

**`c.rgb`**: (read/write) sets or gets the rgb components of `c`. When it is used as getter, the returning value is a `bg2e-math.Vec` vector with three elements. When it is used as setter, the input parameter can be any array-like type with three elements.

