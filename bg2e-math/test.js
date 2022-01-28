
import { math, Vector, vec, Matrix3, mat3 } from './dist/bg2e-math.js';

const deg = 90;
console.log(`${ deg }º = ${ math.degreesToRadians(deg) } radians`);
const rad = math.PI_4;
console.log(`${ rad } radians = ${ math.radiansToDegrees(rad) }º`);

const a = new Vector(5,2,4);
const b = new Vector(2,3,1);

console.log("a: ", a);
console.log("b: ", b);
console.log("a + b: ", vec.add(a,b));
console.log("a - b: ", vec.sub(a,b));
console.log("Max new Vector: ", vec.maxVector(a,b));
console.log("Min new Vector: ", vec.minVector(a,b));

const c = new Vector(a);
console.log("c: ", c);
const d = new Vector(new Vector(4,5));
console.log("d: ", d);
const e = new Vector(new Vector(6,7,8,9));
console.log("e: ", e);

const p = new Vector(1,2,1);
const q = new Vector(2,2,2);
console.log("p: ", p);
console.log("q: ", q);
console.log("distance between p and q: ", vec.distance(p, q));
console.log("p · q = ", vec.dot(p,q));
console.log("p X q = ", vec.cross(p,q));
console.log("p normalized = ", vec.getNormalized(p), " (magnitude = " + vec.magnitude(vec.getNormalized(p)) + ")");
console.log("q normalized = ", vec.getNormalized(q), " (magnitude = " + vec.magnitude(vec.getNormalized(q)) + ")");
console.log("v = [p, 9.87] = ", new Vector(p, 9.87));

const s = new Vector(1,2);
const t = new Vector(2,2);
console.log("s: ", s);
console.log("t: ", t);
console.log("distance between s and t: ", vec.distance(s, t));
console.log("s · t = ", vec.cross(s,t));
console.log("s X t = ", vec.cross(s,t));
console.log("s normalized = ", vec.getNormalized(s), " (magnitude = " + vec.magnitude(vec.getNormalized(s)) + ")");
console.log("s normalized = ", vec.getNormalized(s), " (magnitude = " + vec.magnitude(vec.getNormalized(t)) + ")");
console.log("v = [s, 7.6] = ", new Vector(s, 7.6));
console.log("v = [s, 9.7, 4.32] = ", new Vector(s, 9.7, 4.32));

p.assign(q);
console.log("p = q => p = ", p);

p.set(6, 7, 8);
console.log("p = (6, 7, 8) => ", p);

p.set(9, 10, Math.sqrt(-1));
console.log("p = (9, 10, sqrt(-1))", p);
console.log("isNaN(p) = ", vec.isNaN(p));

console.log("p.xz = ", vec.xz(p));

const v4 = new Vector(2,3,5,1);
console.log("v4 = ", v4);
console.log("v4.xyz = ", vec.xyz(v4));

v4.normalize();
console.log("v4.normalize() = ", v4);
console.log("v4 magnitude = ", vec.magnitude(v4));

const m1 = new Matrix3();
console.log(m1.toString());
m1.identity();
console.log(m1.toString());

const m2 = mat3.identity();
console.log(m2.toString());
console.log(m2.row(0));

console.log(
    m2.setRow(0, 10, 20, 30)
      .setRow(1, new Vector(100,200,300))
      .toString()
);

console.log(
    m2.identity()
      .setScale(10, 5, 2)
      .toString()
);

console.log(mat3.getScale(m2));

m2.setRow(0, 1, 2, 3);
m2.setRow(1, 4, 5, 6);
m2.setRow(2, 7, 8, 9);
console.log(m2.toString());
console.log(m2.traspose().toString());

const m3 = mat3.identity();
const m4 = mat3.identity();
console.log("m3 === m4 : ", mat3.equals(m3, m4));
console.log("m3 === m4.mult(10) : ", mat3.equals(m3, m4.mult(10)));
console.log(m4.toString());

const vs1 = new Vector(1,2);
const vs2 = new Vector(1,2,3);
const vs3 = new Vector(1,2,3,4);
console.log(vs1.scale(100));
console.log(vs2.scale(100));
console.log(vs3.scale(100));

console.log(vs3.xyz);

const ms1 = mat3.identity()
    .setScale(10, 4, 1);
const v2d = new Vector(1,1);
console.log(ms1.multVector(v2d));

ms1[0] = Math.sqrt(-1);
console.log("ms1: ", ms1.toString());
console.log("ms1 isNaN = ", mat3.isNaN(ms1));

const ma = new Matrix3(
    1, 4, 5,
    4, 2, 2, 
    9, 3, 1
);

const mb = new Matrix3([
    7, 7, 3,
    1, 9, 4,
    0, 2, 2
]);

console.log("ma: ", ma.toString());
console.log("mb: ", mb.toString());
console.log("ma = ma x mb:");
console.log(ma.mult(mb).toString());