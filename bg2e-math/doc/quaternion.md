# Quaternion

## Introducción

It implements a quaternion. It is implemented from the class [`bg2e.math.Vec`](vector.md), so it can use all the methods of the `Vec` class, but modifies the behavior of its constructor, and also adds some methods. This class is used instead of a normal `Vec` because in this way it is possible to differentiate a quaternion from a four-element vector using the `instanceof` operator.

The constructor can operate in the following ways:

- No parameters: creates a quaternion initialized to zero.
- Four numeric parameters: creates a quaternion with the parameters specified for `alpha`, `x`, `y`, and `z`.
- A four-element array: creates a quaternion as above, but specifies the parameters as an array.
- A 9-element array: for example, a [``Mat3`](matrix3.md) object, but it could be a standard 9-element array. Initializes the quaternion with a 3x3 rotation matrix.
- A 16-element array: for example, a [``Mat4`](matrix4.md) object, but it could be a standard 16-element array. Initializes the quaternion with the rotation matrix extracted from the specified 4x4 transformation matrix.

## Methods

**`initWithMatrix3(m)`**: Loads the quaternion parameters from a 3x3 matrix, that can be specified using an stardard JavaScript array with 9 elements, or using a [`Mat3`](matrix3.md) object. Returns `this`.

**`initWithMatrix4(m)`**: Loads the quaternion parameters from a 4x4 matrix, that can be specified using an stardard JavaScript array with 16 elements, or using a [`Mat4`](matrix4.md) object. Returns `this`.

**`initWithValues(alpha,x,y,z)`**: Initialize the quaternion with the `alpha`, `x`, `y` and `z` and returns `this`. The parameters are initialized as follows:

```js
quaternion[0] = x * Math.sin( alpha / 2 );
quaternion[1] = y * Math.sin( alpha / 2 );
quaternion[2] = z * Math.sin( alpha / 2 );
quaternion[3] = Math.cos( alpha / 2 );
```
