
import {
    Color,
    Light,
    PolyList,
    Texture,
    TextureDataType,
    TextureWrap,
    TextureFilter,
    TextureWrapName,
    TextureFilterName,
} from './dist/bg2e-base.js';

import { Vec } from 'bg2e-math';
import { TextureDataTypeName } from './src/js/Texture.js';

console.log(Vec);

const red = new Color({r: 1, b: 0.5});
console.log(red.toString());

const gray = new Color({ rgb: 0.8 });
console.log(gray.toString());

const l = new Light();
l.diffuse = Color.Red();
const sceneData = {};
l.serialize(sceneData);
//console.log(JSON.stringify(sceneData, "", "  "));

const l2 = new Light();
l2.deserialize(sceneData);
console.log("Light 2 intensity: " + l2.intensity);

console.log(l2.diffuse.toString()); // Red

const c2 = new Color([0.1, 0.4, 0.5]);
console.log(c2.toString());

c2.rgb = new Vec(0.1, 0.2, 0.3);
console.log(c2.rgb.toString());

try {
    const invalidColor = new Color([1, 0.3]);
}
catch (e) {}

const plist = new PolyList();

plist.vertex = [
    1, 0, 0,
    0, 1, 0,
    1, 1, 0
];

plist.normal = [
    0, 0, 1,
    0, 0, 1,
    0, 0, 1
];

plist.texCoord0 = [
    1, 0,
    0, 1,
    1, 1
];

plist.index = [
    0, 1, 2
];

console.log(plist.vertex);
console.log(plist.normal);
console.log(plist.texCoord0);
console.log(plist.tangent);

const t = new Texture();
t.dataType = TextureDataType.IMAGE;
t.fileName = "test.jpg";
t.size.x = 128;
t.size.y = 128;
t.wrapModeXY = TextureWrap.REPEAT;
t.minFilter = TextureFilter.LINEAR;
t.magFilter = TextureFilter.NEAREST_MIPMAP_LINEAR;

const textureData = {};
t.serialize(textureData);
console.log(textureData);
const t2 = new Texture();
t2.deserialize(textureData);
console.log("Size: ", t2.size.toString());
console.log("File name: ", t2.fileName);
console.log("Wrap mode X: ", TextureWrapName[t2.wrapModeX]);
console.log("Data type: ", TextureDataTypeName[t2.dataType]);
console.log("Min filter: ", TextureFilterName[t2.minFilter]);
console.log("Mag filter: ", TextureFilterName[t2.magFilter]);
