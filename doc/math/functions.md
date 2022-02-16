# Math functions

```js
import { math } from 'bg2/math';

math.checkPowerOfTwo(1024);
```

## EPSILON functions

**`math.checkPowerOfTwo(n)`**: Tests if a number is a power of two. Returns the number passed if it is greater than EPSILON, or zero otherwise

**`math.checkZero(n)`**: Tests if a number is zero, taking into account the constant `math.EPSILON`.

**`math.equals(n)`**: Tests if a numer is equals to other, taking into account the constant `math.EPSILON`.

**`math.degreesToRadians(deg)` and `math.radiansToDegrees(rad)`**: Converts between radians and degrees.

All the following functions in bg2e math library takes into account the EPSILON constant to round zero values. For example, note the difference between using `radiansToDegrees()` and `RAD_TO_DEG`:

```js
const rad = math.PI_4;
console.log(`${ rad } radians = ${ math.radiansToDegrees(rad) }º`);     // 0.785398163397448 radians = 45º
console.log(`${rad} radians = ${math.RAD_TO_DEG * rad}º.`); //0.785398163397448 radians = 44.999999999999986º
```

The fact that the EPSILON constant is taken into account makes the calculations slightly less optimal compared to the use of the native JavaScript mathematical library. For that reason it is advisable to evaluate well which functions we use depending on the case. If we have rounding problems, we can use the bg2 engine mathematical functions, and if we need a little more performance, because we are doing a particularly expensive calculation, it may be better to use the native JavaScript functions.

## Trigonometric functions

**`math.sin(val)`**

**`math.cos(val)`**

**`math.tan(val)`**

**`math.cotan(val)`**

**`math.atan(val)`**

**`math.atan2(i,j)`**

## Other functions

**`math.seededRandom()`**: Returns a random number between 0 and 1. This function is responsible for initializing the random number seed using system variable values to improve the randomness of the native `Math.random()` function.

**`math.max(n,b)`**: Returns the higher value between `a` and `b`.


**`math.min(n,b)`**: Returns the lower value between `a` and `b`.


**`math.abs(n)`**: Returns the absolute value of `n`.


**`math.sqrt(n)`**: Returns the square root of `n`.


**`math.ler(from, to, t)`**: Performs a linear interpolation between `from` and `to`, determined by `t` (between 0 and 1).


**`math.square(n)`**: Returns the square of `n` (n * n).
