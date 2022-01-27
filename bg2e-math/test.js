
import { math, Vector, vec } from './dist/bg2e-math.js';

const deg = 90;
console.log(`${ deg }º = ${ math.degreesToRadians(deg) } radians`);
const rad = math.PI_4;
console.log(`${ rad } radians = ${ math.radiansToDegrees(rad) }º`);

const a = Vector(5,2,4);
const b = Vector(2,3,1);

console.log("a: ", a);
console.log("b: ", b);
console.log("a + b: ", vec.add(a,b));
console.log("a - b: ", vec.sub(a,b));
console.log("Max vector: ", vec.maxVector(a,b));
console.log("Min vector: ", vec.minVector(a,b));

const c = Vector(a);
console.log("c: ", c);
const d = Vector(Vector(4,5));
console.log("d: ", d);
const e = Vector(Vector(6,7,8,9));
console.log("e: ", e);

const p = Vector(1,2,1);
const q = Vector(2,2,2);
console.log("p: ", p);
console.log("q: ", q);
console.log("distance between p and q: ", vec.distance(p, q));
console.log("p · q = ", vec.dot(p,q));
console.log("p X q = ", vec.cross(p,q));
console.log("p normalized = ", vec.getNormalized(p), " (magnitude = " + vec.magnitude(vec.getNormalized(p)) + ")");
console.log("q normalized = ", vec.getNormalized(q), " (magnitude = " + vec.magnitude(vec.getNormalized(q)) + ")");
console.log("v = [p, 9.87] = ", Vector(p, 9.87));

const s = Vector(1,2);
const t = Vector(2,2);
console.log("s: ", s);
console.log("t: ", t);
console.log("distance between s and t: ", vec.distance(s, t));
console.log("s · t = ", vec.cross(s,t));
console.log("s X t = ", vec.cross(s,t));
console.log("s normalized = ", vec.getNormalized(s), " (magnitude = " + vec.magnitude(vec.getNormalized(s)) + ")");
console.log("s normalized = ", vec.getNormalized(s), " (magnitude = " + vec.magnitude(vec.getNormalized(t)) + ")");
console.log("v = [s, 7.6] = ", Vector(s, 7.6));
console.log("v = [s, 9.7, 4.32] = ", Vector(s, 9.7, 4.32));

vec.assign(p,q);
console.log("p = q => p = ", p);

vec.set(p, 6, 7, 8);
console.log("p = (6, 7, 8) => ", p);

vec.set(p, 9, 10, Math.sqrt(-1));
console.log("p = (9, 10, sqrt(-1))", p);
console.log("isNaN(p) = ", vec.isNaN(p));

console.log("p.xz = ", vec.xz(p));

const v4 = Vector(2,3,5,1);
console.log("v4 = ", v4);
console.log("v4.xyz = ", vec.xyz(v4));

vec.normalize(v4);
console.log("v4.normalize() = ", v4);
console.log("v4 magnitude = ", vec.magnitude(v4));

