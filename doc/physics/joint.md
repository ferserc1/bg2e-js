# Joint

Defines physical joints of different types. A joint contains a transformation matrix, which stores the transformation relative to that joint. It also defines the `calculateTransform()` and `applyTransform(matrix)` methods, which implement each specific type of joint:

- **`calculateTransform()`**: Applies the changes defined by the state of the joint to the internal transformation matrix.
- **`applyTransform(matrix)`**: Applies the changes of the internal transformation matrix to the matrix passed as a parameter. The method of application will depend on the particular joint type.


A concrete joint can be created using `new` with its constructor, or restored using the factory method of the `Joint` class:

```js
import Joint from 'bg2e/physics/Joint';

// linkData is an object generated with the serialize() function of the joint
const joint = Joint.Factory(linkData);
```

The joints implement the synchronous [serialize/deserialize protocol](../base/serialization.md).

## LinkJoint

Implements a simple joint of type link. It can be used to implement joint chains. The transformation is performed based on an offset and a series of euler angles. It is intended to define static joints, because when defining the rotations with euler angles, in case we want to animate the joints we can have the problem of gimbal lock. The order of application of offset and angles can be specified (first rotation and then translation or the other way around).

### Properties

- **`offset`**: (read/write) Joint offset as 3D vector.
- **`eulerRotation`**: (read/write) Joint euler rotation as a 3D vector (x:yaw, y:pitch, z: roll).
- **`yaw`**: (read/write) yaw euler angle. Equivalent to `eulerRotation.x`.
- **`pitch`**:  (read/write) yaw euler angle. Equivalent to `eulerRotation.y`.
- **`roll`**: (read/write) yaw euler angle. Equivalent to `eulerRotation.z`.
- **`transformOrder`**: (read/write) specifies the order of the transformation, defined in the `LinkTransformOrder` object:

```js
const LinkTransformOrder = {
    TRANSLATE_ROTATE: 1,
    ROTATE_TRANSLATE: 0
}
```

```js
import { LinkTransformOrder, LinkJoint } from 'bg2e/physics/Joint';

const joint = new LinkJoint();
joint.transformOrder = LinkTransformOrder.ROTATE_TRANSLATE;
```

