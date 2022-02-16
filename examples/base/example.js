
import Color from 'bg2e/base/Color';
import Light from 'bg2e/base/Light';
import PolyList from 'bg2e/base/PolyList';
import Texture, {
    TextureDataType,
    TextureWrap,
    TextureFilter,
    TextureWrapName,
    TextureFilterName,
    TextureDataTypeName
} from 'bg2e/base/Texture';
import Material from 'bg2e/base/Material';
import Vec from 'bg2e/math/Vec';
import Test from 'bg2e/fs/Test';

await Test.DoImportTest("dist/");

console.log(Vec);

const red = new Color({r: 1, b: 0.5});
console.log(red.toString());

const gray = new Color({ rgb: 0.8 });
console.log(gray.toString());

const l = new Light();
l.diffuse = Color.Red();
const sceneData = {};
await l.serialize(sceneData);
//console.log(JSON.stringify(sceneData, "", "  "));

const l2 = new Light();
await l2.deserialize(sceneData);
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

const m = new Material();
m.diffuse = t;
m.diffuseScale = [0.5, 0.5];
const data = {};
m.serialize(data);
console.log(data);

const m2 = new Material();
m2.deserialize(data);
const m2Data = {}
m2.serialize(m2Data);
console.log(data);

const m3 = m2.clone();
const m3Data = {}
m3.serialize(m3Data);
console.log(JSON.stringify(m3Data, "", "  "));