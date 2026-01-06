
import { math } from 'bg2e-js';

const container: HTMLElement | null = document.getElementById('app');

function log(...args: any[]): void {
    if (container) {
        const p: HTMLParagraphElement = document.createElement('p');
        p.textContent = args.join(' ');
        container.appendChild(p);
    }
}

const xAxis: number = math.Axis.X;
const yAxis: number = math.Axis.Y;
const zAxis: number = math.Axis.Z;
log(`Axis: ${math.Axis.name(xAxis)}, ${math.Axis.name(yAxis)}, ${math.Axis.name(zAxis)}`);

const deg: number = 90;
log(`${deg}º = ${math.degreesToRadians(deg)} radians`);
const rad: number = math.PI_4;
log(`${rad} radians = ${math.radiansToDegrees(rad)}º`);

// Convert degrees and radians using numeric constants. See that using RAD_TO_DEG, the converted
// value is 44.999999999999986, instead of 45, because math.radiansToDegrees(rad) takes into account
// the EPSILON constant.
log(`${deg}º = ${math.DEG_TO_RAD * deg} radians.`);
log(`${rad} radians = ${math.RAD_TO_DEG * rad} degrees.`);

const { Vec, Mat3, Mat4, Quat } = math;

const a = new Vec(5, 2, 4);
const b = new Vec(2, 3, 1);

log("a: ", a);
log("b: ", b);
log("a + b: ", Vec.Add(a, b));
log("a - b: ", Vec.Sub(a, b));
log("Max new Vec: ", Vec.Max(a, b));
log("Min new Vector: ", Vec.Min(a, b));

const c = new Vec(a);
log("c: ", c);
const d = new Vec(new Vec(4, 5));
log("d: ", d);
const e = new Vec(new Vec(6, 7, 8, 9));
log("e: ", e);
const f = new Vec([9, 8, 7, 6]);
log("f: ", f);

const p = new Vec(1, 2, 1);
const q = new Vec(2, 2, 2);
log("p: ", p);
log("q: ", q);
log("distance between p and q: ", Vec.Distance(p, q));
log("p · q = ", Vec.Dot(p, q));
log("p X q = ", Vec.Cross(p, q));
log("p normalized = ", Vec.Normalized(p), " (magnitude = " + Vec.Magnitude(Vec.Normalized(p)) + ")");
log("q normalized = ", Vec.Normalized(q), " (magnitude = " + Vec.Magnitude(Vec.Normalized(q)) + ")");
log("v = [p, 9.87] = ", new Vec(p, 9.87));

const s = new Vec(1, 2);
const t = new Vec(2, 2);
log("s: ", s);
log("t: ", t);
log("distance between s and t: ", Vec.Distance(s, t));
log("s · t = ", Vec.Cross(s, t));
log("s X t = ", Vec.Cross(s, t));
log("s normalized = ", Vec.Normalized(s), " (magnitude = " + Vec.Magnitude(Vec.Normalized(s)) + ")");
log("s normalized = ", Vec.Normalized(s), " (magnitude = " + Vec.Magnitude(Vec.Normalized(t)) + ")");
log("v = [s, 7.6] = ", new Vec(s, 7.6));
log("v = [s, 9.7, 4.32] = ", new Vec(s, 9.7, 4.32));

p.assign(q);
log("p = q => p = ", p);

p.setValue(6, 7, 8);
log("p = (6, 7, 8) => ", p);

p.setValue(9, 10, Math.sqrt(-1));
log("p = (9, 10, sqrt(-1))", p);
log("isNaN(p) = ", Vec.IsNaN(p));

log("p.xz = ", p.xz);

const v4 = new Vec(2, 3, 5, 1);
log("v4 = ", v4);
log("v4.xyz = ", v4.xyz);

v4.normalize();
log("v4.normalize() = ", v4);
log("v4 magnitude = ", Vec.Magnitude(v4));

const m1 = new Mat3();
log(m1.toString());
m1.identity();
log(m1.toString());

const m2 = Mat3.MakeIdentity();
log(m2.toString());
log(m2.row(0));

log(
    m2.setRow(0, 10, 20, 30)
        .setRow(1, new Vec(100, 200, 300))
        .toString()
);

log(
    m2.identity()
        .setScale(10, 5, 2)
        .toString()
);

log(Mat3.GetScale(m2));

m2.setRow(0, 1, 2, 3);
m2.setRow(1, 4, 5, 6);
m2.setRow(2, 7, 8, 9);
log(m2.toString());
log(m2.traspose().toString());

const m3 = Mat3.MakeIdentity();
const m4 = Mat3.MakeIdentity();
log("m3 === m4 : ", Mat3.Equals(m3, m4));
log("m3 === m4.mult(10) : ", Mat3.Equals(m3, m4.mult(10)));
log(m4.toString());

const vs1 = new Vec(1, 2);
const vs2 = new Vec(1, 2, 3);
const vs3 = new Vec(1, 2, 3, 4);
log(vs1.scale(100));
log(vs2.scale(100));
log(vs3.scale(100));

log(vs3.xyz);

const ms1 = Mat3.MakeIdentity()
    .setScale(10, 4, 1);
const v2d = new Vec(1, 1);
log(ms1.multVector(v2d));

ms1[0] = Math.sqrt(-1);
log("ms1: ", ms1.toString());
log("ms1 isNaN = ", Mat3.IsNaN(ms1));

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

log("ma: ", ma.toString());
log("mb: ", mb.toString());
log("ma = ma x mb:");
log(ma.mult(mb).toString());

const M = Mat4.MakeIdentity();
log(M.toString());

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

log("M1: ", M1.toString());
log("M2: ", M2.toString());
log("M1 = M1 x M2: ");
log(M1.mult(M2).toString());

log("M2^-1:");
log(M2.invert().toString());
log("(M2^-1)^t:");
log(M2.traspose().toString());

const trx = Mat4.MakeIdentity();
trx.rotate(math.PI_4, 0, 1, 0);
log(trx.forwardVector);

M2[0] = Math.sqrt(-1);
log(M2.toString());
log("M2 isNaN: ", Mat4.IsNan(M2));

const quat = new Quat(math.PI_4, 0, 1, 0);
log(quat);
const m3q = Mat3.MakeWithQuaternion(quat);
log(m3q.toString());

const m4q = Mat4.MakeWithQuaternion(quat);
log(m4q.toString());

const quatTest = new Vec(1, 0, 0);
log(m4q.multVector(quatTest));

const color24 = new Vec(0.33, 0.52, 0.18);
const color32 = new Vec(color24, 1);
log(color24);
log(color32);

(() => {
    const v1 = new Vec(1, 2, 3, 4);
    const v2 = v1.xyzw; // v2 is a copy of v1
    v2.xy = new Vec(4, 3);
    v2.z = 2;
    v1.xyzw = v2;
    v1.w = 1;
    log(v1);
})();

(() => {
    const v1 = new Vec(0, 0, 0, 0);
    log(v1);
    v1.xyzw = [9, 8, 7, 6];
    log(v1);
})();

(() => {
    const v1 = Vec.Vec2();
    const v2 = Vec.Vec2();
    v1[0] = math.EPSILON * 0.5; // Half of Epsilon is in practice zero.
    log(Vec.Equals(v1, v2)); // true
    log(Vec.IsZero(v1));

    v2[1] = math.sqrt(-1);
    log(Vec.IsNaN(v2)); // v2 is NaN because v2[1] = sqrt(-1);

    log(JSON.stringify(Array.from(v1)));
})();