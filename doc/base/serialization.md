
# Serialization and deserialization protocol

It is a serialization and deserialization protocol that is used to read and write data streams containing information from a bg2 engine 3D scene or model.

Any class that complies with the serialization protocol has to implement the following methods:

**`serialize(sceneData)`**: `sceneData` is a JavaScript object. The method must write to `sceneData` all the necessary data to store its state.

**`deserialize(sceneData)`**: `sceneData` is a JavaScript object. The method must read from `sceneData` all the necessary data to restore the object state.

The serialization and deserialization rules are as follows:

- All data written to `sceneData` must be JavaScript primitive types that can be converted to a `JSON` string. For example, if we have to serialize a [`Color`](color.md) or an array [`bg2e-math.Mat4`](../../bg2e-math/doc/mat4.md) the conversion is straightforward, since in both cases these classes are vectors based on a `Float32Array` data type (see the [`Vec` class definition](../../bg2e-math/doc/vector.md)), which in turn can be converted to a `JSON` array.
- If the class include mandatory parameters, these parameters will be also mandatory in serialization and deserialization.


## Example: the `Light` class

```js

class Light {

    ...

    deserialize(sceneData) {
        switch (sceneData.lightType) {
        case 'kTypeDirectional':
            this._type = LightType.DIRECTIONAL;
            break;
        case 'kTypeSpot':
            this._type = LightType.SPOT;
            this._shadowBias = sceneData.shadowBias;
            break;
        case 'kTypePoint':
            this._type = LightType.POINT;
            break;
        }
        
        this._ambient = new Color(sceneData.ambient);
        this._diffuse = new Color(sceneData.diffuse);
        this._specular = new Color(sceneData.specular);
        this._spotCutoff = sceneData.spotCutoff || 20;
        this._spotExponent = sceneData.spotExponent || 30;
        this._shadowStrength = sceneData.shadowStrength;
        this._projection = new Mat4(sceneData.projection);
        this._castShadows = sceneData.castShadows;
        this._intensity = sceneData.intensity || 1;
    }

    serialize(sceneData) {
        const lightTypes = [];
        lightTypes[LightType.DIRECTIONAL] = "kTypeDirectional";
        lightTypes[LightType.SPOT] = "kTypeSpot";
        lightTypes[LightType.POINT] = "kTypePoint";
        sceneData.lightType = lightTypes[this._type];
        sceneData.ambient = this._ambient;
        sceneData.diffuse = this._diffuse;
        sceneData.specular = this._specular;
        sceneData.intensity = 1;
        sceneData.spotCutoff = this._spotCutoff || 20;
        sceneData.spotExponent = this._spotExponent || 30;
        sceneData.shadowStrength = this._shadowStrength;
        sceneData.projection = this._projection;
        sceneData.castShadows = this._castShadows;
        sceneData.shadowBias = this._shadowBias || 0.0029;
        sceneData.intensity = this.intensity || 1;
    }
}
```

The serialize/deserialize protocol exists in two forms: a synchronous and an asynchronous form. The asynchronous form is intended for objects that have to retrieve or save data from a [loader](../db/loader.md) or [writer](../db/writer.md). A class or object that implements the serialize/deserialize protocol must specify whether its implementation is asynchronous or synchronous. In turn, all classes that inherit from it must perform the same type of implementation as its base class.

```js
class MyClass {
    ...
    async serialize(sceneData,writer) {
        sceneData.texturePath = this.texturePath;
        await writer.writeTexture(this.texturePath, this.textureData);
    }

    async deserialize(sceneData,loader) {
        this.texturePath = sceneData.texturePath;
        this.textureData = await loader.loadTexture(this.texturePath);
    }
}
```
