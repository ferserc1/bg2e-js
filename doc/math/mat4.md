
# Mat4: 4x4 matrix

## Introduction

4x4 matrixes are represented by the `Mat4` class, which extends `bg2e.math.NumericArray`.

```js
import Mat4 from 'bg2e/math/Mat4';

const m1 = new Mat4();
```

The `Mat4` constructor can accept five kinds of parameters

- None: the matrix is initialized to zero.
- Nine numeric parameters: the matrix is initialized with the values supplied as a 3x3 matrix, which are placed starting from the first row, from left to right, in the part of the 4x4 matrix that corresponds to the rotation and scale (rows 1-3, columns 1-3).
- An array parameter with nine elements. Same as with nine parameters, but they are taken from an array. In this case, the array must contain exactly 9 elements.
- Sixteen numeric parameters: the matrix is initialized with the values supplied as a 3x3 matrix, which are placed starting from the first row, from left to right.
- An array parameter with sixteen elements. Same as with sixteen parameters, but they are taken from an array. The array must contain exactly 16 elements.

While with [class `Vec`](vector.md) there are specific rules for defining methods, properties or static functions, depending on their behavior, in the case of matrices (also in the case of [3x3 matrices](mat3.md), these rules do not apply. In this case, static methods, properties and functions are defined after analyzing their use in the graphics engine code.

In general, instance methods that return `this` (the matrix itself) are used when operations are to be used using the functional programming paradigm. For example, we use the instance method `.identity()` to set the matrix identity (the method modifies the state of the matrix), but we also use the instance method `.multVector(v)` to multiply a vector by the matrix (it returns the result and does not modify the state of the matrix):

```js
const m = new Mat4();

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

**`perspective(fovy, aspect, nearPlane, farPlane)`**: load a projection matrix with perspective parameters.

**`frustum(left, right, bottom, top, nearPlane, farPlane)`**: load a projection matrix with frustum parameters.

**`ortho(left, right, bottom, top, nearPlane, farPlane)`**: load a projection matrix with orthographic parameters.

**`lookAt(p_eye, p_center, p_up)`**: load a view matrix with `look at` parameters.

**`m.row(i)`**: returns the row with index `i`. It returns a [`Vec`](instance) with four elements.

**`m.setRow(i, a, y = null, z = null, w = null)`**: sets the row with index `i`. You can pass the row values separately, or an array-like object with, at least four elements.

**`m.col(i)`**: returns the column with index `i`. It returns a [`Vec`](instance) with four elements.

**`m.setCol(i, a, y = null, z = null, w = null)`**: sets the column with index `i`. You can pass the row values separately, or an array-like object with, at least four elements.

**`m.assign(m)`**: copies the values of an array that is passed as a parameter. The array can be a `Mat3` object, a `Mat4` object or standard JavaScript arrays with 9 or 16 elements. If the array is 3x3, the values will be set on the rotation/scale matrix (rows 1-3, columns 1-3):

```other
| V  V  V  x |
| V  V  V  x |
| V  V  V  x |
| x  x  x  x |
```

**`m.translate(x, y, z)`**: multiply `m` by the translation matrix created with the `x`, `y` and `z` parameters.

**`m.rotate(alpha, x, y, z)`**: multiply `m` by the rotation matrix created with the `alpha`, `x`, `y` and `z` parameters.

**`m.scale(x, y, z)`**: multiply `m` by the scale matrix created with the `x`, `y` and `z` parameters.

**`m.toString()`**: returns a text string formatted with the values of the array, divided into rows and columns.

**`m.setScale(x,y,z)`**: assuming the matrix is a valid transformation matrix (it is orthogonal), modify it to include the scale supplied by the `x`, `y` and `z` parameters.

**`m.setPosition(posOrX,y,z)`**: assuming the matrix is a valid transformation matrix, modify it to set the position suplied by the parameters. The parameters can be:

- An array with, at least, three elements, for the X, Y and Z components of the position.
- Three numeric values, corresponding with the X, Y and Z components of the position.

**`m.mult(a)`**: multiplies the matrix `m` by the matrix `a`, which must be a 4x4 matrix. The resulting matrix will be stored in `m`: `m = m x a`

**`m.multVector(v)`**: multiplies `m` by the vector `v` and returns the result as an object [of class `Vec`](vector.md). If the vector is of three elements, the real vector to be multiplied will be the one constructed as follows:

```js
const actualVector = new Vec(vec3, 1);
```

**`m.invert()`**: Invert the matrix, if it is orthogonal. Note that this operation is expensive, you should avoid using it during rendering, whenever possible.

**`m.traspose()`**: transposes the matrix


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

### Attribures

**`m.mXY`**: (read/write) Sets or gets the element at X row, Y column, for example: `myMatrix.m13 = 0; console.log(myMatrix.m00);`

**`m.mat3`**: (read) Returns the rotation/scale matrix part from `m`:

**`m.forwardVector`**: (read) Returns the forward vector, assuming that `m` is a valid transformation matrix.

**`m.rightVector`**: (read) Returns the right vector, assuming that `m` is a valid transformation matrix.

**`m.upVector`**: (read) Returns the up vector, assuming that `m` is a valid transformation matrix.

**`m.backwardVector`**: (read) Returns the backward vector, assuming that `m` is a valid transformation matrix.

**`m.leftVector`**: (read) Returns the left vector, assuming that `m` is a valid transformation matrix.

**`m.downVector`**: (read) Returns the down vector, assuming that `m` is a valid transformation matrix.


```other
| V  V  V  x |
| V  V  V  x |
| V  V  V  x |
| x  x  x  x |
```

### Static functions

#### Factory methods

**`MakeIdentity()`**: Create an identity matrix.

**`MakeWithQuaternion(q)`**: Create a rotation matrix from a [quaternion](quaternion.md).

**`MakeTranslation(x, y, z)`**: Create a translation matrix.

**`MakeRotation(alpha, x, y, z)`**: Create a rotation matrix.

**`MakeScale(x, y, z)`**: Create a scale matrix.

**`MakePerspective(fovy, aspect, nearPlane, farPlane)`**: Create a projection matrix with perspective parameters.

**`MakeFrustum(left, right, bottom, top, nearPlane, farPlane)`**: Create a projection matrix with frustum parameters.

**`MakeOrtho(left, right, bottom, top, nearPlane, farPlane)`**: Create a projection matrix with orthographic parameters.

**`MakeLookAt(origin, target, up)`**: Create a view matrix with 'look at' parameters.

#### Query methods

**`IsZero(m)`**: Check if the matrix is zero, taking into account the [epsilon constant](constants.md).

**`IsIdentity(m)`**: Check if the matrix is identity, taking into account the [epsilon constant](constants.md).

**`GetScale(m)`**: Returns a scaling matrix extracted from `m`.

**`Equals(a,b)`**: Check if a === b, taking into account the [epsilon constant](constant.md).

**`IsNaN(m)`**: Check if `m` contains some `NaN` value.


#### Utilities

**`Unproject(x, y, depth, mvMat, pMat, viewport)`**: Returns a point in the 3D space from a 2D coordinate, based on the model-view matrix, projection matrix, viewport and depth.

**`GetScale(m)`**: Get the scale values (x, y, z) from `m` matrix

**`GetRotation(m)`**: Get the rotation matrix from `m`, removing scale and translation from it.

**`GetPosition(m)`**: Get the position values (x, y, z) of `m` matrix.

**`TransformDirection(m, dir)`**: Assuming that `m` is a valid orthogonal transformation matrix, and `dir` is a direction vector, returns a new direction vector obtained transforming `dir` with the matrix `m`.


