
# Mat3: 3x3 matrix

## Introduction

3x3 matrixes are represented by the `Mat3` class, which extends `bg2e.math.NumericArray`.

```js
import { Mat3 } from 'bg2e-math';

const m1 = new Mat3();
```

The `Mat3` constructor can accept three kinds of parameters:

- None: the matrix is initialized to zero.
- Nine numeric parameters: the matrix is initialized with the supplied values, as with [class `Vec`](vector.md). The values are placed starting with the first row, from left to right.
- An array parameter with nine elements. It can be another 3x3 matrix or a standard JavaScript array, but it must have exactly nine elements.

While with [class `Vec`](vector.md) there are specific rules for defining methods, properties or static functions, depending on their behavior, in the case of matrices (also in the case of [4x4 matrices](mat4.md), these rules do not apply. In this case, static methods, properties and functions are defined after analyzing their use in the graphics engine code.

In general, instance methods that return `this` (the matrix itself) are used when operations are to be used using the functional programming paradigm. For example, we use the instance method `.identity()` to set the matrix identity (the method modifies the state of the matrix), but we also use the instance method `.multVector(v)` to multiply a vector by the matrix (it returns the result and does not modify the state of the matrix):

```js
const m = new Mat3();

const v = m.identity()
    .setScale(5, 6, 7)
    .multVector(new Vec(1,0,0));

// v is the vector [1, 0, 0] scaled to [5, 6, 7]
```

In general, static functions are used as factory methods, and to obtain matrix values:

```js
const m = Mat3.MakeIdentity();
const q = new Quat(math.PI_2, 0, 1, 0);
const rot = Mat3.MakeWithQuaternion(q);
Mat3.IsIdentity(m);   // false
```

## Reference

### Instance methods

**`m.identity()`**: set the identity matrix.

**`m.zero()`**: set the matrix to zero.

**`m.row(i)`**: returns the row with index `i`. It returns a [`Vec`](instance) with three elements.

**`m.setRow(i, a, y = null, z = null)`**: sets the row with index `i`. You can pass the row values separately, or an array-like object with, at least three elements.

**`m.col(i)`**: returns the column with index `i`. It returns a [`Vec`](instance) with three elements.

**`m.setCol(i, a, y = null, z = null)`**: sets the column with index `i`. You can pass the row values separately, or an array-like object with, at least three elements.

**`m.assign(m)`**: copies the values of an array that is passed as a parameter. The array can be a `Mat3` object, a `Mat4` object or standard JavaScript arrays with 9 or 16 elements. If the array is 4x4, the value of the corresponding part will be set with the rotation:

```other
| V  V  V  x |
| V  V  V  x |
| V  V  V  x |
| x  x  x  x |
```

**`m.setScale(x,y,z)`**: assuming the matrix is a valid transformation matrix (it is orthogonal), modify it to include the scale supplied by the `x`, `y` and `z` parameters.

**`m.traspose()`**: transposes the matrix

**`m.mult(a)`**: multiplies the matrix `m` by the matrix `a`, which must be a 3x3 matrix. The resulting matrix will be stored in `m`: `m = m x a`

**`m.multVector(v)`**: multiplies `m` by the vector `v` and returns the result as an object [of class `Vec`](vector.md).

**`m.toString()`**: returns a text string formatted with the values of the array, divided into rows and columns.

```js
const m = new Mat3();
console.log(m
    .identity()
    .toString());
```

```other
[ 1, 0, 0 
  0, 1, 0
  0, 0, 1 ]
```

### Static functions

#### Factory methods

**`MakeIdentity()`**: Create an identity matrix.

**`MakeWithQuaternion(q)`**: Create a rotation matrix from a [quaternion](quaternion.md).

#### Query methods

**`IsZero(m)`**: Check if the matrix is zero, taking into account the [epsilon constant](constants.md).

**`IsIdentity(m)`**: Check if the matrix is identity, taking into account the [epsilon constant](constants.md).

**`GetScale(m)`**: Returns a scaling matrix extracted from `m`.

**`Equals(a,b)`**: Check if a === b, taking into account the [epsilon constant](constant.md).

**`IsNaN(m)`**: Check if `m` contains some `NaN` value.


