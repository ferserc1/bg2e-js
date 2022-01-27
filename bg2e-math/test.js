
import { MathConst, MathFunc, Vector, VectorFunc } from './dist/bg2e-math.js';

const deg = 90;
console.log(`${ deg }º = ${ MathFunc.degreesToRadians(deg) } radians`);
const rad = MathConst.PI_4;
console.log(`${ rad } radians = ${ MathFunc.radiansToDegrees(rad) }º`);

const a = Vector(5,2,4);
const b = Vector(2,3,1);

console.log("a: ", a);
console.log("b: ", b);
console.log("a + b: ", VectorFunc.add(a,b));
console.log("a - b: ", VectorFunc.sub(a,b));
console.log("Max vector: ", VectorFunc.maxVector(a,b));
console.log("Min vector: ", VectorFunc.minVector(a,b));

