
import { math, Vec, Mat3, Mat4 } from './dist/bg2e-math.js';

const deg = 90;
console.log(`${ deg }º = ${ math.degreesToRadians(deg) } radians`);
const rad = math.PI_4;
console.log(`${ rad } radians = ${ math.radiansToDegrees(rad) }º`);

const a = new Vec(5,2,4);
const b = new Vec(2,3,1);

console.log("a: ", a);
console.log("b: ", b);
console.log("a + b: ", Vec.Add(a,b));
console.log("a - b: ", Vec.Sub(a,b));
console.log("Max new Vec: ", Vec.Max(a,b));
console.log("Min new Vector: ", Vec.Min(a,b));

const c = new Vec(a);
console.log("c: ", c);
const d = new Vec(new Vec(4,5));
console.log("d: ", d);
const e = new Vec(new Vec(6,7,8,9));
console.log("e: ", e);

const p = new Vec(1,2,1);
const q = new Vec(2,2,2);
console.log("p: ", p);
console.log("q: ", q);
console.log("distance between p and q: ", Vec.Distance(p, q));
console.log("p · q = ", Vec.Dot(p,q));
console.log("p X q = ", Vec.Cross(p,q));
console.log("p normalized = ", Vec.Normalized(p), " (magnitude = " + Vec.Magnitude(Vec.Normalized(p)) + ")");
console.log("q normalized = ", Vec.Normalized(q), " (magnitude = " + Vec.Magnitude(Vec.Normalized(q)) + ")");
console.log("v = [p, 9.87] = ", new Vec(p, 9.87));

const s = new Vec(1,2);
const t = new Vec(2,2);
console.log("s: ", s);
console.log("t: ", t);
console.log("distance between s and t: ", Vec.Distance(s, t));
console.log("s · t = ", Vec.Cross(s,t));
console.log("s X t = ", Vec.Cross(s,t));
console.log("s normalized = ", Vec.Normalized(s), " (magnitude = " + Vec.Magnitude(Vec.Normalized(s)) + ")");
console.log("s normalized = ", Vec.Normalized(s), " (magnitude = " + Vec.Magnitude(Vec.Normalized(t)) + ")");
console.log("v = [s, 7.6] = ", new Vec(s, 7.6));
console.log("v = [s, 9.7, 4.32] = ", new Vec(s, 9.7, 4.32));

p.assign(q);
console.log("p = q => p = ", p);

p.set(6, 7, 8);
console.log("p = (6, 7, 8) => ", p);

p.set(9, 10, Math.sqrt(-1));
console.log("p = (9, 10, sqrt(-1))", p);
console.log("isNaN(p) = ", Vec.IsNaN(p));

console.log("p.xz = ", p.xz);

const v4 = new Vec(2,3,5,1);
console.log("v4 = ", v4);
console.log("v4.xyz = ", v4.xyz);

v4.normalize();
console.log("v4.normalize() = ", v4);
console.log("v4 magnitude = ", Vec.Magnitude(v4));

const m1 = new Mat3();
console.log(m1.toString());
m1.identity();
console.log(m1.toString());

const m2 = Mat3.MakeIdentity();
console.log(m2.toString());
console.log(m2.row(0));

console.log(
    m2.setRow(0, 10, 20, 30)
      .setRow(1, new Vec(100,200,300))
      .toString()
);

console.log(
    m2.identity()
      .setScale(10, 5, 2)
      .toString()
);

console.log(Mat3.GetScale(m2));

m2.setRow(0, 1, 2, 3);
m2.setRow(1, 4, 5, 6);
m2.setRow(2, 7, 8, 9);
console.log(m2.toString());
console.log(m2.traspose().toString());

const m3 = Mat3.MakeIdentity();
const m4 = Mat3.MakeIdentity();
console.log("m3 === m4 : ", Mat3.Equals(m3, m4));
console.log("m3 === m4.mult(10) : ", Mat3.Equals(m3, m4.mult(10)));
console.log(m4.toString());

const vs1 = new Vec(1,2);
const vs2 = new Vec(1,2,3);
const vs3 = new Vec(1,2,3,4);
console.log(vs1.scale(100));
console.log(vs2.scale(100));
console.log(vs3.scale(100));

console.log(vs3.xyz);

const ms1 = Mat3.MakeIdentity()
    .setScale(10, 4, 1);
const v2d = new Vec(1,1);
console.log(ms1.multVector(v2d));

ms1[0] = Math.sqrt(-1);
console.log("ms1: ", ms1.toString());
console.log("ms1 isNaN = ", Mat3.IsNaN(ms1));

const ma = new Mat3(
    1, 4, 5,
    4, 2, 2, 
    9, 3, 1
);

const mb = new Mat3([
    7, 7, 3,
    1, 9, 4,
    0, 2, 2
]);

console.log("ma: ", ma.toString());
console.log("mb: ", mb.toString());
console.log("ma = ma x mb:");
console.log(ma.mult(mb).toString());

const M = Mat4.MakeIdentity();
console.log(M.toString());

const M1 = new Mat4(
    2, 3, 6, 4,
    9, 2, 2, 4,
    0, 4, 8, 8,
    3, 1, 9, 7
);

const M2 = new Mat4(
    9, 6, 5, 5, 
    2, 3, 8, 5, 
    1, 1, 9, 4,
    0, 3, 2, 2
);

console.log("M1: ", M1.toString());
console.log("M2: ", M2.toString());
console.log("M1 = M1 x M2: ");
console.log(M1.mult(M2).toString());

console.log("M2^-1:");
console.log(M2.invert().toString());
console.log("(M2^-1)^t:");
console.log(M2.traspose().toString());

const trx = Mat4.MakeIdentity();
trx.rotate(math.PI_4, 0, 1, 0);
console.log(trx.forwardVector);

M2[0] = Math.sqrt(-1);
console.log(M2.toString());
console.log("M2 isNaN: ", Mat4.IsNan(M2));