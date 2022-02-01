
import {
    Color,
    Light
} from './dist/bg2e-base.js';

import { Vec } from 'bg2e-math';

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