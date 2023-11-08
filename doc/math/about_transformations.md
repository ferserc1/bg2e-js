# Clarifications about transformations

In computer graphics, as you should already know if you are using this library, linear algebra (in particular, matrix operations) is used to represent and process transformations of 2D and 3D elements. In our case, we are going to talk all the time about a 3D space, since the same can be applied for a 2D space.

It is not the aim of this document to detail the mathematical theory on this subject, here we assume that you already understand the mathematical part. The problem is that many programmers have doubts about how transformations work in graphics engines, and this happens regardless of whether that person comes from the world of mathematics or the world of programming.

There are actually two circumstances that can lead to misunderstandings: one is related to the notation used to represent matrices and the other has to do with the way operations are processed in the program code.

## Matrix notation

If you are a programmer, in general a row goes from left to right, and a column is read from top to bottom. When representing a matrix, it is normal for efficiency reasons to use a one-dimensional array, and place the rows one after the other:

```js
const mat4x4 = [
     0,  1,  2,  3, // row 0
     4,  5,  6,  7, // row 1
     8,  9, 10, 11, // row 2
    12, 13, 14, 15  // row 3
];
```

According to this convention, the last row of the above matrix is `12, 13, 14, 15`.

When we read articles on graphics programming, we can see that a translation matrix is generated with the following code:

```js
const myTransformation = [
     1,  0,  0,  0,
     0,  1,  0,  0,
     0,  0,  1,  0,
    tx, ty, tz,  1
];
```

The problem comes from the fact that the convention in mathematics for matrices would define the above matrix as follows:

```other
| 1 0 0 tx |
| 0 1 0 ty |
| 0 0 1 tz |
| 0 0 0  1 |
```

For a mathematician, perhaps the most appropriate way would be to represent matrices using mathematical notation:

```js
const myTransformation = [
     1, 0, 0, tx,
     0, 1, 0, ty,
     0, 0, 1, tz,
     0, 0, 0,  1
];
```

The problem with this approach is that it causes some drawbacks related to the way we represent the data in memory. The first, second and third columns are considered the X, Y and Z axes respectively, while the last one is the translation. Suppose we want to obtain the Z axis and the translation. The code we would need would be the following:

```js
const zAxis = [
    myTransformation[2],
    myTransformation[6],
    myTransformation[10]
];
const translation = [
    myTransformation[3],
    myTransformation[7],
    myTransformation[11],
];
```

It is a rather inconvenient way to obtain these values, and it is also much easier to make mistakes. Let's say the translation for a mathematician of the programmer's notation would be something like this:

```js
const myTransformation = [
     1,  0,  0,  0,  // column 0
     0,  1,  0,  0,  // column 1
     0,  0,  1,  0,  // column 2
    tx, ty, tz,  1   // column 3
];
```

Using the "programmer notation", it is possible to obtain the axis and translation values as a range, and this also makes it easier to optimize the code:

```js
const zAxis = myTransformation.slice(8, 11);
const translation = myTransformation.slice(12, 15);
```

Calling rows "columns" in this convention makes it easier for a programmer to work with matrices, although it can make everything more confusing for a mathematician. It also happens very often that a programmer with a lot of experience in programming, but little in mathematics, is documented to work in computer graphics using mathematical articles, and finds contradictions: why in a mathematical article the position is defined in a column, but in all the code that I consult that column is defined as a row? Well, the reason is the one we have explained: the mathematical notation is not the most appropriate to represent the values of the matrix as data.

In general, in the bg2 engine documentation all matrices are defined from a programmer's point of view to avoid confusion. Based on this idea, in the documentation and also in the APIs, we will always call rows to the horizontal elements of the matrices, so we will also forget about those rows that represent columns. That is to say, a transformation matrix for us will be this:

```js
const myTransformation = [
    x0, x1, x2, 0,  // row 0
    y0, y1, y2, 0,  // row 1
    z0, z1, z2, 0,  // row 2
    tx, ty, tz, 1   // ro2 3
];
```

## Operation order

Let's suppose we have a cube, and we want to place it in the position [1, 0, 0], rotated 45º on the Y axis. To construct the transformation matrix of the model, the order of operations would be as follows:

- First: we multiply by the translation matrix to move the origin to the point [1, 0, 0].
- Second: we multiply by the rotation matrix to rotate the cube.

We can think that the following code does the function we want:

```js
const modelTransform = Mat4.MakeIdentity();
modelTransform
    .translate(1, 0, 0)
    .rotate(Math.PI / 4, 0, 1, 0);
```

But the above code achieves just the opposite: it first rotates and then translates the cube. Why is this happening?

This same problem is found in other APIs such as OpenGL. The order in which the operations are performed is the reverse of the order in which they appear in the source code.

We can see this more clearly if we see how the previous code will be processed in the vertex shader, which is where the final transformation of each vertex will be performed:

```glsl
attribute vec3 vertexPos;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProj;

void main() {
    gl_Position = uProj * uView * uModel * vec4(vertexPos, 1.0);
}
```

The multiplication is performed from left to right: that is, first the projection matrix appears, then the view matrix, then the model matrix and finally the vertex position is multiplied. If we decompose the `uModel` matrix into the above operations, we will see more clearly that the order is wrong. To see it more clearly, let's write the previous operation in a decomposed form:

```js
const trxMat = Mat4.MakeTranslation(1, 0, 0);
const rotMat = Mat4.MakeRotation(Math.PI / 4, 0, 1, 0);
const uModel = Mat4.Mult(rotMat, trxMat);
```

This code would be executed as follows:

```other
uModel = trxMat * rotMat;
```

If we substitute `uModel` in the shader code, the decomposed operation would be as follows:

```glsl
void main() {
    gl_Position = uProj * uView * trxMat * rotMat * vec4(vertexPos, 1.0);
}
```

That is, we are multiplying first by the rotation and then by the translation, which is the opposite of what we wanted to do. This is why operations in WebGL, OpenGL and many other APIs are EXECUTED in the reverse order in which they APPEAR in the code. The correct code would be as follows:

```js
const modelTransform = Mat4.MakeIdentity();
modelTransform
    .rotate(Math.PI / 4, 0, 1, 0)
    .translate(1, 0, 0);
```

Which is equivalent to:

```js
const rotMat = Mat4.MakeRotation(Math.PI / 4, 0, 1, 0);
const trxMat = Mat4.MakeTranslation(1, 0, 0);
const uModel = Mat4.Mult(trxMat, rotMat);
```

```other
uModel = rotMat * trxMat
```

And the operation decomposed in the shader would be as follows:

```glsl
void main() {
    gl_Position = uProj * uView * rotMat * trxMat * vec4(vertexPos, 1.0);
}
```

