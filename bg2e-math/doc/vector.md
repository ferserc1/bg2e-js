# Vector

## Introduction

Vectors are represented by the `Vec` class, which extends `bg2e.math.NumericArray`. A vector can be of two, three or four dimensions.

```js
import { Vec } from 'bg2e-math';

const v1 = new Vec(1,3);     // 2D vector
const v2 = new Vec(4,6,6);   // 3D vector
const v3 = new Vec(9,3,2,1); // 4D vector
```

The dimension of the vector is determined at the time of initialization. After that, it is not possible to modify its dimension, although it is possible to construct copies of different dimensions with fewer or more elements.

```js
const p = new Vec(1,2,3);
const q = p.xy;     // [1,2]
const r = p.yz;     // [2,3]

const s = new Vec(1,2,3,4);
const t = s.xyz;    // [1,2,3]

const color24 = new Vec(0.33,0.52,0.18);
const color32 = new Vec(color24, 1);
```

## Vector methods

Vectors define instance methods, properties and static methods. In general, methods are organized as follows:

- Methods that cause changes to the vector instance are instance methods, for example, normalize a vector. These methods always return the instance itself, so they can be used functionally.

```js
console.log(
    v1.set(1,2,3)
        .normalize()
        .scale(10)
        .toString()
);
```

- Several getters and setters are defined as properties, which allow to get and set the value of all or part of the vector:

```js
const v1 = new Vec(2,3,5,6);
v1.x = 10;
const v2 = v1.xyz;
v2.xy = v1.xz;
```

You can also use the vector properties to copy or assign vector values:

```js
const v1 = new Vec(1,2,3,4);
const v2 = v1.xyzw; // v2 is a copy of v1
v2.xy = new Vec(1,2);
v2.z = 3;
v1.xyzw = v2;
```
You can also use the setter properties to convert normal JavaScript arrays to engine vectors:

```js
const v1 = new Vec(0,0,0,0);
console.log(v1);
v1.xyzw = [9,8,7,6];
console.log(v1);
```

- The methods that do not modify the value of the instances on which they operate are static. That is, those methods that operate on one or several vectors, and return the result.

```js
const v1 = new Vec(1,3);
const v2 = new Vec(4,5);
const v3 = Vec.Cross(v1, v2);
const a = Vec.Dot(v2, v3);
const v3Norm = Vec.Normalized(v3);
```

Some methods are defined in two ways: they can act on the instance, or they can return a copy of the vector. For example, to normalize a vector we can act on the vector itself, or we can create a copy:

```js
const v1 = new Vec(5,0,5);
const v2 = Vec.Normalized(v1);  // v2 is a normalized copy of v1

const v3 = new Vec(5,0,5);
v3.normalize();     // v3 is now normalized
```

The comparation methods are also static, because they don't modify the state of the vectors:

```js
Vec.Equals(v1, v3);
Vec.IsZero(v1);
Vec.IsNaN(v2);
```

All the comparation methods in Vec class takes into account the Epsilon constant:

```js
const v1 = Vec.Vec2();
const v2 = Vec.Vec2();
v1[0] = math.EPSILON * 0.5; // Half of Epsilon is in practice zero.
console.log(Vec.Equals(v1,v2)); // true
console.log(Vec.IsZero(v1));    // true

v2[1] = math.sqrt(-1);
console.log(Vec.IsNaN(v2)); // true
```

- Three factory methods are defined for vectors, which simplify the definition of 2-, 3- and 4-dimensional vectors, because it is no necessary to specify their initial values. These methods are also static:

```js
const v2 = Vec.Vec2();
const v3 = Vec.Vec3();
const v4 = Vec.Vec4();
```

## Reference

### Instance methods

**`v.normalize()`**: Normalize the vector

**`v.assign(src)`**: Assign the src vector values to v. src must be of the same length as v

**`v.set(x, y, z = null, w = null)`**: Set v components. Note that the vector size must match the supplied parameters.

**`v.scale(s)`**: Multiply the vector by a scalar.

### Properties

**`v.x`**: (read/write) Set or get the `x` component of the vector.

**`v.y`**: (read/write) Set or get the `y` component of the vector.

**`v.z`**: (read/write) Set or get the `z` component of the vector.

**`v.w`**: (read/write) Set or get the `w` component of the vector.


**`v.xy`**: (read/write) Set or get the `xy` components of the vector. To set the components, the input value must be an array-like type with at least two components (you can use JavaScript standard arrays).

**`v.yz`**: (read/write) Set or get the `yz` components of the vector. To set the components, the input value must be an array-like type with at least two components (you can use JavaScript standard arrays). The `v` length must be 3 or 4. 

**`v.xz`**: (read/write) Set or get the `xz` components of the vector. To set the components, the input value must be an array-like type with at least two components (you can use JavaScript standard arrays). The `v` length must be 3 or 4. 


**`v.xyz`**: (read/write) Set or get the `xyz` components of the vector. To set the components, the input value must be an array-like type with at least three components (you can use JavaScript standard arrays). The `v` length must be 3 or 4. Note that if the length of `v` and the length of the input vector are 3, this operator acts like an `assign` operation, but in this case the input vector can be an array, and its length can be higher than 3.

**`v.xyzw`**: (read/write) If you use it as a setter, this is the `assign` property for 4D vectors. In this case, the input value can be any array-like type with 4 or more components. If you use it as a getter, this property acts as a `clone` property.

### Static methods

**`CheckEqualLength(v1,v2)`**: Checks if v1 and v2 have the same length. It does not return any value, it simply throws an exception if they are not equal.

**`Max(v1,v2)`**: Returns a vector formed by the highest-valued components of v1 and v2. Both vectors must be of the same length, otherwise the function throws an exception.

**`Min(v1,v2)`**: Returns a vector formed by the lowest-valued components of v1 and v2. Both vectors must be of the same length, otherwise the function throws an exception.

**`Add(v1,v2)`**: Adds v1 and v2 by components and returns the value as a new vector. Both vectors must be of the same length, otherwise the function throws an exception.

**`Sub(v1,v2)`**: Subtract v2 from v1 (`v3 = v1 - v2`) by components and return the value as a new vector. Both vectors must be of the same length, otherwise the function throws an exception.

**`Magnitude(v)`**: Returns the magnitude of the vector `v`, that is, a scalar with its size.

**`Distance(p,q)`**: Returns a scalar with the distance between points `p` and `q`. Both vectors must be of the same length, otherwise the function throws an exception.

**`Dot(v1,v2)`**: Performs the dot product operation between `v1` and `v2`, the result of which is a scalar. Both vectors must be of the same length, otherwise the function throws an exception.

**`Cross(v1,v2)`**: Perform the cross product between `v1` and `v2`. Note that for vectors in R2 the result of the operation is a scalar, for vectors in R3 the result is another R3 vector, and the operation is not defined for vectors in R4 (it will throw an exception if attempted).. Both vectors must be of the same length, otherwise the function throws an exception.

**`Normalized(v)`**: Returns a normalized copy of the vector `v`.

**`Mult(v,s)`**: Multiply the vector `v` by the scalar `s`.

**`Div(v,s)`**: Divide the vector `v` by the scalar `s`.

**`Equals(v1,v2)`**: Returns `true` if `v1` and `v2` are equal. Unlike other functions, if v1 and v2 are not equal, this function does not throw any exception. The Epsilon constant is taken into account in the check.

**`IsZero(v)`**: Returns `true` if the vector `v` is zero, that is, if all its components are zero, taking into account the Epsilon constant.

**`IsNaN(v)`**: Returns `true` if any of the components of the vector `v` is `NaN`.

