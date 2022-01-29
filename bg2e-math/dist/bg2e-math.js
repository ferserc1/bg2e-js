const Axis = {
	NONE: 0,
	X: 1,
	Y: 2,
	Z: 3,
    name: (axis) => {
        switch (axis) {
        case Axis.NONE:
            return "NONE";
        case Axis.X:
            return "X";
        case Axis.Y:
            return "Y";
        case Axis.Z:
            return "Z";
        case Axis.W:
            return "W";
        default:
            return "UNKNOWN"
        }    }
};

const PI$1 = 3.141592653589793;
const DEG_TO_RAD = 0.01745329251994;
const RAD_TO_DEG = 57.29577951308233;
const PI_2 = 1.5707963267948966;
const PI_4 = 0.785398163397448;
const PI_8 = 0.392699081698724;
const TWO_PI = 6.283185307179586;
const EPSILON = 0.0000001;

// Default array: 32 bits
const NumericArray = Float32Array;
const NumericArrayHighP = Float64Array;
const FLOAT_MAX = 3.402823e38;

let s_bg_math_seed = Date.now();

const checkPowerOfTwo = (n) => {
    if (typeof n !== 'number') {
        return false;
    }
    else {
        return n && (n & (n - 1)) === 0;
    }  
};

const checkZero = (v) => {
    return v>-EPSILON && v<EPSILON ? 0:v;
};

const isZero = (v) => {
    return checkZero(v) === 0;
};

const equals = (a,b) => {
    return Math.abs(a - b) < EPSILON;
};

const degreesToRadians = (d) => {
    return Math.fround(checkZero(d * DEG_TO_RAD));
};

const radiansToDegrees = (r) => {
    return Math.fround(checkZero(r * RAD_TO_DEG));
};

const sin = (val) => {
    return Math.fround(checkZero(Math.sin(val)));
};

const cos = (val) => {
    return Math.fround(checkZero(Math.cos(val)));
};

const tan$1 = (val) => {
    return Math.fround(checkZero(Math.tan(val)));
};

const cotan = (val) => {
    return Math.fround(checkZero(1.0 / tan$1(val)));
};

const atan = (val) => {
    return Math.fround(checkZero(Math.atan(val)));
};

const atan2 = (i, j) => {
    return Math.fround(checkZero(Math.atan2f(i, j)));
};

const random = () => {
    return Math.random();
};

const seededRandom = () => {
    const max = 1;
    const min = 0;
 
    s_bg_math_seed = (s_bg_math_seed * 9301 + 49297) % 233280;
    const rnd = s_bg_math_seed / 233280;
 
    return min + rnd * (max - min);
};

const max = (a,b) => {
    return Math.fround(Math.max(a,b));
};

const min = (a,b) => {
    return Math.fround(Math.min(a,b));
};

const abs = (val) => {
    return Math.fround(Math.abs(val));
};

const sqrt = (val) => {
    return Math.fround(Math.sqrt(val));
};

const lerp = (from, to, t) => {
    return Math.fround((1.0 - t) * from + t * to);
};

const square = (n) => {
    return Math.fround(n * n);
};

const checkEqualLength = (v1,v2) => {
    if (v1.length!=v2.length) throw new Error(`Invalid vector length in operation`);
};

class Vec$4 extends NumericArray {
    constructor() {
        switch (arguments.length) {
        case 2:
            if (arguments[0] instanceof NumericArray && 
                arguments[0].length === 2 &&
                typeof(arguments[1]) === "number"
            ) {
                super([ arguments[0][0], arguments[0][1], arguments[1]]);
            }
            else if (arguments[0] instanceof NumericArray && 
                arguments[0].length === 3 &&
                typeof(arguments[1]) === "number"
            ) {
                super([ arguments[0][0], arguments[0][1], arguments[0][2], arguments[1]]);
            }
            else if (typeof(arguments[0]) === "number" &&
                typeof(arguments[1]) === "number"
            ) {
                super([arguments[0],arguments[1]]);
            }
            break;
        case 3:
            if (arguments[0] instanceof NumericArray &&
                arguments[0].length === 2 &&
                typeof(arguments[1]) === "number" && typeof(arguments[2]) === "number"
            ) {
                super([ arguments[0][0], arguments[0][1], arguments[1], arguments[2]]);
            }
            else if (typeof(arguments[0]) === "number" &&
                typeof(arguments[1]) === "number" &&
                typeof(arguments[2]) === "number"
            ) {
                super([arguments[0],arguments[1],arguments[2]]);
            }
            break;
        case 4:
            super([arguments[0],arguments[1],arguments[2],arguments[3]]);
            break;
        case 1:
            if (arguments[0] instanceof NumericArray &&
                arguments[0].length>1 && arguments[0].length<5)
            {
                super(arguments[0]);
            }
            break;
        default:
            throw new Error(`Invalid parameters in Vec constructor`);
        }
    }

    normalize() {
        const m = Vec$4.Magnitude(this);
        switch (this.length) {
        case 4:
            this[3] = this[3] / m;
        case 3:
            this[2] = this[2] / m;
        case 2:
            this[1] = this[1] / m;            
            this[0] = this[0] / m;
            break;
        default:
            throw new Error(`Invalid vector size: ${ this.length }`);
        }
        return this;
    }

    assign(src) {
        checkEqualLength(this,src);
        switch (this.length) {
        case 4:
            this[3] = src[3];
        case 3:
            this[2] = src[2];
        case 2:
            this[1] = src[1];
            this[0] = src[0];
            break;
        default:
            throw new Error(`Invalid vector size: ${ this.length }`);
        }
    }

    set(x, y, z = null, w = null) {
        if (this.length === 2) {
            this[0] = x;
            this[1] = y;
        }
        else if (this.length === 3 && z !== null) {
            this[0] = x;
            this[1] = y;
            this[2] = z;
        }
        else if (this.length === 4 && w !== null) {
            this[0] = x;
            this[1] = y;
            this[2] = z;
            this[3] = w;
        }
        else {
            throw new Error(`Invalid vector size: ${ this.length }. Trying to set x=${x}, y=${y}, z=${z}, w=${w}`);
        }
    }

    scale(s) {
        switch (this.length) {
        case 4:
            this[3] = this[3] * s;
        case 3:
            this[2] = this[2] * s;
        case 2:
            this[1] = this[1] * s;
            this[0] = this[0] * s;
            break;
        default:
            throw new Error(`Invalid vector size: ${ v.length }`);
        }
        return this;
    }

    get x() {
        return this[0];
    }

    get y() {
        return this[1];
    }

    get z() {
        return this[2];
    }

    get w() {
        return this[3];
    }

    set x(v) {
        this[0] = v;
        return this;
    }

    set y(v) {
        this[1] = v;
        return this;
    }

    set z(v) {
        this[2] = v;
        return this;
    }

    set w(v) {
        this[3] = v;
        return this;
    }

    get xy() {
        switch (this.length) {
        case 2:
            return new Vec$4(this);
        case 3:
        case 4:
            return new Vec$4(this[0], this[1]);
        default:
            throw new Error(`Invalid vector size: ${ this.length }`);
        }
    }

    get xz() {
        switch (this.length) {
        case 3:
        case 4:
            return new Vec$4(this[0], this[2]);
        case 2:
        default:
            throw new Error(`Invalid vector size: ${ this.length }`);
        }
    }

    get yz() {
        switch (this.length) {
        case 3:
        case 4:
            return new Vec$4(this[1], this[2]);
        case 2:
        default:
            throw new Error(`Invalid vector size: ${ this.length }`);
        }
    }

    set xy(v) {
        this[0] = v[0];
        this[1] = v[1];
        return this;
    }

    set xz(v) {
        if (this.length<3) {
            throw new Error('Invalid vector size');
        }
        this[0] = v[0];
        this[2] = v[1];
        return this;
    }

    set yz(v) {
        if (this.length<3) {
            throw new Error('Invalid vector size');
        }
        this[1] = v[0];
        this[2] = v[1];
        return this;
    }

    get xyz() {
        if (this.length < 3) {
            throw new Error(`Invalid vector size: ${ this.length }`);
        }
        return new Vec$4(this[0], this[1], this[2]);
    }

    set xyz(v) {
        if (v.length<3 || this.length<3) {
            throw new Error(`Invalid vector size to set: l;${ this.length }, r:${v.length}`);
        }
        this[0] = v[0];
        this[1] = v[1];
        this[2] = v[2];
        return this;
    }

    // Copy operator
    get xyzw() {
        if (this.length < 4) {
            throw new Error(`Invalid vector size: ${ this.length }, 4 required`);
        }
        return new Vec$4(this[0], this[1], this[2], this[3]);
    }

    // Assign operator
    set xyzw(v) {
        if (this.length < 4 || v.length<4) {
            throw new Error(`Invalid vector size to set: l;${ this.length }, r:${v.length}`);
        }
        this[0] = v[0];
        this[1] = v[1];
        this[2] = v[2];
        this[3] = v[3];
        return this;
    }

    static CheckEqualLength(v1,v2) {
        checkEqualLength(v1,v2);
    }

    static Max(v1,v2) {
        checkEqualLength(v1,v2);
        switch (v1.length) {
        case 2:
            return new NumericArray([
                v1[0]>v2[0] ? v1[0] : v2[0],
                v1[1]>v2[1] ? v1[1] : v2[1]
            ]);
        case 3:
            return new NumericArray([
                v1[0]>v2[0] ? v1[0] : v2[0],
                v1[1]>v2[1] ? v1[1] : v2[1],
                v1[2]>v2[2] ? v1[2] : v2[2]
            ]);
        case 4:
            return new NumericArray([
                v1[0]>v2[0] ? v1[0] : v2[0],
                v1[1]>v2[1] ? v1[1] : v2[1],
                v1[2]>v2[2] ? v1[2] : v2[2],
                v1[3]>v2[3] ? v1[3] : v2[3]
            ]);
        default:
            throw new Error(`Invalid vector size: ${ v1.length }`);
        }
    }

    static Min(v1,v2) {
        checkEqualLength(v1,v2);
        switch (v1.length) {
        case 2:
            return new NumericArray([
                v1[0]<v2[0] ? v1[0] : v2[0],
                v1[1]<v2[1] ? v1[1] : v2[1]
            ]);
        case 3:
            return new NumericArray([
                v1[0]<v2[0] ? v1[0] : v2[0],
                v1[1]<v2[1] ? v1[1] : v2[1],
                v1[2]<v2[2] ? v1[2] : v2[2]
            ]);
        case 4:
            return new NumericArray([
                v1[0]<v2[0] ? v1[0] : v2[0],
                v1[1]<v2[1] ? v1[1] : v2[1],
                v1[2]<v2[2] ? v1[2] : v2[2],
                v1[3]<v2[3] ? v1[3] : v2[3]
            ]);
        default:
            throw new Error(`Invalid vector size: ${ v1.length }`);
        }
    }

    static Add(v1,v2) {
        checkEqualLength(v1,v2);
        switch (v1.length) {
        case 2:
            return new NumericArray([
                v1[0] + v2[0],
                v1[1] + v2[1]
            ]);
        case 3:
            return new NumericArray([
                v1[0] + v2[0],
                v1[1] + v2[1],
                v1[2] + v2[2]
            ]);
        case 4:
            return new NumericArray([
                v1[0] + v2[0],
                v1[1] + v2[1],
                v1[2] + v2[2],
                v1[3] + v2[3]
            ]);
        default:
            throw new Error(`Invalid vector size: ${ v1.length }`);
        }
    }

    static Sub(v1,v2) {
        checkEqualLength(v1,v2);
        switch (v1.length) {
        case 2:
            return new NumericArray([
                v1[0] - v2[0],
                v1[1] - v2[1]
            ]);
        case 3:
            return new NumericArray([
                v1[0] - v2[0],
                v1[1] - v2[1],
                v1[2] - v2[2]
            ]);
        case 4:
            return new NumericArray([
                v1[0] - v2[0],
                v1[1] - v2[1],
                v1[2] - v2[2],
                v1[3] - v2[3]
            ]);
        default:
            throw new Error(`Invalid vector size: ${ v1.length }`);
        }
    }

    static Magnitude(v) {
        switch (v.length) {
        case 2:
            return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
        case 3:
            return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        case 4:
            return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2] + v[3] * v[3]);
        default:
            throw new Error(`Invalid vector size: ${ v.length }`);
        }
    }

    static Distance(v1,v2) {
        checkEqualLength(v1,v2);
        return Vec$4.Magnitude(Vec$4.Sub(v1,v2));
    }

    static Dot(v1,v2) {
        checkEqualLength(v1,v2);
        switch (v1.length) {
        case 2:
            return v1[0] * v2[0] + v1[1] * v2[1];
        case 3:
            return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
        case 4:
            return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2] + v1[3] * v2[3];
        default:
            throw new Error(`Invalid vector size: ${ v1.length }`);
        }
    }

    static Cross(v1,v2) {
        checkEqualLength(v1,v2);
        switch (v1.length) {
        case 2:
            return v1[0] * v2[1] - v1[1] - v2[0];
        case 3:
            return new NumericArray([
                v1[1] * v2[2] - v1[2] * v2[1],
                v1[2] * v2[0] - v1[0] * v2[2],
                v1[0] * v2[1] - v1[1] * v2[0],
            ]);
        default:
            throw new Error(`Invalid vector size for cross product: ${ v1.length }`);
        }
    }

    static Normalized(v) {
        const m = Vec$4.Magnitude(v);
        switch (v.length) {
        case 2:
            return new NumericArray([ v[0] / m, v[1] / m ]);
        case 3:
            return new NumericArray([ v[0] / m, v[1] / m, v[2] / m ]);
        case 4:
            return new NumericArray([ v[0] / m, v[1] / m, v[2] / m, v[3] / m ])
        default:
            throw new Error(`Invalid vector size: ${ v.length }`);
        }
    }

    static Mult(v,s) {
        switch (v.length) {
        case 2:
            return new NumericArray([ v[0] * s, v[1] * s ]);
        case 3:
            return new NumericArray([ v[0] * s, v[1] * s, v[2] * s ]);
        case 4:
            return new NumericArray([ v[0] * s, v[1] * s, v[2] * s, v[3] * s ]);
        default:
            throw new Error(`Invalid vector size: ${ v.length }`);
        }
    }

    static Div(v,s) {
        switch (v.length) {
        case 2:
            return new NumericArray([ v[0] / s, v[1] / s ]);
        case 3:
            return new NumericArray([ v[0] / s, v[1] / s, v[2] / s ]);
        case 4:
            return new NumericArray([ v[0] / s, v[1] / s, v[2] / s, v[3] / s ]);
        default:
            throw new Error(`Invalid vector size: ${ v.length }`);
        }
    }

    static Equals(v1,v2) {
        if (v1.length != v2.length) {
            return false;
        }
        else {
            switch (v1.length) {
            case 2:
                return  equals(v1[0], v2[0]) &&
                        equals(v1[1], v2[1]);
            case 3:
                return  equals(v1[0], v2[0]) &&
                        equals(v1[1], v2[1]) &&
                        equals(v1[2], v2[2]);
            case 4:
                return  equals(v1[0], v2[0]) &&
                        equals(v1[1], v2[1]) &&
                        equals(v1[2], v2[2]) &&
                        equals(v1[3], v2[3]);
            default:
                throw new Error(`Invalid vector size: ${ v1.length }`);
            }
        }
    }

    static IsZero(v) {
        switch (v.length) {
        case 2:
            return isZero(v[0]) || isZero(v[1]);
        case 3:
            return isZero(v[0]) || isZero(v[1]) || isZero(v[2]);
        case 4:
            return isZero(v[0]) || isZero(v[1]) || isZero(v[2]) || isZero(v[3]);
        default:
            throw new Error(`Invalid vector size: ${ v.length }`);
        }
    }

    static IsNaN(v) {
        switch (v.length) {
        case 2:
            return isNaN(v[0]) || isNaN(v[1]);
        case 3:
            return isNaN(v[0]) || isNaN(v[1]) || isNaN(v[2]);
        case 4:
            return isNaN(v[0]) || isNaN(v[1]) || isNaN(v[2]) || isNaN(v[3]);
        default:
            throw new Error(`Invalid vector size: ${ v.length }`);
        }
    }

    /////// Constructors
    static Vec2() {
        return new Vec$4(0,0);
    }

    static Vec3() {
        return new Vec$4(0,0,0);
    }

    static Vec4() {
        return new Vec$4(0,0,0,0);
    }
}

var VectorUtils = {
    Vec: Vec$4
};

const Vec$3 = VectorUtils.Vec;

class Mat3$2 extends NumericArray {
    constructor() {
        if (arguments.length === 9) {
            super(arguments);
        }
        else if (arguments.length === 1 && arguments[0].length === 9) {
            super(arguments[0]);
        }
        else if (arguments.length === 0) {
            super([0,0,0,0,0,0,0,0,0]);
        }
        else {
            throw new Error(`Invalid parameter size in Mat3 constructor`);
        }
    }

    identity() {
        this[0] = 1; this[1] = 0; this[2] = 0;
        this[3] = 0; this[4] = 1; this[5] = 0;
        this[6] = 0; this[7] = 0; this[8] = 1;
        return this;
    }

    zero() {
        this[0] = 0; this[1] = 0; this[2] = 0;
        this[3] = 0; this[4] = 0; this[5] = 0;
        this[6] = 0; this[7] = 0; this[8] = 0;
        return this;
    }

    row(i) {
        return new Vec$3(
            this[i * 3], 
            this[i * 3 + 1],
            this[ i* 3 + 2]);
    }

    setRow(i, a, y = null, z = null) {
        if (a instanceof NumericArray && a.length>=3) {
            this[i * 3]      = a[0];
            this[i * 3 + 1]  = a[1];
            this[i * 3 + 2]  = a[2];
        }
        else if (typeof(a) === "number" && 
            typeof(y) === "number" && 
            typeof(z) === "number"
        ) {
            this[i * 3]      = a;
            this[i * 3 + 1]  = y;
            this[i * 3 + 2]  = z;
        }
        else {
            throw new Error(`Invalid parameter setting matrix row`);
        }
        return this;
    }

    col(i) {
        return new Vec$3(
            this[i],
            this[i + 3],
            this[i + 3 * 2]
        )
    }

    setCol(i, a, y = null, z = null) {
        if (a instanceof NumericArray && a.length>=3) {
            this[i]         = a[0];
            this[i + 3]     = a[1];
            this[i + 3 * 2] = a[2];
        }
        else if (typeof(a) === "number" && 
            typeof(y) === "number" && 
            typeof(z) === "number"
        ) {
            this[i]         = a;
            this[i + 3]     = y;
            this[i + 3 * 2] = z;
        }
        else {
            throw new Error(`Invalid parameter setting matrix row`);
        }
        return this;
    }

    assign(m) {
        if (m.length === 9) {
            this[0] = m[0]; this[1] = m[1]; this[2] = m[2];
			this[3] = m[3]; this[4] = m[4]; this[5] = m[5];
			this[6] = m[6]; this[7] = m[7]; this[8] = m[8];
        }
        else if (m.length === 16) {
            this[0] = m[0]; this[1] = m[1]; this[2] = m[2];
			this[3] = m[4]; this[4] = m[5]; this[5] = m[6];
			this[6] = m[8]; this[7] = m[9]; this[8] = m[10];
        }
        else {
            throw new Error(`Invalid plarameter setting matrix data`);
        }
        return this;
    }

    setScale(x,y,z) { 
		const rx = (new Vec$3(this[0], this[3], this[6])).normalize().scale(x);
		const ry = (new Vec$3(this[1], this[4], this[7])).normalize().scale(y);
		const rz = (new Vec$3(this[2], this[5], this[8])).normalize().scale(z);
		this[0] = rx.x; this[3] = rx.y; this[6] = rx.z;
		this[1] = ry.x; this[4] = ry.y; this[7] = ry.z;
		this[2] = rz.x; this[5] = rz.y; this[8] = rz.z;
		return this;
	}

    traspose() {
        const m3 = this[3];  // 0, 1, 2
        const m7 = this[7];  // 3, 4, 5
        const m6 = this[6];  // 6, 7, 8
        this[3] = this[1];
        this[6] = this[2];
        this[7] = this[5];
        this[1] = m3;
        this[2] = m6;
        this[5] = m7;
        return this;
    }

    mult(a) {
        if (typeof(a) === "number") {
            this[0] *= a; this[1] *= a; this[2] *= a;
            this[3] *= a; this[4] *= a; this[5] *= a;
            this[6] *= a; this[7] *= a; this[8] *= a;
        }
        else if (a instanceof NumericArray && a.length === 9) {
            const r0 = this.row(0);
            const r1 = this.row(1);
            const r2 = this.row(2);
            const c0 = a.col(0);
            const c1 = a.col(1);
            const c2 = a.col(2);
            
            this[0] = Vec$3.Dot(r0,c0); this[1] = Vec$3.Dot(r0,c1); this[2] = Vec$3.Dot(r0,c2);
            this[3] = Vec$3.Dot(r1,c0); this[4] = Vec$3.Dot(r1,c1); this[5] = Vec$3.Dot(r1,c2);
            this[6] = Vec$3.Dot(r2,c0); this[7] = Vec$3.Dot(r2,c1); this[8] = Vec$3.Dot(r2,c2);
        }
        else {
            throw new Error(`Invalid parameter in Mat3.mult()`);
        }
        return this;
    }

    multVector(v) {
        if (v.length === 2 || v.length === 3) {
            const x = v[0];
            const y = v[1];
            const z = v.length === 2 ? 1 : v[2];
        
            return new Vec$3(	this[0] * x + this[3] * y + this[6] * z,
                            this[1] * x + this[4] * y + this[7] * z,
                            this[2] * x + this[5] * y + this[8] * z);
        }
        else {
            throw new Error(`Invalid parameter in Mat3.multVector()`);
        }
    }

    toString() {
        return  `[ ${this[0]}, ${this[1]}, ${this[2]}\n` +
                `  ${this[3]}, ${this[4]}, ${this[5]}\n` +
                `  ${this[6]}, ${this[7]}, ${this[8]} ]`;
    }

    static MakeIdentity() {
        const m = new Mat3$2();
        return m.identity();
    }

    static MakeZero() {
        const m = new Mat3$2();
        return m.zero();
    }

    static MakeWithQuaternion(q) {
        const m = Mat3$2.MakeIdentity();
        
        m.setRow(0, new Vec$3( 1  - 2 * q[1] * q[1] - 2 * q[2] * q[2], 2 * q[0] * q[1] - 2 * q[2] * q[3], 2 * q[0] * q[2] + 2 * q[1] * q[3]));
        m.setRow(1, new Vec$3( 2 * q[0] * q[1] + 2 * q[2] * q[3], 1  - 2.0 * q[0] * q[0] - 2 * q[2] * q[2], 2 * q[1] * q[2] - 2 * q[0] * q[3]));
        m.setRow(2, new Vec$3( 2 * q[0] * q[2] - 2 * q[1] * q[3], 2 * q[1] * q[2] + 2 * q[0] * q[3] , 1 - 2 * q[0] * q[0] - 2 * q[1] * q[1]));

        return m;
    }

    static IsZero(m) {
        return	v[0]==0 && v[1]==0.0 && v[2]==0.0 &&
                v[3]==0 && v[4]==0.0 && v[5]==0.0 &&
                v[6]==0 && v[7]==0.0 && v[8]==0.0;
    }
    
    static IsIdentity(m) {
        return	v[0]==1.0 && v[1]==0.0 && v[2]==0.0 &&
                v[3]==0.0 && v[4]==1.0 && v[5]==0.0 &&
                v[6]==0.0 && v[7]==0.0 && v[8]==1.0;
    }

    static GetScale(m) {
        return new Vec$3(
            Vec$3.Magnitude(new Vec$3(m[0], m[3], m[6])),
            Vec$3.Magnitude(new Vec$3(m[1], m[4], m[7])),
            Vec$3.Magnitude(new Vec$3(m[2], m[5], m[8]))
        );
    }

    static Equals(a,b) {
        return	a[0] == b[0] && a[1] == b[1]  && a[2] == b[2] &&
                a[3] == b[3] && a[4] == b[4]  && a[5] == b[5] &&
                a[6] == b[6] && a[7] == b[7]  && a[8] == b[8];
    }

    static IsNaN(m) {
        return	isNaN(m[0]) || isNaN(m[1]) || isNaN(m[2]) &&
                isNaN(m[3]) || isNaN(m[4]) || isNaN(m[5]) &&
                isNaN(m[6]) || isNaN(m[7]) || isNaN(m[8]);
    }
}
var Matrix3Utils = {
    Mat3: Mat3$2
};

const Vec$2 = VectorUtils.Vec;
const Mat3$1 = Matrix3Utils.Mat3;

class Mat4$1 extends NumericArray {
    constructor() {
        const inMatrix = [
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0
        ];

        // Create from matrix3
        if (arguments.length === 9) {
            inMatrix[0] = arguments[0]; 
            inMatrix[1] = arguments[1];
            inMatrix[2] = arguments[2];

            inMatrix[4] = arguments[3]; 
            inMatrix[5] = arguments[4];
            inMatrix[6] = arguments[5];

            inMatrix[8] = arguments[6]; 
            inMatrix[9] = arguments[7];
            inMatrix[10] = arguments[8];

            inMatrix[15] = 1;
        }
        else if (arguments.length === 1 && arguments[0].length === 9) {
            inMatrix[0]  = arguments[0][0]; 
            inMatrix[1]  = arguments[0][1];
            inMatrix[2]  = arguments[0][2];

            inMatrix[4]  = arguments[0][3]; 
            inMatrix[5]  = arguments[0][4];
            inMatrix[6]  = arguments[0][5];

            inMatrix[8]  = arguments[0][6]; 
            inMatrix[9]  = arguments[0][7];
            inMatrix[10] = arguments[0][8];

            inMatrix[15] = 1;
        }
        // Create from matrix4
        else if (arguments.length === 16) {
            inMatrix[0 ] = arguments[0];
            inMatrix[1 ] = arguments[1 ];
            inMatrix[2 ] = arguments[2 ];
            inMatrix[3 ] = arguments[3 ];

            inMatrix[4 ] = arguments[4 ];
            inMatrix[5 ] = arguments[5 ];
            inMatrix[6 ] = arguments[6 ];
            inMatrix[7 ] = arguments[7 ];

            inMatrix[8 ] = arguments[8 ];
            inMatrix[9 ] = arguments[9 ];
            inMatrix[10] = arguments[10];
            inMatrix[11] = arguments[11];

            inMatrix[12] = arguments[12];
            inMatrix[13] = arguments[13];
            inMatrix[14] = arguments[14];
            inMatrix[15] = arguments[15];
        }
        else if (arguments.length === 1 && arguments[0].length === 16) {
            inMatrix[0 ] = arguments[0][0];
            inMatrix[1 ] = arguments[0][1 ];
            inMatrix[2 ] = arguments[0][2 ];
            inMatrix[3 ] = arguments[0][3 ];

            inMatrix[4 ] = arguments[0][4 ];
            inMatrix[5 ] = arguments[0][5 ];
            inMatrix[6 ] = arguments[0][6 ];
            inMatrix[7 ] = arguments[0][7 ];

            inMatrix[8 ] = arguments[0][8 ];
            inMatrix[9 ] = arguments[0][9 ];
            inMatrix[10] = arguments[0][10];
            inMatrix[11] = arguments[0][11];

            inMatrix[12] = arguments[0][12];
            inMatrix[13] = arguments[0][13];
            inMatrix[14] = arguments[0][14];
            inMatrix[15] = arguments[0][15];
        }
        else if (arguments.length != 0) {
            throw new Error(`Invalid parameter size in Matrix3 constructor`);
        }

        super(inMatrix);
    }

    ////// Initializers
    identity() {
        this[0 ] = 1; this[1 ] = 0; this[2 ] = 0; this[3 ] = 0;
        this[4 ] = 0; this[5 ] = 1; this[6 ] = 0; this[7 ] = 0;
        this[8 ] = 0; this[9 ] = 0; this[10] = 1; this[11] = 0;
        this[12] = 0; this[13] = 0; this[14] = 0; this[15] = 1;
        return this;
    }

    zero() {
		this[ 0] = 0; this[ 1] = 0; this[ 2] = 0; this[ 3] = 0;
		this[ 4] = 0; this[ 5] = 0; this[ 6] = 0; this[ 7] = 0;
		this[ 8] = 0; this[ 9] = 0; this[10] = 0; this[11] = 0;
		this[12] = 0; this[13] = 0; this[14] = 0; this[15] = 0;
		return this;
	}

    perspective(fovy, aspect, nearPlane, farPlane) {
		let fovy2 = tan(fovy * PI / 360.0) * nearPlane;
		let fovy2aspect = fovy2 * aspect;
		this.frustum(-fovy2aspect,fovy2aspect,-fovy2,fovy2,nearPlane,farPlane);
        return this;
	}

	frustum(left, right, bottom, top, nearPlane, farPlane) {
		let A = right - left;
		let B = top-bottom;
		let C = farPlane-nearPlane;
		
		this.setRow(0, new Vec$2(nearPlane*2.0/A,	0.0,	0.0,	0.0));
		this.setRow(1, new Vec$2(0.0,	nearPlane*2.0/B,	0.0,	0.0));
		this.setRow(2, new Vec$2((right+left)/A,	(top+bottom)/B,	-(farPlane+nearPlane)/C,	-1.0));
		this.setRow(3, new Vec$2(0.0,	0.0,	-(farPlane*nearPlane*2.0)/C,	0.0));
		
		return this;
	}

	ortho(left, right, bottom, top, nearPlane, farPlane) {
		let m = right-left;
		let l = top-bottom;
		let k = farPlane-nearPlane;		
		this[0] = 2/m; this[1] = 0;   this[2] = 0;     this[3] = 0;
		this[4] = 0;   this[5] = 2/l; this[6] = 0;     this[7] = 0;
		this[8] = 0;   this[9] = 0;   this[10] = -2/k; this[11]= 0;
		this[12]=-(left+right)/m; this[13] = -(top+bottom)/l; this[14] = -(farPlane+nearPlane)/k; this[15]=1;

		return this;
	}
		
	lookAt(p_eye, p_center, p_up) {
        this.identity();

		const y = new Vec$2(p_up);
		const z = Vec3.Sub(p_eye,p_center);
		z.normalize();
		const x = Vec3.Cross(y,z);
		x.normalize();
		y.normalize();

		this.m00 = x.x;
		this.m10 = x.y;
		this.m20 = x.z;
		this.m30 = -Vec3.Dot(x, p_eye);
		this.m01 = y.x;
		this.m11 = y.y;
		this.m21 = y.z;
		this.m31 = -Vec3.Dot(y, p_eye);
		this.m02 = z.x;
		this.m12 = z.y;
		this.m22 = z.z;
		this.m32 = -Vec3.Dot(z, p_eye);
		this.m03 = 0;
		this.m13 = 0;
		this.m23 = 0;
		this.m33 = 1;
	
		return result;
	}




    ///// Setters and getters
    get m00() { return this[0]; }
	get m01() { return this[1]; }
	get m02() { return this[2]; }
	get m03() { return this[3]; }
	get m10() { return this[4]; }
	get m11() { return this[5]; }
	get m12() { return this[6]; }
	get m13() { return this[7]; }
	get m20() { return this[8]; }
	get m21() { return this[9]; }
	get m22() { return this[10]; }
	get m23() { return this[11]; }
	get m30() { return this[12]; }
	get m31() { return this[13]; }
	get m32() { return this[14]; }
	get m33() { return this[15]; }
	
	set m00(v) { this[0] = v; }
	set m01(v) { this[1] = v; }
	set m02(v) { this[2] = v; }
	set m03(v) { this[3] = v; }
	set m10(v) { this[4] = v; }
	set m11(v) { this[5] = v; }
	set m12(v) { this[6] = v; }
	set m13(v) { this[7] = v; }
	set m20(v) { this[8] = v; }
	set m21(v) { this[9] = v; }
	set m22(v) { this[10] = v; }
	set m23(v) { this[11] = v; }
	set m30(v) { this[12] = v; }
	set m31(v) { this[13] = v; }
	set m32(v) { this[14] = v; }
	set m33(v) { this[15] = v; }

    row(i) {
        return new Vec$2(
            this[i * 4], 
            this[i * 4 + 1],
            this[i * 4 + 2],
            this[i * 4 + 3]);
    }

    setRow(i, a, y = null, z = null, w = null) {
        if (a instanceof NumericArray && a.length>=4) {
            this[i * 4]      = a[0];
            this[i * 4 + 1]  = a[1];
            this[i * 4 + 2]  = a[2];
            this[i * 4 + 3]  = a[3];
        }
        else if (typeof(a) === "number" && 
            typeof(y) === "number" && 
            typeof(z) === "number" &&
            typeof(w) === "number"
        ) {
            this[i * 4]      = a;
            this[i * 4 + 1]  = y;
            this[i * 4 + 2]  = z;
            this[i * 4 + 3]  = w;
        }
        else {
            throw new Error(`Invalid parameter setting matrix row`);
        }
        return this;
    }

    col(i) {
        return new Vec$2(
            this[i],
            this[i + 4],
            this[i + 4 * 2],
            this[i + 4 * 3]
        )
    }

    setCol(i, a, y = null, z = null, w = null) {
        if (a instanceof NumericArray && a.length>=4) {
            this[i]         = a[0];
            this[i + 4]     = a[1];
            this[i + 4 * 2] = a[2];
            this[i + 4 * 3] = a[3];
        }
        else if (typeof(a) === "number" && 
            typeof(y) === "number" && 
            typeof(z) === "number" &&
            typeof(w) === "number"
        ) {
            this[i]         = a;
            this[i + 4]     = y;
            this[i + 4 * 2] = z;
            this[i + 4 * 3] = w;
        }
        else {
            throw new Error(`Invalid parameter setting matrix row`);
        }
        return this;
    }

    mat3() {
		return new Mat3$1(this[0], this[1], this[ 2],
						this[4], this[5], this[ 6],
						this[8], this[9], this[10]);
	}

    assign(a) {
		if (a.length==9) {
			this[0]  = a[0]; this[1]  = a[1]; this[2]  = a[2]; this[3]  = 0;
			this[4]  = a[3]; this[5]  = a[4]; this[6]  = a[5]; this[7]  = 0;
			this[8]  = a[6]; this[9]  = a[7]; this[10] = a[8]; this[11] = 0;
			this[12] = 0;	 this[13] = 0;	  this[14] = 0;	   this[15] = 1;
		}
		else if (a.length==16) {
			this[0]  = a[0];  this[1]  = a[1];  this[2]  = a[2];  this[3]  = a[3];
			this[4]  = a[4];  this[5]  = a[5];  this[6]  = a[6];  this[7]  = a[7];
			this[8]  = a[8];  this[9]  = a[9];  this[10] = a[10]; this[11] = a[11];
			this[12] = a[12]; this[13] = a[13];	this[14] = a[14]; this[15] = a[15];
		}
		return this;
	}

    get forwardVector() {
		return Mat4$1.TransformDirection(this, new Vec$2(0.0, 0.0, 1.0));
	}
	
	get rightVector() {
		return Mat4$1.TransformDirection(this, new Vec$2(1.0, 0.0, 0.0));
	}
	
	get upVector() {
		return Mat4$1.TransformDirection(this, new Vec$2(0.0, 1.0, 0.0));
	}
	
	get backwardVector() {
		return Mat4$1.TransformDirection(this, new Vec$2(0.0, 0.0, -1.0));
	}
	
	get leftVector() {
		return Mat4$1.TransformDirection(this, new Vec$2(-1.0, 0.0, 0.0));
	}
	
	get downVector() {
		return Mat4$1.TransformDirection(this, new Vec$2(0.0, -1.0, 0.0));
	}


    /////// Query functions
    isZero() {
		return	this[ 0]==0 && this[ 1]==0 && this[ 2]==0 && this[ 3]==0 &&
				this[ 4]==0 && this[ 5]==0 && this[ 6]==0 && this[ 7]==0 &&
				this[ 8]==0 && this[ 9]==0 && this[10]==0 && this[11]==0 &&
				this[12]==0 && this[13]==0 && this[14]==0 && this[15]==0;
	}
	
	isIdentity() {
		return	this[ 0]==1 && this[ 1]==0 && this[ 2]==0 && this[ 3]==0 &&
				this[ 4]==0 && this[ 5]==1 && this[ 6]==0 && this[ 7]==0 &&
				this[ 8]==0 && this[ 9]==0 && this[10]==1 && this[11]==0 &&
				this[12]==0 && this[13]==0 && this[14]==0 && this[15]==1;
	}


    /////// Transform functions
	translate(x, y, z) {
		this.mult(Mat4$1.MakeTranslation(x, y, z));
		return this;
	}

	rotate(alpha, x, y, z) {
		this.mult(Mat4$1.MakeRotation(alpha, x, y, z));
		return this;
	}
	
	scale(x, y, z) {
		this.mult(Mat4$1.MakeScale(x, y, z));
		return this;
	}




    toString() {
        return  `[ ${this[ 0]}, ${this[ 1]}, ${this[ 2]}, ${this[ 3]}\n` +
                `  ${this[ 4]}, ${this[ 5]}, ${this[ 6]}, ${this[ 7]}\n` +
                `  ${this[ 8]}, ${this[ 9]}, ${this[10]}, ${this[11]}\n` +
                `  ${this[12]}, ${this[13]}, ${this[14]}, ${this[15]} ]`;
    }


    ////// Utilities
    setScale(x,y,z) {
		const rx = new Vec$2(this[0], this[4], this[8]).normalize().scale(x);
		const ry = new Vec$2(this[1], this[5], this[9]).normalize().scale(y);
		const rz = new Vec$2(this[2], this[6], this[10]).normalize().scale(z);
		this[0] = rx.x; this[4] = rx.y; this[8] = rx.z;
		this[1] = ry.x; this[5] = ry.y; this[9] = ry.z;
		this[2] = rz.x; this[6] = rz.y; this[10] = rz.z;
		return this;
	}

	setPosition(pos,y,z) {
		if (typeof(pos)=="number") {
			this[12] = pos;
			this[13] = y;
			this[14] = z;
		}
		else {
			this[12] = pos.x;
			this[13] = pos.y;
			this[14] = pos.z;
		}
		return this;
	}

    /////// Operations
    mult(a) {
		if (typeof(a)=='number') {
			this[ 0] *= a; this[ 1] *= a; this[ 2] *= a; this[ 3] *= a;
			this[ 4] *= a; this[ 5] *= a; this[ 6] *= a; this[ 7] *= a;
			this[ 8] *= a; this[ 9] *= a; this[10] *= a; this[11] *= a;
			this[12] *= a; this[13] *= a; this[14] *= a; this[15] *= a;
			return this;
		}

        const r0 = this.row(0);
        const r1 = this.row(1);
        const r2 = this.row(2);
        const r3 = this.row(3);
        const c0 = a.col(0);
        const c1 = a.col(1);
        const c2 = a.col(2);
        const c3 = a.col(3);

        this[0 ] = Vec$2.Dot(r0, c0); this[1 ] = Vec$2.Dot(r0, c1); this[2 ] = Vec$2.Dot(r0, c2); this[3 ] = Vec$2.Dot(r0, c3);
        this[4 ] = Vec$2.Dot(r1, c0); this[5 ] = Vec$2.Dot(r1, c1); this[6 ] = Vec$2.Dot(r1, c2); this[7 ] = Vec$2.Dot(r1, c3);
        this[8 ] = Vec$2.Dot(r2, c0); this[9 ] = Vec$2.Dot(r2, c1); this[10] = Vec$2.Dot(r2, c2); this[11] = Vec$2.Dot(r2, c3);
        this[12] = Vec$2.Dot(r3, c0); this[13] = Vec$2.Dot(r3, c1); this[14] = Vec$2.Dot(r3, c2); this[15] = Vec$2.Dot(r3, c3);

		return this;
	}

	multVector(vec) {
        if (vec.length<3) {
            throw new Error("Invalid parameter multiplying Mat4 by vector");
        }

		const x = vec[0];
		const y = vec[1];
		const z = vec[2];
		const w = vec.length >3 ? vec[3] : 1.0;
	
		return new Vec$2( this[0] * x + this[4] * y + this[ 8] * z + this[12] * w,
						this[1] * x + this[5] * y + this[ 9] * z + this[13] * w,
						this[2] * x + this[6] * y + this[10] * z + this[14] * w,
						this[3] * x + this[7] * y + this[11] * z + this[15] * w);
	}
	
	invert() {
		const a00 = this[0],  a01 = this[1],  a02 = this[2],  a03 = this[3],
	          a10 = this[4],  a11 = this[5],  a12 = this[6],  a13 = this[7],
	          a20 = this[8],  a21 = this[9],  a22 = this[10], a23 = this[11],
	          a30 = this[12], a31 = this[13], a32 = this[14], a33 = this[15];

	    const b00 = a00 * a11 - a01 * a10,
	          b01 = a00 * a12 - a02 * a10,
	          b02 = a00 * a13 - a03 * a10,
	          b03 = a01 * a12 - a02 * a11,
	          b04 = a01 * a13 - a03 * a11,
	          b05 = a02 * a13 - a03 * a12,
	          b06 = a20 * a31 - a21 * a30,
	          b07 = a20 * a32 - a22 * a30,
	          b08 = a20 * a33 - a23 * a30,
	          b09 = a21 * a32 - a22 * a31,
	          b10 = a21 * a33 - a23 * a31,
	          b11 = a22 * a33 - a23 * a32;

	    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

	    if (!det) {
			this.zero();
	    }
		else {
			det = 1.0 / det;

			this[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
			this[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
			this[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
			this[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
			this[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
			this[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
			this[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
			this[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
			this[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
			this[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
			this[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
			this[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
			this[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
			this[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
			this[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
			this[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
		}

        return this;
	}
	
	traspose() {
		const r0 = new Vec$2(this[0], this[4], this[ 8], this[12]);
		const r1 = new Vec$2(this[1], this[5], this[ 9], this[13]);
		const r2 = new Vec$2(this[2], this[6], this[10], this[14]);
		const r3 = new Vec$2(this[3], this[7], this[11], this[15]);
	
		this.setRow(0, r0);
		this.setRow(1, r1);
		this.setRow(2, r2);
		this.setRow(3, r3);
		return this;
	}




    ///////// Factory methods
    static MakeIdentity() {
        const m = new Mat4$1();
        return m.identity();
    }

	static MakeZero() {
		const m = new Mat4$1();
		return m.zero();
	}

	static MakeWithQuaternion(q) {
		const m = Mat4$1.MakeIdentity();
        
        m.setRow(0, new Vec$2( 1  - 2 * q[1] * q[1] - 2 * q[2] * q[2], 2 * q[0] * q[1] - 2 * q[2] * q[3], 2 * q[0] * q[2] + 2 * q[1] * q[3], 0));
        m.setRow(1, new Vec$2( 2 * q[0] * q[1] + 2 * q[2] * q[3], 1  - 2.0 * q[0] * q[0] - 2 * q[2] * q[2], 2 * q[1] * q[2] - 2 * q[0] * q[3], 0));
        m.setRow(2, new Vec$2( 2 * q[0] * q[2] - 2 * q[1] * q[3], 2 * q[1] * q[2] + 2 * q[0] * q[3] , 1 - 2 * q[0] * q[0] - 2 * q[1] * q[1], 0));//
        return m;
	}
	
    static MakeTranslation(x, y, z) {
		if (x instanceof NumericArray && x.length >= 3) {
			y = x[1];
			z = x[2];
			x = x[0];
		}
		return new Mat4$1(
			1.0, 0.0, 0.0, 0.0,
			0.0, 1.0, 0.0, 0.0,
			0.0, 0.0, 1.0, 0.0,
			  x,   y,   z, 1.0
		);
	}
		
	static MakeRotation(alpha, x, y, z) {
		const axis = new Vec$2(x,y,z);
		axis.normalize();
				
		var cosAlpha = Math.cos(alpha);
		var acosAlpha = 1.0 - cosAlpha;
		var sinAlpha = Math.sin(alpha);
		
		return new Mat4$1(
			axis.x * axis.x * acosAlpha + cosAlpha, axis.x * axis.y * acosAlpha + axis.z * sinAlpha, axis.x * axis.z * acosAlpha - axis.y * sinAlpha, 0,
			axis.y * axis.x * acosAlpha - axis.z * sinAlpha, axis.y * axis.y * acosAlpha + cosAlpha, axis.y * axis.z * acosAlpha + axis.x * sinAlpha, 0,
			axis.z * axis.x * acosAlpha + axis.y * sinAlpha, axis.z * axis.y * acosAlpha - axis.x * sinAlpha, axis.z * axis.z * acosAlpha + cosAlpha, 0,
			0,0,0,1
		);
	}

	static MakeScale(x, y, z) {
		if (x instanceof NumericArray  && x.length >= 3) {
            y = x[1];
			z = x[2];
			x = x[0];
		}
		return new Mat4$1(
			x, 0, 0, 0,
			0, y, 0, 0,
			0, 0, z, 0,
			0, 0, 0, 1
		)
	}
    

    static MakePerspective(fovy, aspect, nearPlane, farPlane) {
		return (new Mat4$1()).perspective(fovy, aspect, nearPlane, farPlane);
	}
	
	static MakeFrustum(left, right, bottom, top, nearPlane, farPlane) {
		return (new Mat4$1()).frustum(left, right, bottom, top, nearPlane, farPlane);
	}
	
	static MakeOrtho(left, right, bottom, top, nearPlane, farPlane) {
		return (new Mat4$1()).ortho(left, right, bottom, top, nearPlane, farPlane);
	}

	static MakeLookAt(origin, target, up) {
		return (new Mat4$1()).LookAt(origin,target,up);
	}





    /////// Static Utilities
    static Unproject(x, y, depth, mvMat, pMat, viewport) {
		let mvp = new Mat4$1(pMat);
		mvp.mult(mvMat);
		mvp.invert();

		const vin = new Vec$2(((x - viewport.y) / viewport.width) * 2.0 - 1.0,
								((y - viewport.x) / viewport.height) * 2.0 - 1.0,
								depth * 2.0 - 1.0,
								1.0);
		
		const result = new Vec4(mvp.multVector(vin));
		if (result.z==0) {
			result.set(0);
		}
		else {
			result.set(	result.x/result.w,
						result.y/result.w,
						result.z/result.w,
						result.w/result.w);
		}

		return result;
	}

    static GetScale(m) {
		return new Vec3(
            new Vec$2(m[1], m[5], m[9]).magnitude(),
			new Vec$2(m[0], m[4], m[8]).magnitude(),
			new Vec$2(m[2], m[6], m[10]).magnitude()
		);
	}

    static GetRotation(m) {
		const scale = Mat4$1.GetScale();
		return new Mat4$1(
				m[0] / scale.x, m[1] / scale.y, m[ 2] / scale.z, 0,
				m[4] / scale.x, m[5] / scale.y, m[ 6] / scale.z, 0,
				m[8] / scale.x, m[9] / scale.y, m[10] / scale.z, 0,
				0,	   0,	  0, 	1
		);
	}

	static GetPosition(m) {
		return new Vec$2(m[12], m[13], m[14]);
	}

    static Equals(m,n) {
		return	m[ 0] == n[ 0] && m[ 1] == n[ 1] && m[ 2] == n[ 2] && m[ 3] == n[ 3] &&
				m[ 4] == n[ 4] && m[ 5] == n[ 5] && m[ 6] == n[ 6] && m[ 7] == n[ 7] &&
				m[ 8] == n[ 8] && m[ 9] == n[ 9] && m[10] == n[10] && m[11] == n[11] &&
				m[12] == n[12] && m[13] == n[13] && m[14] == n[14] && m[15] == n[15];
	}

    static TransformDirection(M, /* Vec */ dir) {
		const direction = new Vec$2(dir);
		const trx = new Mat4$1(M);
		trx.setRow(3, new Vec$2(0, 0, 0, 1));
		direction.assign(trx.multVector(direction).xyz);
		direction.normalize();
		return direction;
	}

    static IsNan() {
		return	isNaN(this[ 0]) || isNaN(this[ 1]) || isNaN(this[ 2]) || isNaN(this[ 3]) ||
				isNaN(this[ 4]) || isNaN(this[ 5]) || isNaN(this[ 6]) || isNaN(this[ 7]) ||
				isNaN(this[ 8]) || isNaN(this[ 9]) || isNaN(this[10]) || isNaN(this[11]) ||
				isNaN(this[12]) || isNaN(this[13]) || isNaN(this[14]) || isNaN(this[15]);
	}
}

var Matrix4Utils = {
    Mat4: Mat4$1
};

const Vec$1 = VectorUtils.Vec;

class Quat$1 extends Vec$1 {
    constructor(a,b,c,d) {
        super(0,0,0,0);

        if (a === undefined) {
            Vec$1.Zero(this);
        }
        else if (b === undefined) {
            if (a.length === 4) {
                Vec$1.Assign(this, a);
            }
            else if (a.length === 9) {
                this.initWithMatrix3(a);
            }
            else if (a.length === 16) {
                this.initWithMatrix4(a);
            }
            else {
                throw new Error("Invalid parameter initializing Quaternion");
            }
        }
        else if (a !== undefined && b !== undefined && c !== undefined && d !== undefined) {
            this.initWithValues(a, b, c, d);
        }
        else {
            throw new Error("Invalid parameters initializing Quaternion");
        }
    }

    initWithMatrix3(m) {
        const w = Math.sqrt(1 + m[0] + m[4] + m[8]) / 2;
        const w4 = 4 * w;
        
        this[0] = (m[7] - m[5]) / w;
        this[1] = (m[2] - m[6]) / w4;
        this[2] = (m[3] - m[1]) / w4;
        this[3] = w;
    }

    initWithMatrix4(m) {
        const w = Math.sqrt(1 + m[0] + m[5] + m[10]) / 2;
        const w4 = 4 * w;
        
        this[0] = (m[9] - m[6]) / w;
        this[1] = (m[2] - m[8]) / w4;
        this[2] = (m[4] - m[1]) / w4;
        this[3] = w;
    }

    initWithValues(alpha, x, y, z) {
        this[0] = x * Math.sin( alpha / 2 );
        this[1] = y * Math.sin( alpha / 2 );
        this[2] = z * Math.sin( alpha / 2 );
        this[3] = Math.cos( alpha / 2 );
        return this;
    }
}

var Quaternion = {
    Quat: Quat$1
};

const math = {
    Axis,
    PI: PI$1,
    DEG_TO_RAD,
    RAD_TO_DEG,
    PI_2,
    PI_4,
    PI_8,
    TWO_PI,
    EPSILON,
    NumericArray,
    NumericArrayHighP,
    FLOAT_MAX,

    checkPowerOfTwo,
    checkZero,
    isZero,
    equals,
    degreesToRadians,
    radiansToDegrees,
    sin,
    cos,
    tan: tan$1,
    cotan,
    atan,
    atan2,
    random,
    seededRandom,
    max,
    min,
    abs,
    sqrt,
    lerp,
    square
};

const Vec = VectorUtils.Vec;
const Mat3 = Matrix3Utils.Mat3;
const Mat4 = Matrix4Utils.Mat4;
const Quat = Quaternion.Quat;

export { Mat3, Mat4, Quat, Vec, math };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmcyZS1tYXRoLmpzIiwic291cmNlcyI6WyIuLi9zcmMvanMvY29uc3RhbnRzLmpzIiwiLi4vc3JjL2pzL2Z1bmN0aW9ucy5qcyIsIi4uL3NyYy9qcy9WZWN0b3IuanMiLCIuLi9zcmMvanMvTWF0cml4My5qcyIsIi4uL3NyYy9qcy9NYXRyaXg0LmpzIiwiLi4vc3JjL2pzL1F1YXRlcm5pb24uanMiLCIuLi9zcmMvanMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiXG5leHBvcnQgY29uc3QgQXhpcyA9IHtcblx0Tk9ORTogMCxcblx0WDogMSxcblx0WTogMixcblx0WjogMyxcbiAgICBuYW1lOiAoYXhpcykgPT4ge1xuICAgICAgICBzd2l0Y2ggKGF4aXMpIHtcbiAgICAgICAgY2FzZSBBeGlzLk5PTkU6XG4gICAgICAgICAgICByZXR1cm4gXCJOT05FXCI7XG4gICAgICAgIGNhc2UgQXhpcy5YOlxuICAgICAgICAgICAgcmV0dXJuIFwiWFwiO1xuICAgICAgICBjYXNlIEF4aXMuWTpcbiAgICAgICAgICAgIHJldHVybiBcIllcIjtcbiAgICAgICAgY2FzZSBBeGlzLlo6XG4gICAgICAgICAgICByZXR1cm4gXCJaXCI7XG4gICAgICAgIGNhc2UgQXhpcy5XOlxuICAgICAgICAgICAgcmV0dXJuIFwiV1wiO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIFwiVU5LTk9XTlwiXG4gICAgICAgIH07XG4gICAgfVxufTtcblxuZXhwb3J0IGNvbnN0IFBJID0gMy4xNDE1OTI2NTM1ODk3OTM7XG5leHBvcnQgY29uc3QgREVHX1RPX1JBRCA9IDAuMDE3NDUzMjkyNTE5OTQ7XG5leHBvcnQgY29uc3QgUkFEX1RPX0RFRyA9IDU3LjI5NTc3OTUxMzA4MjMzO1xuZXhwb3J0IGNvbnN0IFBJXzIgPSAxLjU3MDc5NjMyNjc5NDg5NjY7XG5leHBvcnQgY29uc3QgUElfNCA9IDAuNzg1Mzk4MTYzMzk3NDQ4O1xuZXhwb3J0IGNvbnN0IFBJXzggPSAwLjM5MjY5OTA4MTY5ODcyNDtcbmV4cG9ydCBjb25zdCBUV09fUEkgPSA2LjI4MzE4NTMwNzE3OTU4NjtcbmV4cG9ydCBjb25zdCBFUFNJTE9OID0gMC4wMDAwMDAxO1xuXG4vLyBEZWZhdWx0IGFycmF5OiAzMiBiaXRzXG5leHBvcnQgY29uc3QgTnVtZXJpY0FycmF5ID0gRmxvYXQzMkFycmF5O1xuZXhwb3J0IGNvbnN0IE51bWVyaWNBcnJheUhpZ2hQID0gRmxvYXQ2NEFycmF5O1xuZXhwb3J0IGNvbnN0IEZMT0FUX01BWCA9IDMuNDAyODIzZTM4O1xuIiwiXG5pbXBvcnQge1xuICAgIEVQU0lMT04sXG4gICAgREVHX1RPX1JBRCxcbiAgICBSQURfVE9fREVHXG59IGZyb20gJy4vY29uc3RhbnRzLmpzJztcblxubGV0IHNfYmdfbWF0aF9zZWVkID0gRGF0ZS5ub3coKTtcblxuZXhwb3J0IGNvbnN0IGNoZWNrUG93ZXJPZlR3byA9IChuKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBuICE9PSAnbnVtYmVyJykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gbiAmJiAobiAmIChuIC0gMSkpID09PSAwO1xuICAgIH0gIFxufVxuXG5leHBvcnQgY29uc3QgY2hlY2taZXJvID0gKHYpID0+IHtcbiAgICByZXR1cm4gdj4tRVBTSUxPTiAmJiB2PEVQU0lMT04gPyAwOnY7XG59XG5cbmV4cG9ydCBjb25zdCBpc1plcm8gPSAodikgPT4ge1xuICAgIHJldHVybiBjaGVja1plcm8odikgPT09IDA7XG59XG5cbmV4cG9ydCBjb25zdCBlcXVhbHMgPSAoYSxiKSA9PiB7XG4gICAgcmV0dXJuIE1hdGguYWJzKGEgLSBiKSA8IEVQU0lMT047XG59XG5cbmV4cG9ydCBjb25zdCBkZWdyZWVzVG9SYWRpYW5zID0gKGQpID0+IHtcbiAgICByZXR1cm4gTWF0aC5mcm91bmQoY2hlY2taZXJvKGQgKiBERUdfVE9fUkFEKSk7XG59XG5cbmV4cG9ydCBjb25zdCByYWRpYW5zVG9EZWdyZWVzID0gKHIpID0+IHtcbiAgICByZXR1cm4gTWF0aC5mcm91bmQoY2hlY2taZXJvKHIgKiBSQURfVE9fREVHKSk7XG59XG5cbmV4cG9ydCBjb25zdCBzaW4gPSAodmFsKSA9PiB7XG4gICAgcmV0dXJuIE1hdGguZnJvdW5kKGNoZWNrWmVybyhNYXRoLnNpbih2YWwpKSk7XG59XG5cbmV4cG9ydCBjb25zdCBjb3MgPSAodmFsKSA9PiB7XG4gICAgcmV0dXJuIE1hdGguZnJvdW5kKGNoZWNrWmVybyhNYXRoLmNvcyh2YWwpKSk7XG59XG5cbmV4cG9ydCBjb25zdCB0YW4gPSAodmFsKSA9PiB7XG4gICAgcmV0dXJuIE1hdGguZnJvdW5kKGNoZWNrWmVybyhNYXRoLnRhbih2YWwpKSk7XG59XG5cbmV4cG9ydCBjb25zdCBjb3RhbiA9ICh2YWwpID0+IHtcbiAgICByZXR1cm4gTWF0aC5mcm91bmQoY2hlY2taZXJvKDEuMCAvIHRhbih2YWwpKSk7XG59XG5cbmV4cG9ydCBjb25zdCBhdGFuID0gKHZhbCkgPT4ge1xuICAgIHJldHVybiBNYXRoLmZyb3VuZChjaGVja1plcm8oTWF0aC5hdGFuKHZhbCkpKTtcbn1cblxuZXhwb3J0IGNvbnN0IGF0YW4yID0gKGksIGopID0+IHtcbiAgICByZXR1cm4gTWF0aC5mcm91bmQoY2hlY2taZXJvKE1hdGguYXRhbjJmKGksIGopKSk7XG59XG5cbmV4cG9ydCBjb25zdCByYW5kb20gPSAoKSA9PiB7XG4gICAgcmV0dXJuIE1hdGgucmFuZG9tKCk7XG59XG5cbmV4cG9ydCBjb25zdCBzZWVkZWRSYW5kb20gPSAoKSA9PiB7XG4gICAgY29uc3QgbWF4ID0gMTtcbiAgICBjb25zdCBtaW4gPSAwO1xuIFxuICAgIHNfYmdfbWF0aF9zZWVkID0gKHNfYmdfbWF0aF9zZWVkICogOTMwMSArIDQ5Mjk3KSAlIDIzMzI4MDtcbiAgICBjb25zdCBybmQgPSBzX2JnX21hdGhfc2VlZCAvIDIzMzI4MDtcbiBcbiAgICByZXR1cm4gbWluICsgcm5kICogKG1heCAtIG1pbik7XG59XG5cbmV4cG9ydCBjb25zdCBtYXggPSAoYSxiKSA9PiB7XG4gICAgcmV0dXJuIE1hdGguZnJvdW5kKE1hdGgubWF4KGEsYikpO1xufVxuXG5leHBvcnQgY29uc3QgbWluID0gKGEsYikgPT4ge1xuICAgIHJldHVybiBNYXRoLmZyb3VuZChNYXRoLm1pbihhLGIpKTtcbn1cblxuZXhwb3J0IGNvbnN0IGFicyA9ICh2YWwpID0+IHtcbiAgICByZXR1cm4gTWF0aC5mcm91bmQoTWF0aC5hYnModmFsKSk7XG59XG5cbmV4cG9ydCBjb25zdCBzcXJ0ID0gKHZhbCkgPT4ge1xuICAgIHJldHVybiBNYXRoLmZyb3VuZChNYXRoLnNxcnQodmFsKSk7XG59XG5cbmV4cG9ydCBjb25zdCBsZXJwID0gKGZyb20sIHRvLCB0KSA9PiB7XG4gICAgcmV0dXJuIE1hdGguZnJvdW5kKCgxLjAgLSB0KSAqIGZyb20gKyB0ICogdG8pO1xufVxuXG5leHBvcnQgY29uc3Qgc3F1YXJlID0gKG4pID0+IHtcbiAgICByZXR1cm4gTWF0aC5mcm91bmQobiAqIG4pO1xufVxuIiwiaW1wb3J0IHsgbWF0aCB9IGZyb20gXCIuLi8uLi9kaXN0L2JnMmUtbWF0aC5qc1wiO1xuaW1wb3J0IHsgTnVtZXJpY0FycmF5IH0gZnJvbSBcIi4vY29uc3RhbnRzLmpzXCI7XG5pbXBvcnQgeyBpc1plcm8sIGVxdWFscyB9IGZyb20gXCIuL2Z1bmN0aW9ucy5qc1wiO1xuXG5jb25zdCBjaGVja0VxdWFsTGVuZ3RoID0gKHYxLHYyKSA9PiB7XG4gICAgaWYgKHYxLmxlbmd0aCE9djIubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIGxlbmd0aCBpbiBvcGVyYXRpb25gKTtcbn1cblxuY2xhc3MgVmVjIGV4dGVuZHMgTnVtZXJpY0FycmF5IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHNbMF0gaW5zdGFuY2VvZiBOdW1lcmljQXJyYXkgJiYgXG4gICAgICAgICAgICAgICAgYXJndW1lbnRzWzBdLmxlbmd0aCA9PT0gMiAmJlxuICAgICAgICAgICAgICAgIHR5cGVvZihhcmd1bWVudHNbMV0pID09PSBcIm51bWJlclwiXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBzdXBlcihbIGFyZ3VtZW50c1swXVswXSwgYXJndW1lbnRzWzBdWzFdLCBhcmd1bWVudHNbMV1dKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGFyZ3VtZW50c1swXSBpbnN0YW5jZW9mIE51bWVyaWNBcnJheSAmJiBcbiAgICAgICAgICAgICAgICBhcmd1bWVudHNbMF0ubGVuZ3RoID09PSAzICYmXG4gICAgICAgICAgICAgICAgdHlwZW9mKGFyZ3VtZW50c1sxXSkgPT09IFwibnVtYmVyXCJcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHN1cGVyKFsgYXJndW1lbnRzWzBdWzBdLCBhcmd1bWVudHNbMF1bMV0sIGFyZ3VtZW50c1swXVsyXSwgYXJndW1lbnRzWzFdXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh0eXBlb2YoYXJndW1lbnRzWzBdKSA9PT0gXCJudW1iZXJcIiAmJlxuICAgICAgICAgICAgICAgIHR5cGVvZihhcmd1bWVudHNbMV0pID09PSBcIm51bWJlclwiXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBzdXBlcihbYXJndW1lbnRzWzBdLGFyZ3VtZW50c1sxXV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHNbMF0gaW5zdGFuY2VvZiBOdW1lcmljQXJyYXkgJiZcbiAgICAgICAgICAgICAgICBhcmd1bWVudHNbMF0ubGVuZ3RoID09PSAyICYmXG4gICAgICAgICAgICAgICAgdHlwZW9mKGFyZ3VtZW50c1sxXSkgPT09IFwibnVtYmVyXCIgJiYgdHlwZW9mKGFyZ3VtZW50c1syXSkgPT09IFwibnVtYmVyXCJcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHN1cGVyKFsgYXJndW1lbnRzWzBdWzBdLCBhcmd1bWVudHNbMF1bMV0sIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdXSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZihhcmd1bWVudHNbMF0pID09PSBcIm51bWJlclwiICYmXG4gICAgICAgICAgICAgICAgdHlwZW9mKGFyZ3VtZW50c1sxXSkgPT09IFwibnVtYmVyXCIgJiZcbiAgICAgICAgICAgICAgICB0eXBlb2YoYXJndW1lbnRzWzJdKSA9PT0gXCJudW1iZXJcIlxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoW2FyZ3VtZW50c1swXSxhcmd1bWVudHNbMV0sYXJndW1lbnRzWzJdXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgc3VwZXIoW2FyZ3VtZW50c1swXSxhcmd1bWVudHNbMV0sYXJndW1lbnRzWzJdLGFyZ3VtZW50c1szXV0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHNbMF0gaW5zdGFuY2VvZiBOdW1lcmljQXJyYXkgJiZcbiAgICAgICAgICAgICAgICBhcmd1bWVudHNbMF0ubGVuZ3RoPjEgJiYgYXJndW1lbnRzWzBdLmxlbmd0aDw1KVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHN1cGVyKGFyZ3VtZW50c1swXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBwYXJhbWV0ZXJzIGluIFZlYyBjb25zdHJ1Y3RvcmApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbm9ybWFsaXplKCkge1xuICAgICAgICBjb25zdCBtID0gVmVjLk1hZ25pdHVkZSh0aGlzKTtcbiAgICAgICAgc3dpdGNoICh0aGlzLmxlbmd0aCkge1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICB0aGlzWzNdID0gdGhpc1szXSAvIG07XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHRoaXNbMl0gPSB0aGlzWzJdIC8gbTtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgdGhpc1sxXSA9IHRoaXNbMV0gLyBtOyAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpc1swXSA9IHRoaXNbMF0gLyBtO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHRoaXMubGVuZ3RoIH1gKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBhc3NpZ24oc3JjKSB7XG4gICAgICAgIGNoZWNrRXF1YWxMZW5ndGgodGhpcyxzcmMpO1xuICAgICAgICBzd2l0Y2ggKHRoaXMubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHRoaXNbM10gPSBzcmNbM107XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHRoaXNbMl0gPSBzcmNbMl07XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHRoaXNbMV0gPSBzcmNbMV07XG4gICAgICAgICAgICB0aGlzWzBdID0gc3JjWzBdO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHRoaXMubGVuZ3RoIH1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldCh4LCB5LCB6ID0gbnVsbCwgdyA9IG51bGwpIHtcbiAgICAgICAgaWYgKHRoaXMubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICB0aGlzWzBdID0geDtcbiAgICAgICAgICAgIHRoaXNbMV0gPSB5O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMubGVuZ3RoID09PSAzICYmIHogIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXNbMF0gPSB4O1xuICAgICAgICAgICAgdGhpc1sxXSA9IHk7XG4gICAgICAgICAgICB0aGlzWzJdID0gejtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLmxlbmd0aCA9PT0gNCAmJiB3ICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzWzBdID0geDtcbiAgICAgICAgICAgIHRoaXNbMV0gPSB5O1xuICAgICAgICAgICAgdGhpc1syXSA9IHo7XG4gICAgICAgICAgICB0aGlzWzNdID0gdztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdGhpcy5sZW5ndGggfS4gVHJ5aW5nIHRvIHNldCB4PSR7eH0sIHk9JHt5fSwgej0ke3p9LCB3PSR7d31gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNjYWxlKHMpIHtcbiAgICAgICAgc3dpdGNoICh0aGlzLmxlbmd0aCkge1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICB0aGlzWzNdID0gdGhpc1szXSAqIHM7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHRoaXNbMl0gPSB0aGlzWzJdICogcztcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgdGhpc1sxXSA9IHRoaXNbMV0gKiBzO1xuICAgICAgICAgICAgdGhpc1swXSA9IHRoaXNbMF0gKiBzO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYubGVuZ3RoIH1gKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBnZXQgeCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMF07XG4gICAgfVxuXG4gICAgZ2V0IHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzFdO1xuICAgIH1cblxuICAgIGdldCB6KCkge1xuICAgICAgICByZXR1cm4gdGhpc1syXTtcbiAgICB9XG5cbiAgICBnZXQgdygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbM107XG4gICAgfVxuXG4gICAgc2V0IHgodikge1xuICAgICAgICB0aGlzWzBdID0gdjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgc2V0IHkodikge1xuICAgICAgICB0aGlzWzFdID0gdjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgc2V0IHoodikge1xuICAgICAgICB0aGlzWzJdID0gdjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgc2V0IHcodikge1xuICAgICAgICB0aGlzWzNdID0gdjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZ2V0IHh5KCkge1xuICAgICAgICBzd2l0Y2ggKHRoaXMubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHJldHVybiBuZXcgVmVjKHRoaXMpO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHJldHVybiBuZXcgVmVjKHRoaXNbMF0sIHRoaXNbMV0pO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB0aGlzLmxlbmd0aCB9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgeHooKSB7XG4gICAgICAgIHN3aXRjaCAodGhpcy5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICByZXR1cm4gbmV3IFZlYyh0aGlzWzBdLCB0aGlzWzJdKTtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB0aGlzLmxlbmd0aCB9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgeXooKSB7XG4gICAgICAgIHN3aXRjaCAodGhpcy5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICByZXR1cm4gbmV3IFZlYyh0aGlzWzFdLCB0aGlzWzJdKTtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB0aGlzLmxlbmd0aCB9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXQgeHkodikge1xuICAgICAgICB0aGlzWzBdID0gdlswXTtcbiAgICAgICAgdGhpc1sxXSA9IHZbMV07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHNldCB4eih2KSB7XG4gICAgICAgIGlmICh0aGlzLmxlbmd0aDwzKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgdmVjdG9yIHNpemUnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzWzBdID0gdlswXTtcbiAgICAgICAgdGhpc1syXSA9IHZbMV07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHNldCB5eih2KSB7XG4gICAgICAgIGlmICh0aGlzLmxlbmd0aDwzKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgdmVjdG9yIHNpemUnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzWzFdID0gdlswXTtcbiAgICAgICAgdGhpc1syXSA9IHZbMV07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGdldCB4eXooKSB7XG4gICAgICAgIGlmICh0aGlzLmxlbmd0aCA8IDMpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdGhpcy5sZW5ndGggfWApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgVmVjKHRoaXNbMF0sIHRoaXNbMV0sIHRoaXNbMl0pO1xuICAgIH1cblxuICAgIHNldCB4eXoodikge1xuICAgICAgICBpZiAodi5sZW5ndGg8MyB8fCB0aGlzLmxlbmd0aDwzKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemUgdG8gc2V0OiBsOyR7IHRoaXMubGVuZ3RoIH0sIHI6JHt2Lmxlbmd0aH1gKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzWzBdID0gdlswXTtcbiAgICAgICAgdGhpc1sxXSA9IHZbMV07XG4gICAgICAgIHRoaXNbMl0gPSB2WzJdO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvLyBDb3B5IG9wZXJhdG9yXG4gICAgZ2V0IHh5encoKSB7XG4gICAgICAgIGlmICh0aGlzLmxlbmd0aCA8IDQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdGhpcy5sZW5ndGggfSwgNCByZXF1aXJlZGApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgVmVjKHRoaXNbMF0sIHRoaXNbMV0sIHRoaXNbMl0sIHRoaXNbM10pO1xuICAgIH1cblxuICAgIC8vIEFzc2lnbiBvcGVyYXRvclxuICAgIHNldCB4eXp3KHYpIHtcbiAgICAgICAgaWYgKHRoaXMubGVuZ3RoIDwgNCB8fCB2Lmxlbmd0aDw0KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemUgdG8gc2V0OiBsOyR7IHRoaXMubGVuZ3RoIH0sIHI6JHt2Lmxlbmd0aH1gKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzWzBdID0gdlswXTtcbiAgICAgICAgdGhpc1sxXSA9IHZbMV07XG4gICAgICAgIHRoaXNbMl0gPSB2WzJdO1xuICAgICAgICB0aGlzWzNdID0gdlszXTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgc3RhdGljIENoZWNrRXF1YWxMZW5ndGgodjEsdjIpIHtcbiAgICAgICAgY2hlY2tFcXVhbExlbmd0aCh2MSx2Mik7XG4gICAgfVxuXG4gICAgc3RhdGljIE1heCh2MSx2Mikge1xuICAgICAgICBjaGVja0VxdWFsTGVuZ3RoKHYxLHYyKTtcbiAgICAgICAgc3dpdGNoICh2MS5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoW1xuICAgICAgICAgICAgICAgIHYxWzBdPnYyWzBdID8gdjFbMF0gOiB2MlswXSxcbiAgICAgICAgICAgICAgICB2MVsxXT52MlsxXSA/IHYxWzFdIDogdjJbMV1cbiAgICAgICAgICAgIF0pO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbXG4gICAgICAgICAgICAgICAgdjFbMF0+djJbMF0gPyB2MVswXSA6IHYyWzBdLFxuICAgICAgICAgICAgICAgIHYxWzFdPnYyWzFdID8gdjFbMV0gOiB2MlsxXSxcbiAgICAgICAgICAgICAgICB2MVsyXT52MlsyXSA/IHYxWzJdIDogdjJbMl1cbiAgICAgICAgICAgIF0pO1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbXG4gICAgICAgICAgICAgICAgdjFbMF0+djJbMF0gPyB2MVswXSA6IHYyWzBdLFxuICAgICAgICAgICAgICAgIHYxWzFdPnYyWzFdID8gdjFbMV0gOiB2MlsxXSxcbiAgICAgICAgICAgICAgICB2MVsyXT52MlsyXSA/IHYxWzJdIDogdjJbMl0sXG4gICAgICAgICAgICAgICAgdjFbM10+djJbM10gPyB2MVszXSA6IHYyWzNdXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdjEubGVuZ3RoIH1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBNaW4odjEsdjIpIHtcbiAgICAgICAgY2hlY2tFcXVhbExlbmd0aCh2MSx2Mik7XG4gICAgICAgIHN3aXRjaCAodjEubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFtcbiAgICAgICAgICAgICAgICB2MVswXTx2MlswXSA/IHYxWzBdIDogdjJbMF0sXG4gICAgICAgICAgICAgICAgdjFbMV08djJbMV0gPyB2MVsxXSA6IHYyWzFdXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoW1xuICAgICAgICAgICAgICAgIHYxWzBdPHYyWzBdID8gdjFbMF0gOiB2MlswXSxcbiAgICAgICAgICAgICAgICB2MVsxXTx2MlsxXSA/IHYxWzFdIDogdjJbMV0sXG4gICAgICAgICAgICAgICAgdjFbMl08djJbMl0gPyB2MVsyXSA6IHYyWzJdXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoW1xuICAgICAgICAgICAgICAgIHYxWzBdPHYyWzBdID8gdjFbMF0gOiB2MlswXSxcbiAgICAgICAgICAgICAgICB2MVsxXTx2MlsxXSA/IHYxWzFdIDogdjJbMV0sXG4gICAgICAgICAgICAgICAgdjFbMl08djJbMl0gPyB2MVsyXSA6IHYyWzJdLFxuICAgICAgICAgICAgICAgIHYxWzNdPHYyWzNdID8gdjFbM10gOiB2MlszXVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYxLmxlbmd0aCB9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgQWRkKHYxLHYyKSB7XG4gICAgICAgIGNoZWNrRXF1YWxMZW5ndGgodjEsdjIpO1xuICAgICAgICBzd2l0Y2ggKHYxLmxlbmd0aCkge1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbXG4gICAgICAgICAgICAgICAgdjFbMF0gKyB2MlswXSxcbiAgICAgICAgICAgICAgICB2MVsxXSArIHYyWzFdXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoW1xuICAgICAgICAgICAgICAgIHYxWzBdICsgdjJbMF0sXG4gICAgICAgICAgICAgICAgdjFbMV0gKyB2MlsxXSxcbiAgICAgICAgICAgICAgICB2MVsyXSArIHYyWzJdXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoW1xuICAgICAgICAgICAgICAgIHYxWzBdICsgdjJbMF0sXG4gICAgICAgICAgICAgICAgdjFbMV0gKyB2MlsxXSxcbiAgICAgICAgICAgICAgICB2MVsyXSArIHYyWzJdLFxuICAgICAgICAgICAgICAgIHYxWzNdICsgdjJbM11cbiAgICAgICAgICAgIF0pO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB2MS5sZW5ndGggfWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIFN1Yih2MSx2Mikge1xuICAgICAgICBjaGVja0VxdWFsTGVuZ3RoKHYxLHYyKTtcbiAgICAgICAgc3dpdGNoICh2MS5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoW1xuICAgICAgICAgICAgICAgIHYxWzBdIC0gdjJbMF0sXG4gICAgICAgICAgICAgICAgdjFbMV0gLSB2MlsxXVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFtcbiAgICAgICAgICAgICAgICB2MVswXSAtIHYyWzBdLFxuICAgICAgICAgICAgICAgIHYxWzFdIC0gdjJbMV0sXG4gICAgICAgICAgICAgICAgdjFbMl0gLSB2MlsyXVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFtcbiAgICAgICAgICAgICAgICB2MVswXSAtIHYyWzBdLFxuICAgICAgICAgICAgICAgIHYxWzFdIC0gdjJbMV0sXG4gICAgICAgICAgICAgICAgdjFbMl0gLSB2MlsyXSxcbiAgICAgICAgICAgICAgICB2MVszXSAtIHYyWzNdXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdjEubGVuZ3RoIH1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBNYWduaXR1ZGUodikge1xuICAgICAgICBzd2l0Y2ggKHYubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnNxcnQodlswXSAqIHZbMF0gKyB2WzFdICogdlsxXSk7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnNxcnQodlswXSAqIHZbMF0gKyB2WzFdICogdlsxXSArIHZbMl0gKiB2WzJdKTtcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgcmV0dXJuIE1hdGguc3FydCh2WzBdICogdlswXSArIHZbMV0gKiB2WzFdICsgdlsyXSAqIHZbMl0gKyB2WzNdICogdlszXSk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYubGVuZ3RoIH1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBEaXN0YW5jZSh2MSx2Mikge1xuICAgICAgICBjaGVja0VxdWFsTGVuZ3RoKHYxLHYyKTtcbiAgICAgICAgcmV0dXJuIFZlYy5NYWduaXR1ZGUoVmVjLlN1Yih2MSx2MikpO1xuICAgIH1cblxuICAgIHN0YXRpYyBEb3QodjEsdjIpIHtcbiAgICAgICAgY2hlY2tFcXVhbExlbmd0aCh2MSx2Mik7XG4gICAgICAgIHN3aXRjaCAodjEubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHJldHVybiB2MVswXSAqIHYyWzBdICsgdjFbMV0gKiB2MlsxXTtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgcmV0dXJuIHYxWzBdICogdjJbMF0gKyB2MVsxXSAqIHYyWzFdICsgdjFbMl0gKiB2MlsyXTtcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgcmV0dXJuIHYxWzBdICogdjJbMF0gKyB2MVsxXSAqIHYyWzFdICsgdjFbMl0gKiB2MlsyXSArIHYxWzNdICogdjJbM107XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYxLmxlbmd0aCB9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgQ3Jvc3ModjEsdjIpIHtcbiAgICAgICAgY2hlY2tFcXVhbExlbmd0aCh2MSx2Mik7XG4gICAgICAgIHN3aXRjaCAodjEubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHJldHVybiB2MVswXSAqIHYyWzFdIC0gdjFbMV0gLSB2MlswXTtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoW1xuICAgICAgICAgICAgICAgIHYxWzFdICogdjJbMl0gLSB2MVsyXSAqIHYyWzFdLFxuICAgICAgICAgICAgICAgIHYxWzJdICogdjJbMF0gLSB2MVswXSAqIHYyWzJdLFxuICAgICAgICAgICAgICAgIHYxWzBdICogdjJbMV0gLSB2MVsxXSAqIHYyWzBdLFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemUgZm9yIGNyb3NzIHByb2R1Y3Q6ICR7IHYxLmxlbmd0aCB9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgTm9ybWFsaXplZCh2KSB7XG4gICAgICAgIGNvbnN0IG0gPSBWZWMuTWFnbml0dWRlKHYpO1xuICAgICAgICBzd2l0Y2ggKHYubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFsgdlswXSAvIG0sIHZbMV0gLyBtIF0pO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbIHZbMF0gLyBtLCB2WzFdIC8gbSwgdlsyXSAvIG0gXSk7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFsgdlswXSAvIG0sIHZbMV0gLyBtLCB2WzJdIC8gbSwgdlszXSAvIG0gXSlcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdi5sZW5ndGggfWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIE11bHQodixzKSB7XG4gICAgICAgIHN3aXRjaCAodi5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoWyB2WzBdICogcywgdlsxXSAqIHMgXSk7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFsgdlswXSAqIHMsIHZbMV0gKiBzLCB2WzJdICogcyBdKTtcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoWyB2WzBdICogcywgdlsxXSAqIHMsIHZbMl0gKiBzLCB2WzNdICogcyBdKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdi5sZW5ndGggfWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIERpdih2LHMpIHtcbiAgICAgICAgc3dpdGNoICh2Lmxlbmd0aCkge1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbIHZbMF0gLyBzLCB2WzFdIC8gcyBdKTtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoWyB2WzBdIC8gcywgdlsxXSAvIHMsIHZbMl0gLyBzIF0pO1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbIHZbMF0gLyBzLCB2WzFdIC8gcywgdlsyXSAvIHMsIHZbM10gLyBzIF0pO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB2Lmxlbmd0aCB9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgRXF1YWxzKHYxLHYyKSB7XG4gICAgICAgIGlmICh2MS5sZW5ndGggIT0gdjIubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHYxLmxlbmd0aCkge1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIHJldHVybiAgZXF1YWxzKHYxWzBdLCB2MlswXSkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGVxdWFscyh2MVsxXSwgdjJbMV0pO1xuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgIHJldHVybiAgZXF1YWxzKHYxWzBdLCB2MlswXSkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGVxdWFscyh2MVsxXSwgdjJbMV0pICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBlcXVhbHModjFbMl0sIHYyWzJdKTtcbiAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICByZXR1cm4gIGVxdWFscyh2MVswXSwgdjJbMF0pICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBlcXVhbHModjFbMV0sIHYyWzFdKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgZXF1YWxzKHYxWzJdLCB2MlsyXSkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGVxdWFscyh2MVszXSwgdjJbM10pO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYxLmxlbmd0aCB9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgSXNaZXJvKHYpIHtcbiAgICAgICAgc3dpdGNoICh2Lmxlbmd0aCkge1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICByZXR1cm4gaXNaZXJvKHZbMF0pIHx8IGlzWmVybyh2WzFdKTtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgcmV0dXJuIGlzWmVybyh2WzBdKSB8fCBpc1plcm8odlsxXSkgfHwgaXNaZXJvKHZbMl0pO1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICByZXR1cm4gaXNaZXJvKHZbMF0pIHx8IGlzWmVybyh2WzFdKSB8fCBpc1plcm8odlsyXSkgfHwgaXNaZXJvKHZbM10pO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB2Lmxlbmd0aCB9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgSXNOYU4odikge1xuICAgICAgICBzd2l0Y2ggKHYubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHJldHVybiBpc05hTih2WzBdKSB8fCBpc05hTih2WzFdKTtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgcmV0dXJuIGlzTmFOKHZbMF0pIHx8IGlzTmFOKHZbMV0pIHx8IGlzTmFOKHZbMl0pO1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICByZXR1cm4gaXNOYU4odlswXSkgfHwgaXNOYU4odlsxXSkgfHwgaXNOYU4odlsyXSkgfHwgaXNOYU4odlszXSk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYubGVuZ3RoIH1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vLy8vLy8gQ29uc3RydWN0b3JzXG4gICAgc3RhdGljIFZlYzIoKSB7XG4gICAgICAgIHJldHVybiBuZXcgVmVjKDAsMCk7XG4gICAgfVxuXG4gICAgc3RhdGljIFZlYzMoKSB7XG4gICAgICAgIHJldHVybiBuZXcgVmVjKDAsMCwwKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgVmVjNCgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMoMCwwLDAsMCk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgVmVjOiBWZWNcbn1cblxuIiwiaW1wb3J0IHsgTnVtZXJpY0FycmF5IH0gZnJvbSBcIi4vY29uc3RhbnRzLmpzXCI7XG5pbXBvcnQgVmVjdG9yVXRpbHMgZnJvbSBcIi4vVmVjdG9yLmpzXCI7XG5cbmNvbnN0IFZlYyA9IFZlY3RvclV0aWxzLlZlYztcblxuY2xhc3MgTWF0MyBleHRlbmRzIE51bWVyaWNBcnJheSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSA5KSB7XG4gICAgICAgICAgICBzdXBlcihhcmd1bWVudHMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEgJiYgYXJndW1lbnRzWzBdLmxlbmd0aCA9PT0gOSkge1xuICAgICAgICAgICAgc3VwZXIoYXJndW1lbnRzWzBdKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBzdXBlcihbMCwwLDAsMCwwLDAsMCwwLDBdKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBwYXJhbWV0ZXIgc2l6ZSBpbiBNYXQzIGNvbnN0cnVjdG9yYCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZGVudGl0eSgpIHtcbiAgICAgICAgdGhpc1swXSA9IDE7IHRoaXNbMV0gPSAwOyB0aGlzWzJdID0gMDtcbiAgICAgICAgdGhpc1szXSA9IDA7IHRoaXNbNF0gPSAxOyB0aGlzWzVdID0gMDtcbiAgICAgICAgdGhpc1s2XSA9IDA7IHRoaXNbN10gPSAwOyB0aGlzWzhdID0gMTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgemVybygpIHtcbiAgICAgICAgdGhpc1swXSA9IDA7IHRoaXNbMV0gPSAwOyB0aGlzWzJdID0gMDtcbiAgICAgICAgdGhpc1szXSA9IDA7IHRoaXNbNF0gPSAwOyB0aGlzWzVdID0gMDtcbiAgICAgICAgdGhpc1s2XSA9IDA7IHRoaXNbN10gPSAwOyB0aGlzWzhdID0gMDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcm93KGkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMoXG4gICAgICAgICAgICB0aGlzW2kgKiAzXSwgXG4gICAgICAgICAgICB0aGlzW2kgKiAzICsgMV0sXG4gICAgICAgICAgICB0aGlzWyBpKiAzICsgMl0pO1xuICAgIH1cblxuICAgIHNldFJvdyhpLCBhLCB5ID0gbnVsbCwgeiA9IG51bGwpIHtcbiAgICAgICAgaWYgKGEgaW5zdGFuY2VvZiBOdW1lcmljQXJyYXkgJiYgYS5sZW5ndGg+PTMpIHtcbiAgICAgICAgICAgIHRoaXNbaSAqIDNdICAgICAgPSBhWzBdO1xuICAgICAgICAgICAgdGhpc1tpICogMyArIDFdICA9IGFbMV07XG4gICAgICAgICAgICB0aGlzW2kgKiAzICsgMl0gID0gYVsyXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlb2YoYSkgPT09IFwibnVtYmVyXCIgJiYgXG4gICAgICAgICAgICB0eXBlb2YoeSkgPT09IFwibnVtYmVyXCIgJiYgXG4gICAgICAgICAgICB0eXBlb2YoeikgPT09IFwibnVtYmVyXCJcbiAgICAgICAgKSB7XG4gICAgICAgICAgICB0aGlzW2kgKiAzXSAgICAgID0gYTtcbiAgICAgICAgICAgIHRoaXNbaSAqIDMgKyAxXSAgPSB5O1xuICAgICAgICAgICAgdGhpc1tpICogMyArIDJdICA9IHo7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcGFyYW1ldGVyIHNldHRpbmcgbWF0cml4IHJvd2ApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvbChpKSB7XG4gICAgICAgIHJldHVybiBuZXcgVmVjKFxuICAgICAgICAgICAgdGhpc1tpXSxcbiAgICAgICAgICAgIHRoaXNbaSArIDNdLFxuICAgICAgICAgICAgdGhpc1tpICsgMyAqIDJdXG4gICAgICAgIClcbiAgICB9XG5cbiAgICBzZXRDb2woaSwgYSwgeSA9IG51bGwsIHogPSBudWxsKSB7XG4gICAgICAgIGlmIChhIGluc3RhbmNlb2YgTnVtZXJpY0FycmF5ICYmIGEubGVuZ3RoPj0zKSB7XG4gICAgICAgICAgICB0aGlzW2ldICAgICAgICAgPSBhWzBdO1xuICAgICAgICAgICAgdGhpc1tpICsgM10gICAgID0gYVsxXTtcbiAgICAgICAgICAgIHRoaXNbaSArIDMgKiAyXSA9IGFbMl07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mKGEpID09PSBcIm51bWJlclwiICYmIFxuICAgICAgICAgICAgdHlwZW9mKHkpID09PSBcIm51bWJlclwiICYmIFxuICAgICAgICAgICAgdHlwZW9mKHopID09PSBcIm51bWJlclwiXG4gICAgICAgICkge1xuICAgICAgICAgICAgdGhpc1tpXSAgICAgICAgID0gYTtcbiAgICAgICAgICAgIHRoaXNbaSArIDNdICAgICA9IHk7XG4gICAgICAgICAgICB0aGlzW2kgKyAzICogMl0gPSB6O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHBhcmFtZXRlciBzZXR0aW5nIG1hdHJpeCByb3dgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBhc3NpZ24obSkge1xuICAgICAgICBpZiAobS5sZW5ndGggPT09IDkpIHtcbiAgICAgICAgICAgIHRoaXNbMF0gPSBtWzBdOyB0aGlzWzFdID0gbVsxXTsgdGhpc1syXSA9IG1bMl07XG5cdFx0XHR0aGlzWzNdID0gbVszXTsgdGhpc1s0XSA9IG1bNF07IHRoaXNbNV0gPSBtWzVdO1xuXHRcdFx0dGhpc1s2XSA9IG1bNl07IHRoaXNbN10gPSBtWzddOyB0aGlzWzhdID0gbVs4XTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChtLmxlbmd0aCA9PT0gMTYpIHtcbiAgICAgICAgICAgIHRoaXNbMF0gPSBtWzBdOyB0aGlzWzFdID0gbVsxXTsgdGhpc1syXSA9IG1bMl07XG5cdFx0XHR0aGlzWzNdID0gbVs0XTsgdGhpc1s0XSA9IG1bNV07IHRoaXNbNV0gPSBtWzZdO1xuXHRcdFx0dGhpc1s2XSA9IG1bOF07IHRoaXNbN10gPSBtWzldOyB0aGlzWzhdID0gbVsxMF07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcGxhcmFtZXRlciBzZXR0aW5nIG1hdHJpeCBkYXRhYCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgc2V0U2NhbGUoeCx5LHopIHsgXG5cdFx0Y29uc3QgcnggPSAobmV3IFZlYyh0aGlzWzBdLCB0aGlzWzNdLCB0aGlzWzZdKSkubm9ybWFsaXplKCkuc2NhbGUoeCk7XG5cdFx0Y29uc3QgcnkgPSAobmV3IFZlYyh0aGlzWzFdLCB0aGlzWzRdLCB0aGlzWzddKSkubm9ybWFsaXplKCkuc2NhbGUoeSk7XG5cdFx0Y29uc3QgcnogPSAobmV3IFZlYyh0aGlzWzJdLCB0aGlzWzVdLCB0aGlzWzhdKSkubm9ybWFsaXplKCkuc2NhbGUoeik7XG5cdFx0dGhpc1swXSA9IHJ4Lng7IHRoaXNbM10gPSByeC55OyB0aGlzWzZdID0gcnguejtcblx0XHR0aGlzWzFdID0gcnkueDsgdGhpc1s0XSA9IHJ5Lnk7IHRoaXNbN10gPSByeS56O1xuXHRcdHRoaXNbMl0gPSByei54OyB0aGlzWzVdID0gcnoueTsgdGhpc1s4XSA9IHJ6Lno7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuICAgIHRyYXNwb3NlKCkge1xuICAgICAgICBjb25zdCBtMyA9IHRoaXNbM107ICAvLyAwLCAxLCAyXG4gICAgICAgIGNvbnN0IG03ID0gdGhpc1s3XTsgIC8vIDMsIDQsIDVcbiAgICAgICAgY29uc3QgbTYgPSB0aGlzWzZdOyAgLy8gNiwgNywgOFxuICAgICAgICB0aGlzWzNdID0gdGhpc1sxXTtcbiAgICAgICAgdGhpc1s2XSA9IHRoaXNbMl07XG4gICAgICAgIHRoaXNbN10gPSB0aGlzWzVdO1xuICAgICAgICB0aGlzWzFdID0gbTM7XG4gICAgICAgIHRoaXNbMl0gPSBtNjtcbiAgICAgICAgdGhpc1s1XSA9IG03O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBtdWx0KGEpIHtcbiAgICAgICAgaWYgKHR5cGVvZihhKSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgdGhpc1swXSAqPSBhOyB0aGlzWzFdICo9IGE7IHRoaXNbMl0gKj0gYTtcbiAgICAgICAgICAgIHRoaXNbM10gKj0gYTsgdGhpc1s0XSAqPSBhOyB0aGlzWzVdICo9IGE7XG4gICAgICAgICAgICB0aGlzWzZdICo9IGE7IHRoaXNbN10gKj0gYTsgdGhpc1s4XSAqPSBhO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGEgaW5zdGFuY2VvZiBOdW1lcmljQXJyYXkgJiYgYS5sZW5ndGggPT09IDkpIHtcbiAgICAgICAgICAgIGNvbnN0IHIwID0gdGhpcy5yb3coMCk7XG4gICAgICAgICAgICBjb25zdCByMSA9IHRoaXMucm93KDEpO1xuICAgICAgICAgICAgY29uc3QgcjIgPSB0aGlzLnJvdygyKTtcbiAgICAgICAgICAgIGNvbnN0IGMwID0gYS5jb2woMCk7XG4gICAgICAgICAgICBjb25zdCBjMSA9IGEuY29sKDEpO1xuICAgICAgICAgICAgY29uc3QgYzIgPSBhLmNvbCgyKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpc1swXSA9IFZlYy5Eb3QocjAsYzApOyB0aGlzWzFdID0gVmVjLkRvdChyMCxjMSk7IHRoaXNbMl0gPSBWZWMuRG90KHIwLGMyKTtcbiAgICAgICAgICAgIHRoaXNbM10gPSBWZWMuRG90KHIxLGMwKTsgdGhpc1s0XSA9IFZlYy5Eb3QocjEsYzEpOyB0aGlzWzVdID0gVmVjLkRvdChyMSxjMik7XG4gICAgICAgICAgICB0aGlzWzZdID0gVmVjLkRvdChyMixjMCk7IHRoaXNbN10gPSBWZWMuRG90KHIyLGMxKTsgdGhpc1s4XSA9IFZlYy5Eb3QocjIsYzIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHBhcmFtZXRlciBpbiBNYXQzLm11bHQoKWApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIG11bHRWZWN0b3Iodikge1xuICAgICAgICBpZiAodi5sZW5ndGggPT09IDIgfHwgdi5sZW5ndGggPT09IDMpIHtcbiAgICAgICAgICAgIGNvbnN0IHggPSB2WzBdO1xuICAgICAgICAgICAgY29uc3QgeSA9IHZbMV07XG4gICAgICAgICAgICBjb25zdCB6ID0gdi5sZW5ndGggPT09IDIgPyAxIDogdlsyXTtcbiAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gbmV3IFZlYyhcdHRoaXNbMF0gKiB4ICsgdGhpc1szXSAqIHkgKyB0aGlzWzZdICogeixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzWzFdICogeCArIHRoaXNbNF0gKiB5ICsgdGhpc1s3XSAqIHosXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpc1syXSAqIHggKyB0aGlzWzVdICogeSArIHRoaXNbOF0gKiB6KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBwYXJhbWV0ZXIgaW4gTWF0My5tdWx0VmVjdG9yKClgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gIGBbICR7dGhpc1swXX0sICR7dGhpc1sxXX0sICR7dGhpc1syXX1cXG5gICtcbiAgICAgICAgICAgICAgICBgICAke3RoaXNbM119LCAke3RoaXNbNF19LCAke3RoaXNbNV19XFxuYCArXG4gICAgICAgICAgICAgICAgYCAgJHt0aGlzWzZdfSwgJHt0aGlzWzddfSwgJHt0aGlzWzhdfSBdYDtcbiAgICB9XG5cbiAgICBzdGF0aWMgTWFrZUlkZW50aXR5KCkge1xuICAgICAgICBjb25zdCBtID0gbmV3IE1hdDMoKTtcbiAgICAgICAgcmV0dXJuIG0uaWRlbnRpdHkoKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgTWFrZVplcm8oKSB7XG4gICAgICAgIGNvbnN0IG0gPSBuZXcgTWF0MygpO1xuICAgICAgICByZXR1cm4gbS56ZXJvKCk7XG4gICAgfVxuXG4gICAgc3RhdGljIE1ha2VXaXRoUXVhdGVybmlvbihxKSB7XG4gICAgICAgIGNvbnN0IG0gPSBNYXQzLk1ha2VJZGVudGl0eSgpO1xuICAgICAgICBcbiAgICAgICAgbS5zZXRSb3coMCwgbmV3IFZlYyggMSAgLSAyICogcVsxXSAqIHFbMV0gLSAyICogcVsyXSAqIHFbMl0sIDIgKiBxWzBdICogcVsxXSAtIDIgKiBxWzJdICogcVszXSwgMiAqIHFbMF0gKiBxWzJdICsgMiAqIHFbMV0gKiBxWzNdKSk7XG4gICAgICAgIG0uc2V0Um93KDEsIG5ldyBWZWMoIDIgKiBxWzBdICogcVsxXSArIDIgKiBxWzJdICogcVszXSwgMSAgLSAyLjAgKiBxWzBdICogcVswXSAtIDIgKiBxWzJdICogcVsyXSwgMiAqIHFbMV0gKiBxWzJdIC0gMiAqIHFbMF0gKiBxWzNdKSk7XG4gICAgICAgIG0uc2V0Um93KDIsIG5ldyBWZWMoIDIgKiBxWzBdICogcVsyXSAtIDIgKiBxWzFdICogcVszXSwgMiAqIHFbMV0gKiBxWzJdICsgMiAqIHFbMF0gKiBxWzNdICwgMSAtIDIgKiBxWzBdICogcVswXSAtIDIgKiBxWzFdICogcVsxXSkpO1xuXG4gICAgICAgIHJldHVybiBtO1xuICAgIH1cblxuICAgIHN0YXRpYyBJc1plcm8obSkge1xuICAgICAgICByZXR1cm5cdHZbMF09PTAgJiYgdlsxXT09MC4wICYmIHZbMl09PTAuMCAmJlxuICAgICAgICAgICAgICAgIHZbM109PTAgJiYgdls0XT09MC4wICYmIHZbNV09PTAuMCAmJlxuICAgICAgICAgICAgICAgIHZbNl09PTAgJiYgdls3XT09MC4wICYmIHZbOF09PTAuMDtcbiAgICB9XG4gICAgXG4gICAgc3RhdGljIElzSWRlbnRpdHkobSkge1xuICAgICAgICByZXR1cm5cdHZbMF09PTEuMCAmJiB2WzFdPT0wLjAgJiYgdlsyXT09MC4wICYmXG4gICAgICAgICAgICAgICAgdlszXT09MC4wICYmIHZbNF09PTEuMCAmJiB2WzVdPT0wLjAgJiZcbiAgICAgICAgICAgICAgICB2WzZdPT0wLjAgJiYgdls3XT09MC4wICYmIHZbOF09PTEuMDtcbiAgICB9XG5cbiAgICBzdGF0aWMgR2V0U2NhbGUobSkge1xuICAgICAgICByZXR1cm4gbmV3IFZlYyhcbiAgICAgICAgICAgIFZlYy5NYWduaXR1ZGUobmV3IFZlYyhtWzBdLCBtWzNdLCBtWzZdKSksXG4gICAgICAgICAgICBWZWMuTWFnbml0dWRlKG5ldyBWZWMobVsxXSwgbVs0XSwgbVs3XSkpLFxuICAgICAgICAgICAgVmVjLk1hZ25pdHVkZShuZXcgVmVjKG1bMl0sIG1bNV0sIG1bOF0pKVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHN0YXRpYyBFcXVhbHMoYSxiKSB7XG4gICAgICAgIHJldHVyblx0YVswXSA9PSBiWzBdICYmIGFbMV0gPT0gYlsxXSAgJiYgYVsyXSA9PSBiWzJdICYmXG4gICAgICAgICAgICAgICAgYVszXSA9PSBiWzNdICYmIGFbNF0gPT0gYls0XSAgJiYgYVs1XSA9PSBiWzVdICYmXG4gICAgICAgICAgICAgICAgYVs2XSA9PSBiWzZdICYmIGFbN10gPT0gYls3XSAgJiYgYVs4XSA9PSBiWzhdO1xuICAgIH1cblxuICAgIHN0YXRpYyBJc05hTihtKSB7XG4gICAgICAgIHJldHVyblx0aXNOYU4obVswXSkgfHwgaXNOYU4obVsxXSkgfHwgaXNOYU4obVsyXSkgJiZcbiAgICAgICAgICAgICAgICBpc05hTihtWzNdKSB8fCBpc05hTihtWzRdKSB8fCBpc05hTihtWzVdKSAmJlxuICAgICAgICAgICAgICAgIGlzTmFOKG1bNl0pIHx8IGlzTmFOKG1bN10pIHx8IGlzTmFOKG1bOF0pO1xuICAgIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBNYXQzOiBNYXQzXG59XG4iLCJpbXBvcnQgeyBOdW1lcmljQXJyYXkgfSBmcm9tIFwiLi9jb25zdGFudHMuanNcIjtcbmltcG9ydCBWZWN0b3JVdGlscyBmcm9tIFwiLi9WZWN0b3IuanNcIjtcbmltcG9ydCBNYXRyaXhVdGlscyBmcm9tIFwiLi9NYXRyaXgzLmpzXCI7XG5cbmNvbnN0IFZlYyA9IFZlY3RvclV0aWxzLlZlYztcbmNvbnN0IE1hdDMgPSBNYXRyaXhVdGlscy5NYXQzO1xuXG5jbGFzcyBNYXQ0IGV4dGVuZHMgTnVtZXJpY0FycmF5IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgaW5NYXRyaXggPSBbXG4gICAgICAgICAgICAwLCAwLCAwLCAwLFxuICAgICAgICAgICAgMCwgMCwgMCwgMCxcbiAgICAgICAgICAgIDAsIDAsIDAsIDAsXG4gICAgICAgICAgICAwLCAwLCAwLCAwXG4gICAgICAgIF07XG5cbiAgICAgICAgLy8gQ3JlYXRlIGZyb20gbWF0cml4M1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gOSkge1xuICAgICAgICAgICAgaW5NYXRyaXhbMF0gPSBhcmd1bWVudHNbMF07IFxuICAgICAgICAgICAgaW5NYXRyaXhbMV0gPSBhcmd1bWVudHNbMV07XG4gICAgICAgICAgICBpbk1hdHJpeFsyXSA9IGFyZ3VtZW50c1syXTtcblxuICAgICAgICAgICAgaW5NYXRyaXhbNF0gPSBhcmd1bWVudHNbM107IFxuICAgICAgICAgICAgaW5NYXRyaXhbNV0gPSBhcmd1bWVudHNbNF07XG4gICAgICAgICAgICBpbk1hdHJpeFs2XSA9IGFyZ3VtZW50c1s1XTtcblxuICAgICAgICAgICAgaW5NYXRyaXhbOF0gPSBhcmd1bWVudHNbNl07IFxuICAgICAgICAgICAgaW5NYXRyaXhbOV0gPSBhcmd1bWVudHNbN107XG4gICAgICAgICAgICBpbk1hdHJpeFsxMF0gPSBhcmd1bWVudHNbOF07XG5cbiAgICAgICAgICAgIGluTWF0cml4WzE1XSA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSAmJiBhcmd1bWVudHNbMF0ubGVuZ3RoID09PSA5KSB7XG4gICAgICAgICAgICBpbk1hdHJpeFswXSAgPSBhcmd1bWVudHNbMF1bMF07IFxuICAgICAgICAgICAgaW5NYXRyaXhbMV0gID0gYXJndW1lbnRzWzBdWzFdO1xuICAgICAgICAgICAgaW5NYXRyaXhbMl0gID0gYXJndW1lbnRzWzBdWzJdO1xuXG4gICAgICAgICAgICBpbk1hdHJpeFs0XSAgPSBhcmd1bWVudHNbMF1bM107IFxuICAgICAgICAgICAgaW5NYXRyaXhbNV0gID0gYXJndW1lbnRzWzBdWzRdO1xuICAgICAgICAgICAgaW5NYXRyaXhbNl0gID0gYXJndW1lbnRzWzBdWzVdO1xuXG4gICAgICAgICAgICBpbk1hdHJpeFs4XSAgPSBhcmd1bWVudHNbMF1bNl07IFxuICAgICAgICAgICAgaW5NYXRyaXhbOV0gID0gYXJndW1lbnRzWzBdWzddO1xuICAgICAgICAgICAgaW5NYXRyaXhbMTBdID0gYXJndW1lbnRzWzBdWzhdO1xuXG4gICAgICAgICAgICBpbk1hdHJpeFsxNV0gPSAxO1xuICAgICAgICB9XG4gICAgICAgIC8vIENyZWF0ZSBmcm9tIG1hdHJpeDRcbiAgICAgICAgZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMTYpIHtcbiAgICAgICAgICAgIGluTWF0cml4WzAgXSA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIGluTWF0cml4WzEgXSA9IGFyZ3VtZW50c1sxIF07XG4gICAgICAgICAgICBpbk1hdHJpeFsyIF0gPSBhcmd1bWVudHNbMiBdO1xuICAgICAgICAgICAgaW5NYXRyaXhbMyBdID0gYXJndW1lbnRzWzMgXTtcblxuICAgICAgICAgICAgaW5NYXRyaXhbNCBdID0gYXJndW1lbnRzWzQgXTtcbiAgICAgICAgICAgIGluTWF0cml4WzUgXSA9IGFyZ3VtZW50c1s1IF07XG4gICAgICAgICAgICBpbk1hdHJpeFs2IF0gPSBhcmd1bWVudHNbNiBdO1xuICAgICAgICAgICAgaW5NYXRyaXhbNyBdID0gYXJndW1lbnRzWzcgXTtcblxuICAgICAgICAgICAgaW5NYXRyaXhbOCBdID0gYXJndW1lbnRzWzggXTtcbiAgICAgICAgICAgIGluTWF0cml4WzkgXSA9IGFyZ3VtZW50c1s5IF07XG4gICAgICAgICAgICBpbk1hdHJpeFsxMF0gPSBhcmd1bWVudHNbMTBdO1xuICAgICAgICAgICAgaW5NYXRyaXhbMTFdID0gYXJndW1lbnRzWzExXTtcblxuICAgICAgICAgICAgaW5NYXRyaXhbMTJdID0gYXJndW1lbnRzWzEyXTtcbiAgICAgICAgICAgIGluTWF0cml4WzEzXSA9IGFyZ3VtZW50c1sxM107XG4gICAgICAgICAgICBpbk1hdHJpeFsxNF0gPSBhcmd1bWVudHNbMTRdO1xuICAgICAgICAgICAgaW5NYXRyaXhbMTVdID0gYXJndW1lbnRzWzE1XTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxICYmIGFyZ3VtZW50c1swXS5sZW5ndGggPT09IDE2KSB7XG4gICAgICAgICAgICBpbk1hdHJpeFswIF0gPSBhcmd1bWVudHNbMF1bMF07XG4gICAgICAgICAgICBpbk1hdHJpeFsxIF0gPSBhcmd1bWVudHNbMF1bMSBdO1xuICAgICAgICAgICAgaW5NYXRyaXhbMiBdID0gYXJndW1lbnRzWzBdWzIgXTtcbiAgICAgICAgICAgIGluTWF0cml4WzMgXSA9IGFyZ3VtZW50c1swXVszIF07XG5cbiAgICAgICAgICAgIGluTWF0cml4WzQgXSA9IGFyZ3VtZW50c1swXVs0IF07XG4gICAgICAgICAgICBpbk1hdHJpeFs1IF0gPSBhcmd1bWVudHNbMF1bNSBdO1xuICAgICAgICAgICAgaW5NYXRyaXhbNiBdID0gYXJndW1lbnRzWzBdWzYgXTtcbiAgICAgICAgICAgIGluTWF0cml4WzcgXSA9IGFyZ3VtZW50c1swXVs3IF07XG5cbiAgICAgICAgICAgIGluTWF0cml4WzggXSA9IGFyZ3VtZW50c1swXVs4IF07XG4gICAgICAgICAgICBpbk1hdHJpeFs5IF0gPSBhcmd1bWVudHNbMF1bOSBdO1xuICAgICAgICAgICAgaW5NYXRyaXhbMTBdID0gYXJndW1lbnRzWzBdWzEwXTtcbiAgICAgICAgICAgIGluTWF0cml4WzExXSA9IGFyZ3VtZW50c1swXVsxMV07XG5cbiAgICAgICAgICAgIGluTWF0cml4WzEyXSA9IGFyZ3VtZW50c1swXVsxMl07XG4gICAgICAgICAgICBpbk1hdHJpeFsxM10gPSBhcmd1bWVudHNbMF1bMTNdO1xuICAgICAgICAgICAgaW5NYXRyaXhbMTRdID0gYXJndW1lbnRzWzBdWzE0XTtcbiAgICAgICAgICAgIGluTWF0cml4WzE1XSA9IGFyZ3VtZW50c1swXVsxNV07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCAhPSAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcGFyYW1ldGVyIHNpemUgaW4gTWF0cml4MyBjb25zdHJ1Y3RvcmApO1xuICAgICAgICB9XG5cbiAgICAgICAgc3VwZXIoaW5NYXRyaXgpO1xuICAgIH1cblxuICAgIC8vLy8vLyBJbml0aWFsaXplcnNcbiAgICBpZGVudGl0eSgpIHtcbiAgICAgICAgdGhpc1swIF0gPSAxOyB0aGlzWzEgXSA9IDA7IHRoaXNbMiBdID0gMDsgdGhpc1szIF0gPSAwXG4gICAgICAgIHRoaXNbNCBdID0gMDsgdGhpc1s1IF0gPSAxOyB0aGlzWzYgXSA9IDA7IHRoaXNbNyBdID0gMFxuICAgICAgICB0aGlzWzggXSA9IDA7IHRoaXNbOSBdID0gMDsgdGhpc1sxMF0gPSAxOyB0aGlzWzExXSA9IDBcbiAgICAgICAgdGhpc1sxMl0gPSAwOyB0aGlzWzEzXSA9IDA7IHRoaXNbMTRdID0gMDsgdGhpc1sxNV0gPSAxXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHplcm8oKSB7XG5cdFx0dGhpc1sgMF0gPSAwOyB0aGlzWyAxXSA9IDA7IHRoaXNbIDJdID0gMDsgdGhpc1sgM10gPSAwO1xuXHRcdHRoaXNbIDRdID0gMDsgdGhpc1sgNV0gPSAwOyB0aGlzWyA2XSA9IDA7IHRoaXNbIDddID0gMDtcblx0XHR0aGlzWyA4XSA9IDA7IHRoaXNbIDldID0gMDsgdGhpc1sxMF0gPSAwOyB0aGlzWzExXSA9IDA7XG5cdFx0dGhpc1sxMl0gPSAwOyB0aGlzWzEzXSA9IDA7IHRoaXNbMTRdID0gMDsgdGhpc1sxNV0gPSAwO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cbiAgICBwZXJzcGVjdGl2ZShmb3Z5LCBhc3BlY3QsIG5lYXJQbGFuZSwgZmFyUGxhbmUpIHtcblx0XHRsZXQgZm92eTIgPSB0YW4oZm92eSAqIFBJIC8gMzYwLjApICogbmVhclBsYW5lO1xuXHRcdGxldCBmb3Z5MmFzcGVjdCA9IGZvdnkyICogYXNwZWN0O1xuXHRcdHRoaXMuZnJ1c3R1bSgtZm92eTJhc3BlY3QsZm92eTJhc3BlY3QsLWZvdnkyLGZvdnkyLG5lYXJQbGFuZSxmYXJQbGFuZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuXHR9XG5cblx0ZnJ1c3R1bShsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIG5lYXJQbGFuZSwgZmFyUGxhbmUpIHtcblx0XHRsZXQgQSA9IHJpZ2h0IC0gbGVmdDtcblx0XHRsZXQgQiA9IHRvcC1ib3R0b207XG5cdFx0bGV0IEMgPSBmYXJQbGFuZS1uZWFyUGxhbmU7XG5cdFx0XG5cdFx0dGhpcy5zZXRSb3coMCwgbmV3IFZlYyhuZWFyUGxhbmUqMi4wL0EsXHQwLjAsXHQwLjAsXHQwLjApKTtcblx0XHR0aGlzLnNldFJvdygxLCBuZXcgVmVjKDAuMCxcdG5lYXJQbGFuZSoyLjAvQixcdDAuMCxcdDAuMCkpO1xuXHRcdHRoaXMuc2V0Um93KDIsIG5ldyBWZWMoKHJpZ2h0K2xlZnQpL0EsXHQodG9wK2JvdHRvbSkvQixcdC0oZmFyUGxhbmUrbmVhclBsYW5lKS9DLFx0LTEuMCkpO1xuXHRcdHRoaXMuc2V0Um93KDMsIG5ldyBWZWMoMC4wLFx0MC4wLFx0LShmYXJQbGFuZSpuZWFyUGxhbmUqMi4wKS9DLFx0MC4wKSk7XG5cdFx0XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRvcnRobyhsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIG5lYXJQbGFuZSwgZmFyUGxhbmUpIHtcblx0XHRsZXQgbSA9IHJpZ2h0LWxlZnQ7XG5cdFx0bGV0IGwgPSB0b3AtYm90dG9tO1xuXHRcdGxldCBrID0gZmFyUGxhbmUtbmVhclBsYW5lOztcblx0XHRcblx0XHR0aGlzWzBdID0gMi9tOyB0aGlzWzFdID0gMDsgICB0aGlzWzJdID0gMDsgICAgIHRoaXNbM10gPSAwO1xuXHRcdHRoaXNbNF0gPSAwOyAgIHRoaXNbNV0gPSAyL2w7IHRoaXNbNl0gPSAwOyAgICAgdGhpc1s3XSA9IDA7XG5cdFx0dGhpc1s4XSA9IDA7ICAgdGhpc1s5XSA9IDA7ICAgdGhpc1sxMF0gPSAtMi9rOyB0aGlzWzExXT0gMDtcblx0XHR0aGlzWzEyXT0tKGxlZnQrcmlnaHQpL207IHRoaXNbMTNdID0gLSh0b3ArYm90dG9tKS9sOyB0aGlzWzE0XSA9IC0oZmFyUGxhbmUrbmVhclBsYW5lKS9rOyB0aGlzWzE1XT0xO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0XHRcblx0bG9va0F0KHBfZXllLCBwX2NlbnRlciwgcF91cCkge1xuICAgICAgICB0aGlzLmlkZW50aXR5KCk7XG5cblx0XHRjb25zdCB5ID0gbmV3IFZlYyhwX3VwKTtcblx0XHRjb25zdCB6ID0gVmVjMy5TdWIocF9leWUscF9jZW50ZXIpO1xuXHRcdHoubm9ybWFsaXplKCk7XG5cdFx0Y29uc3QgeCA9IFZlYzMuQ3Jvc3MoeSx6KTtcblx0XHR4Lm5vcm1hbGl6ZSgpO1xuXHRcdHkubm9ybWFsaXplKCk7XG5cblx0XHR0aGlzLm0wMCA9IHgueDtcblx0XHR0aGlzLm0xMCA9IHgueTtcblx0XHR0aGlzLm0yMCA9IHguejtcblx0XHR0aGlzLm0zMCA9IC1WZWMzLkRvdCh4LCBwX2V5ZSk7XG5cdFx0dGhpcy5tMDEgPSB5Lng7XG5cdFx0dGhpcy5tMTEgPSB5Lnk7XG5cdFx0dGhpcy5tMjEgPSB5Lno7XG5cdFx0dGhpcy5tMzEgPSAtVmVjMy5Eb3QoeSwgcF9leWUpO1xuXHRcdHRoaXMubTAyID0gei54O1xuXHRcdHRoaXMubTEyID0gei55O1xuXHRcdHRoaXMubTIyID0gei56O1xuXHRcdHRoaXMubTMyID0gLVZlYzMuRG90KHosIHBfZXllKTtcblx0XHR0aGlzLm0wMyA9IDA7XG5cdFx0dGhpcy5tMTMgPSAwO1xuXHRcdHRoaXMubTIzID0gMDtcblx0XHR0aGlzLm0zMyA9IDE7XG5cdFxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXG5cblxuICAgIC8vLy8vIFNldHRlcnMgYW5kIGdldHRlcnNcbiAgICBnZXQgbTAwKCkgeyByZXR1cm4gdGhpc1swXTsgfVxuXHRnZXQgbTAxKCkgeyByZXR1cm4gdGhpc1sxXTsgfVxuXHRnZXQgbTAyKCkgeyByZXR1cm4gdGhpc1syXTsgfVxuXHRnZXQgbTAzKCkgeyByZXR1cm4gdGhpc1szXTsgfVxuXHRnZXQgbTEwKCkgeyByZXR1cm4gdGhpc1s0XTsgfVxuXHRnZXQgbTExKCkgeyByZXR1cm4gdGhpc1s1XTsgfVxuXHRnZXQgbTEyKCkgeyByZXR1cm4gdGhpc1s2XTsgfVxuXHRnZXQgbTEzKCkgeyByZXR1cm4gdGhpc1s3XTsgfVxuXHRnZXQgbTIwKCkgeyByZXR1cm4gdGhpc1s4XTsgfVxuXHRnZXQgbTIxKCkgeyByZXR1cm4gdGhpc1s5XTsgfVxuXHRnZXQgbTIyKCkgeyByZXR1cm4gdGhpc1sxMF07IH1cblx0Z2V0IG0yMygpIHsgcmV0dXJuIHRoaXNbMTFdOyB9XG5cdGdldCBtMzAoKSB7IHJldHVybiB0aGlzWzEyXTsgfVxuXHRnZXQgbTMxKCkgeyByZXR1cm4gdGhpc1sxM107IH1cblx0Z2V0IG0zMigpIHsgcmV0dXJuIHRoaXNbMTRdOyB9XG5cdGdldCBtMzMoKSB7IHJldHVybiB0aGlzWzE1XTsgfVxuXHRcblx0c2V0IG0wMCh2KSB7IHRoaXNbMF0gPSB2OyB9XG5cdHNldCBtMDEodikgeyB0aGlzWzFdID0gdjsgfVxuXHRzZXQgbTAyKHYpIHsgdGhpc1syXSA9IHY7IH1cblx0c2V0IG0wMyh2KSB7IHRoaXNbM10gPSB2OyB9XG5cdHNldCBtMTAodikgeyB0aGlzWzRdID0gdjsgfVxuXHRzZXQgbTExKHYpIHsgdGhpc1s1XSA9IHY7IH1cblx0c2V0IG0xMih2KSB7IHRoaXNbNl0gPSB2OyB9XG5cdHNldCBtMTModikgeyB0aGlzWzddID0gdjsgfVxuXHRzZXQgbTIwKHYpIHsgdGhpc1s4XSA9IHY7IH1cblx0c2V0IG0yMSh2KSB7IHRoaXNbOV0gPSB2OyB9XG5cdHNldCBtMjIodikgeyB0aGlzWzEwXSA9IHY7IH1cblx0c2V0IG0yMyh2KSB7IHRoaXNbMTFdID0gdjsgfVxuXHRzZXQgbTMwKHYpIHsgdGhpc1sxMl0gPSB2OyB9XG5cdHNldCBtMzEodikgeyB0aGlzWzEzXSA9IHY7IH1cblx0c2V0IG0zMih2KSB7IHRoaXNbMTRdID0gdjsgfVxuXHRzZXQgbTMzKHYpIHsgdGhpc1sxNV0gPSB2OyB9XG5cbiAgICByb3coaSkge1xuICAgICAgICByZXR1cm4gbmV3IFZlYyhcbiAgICAgICAgICAgIHRoaXNbaSAqIDRdLCBcbiAgICAgICAgICAgIHRoaXNbaSAqIDQgKyAxXSxcbiAgICAgICAgICAgIHRoaXNbaSAqIDQgKyAyXSxcbiAgICAgICAgICAgIHRoaXNbaSAqIDQgKyAzXSk7XG4gICAgfVxuXG4gICAgc2V0Um93KGksIGEsIHkgPSBudWxsLCB6ID0gbnVsbCwgdyA9IG51bGwpIHtcbiAgICAgICAgaWYgKGEgaW5zdGFuY2VvZiBOdW1lcmljQXJyYXkgJiYgYS5sZW5ndGg+PTQpIHtcbiAgICAgICAgICAgIHRoaXNbaSAqIDRdICAgICAgPSBhWzBdO1xuICAgICAgICAgICAgdGhpc1tpICogNCArIDFdICA9IGFbMV07XG4gICAgICAgICAgICB0aGlzW2kgKiA0ICsgMl0gID0gYVsyXTtcbiAgICAgICAgICAgIHRoaXNbaSAqIDQgKyAzXSAgPSBhWzNdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZihhKSA9PT0gXCJudW1iZXJcIiAmJiBcbiAgICAgICAgICAgIHR5cGVvZih5KSA9PT0gXCJudW1iZXJcIiAmJiBcbiAgICAgICAgICAgIHR5cGVvZih6KSA9PT0gXCJudW1iZXJcIiAmJlxuICAgICAgICAgICAgdHlwZW9mKHcpID09PSBcIm51bWJlclwiXG4gICAgICAgICkge1xuICAgICAgICAgICAgdGhpc1tpICogNF0gICAgICA9IGE7XG4gICAgICAgICAgICB0aGlzW2kgKiA0ICsgMV0gID0geTtcbiAgICAgICAgICAgIHRoaXNbaSAqIDQgKyAyXSAgPSB6O1xuICAgICAgICAgICAgdGhpc1tpICogNCArIDNdICA9IHc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcGFyYW1ldGVyIHNldHRpbmcgbWF0cml4IHJvd2ApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvbChpKSB7XG4gICAgICAgIHJldHVybiBuZXcgVmVjKFxuICAgICAgICAgICAgdGhpc1tpXSxcbiAgICAgICAgICAgIHRoaXNbaSArIDRdLFxuICAgICAgICAgICAgdGhpc1tpICsgNCAqIDJdLFxuICAgICAgICAgICAgdGhpc1tpICsgNCAqIDNdXG4gICAgICAgIClcbiAgICB9XG5cbiAgICBzZXRDb2woaSwgYSwgeSA9IG51bGwsIHogPSBudWxsLCB3ID0gbnVsbCkge1xuICAgICAgICBpZiAoYSBpbnN0YW5jZW9mIE51bWVyaWNBcnJheSAmJiBhLmxlbmd0aD49NCkge1xuICAgICAgICAgICAgdGhpc1tpXSAgICAgICAgID0gYVswXTtcbiAgICAgICAgICAgIHRoaXNbaSArIDRdICAgICA9IGFbMV07XG4gICAgICAgICAgICB0aGlzW2kgKyA0ICogMl0gPSBhWzJdO1xuICAgICAgICAgICAgdGhpc1tpICsgNCAqIDNdID0gYVszXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlb2YoYSkgPT09IFwibnVtYmVyXCIgJiYgXG4gICAgICAgICAgICB0eXBlb2YoeSkgPT09IFwibnVtYmVyXCIgJiYgXG4gICAgICAgICAgICB0eXBlb2YoeikgPT09IFwibnVtYmVyXCIgJiZcbiAgICAgICAgICAgIHR5cGVvZih3KSA9PT0gXCJudW1iZXJcIlxuICAgICAgICApIHtcbiAgICAgICAgICAgIHRoaXNbaV0gICAgICAgICA9IGE7XG4gICAgICAgICAgICB0aGlzW2kgKyA0XSAgICAgPSB5O1xuICAgICAgICAgICAgdGhpc1tpICsgNCAqIDJdID0gejtcbiAgICAgICAgICAgIHRoaXNbaSArIDQgKiAzXSA9IHc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcGFyYW1ldGVyIHNldHRpbmcgbWF0cml4IHJvd2ApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIG1hdDMoKSB7XG5cdFx0cmV0dXJuIG5ldyBNYXQzKHRoaXNbMF0sIHRoaXNbMV0sIHRoaXNbIDJdLFxuXHRcdFx0XHRcdFx0dGhpc1s0XSwgdGhpc1s1XSwgdGhpc1sgNl0sXG5cdFx0XHRcdFx0XHR0aGlzWzhdLCB0aGlzWzldLCB0aGlzWzEwXSk7XG5cdH1cblxuICAgIGFzc2lnbihhKSB7XG5cdFx0aWYgKGEubGVuZ3RoPT05KSB7XG5cdFx0XHR0aGlzWzBdICA9IGFbMF07IHRoaXNbMV0gID0gYVsxXTsgdGhpc1syXSAgPSBhWzJdOyB0aGlzWzNdICA9IDA7XG5cdFx0XHR0aGlzWzRdICA9IGFbM107IHRoaXNbNV0gID0gYVs0XTsgdGhpc1s2XSAgPSBhWzVdOyB0aGlzWzddICA9IDA7XG5cdFx0XHR0aGlzWzhdICA9IGFbNl07IHRoaXNbOV0gID0gYVs3XTsgdGhpc1sxMF0gPSBhWzhdOyB0aGlzWzExXSA9IDA7XG5cdFx0XHR0aGlzWzEyXSA9IDA7XHQgdGhpc1sxM10gPSAwO1x0ICB0aGlzWzE0XSA9IDA7XHQgICB0aGlzWzE1XSA9IDE7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKGEubGVuZ3RoPT0xNikge1xuXHRcdFx0dGhpc1swXSAgPSBhWzBdOyAgdGhpc1sxXSAgPSBhWzFdOyAgdGhpc1syXSAgPSBhWzJdOyAgdGhpc1szXSAgPSBhWzNdO1xuXHRcdFx0dGhpc1s0XSAgPSBhWzRdOyAgdGhpc1s1XSAgPSBhWzVdOyAgdGhpc1s2XSAgPSBhWzZdOyAgdGhpc1s3XSAgPSBhWzddO1xuXHRcdFx0dGhpc1s4XSAgPSBhWzhdOyAgdGhpc1s5XSAgPSBhWzldOyAgdGhpc1sxMF0gPSBhWzEwXTsgdGhpc1sxMV0gPSBhWzExXTtcblx0XHRcdHRoaXNbMTJdID0gYVsxMl07IHRoaXNbMTNdID0gYVsxM107XHR0aGlzWzE0XSA9IGFbMTRdOyB0aGlzWzE1XSA9IGFbMTVdO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG4gICAgZ2V0IGZvcndhcmRWZWN0b3IoKSB7XG5cdFx0cmV0dXJuIE1hdDQuVHJhbnNmb3JtRGlyZWN0aW9uKHRoaXMsIG5ldyBWZWMoMC4wLCAwLjAsIDEuMCkpO1xuXHR9XG5cdFxuXHRnZXQgcmlnaHRWZWN0b3IoKSB7XG5cdFx0cmV0dXJuIE1hdDQuVHJhbnNmb3JtRGlyZWN0aW9uKHRoaXMsIG5ldyBWZWMoMS4wLCAwLjAsIDAuMCkpO1xuXHR9XG5cdFxuXHRnZXQgdXBWZWN0b3IoKSB7XG5cdFx0cmV0dXJuIE1hdDQuVHJhbnNmb3JtRGlyZWN0aW9uKHRoaXMsIG5ldyBWZWMoMC4wLCAxLjAsIDAuMCkpO1xuXHR9XG5cdFxuXHRnZXQgYmFja3dhcmRWZWN0b3IoKSB7XG5cdFx0cmV0dXJuIE1hdDQuVHJhbnNmb3JtRGlyZWN0aW9uKHRoaXMsIG5ldyBWZWMoMC4wLCAwLjAsIC0xLjApKTtcblx0fVxuXHRcblx0Z2V0IGxlZnRWZWN0b3IoKSB7XG5cdFx0cmV0dXJuIE1hdDQuVHJhbnNmb3JtRGlyZWN0aW9uKHRoaXMsIG5ldyBWZWMoLTEuMCwgMC4wLCAwLjApKTtcblx0fVxuXHRcblx0Z2V0IGRvd25WZWN0b3IoKSB7XG5cdFx0cmV0dXJuIE1hdDQuVHJhbnNmb3JtRGlyZWN0aW9uKHRoaXMsIG5ldyBWZWMoMC4wLCAtMS4wLCAwLjApKTtcblx0fVxuXG5cbiAgICAvLy8vLy8vIFF1ZXJ5IGZ1bmN0aW9uc1xuICAgIGlzWmVybygpIHtcblx0XHRyZXR1cm5cdHRoaXNbIDBdPT0wICYmIHRoaXNbIDFdPT0wICYmIHRoaXNbIDJdPT0wICYmIHRoaXNbIDNdPT0wICYmXG5cdFx0XHRcdHRoaXNbIDRdPT0wICYmIHRoaXNbIDVdPT0wICYmIHRoaXNbIDZdPT0wICYmIHRoaXNbIDddPT0wICYmXG5cdFx0XHRcdHRoaXNbIDhdPT0wICYmIHRoaXNbIDldPT0wICYmIHRoaXNbMTBdPT0wICYmIHRoaXNbMTFdPT0wICYmXG5cdFx0XHRcdHRoaXNbMTJdPT0wICYmIHRoaXNbMTNdPT0wICYmIHRoaXNbMTRdPT0wICYmIHRoaXNbMTVdPT0wO1xuXHR9XG5cdFxuXHRpc0lkZW50aXR5KCkge1xuXHRcdHJldHVyblx0dGhpc1sgMF09PTEgJiYgdGhpc1sgMV09PTAgJiYgdGhpc1sgMl09PTAgJiYgdGhpc1sgM109PTAgJiZcblx0XHRcdFx0dGhpc1sgNF09PTAgJiYgdGhpc1sgNV09PTEgJiYgdGhpc1sgNl09PTAgJiYgdGhpc1sgN109PTAgJiZcblx0XHRcdFx0dGhpc1sgOF09PTAgJiYgdGhpc1sgOV09PTAgJiYgdGhpc1sxMF09PTEgJiYgdGhpc1sxMV09PTAgJiZcblx0XHRcdFx0dGhpc1sxMl09PTAgJiYgdGhpc1sxM109PTAgJiYgdGhpc1sxNF09PTAgJiYgdGhpc1sxNV09PTE7XG5cdH1cblxuXG4gICAgLy8vLy8vLyBUcmFuc2Zvcm0gZnVuY3Rpb25zXG5cdHRyYW5zbGF0ZSh4LCB5LCB6KSB7XG5cdFx0dGhpcy5tdWx0KE1hdDQuTWFrZVRyYW5zbGF0aW9uKHgsIHksIHopKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdHJvdGF0ZShhbHBoYSwgeCwgeSwgeikge1xuXHRcdHRoaXMubXVsdChNYXQ0Lk1ha2VSb3RhdGlvbihhbHBoYSwgeCwgeSwgeikpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdFxuXHRzY2FsZSh4LCB5LCB6KSB7XG5cdFx0dGhpcy5tdWx0KE1hdDQuTWFrZVNjYWxlKHgsIHksIHopKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cblxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiAgYFsgJHt0aGlzWyAwXX0sICR7dGhpc1sgMV19LCAke3RoaXNbIDJdfSwgJHt0aGlzWyAzXX1cXG5gICtcbiAgICAgICAgICAgICAgICBgICAke3RoaXNbIDRdfSwgJHt0aGlzWyA1XX0sICR7dGhpc1sgNl19LCAke3RoaXNbIDddfVxcbmAgK1xuICAgICAgICAgICAgICAgIGAgICR7dGhpc1sgOF19LCAke3RoaXNbIDldfSwgJHt0aGlzWzEwXX0sICR7dGhpc1sxMV19XFxuYCArXG4gICAgICAgICAgICAgICAgYCAgJHt0aGlzWzEyXX0sICR7dGhpc1sxM119LCAke3RoaXNbMTRdfSwgJHt0aGlzWzE1XX0gXWA7XG4gICAgfVxuXG5cbiAgICAvLy8vLy8gVXRpbGl0aWVzXG4gICAgc2V0U2NhbGUoeCx5LHopIHtcblx0XHRjb25zdCByeCA9IG5ldyBWZWModGhpc1swXSwgdGhpc1s0XSwgdGhpc1s4XSkubm9ybWFsaXplKCkuc2NhbGUoeCk7XG5cdFx0Y29uc3QgcnkgPSBuZXcgVmVjKHRoaXNbMV0sIHRoaXNbNV0sIHRoaXNbOV0pLm5vcm1hbGl6ZSgpLnNjYWxlKHkpO1xuXHRcdGNvbnN0IHJ6ID0gbmV3IFZlYyh0aGlzWzJdLCB0aGlzWzZdLCB0aGlzWzEwXSkubm9ybWFsaXplKCkuc2NhbGUoeik7XG5cdFx0dGhpc1swXSA9IHJ4Lng7IHRoaXNbNF0gPSByeC55OyB0aGlzWzhdID0gcnguejtcblx0XHR0aGlzWzFdID0gcnkueDsgdGhpc1s1XSA9IHJ5Lnk7IHRoaXNbOV0gPSByeS56O1xuXHRcdHRoaXNbMl0gPSByei54OyB0aGlzWzZdID0gcnoueTsgdGhpc1sxMF0gPSByei56O1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0c2V0UG9zaXRpb24ocG9zLHkseikge1xuXHRcdGlmICh0eXBlb2YocG9zKT09XCJudW1iZXJcIikge1xuXHRcdFx0dGhpc1sxMl0gPSBwb3M7XG5cdFx0XHR0aGlzWzEzXSA9IHk7XG5cdFx0XHR0aGlzWzE0XSA9IHo7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0dGhpc1sxMl0gPSBwb3MueDtcblx0XHRcdHRoaXNbMTNdID0gcG9zLnk7XG5cdFx0XHR0aGlzWzE0XSA9IHBvcy56O1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG4gICAgLy8vLy8vLyBPcGVyYXRpb25zXG4gICAgbXVsdChhKSB7XG5cdFx0aWYgKHR5cGVvZihhKT09J251bWJlcicpIHtcblx0XHRcdHRoaXNbIDBdICo9IGE7IHRoaXNbIDFdICo9IGE7IHRoaXNbIDJdICo9IGE7IHRoaXNbIDNdICo9IGE7XG5cdFx0XHR0aGlzWyA0XSAqPSBhOyB0aGlzWyA1XSAqPSBhOyB0aGlzWyA2XSAqPSBhOyB0aGlzWyA3XSAqPSBhO1xuXHRcdFx0dGhpc1sgOF0gKj0gYTsgdGhpc1sgOV0gKj0gYTsgdGhpc1sxMF0gKj0gYTsgdGhpc1sxMV0gKj0gYTtcblx0XHRcdHRoaXNbMTJdICo9IGE7IHRoaXNbMTNdICo9IGE7IHRoaXNbMTRdICo9IGE7IHRoaXNbMTVdICo9IGE7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cbiAgICAgICAgY29uc3QgcjAgPSB0aGlzLnJvdygwKTtcbiAgICAgICAgY29uc3QgcjEgPSB0aGlzLnJvdygxKTtcbiAgICAgICAgY29uc3QgcjIgPSB0aGlzLnJvdygyKTtcbiAgICAgICAgY29uc3QgcjMgPSB0aGlzLnJvdygzKTtcbiAgICAgICAgY29uc3QgYzAgPSBhLmNvbCgwKTtcbiAgICAgICAgY29uc3QgYzEgPSBhLmNvbCgxKTtcbiAgICAgICAgY29uc3QgYzIgPSBhLmNvbCgyKTtcbiAgICAgICAgY29uc3QgYzMgPSBhLmNvbCgzKTtcblxuICAgICAgICB0aGlzWzAgXSA9IFZlYy5Eb3QocjAsIGMwKTsgdGhpc1sxIF0gPSBWZWMuRG90KHIwLCBjMSk7IHRoaXNbMiBdID0gVmVjLkRvdChyMCwgYzIpOyB0aGlzWzMgXSA9IFZlYy5Eb3QocjAsIGMzKTtcbiAgICAgICAgdGhpc1s0IF0gPSBWZWMuRG90KHIxLCBjMCk7IHRoaXNbNSBdID0gVmVjLkRvdChyMSwgYzEpOyB0aGlzWzYgXSA9IFZlYy5Eb3QocjEsIGMyKTsgdGhpc1s3IF0gPSBWZWMuRG90KHIxLCBjMyk7XG4gICAgICAgIHRoaXNbOCBdID0gVmVjLkRvdChyMiwgYzApOyB0aGlzWzkgXSA9IFZlYy5Eb3QocjIsIGMxKTsgdGhpc1sxMF0gPSBWZWMuRG90KHIyLCBjMik7IHRoaXNbMTFdID0gVmVjLkRvdChyMiwgYzMpO1xuICAgICAgICB0aGlzWzEyXSA9IFZlYy5Eb3QocjMsIGMwKTsgdGhpc1sxM10gPSBWZWMuRG90KHIzLCBjMSk7IHRoaXNbMTRdID0gVmVjLkRvdChyMywgYzIpOyB0aGlzWzE1XSA9IFZlYy5Eb3QocjMsIGMzKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0bXVsdFZlY3Rvcih2ZWMpIHtcbiAgICAgICAgaWYgKHZlYy5sZW5ndGg8Mykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBwYXJhbWV0ZXIgbXVsdGlwbHlpbmcgTWF0NCBieSB2ZWN0b3JcIik7XG4gICAgICAgIH1cblxuXHRcdGNvbnN0IHggPSB2ZWNbMF07XG5cdFx0Y29uc3QgeSA9IHZlY1sxXTtcblx0XHRjb25zdCB6ID0gdmVjWzJdO1xuXHRcdGNvbnN0IHcgPSB2ZWMubGVuZ3RoID4zID8gdmVjWzNdIDogMS4wO1xuXHRcblx0XHRyZXR1cm4gbmV3IFZlYyggdGhpc1swXSAqIHggKyB0aGlzWzRdICogeSArIHRoaXNbIDhdICogeiArIHRoaXNbMTJdICogdyxcblx0XHRcdFx0XHRcdHRoaXNbMV0gKiB4ICsgdGhpc1s1XSAqIHkgKyB0aGlzWyA5XSAqIHogKyB0aGlzWzEzXSAqIHcsXG5cdFx0XHRcdFx0XHR0aGlzWzJdICogeCArIHRoaXNbNl0gKiB5ICsgdGhpc1sxMF0gKiB6ICsgdGhpc1sxNF0gKiB3LFxuXHRcdFx0XHRcdFx0dGhpc1szXSAqIHggKyB0aGlzWzddICogeSArIHRoaXNbMTFdICogeiArIHRoaXNbMTVdICogdyk7XG5cdH1cblx0XG5cdGludmVydCgpIHtcblx0XHRjb25zdCBhMDAgPSB0aGlzWzBdLCAgYTAxID0gdGhpc1sxXSwgIGEwMiA9IHRoaXNbMl0sICBhMDMgPSB0aGlzWzNdLFxuXHQgICAgICAgICAgYTEwID0gdGhpc1s0XSwgIGExMSA9IHRoaXNbNV0sICBhMTIgPSB0aGlzWzZdLCAgYTEzID0gdGhpc1s3XSxcblx0ICAgICAgICAgIGEyMCA9IHRoaXNbOF0sICBhMjEgPSB0aGlzWzldLCAgYTIyID0gdGhpc1sxMF0sIGEyMyA9IHRoaXNbMTFdLFxuXHQgICAgICAgICAgYTMwID0gdGhpc1sxMl0sIGEzMSA9IHRoaXNbMTNdLCBhMzIgPSB0aGlzWzE0XSwgYTMzID0gdGhpc1sxNV07XG5cblx0ICAgIGNvbnN0IGIwMCA9IGEwMCAqIGExMSAtIGEwMSAqIGExMCxcblx0ICAgICAgICAgIGIwMSA9IGEwMCAqIGExMiAtIGEwMiAqIGExMCxcblx0ICAgICAgICAgIGIwMiA9IGEwMCAqIGExMyAtIGEwMyAqIGExMCxcblx0ICAgICAgICAgIGIwMyA9IGEwMSAqIGExMiAtIGEwMiAqIGExMSxcblx0ICAgICAgICAgIGIwNCA9IGEwMSAqIGExMyAtIGEwMyAqIGExMSxcblx0ICAgICAgICAgIGIwNSA9IGEwMiAqIGExMyAtIGEwMyAqIGExMixcblx0ICAgICAgICAgIGIwNiA9IGEyMCAqIGEzMSAtIGEyMSAqIGEzMCxcblx0ICAgICAgICAgIGIwNyA9IGEyMCAqIGEzMiAtIGEyMiAqIGEzMCxcblx0ICAgICAgICAgIGIwOCA9IGEyMCAqIGEzMyAtIGEyMyAqIGEzMCxcblx0ICAgICAgICAgIGIwOSA9IGEyMSAqIGEzMiAtIGEyMiAqIGEzMSxcblx0ICAgICAgICAgIGIxMCA9IGEyMSAqIGEzMyAtIGEyMyAqIGEzMSxcblx0ICAgICAgICAgIGIxMSA9IGEyMiAqIGEzMyAtIGEyMyAqIGEzMjtcblxuXHQgICAgbGV0IGRldCA9IGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcblxuXHQgICAgaWYgKCFkZXQpIHtcblx0XHRcdHRoaXMuemVybygpO1xuXHQgICAgfVxuXHRcdGVsc2Uge1xuXHRcdFx0ZGV0ID0gMS4wIC8gZGV0O1xuXG5cdFx0XHR0aGlzWzBdID0gKGExMSAqIGIxMSAtIGExMiAqIGIxMCArIGExMyAqIGIwOSkgKiBkZXQ7XG5cdFx0XHR0aGlzWzFdID0gKGEwMiAqIGIxMCAtIGEwMSAqIGIxMSAtIGEwMyAqIGIwOSkgKiBkZXQ7XG5cdFx0XHR0aGlzWzJdID0gKGEzMSAqIGIwNSAtIGEzMiAqIGIwNCArIGEzMyAqIGIwMykgKiBkZXQ7XG5cdFx0XHR0aGlzWzNdID0gKGEyMiAqIGIwNCAtIGEyMSAqIGIwNSAtIGEyMyAqIGIwMykgKiBkZXQ7XG5cdFx0XHR0aGlzWzRdID0gKGExMiAqIGIwOCAtIGExMCAqIGIxMSAtIGExMyAqIGIwNykgKiBkZXQ7XG5cdFx0XHR0aGlzWzVdID0gKGEwMCAqIGIxMSAtIGEwMiAqIGIwOCArIGEwMyAqIGIwNykgKiBkZXQ7XG5cdFx0XHR0aGlzWzZdID0gKGEzMiAqIGIwMiAtIGEzMCAqIGIwNSAtIGEzMyAqIGIwMSkgKiBkZXQ7XG5cdFx0XHR0aGlzWzddID0gKGEyMCAqIGIwNSAtIGEyMiAqIGIwMiArIGEyMyAqIGIwMSkgKiBkZXQ7XG5cdFx0XHR0aGlzWzhdID0gKGExMCAqIGIxMCAtIGExMSAqIGIwOCArIGExMyAqIGIwNikgKiBkZXQ7XG5cdFx0XHR0aGlzWzldID0gKGEwMSAqIGIwOCAtIGEwMCAqIGIxMCAtIGEwMyAqIGIwNikgKiBkZXQ7XG5cdFx0XHR0aGlzWzEwXSA9IChhMzAgKiBiMDQgLSBhMzEgKiBiMDIgKyBhMzMgKiBiMDApICogZGV0O1xuXHRcdFx0dGhpc1sxMV0gPSAoYTIxICogYjAyIC0gYTIwICogYjA0IC0gYTIzICogYjAwKSAqIGRldDtcblx0XHRcdHRoaXNbMTJdID0gKGExMSAqIGIwNyAtIGExMCAqIGIwOSAtIGExMiAqIGIwNikgKiBkZXQ7XG5cdFx0XHR0aGlzWzEzXSA9IChhMDAgKiBiMDkgLSBhMDEgKiBiMDcgKyBhMDIgKiBiMDYpICogZGV0O1xuXHRcdFx0dGhpc1sxNF0gPSAoYTMxICogYjAxIC0gYTMwICogYjAzIC0gYTMyICogYjAwKSAqIGRldDtcblx0XHRcdHRoaXNbMTVdID0gKGEyMCAqIGIwMyAtIGEyMSAqIGIwMSArIGEyMiAqIGIwMCkgKiBkZXQ7XG5cdFx0fVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuXHR9XG5cdFxuXHR0cmFzcG9zZSgpIHtcblx0XHRjb25zdCByMCA9IG5ldyBWZWModGhpc1swXSwgdGhpc1s0XSwgdGhpc1sgOF0sIHRoaXNbMTJdKTtcblx0XHRjb25zdCByMSA9IG5ldyBWZWModGhpc1sxXSwgdGhpc1s1XSwgdGhpc1sgOV0sIHRoaXNbMTNdKTtcblx0XHRjb25zdCByMiA9IG5ldyBWZWModGhpc1syXSwgdGhpc1s2XSwgdGhpc1sxMF0sIHRoaXNbMTRdKTtcblx0XHRjb25zdCByMyA9IG5ldyBWZWModGhpc1szXSwgdGhpc1s3XSwgdGhpc1sxMV0sIHRoaXNbMTVdKTtcblx0XG5cdFx0dGhpcy5zZXRSb3coMCwgcjApO1xuXHRcdHRoaXMuc2V0Um93KDEsIHIxKTtcblx0XHR0aGlzLnNldFJvdygyLCByMik7XG5cdFx0dGhpcy5zZXRSb3coMywgcjMpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblxuXG5cbiAgICAvLy8vLy8vLy8gRmFjdG9yeSBtZXRob2RzXG4gICAgc3RhdGljIE1ha2VJZGVudGl0eSgpIHtcbiAgICAgICAgY29uc3QgbSA9IG5ldyBNYXQ0KCk7XG4gICAgICAgIHJldHVybiBtLmlkZW50aXR5KCk7XG4gICAgfVxuXG5cdHN0YXRpYyBNYWtlWmVybygpIHtcblx0XHRjb25zdCBtID0gbmV3IE1hdDQoKTtcblx0XHRyZXR1cm4gbS56ZXJvKCk7XG5cdH1cblxuXHRzdGF0aWMgTWFrZVdpdGhRdWF0ZXJuaW9uKHEpIHtcblx0XHRjb25zdCBtID0gTWF0NC5NYWtlSWRlbnRpdHkoKTtcbiAgICAgICAgXG4gICAgICAgIG0uc2V0Um93KDAsIG5ldyBWZWMoIDEgIC0gMiAqIHFbMV0gKiBxWzFdIC0gMiAqIHFbMl0gKiBxWzJdLCAyICogcVswXSAqIHFbMV0gLSAyICogcVsyXSAqIHFbM10sIDIgKiBxWzBdICogcVsyXSArIDIgKiBxWzFdICogcVszXSwgMCkpO1xuICAgICAgICBtLnNldFJvdygxLCBuZXcgVmVjKCAyICogcVswXSAqIHFbMV0gKyAyICogcVsyXSAqIHFbM10sIDEgIC0gMi4wICogcVswXSAqIHFbMF0gLSAyICogcVsyXSAqIHFbMl0sIDIgKiBxWzFdICogcVsyXSAtIDIgKiBxWzBdICogcVszXSwgMCkpO1xuICAgICAgICBtLnNldFJvdygyLCBuZXcgVmVjKCAyICogcVswXSAqIHFbMl0gLSAyICogcVsxXSAqIHFbM10sIDIgKiBxWzFdICogcVsyXSArIDIgKiBxWzBdICogcVszXSAsIDEgLSAyICogcVswXSAqIHFbMF0gLSAyICogcVsxXSAqIHFbMV0sIDApKTsvL1xuICAgICAgICByZXR1cm4gbTtcblx0fVxuXHRcbiAgICBzdGF0aWMgTWFrZVRyYW5zbGF0aW9uKHgsIHksIHopIHtcblx0XHRpZiAoeCBpbnN0YW5jZW9mIE51bWVyaWNBcnJheSAmJiB4Lmxlbmd0aCA+PSAzKSB7XG5cdFx0XHR5ID0geFsxXTtcblx0XHRcdHogPSB4WzJdO1xuXHRcdFx0eCA9IHhbMF07XG5cdFx0fVxuXHRcdHJldHVybiBuZXcgTWF0NChcblx0XHRcdDEuMCwgMC4wLCAwLjAsIDAuMCxcblx0XHRcdDAuMCwgMS4wLCAwLjAsIDAuMCxcblx0XHRcdDAuMCwgMC4wLCAxLjAsIDAuMCxcblx0XHRcdCAgeCwgICB5LCAgIHosIDEuMFxuXHRcdCk7XG5cdH1cblx0XHRcblx0c3RhdGljIE1ha2VSb3RhdGlvbihhbHBoYSwgeCwgeSwgeikge1xuXHRcdGNvbnN0IGF4aXMgPSBuZXcgVmVjKHgseSx6KTtcblx0XHRheGlzLm5vcm1hbGl6ZSgpO1xuXHRcdFx0XHRcblx0XHR2YXIgY29zQWxwaGEgPSBNYXRoLmNvcyhhbHBoYSk7XG5cdFx0dmFyIGFjb3NBbHBoYSA9IDEuMCAtIGNvc0FscGhhO1xuXHRcdHZhciBzaW5BbHBoYSA9IE1hdGguc2luKGFscGhhKTtcblx0XHRcblx0XHRyZXR1cm4gbmV3IE1hdDQoXG5cdFx0XHRheGlzLnggKiBheGlzLnggKiBhY29zQWxwaGEgKyBjb3NBbHBoYSwgYXhpcy54ICogYXhpcy55ICogYWNvc0FscGhhICsgYXhpcy56ICogc2luQWxwaGEsIGF4aXMueCAqIGF4aXMueiAqIGFjb3NBbHBoYSAtIGF4aXMueSAqIHNpbkFscGhhLCAwLFxuXHRcdFx0YXhpcy55ICogYXhpcy54ICogYWNvc0FscGhhIC0gYXhpcy56ICogc2luQWxwaGEsIGF4aXMueSAqIGF4aXMueSAqIGFjb3NBbHBoYSArIGNvc0FscGhhLCBheGlzLnkgKiBheGlzLnogKiBhY29zQWxwaGEgKyBheGlzLnggKiBzaW5BbHBoYSwgMCxcblx0XHRcdGF4aXMueiAqIGF4aXMueCAqIGFjb3NBbHBoYSArIGF4aXMueSAqIHNpbkFscGhhLCBheGlzLnogKiBheGlzLnkgKiBhY29zQWxwaGEgLSBheGlzLnggKiBzaW5BbHBoYSwgYXhpcy56ICogYXhpcy56ICogYWNvc0FscGhhICsgY29zQWxwaGEsIDAsXG5cdFx0XHQwLDAsMCwxXG5cdFx0KTtcblx0fVxuXG5cdHN0YXRpYyBNYWtlU2NhbGUoeCwgeSwgeikge1xuXHRcdGlmICh4IGluc3RhbmNlb2YgTnVtZXJpY0FycmF5ICAmJiB4Lmxlbmd0aCA+PSAzKSB7XG4gICAgICAgICAgICB5ID0geFsxXTtcblx0XHRcdHogPSB4WzJdO1xuXHRcdFx0eCA9IHhbMF07XG5cdFx0fVxuXHRcdHJldHVybiBuZXcgTWF0NChcblx0XHRcdHgsIDAsIDAsIDAsXG5cdFx0XHQwLCB5LCAwLCAwLFxuXHRcdFx0MCwgMCwgeiwgMCxcblx0XHRcdDAsIDAsIDAsIDFcblx0XHQpXG5cdH1cbiAgICBcblxuICAgIHN0YXRpYyBNYWtlUGVyc3BlY3RpdmUoZm92eSwgYXNwZWN0LCBuZWFyUGxhbmUsIGZhclBsYW5lKSB7XG5cdFx0cmV0dXJuIChuZXcgTWF0NCgpKS5wZXJzcGVjdGl2ZShmb3Z5LCBhc3BlY3QsIG5lYXJQbGFuZSwgZmFyUGxhbmUpO1xuXHR9XG5cdFxuXHRzdGF0aWMgTWFrZUZydXN0dW0obGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyUGxhbmUsIGZhclBsYW5lKSB7XG5cdFx0cmV0dXJuIChuZXcgTWF0NCgpKS5mcnVzdHVtKGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhclBsYW5lLCBmYXJQbGFuZSk7XG5cdH1cblx0XG5cdHN0YXRpYyBNYWtlT3J0aG8obGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyUGxhbmUsIGZhclBsYW5lKSB7XG5cdFx0cmV0dXJuIChuZXcgTWF0NCgpKS5vcnRobyhsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIG5lYXJQbGFuZSwgZmFyUGxhbmUpO1xuXHR9XG5cblx0c3RhdGljIE1ha2VMb29rQXQob3JpZ2luLCB0YXJnZXQsIHVwKSB7XG5cdFx0cmV0dXJuIChuZXcgTWF0NCgpKS5Mb29rQXQob3JpZ2luLHRhcmdldCx1cCk7XG5cdH1cblxuXG5cblxuXG4gICAgLy8vLy8vLyBTdGF0aWMgVXRpbGl0aWVzXG4gICAgc3RhdGljIFVucHJvamVjdCh4LCB5LCBkZXB0aCwgbXZNYXQsIHBNYXQsIHZpZXdwb3J0KSB7XG5cdFx0bGV0IG12cCA9IG5ldyBNYXQ0KHBNYXQpO1xuXHRcdG12cC5tdWx0KG12TWF0KTtcblx0XHRtdnAuaW52ZXJ0KCk7XG5cblx0XHRjb25zdCB2aW4gPSBuZXcgVmVjKCgoeCAtIHZpZXdwb3J0LnkpIC8gdmlld3BvcnQud2lkdGgpICogMi4wIC0gMS4wLFxuXHRcdFx0XHRcdFx0XHRcdCgoeSAtIHZpZXdwb3J0LngpIC8gdmlld3BvcnQuaGVpZ2h0KSAqIDIuMCAtIDEuMCxcblx0XHRcdFx0XHRcdFx0XHRkZXB0aCAqIDIuMCAtIDEuMCxcblx0XHRcdFx0XHRcdFx0XHQxLjApO1xuXHRcdFxuXHRcdGNvbnN0IHJlc3VsdCA9IG5ldyBWZWM0KG12cC5tdWx0VmVjdG9yKHZpbikpO1xuXHRcdGlmIChyZXN1bHQuej09MCkge1xuXHRcdFx0cmVzdWx0LnNldCgwKTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRyZXN1bHQuc2V0KFx0cmVzdWx0LngvcmVzdWx0LncsXG5cdFx0XHRcdFx0XHRyZXN1bHQueS9yZXN1bHQudyxcblx0XHRcdFx0XHRcdHJlc3VsdC56L3Jlc3VsdC53LFxuXHRcdFx0XHRcdFx0cmVzdWx0LncvcmVzdWx0LncpO1xuXHRcdH1cblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuICAgIHN0YXRpYyBHZXRTY2FsZShtKSB7XG5cdFx0cmV0dXJuIG5ldyBWZWMzKFxuICAgICAgICAgICAgbmV3IFZlYyhtWzFdLCBtWzVdLCBtWzldKS5tYWduaXR1ZGUoKSxcblx0XHRcdG5ldyBWZWMobVswXSwgbVs0XSwgbVs4XSkubWFnbml0dWRlKCksXG5cdFx0XHRuZXcgVmVjKG1bMl0sIG1bNl0sIG1bMTBdKS5tYWduaXR1ZGUoKVxuXHRcdCk7XG5cdH1cblxuICAgIHN0YXRpYyBHZXRSb3RhdGlvbihtKSB7XG5cdFx0Y29uc3Qgc2NhbGUgPSBNYXQ0LkdldFNjYWxlKCk7XG5cdFx0cmV0dXJuIG5ldyBNYXQ0KFxuXHRcdFx0XHRtWzBdIC8gc2NhbGUueCwgbVsxXSAvIHNjYWxlLnksIG1bIDJdIC8gc2NhbGUueiwgMCxcblx0XHRcdFx0bVs0XSAvIHNjYWxlLngsIG1bNV0gLyBzY2FsZS55LCBtWyA2XSAvIHNjYWxlLnosIDAsXG5cdFx0XHRcdG1bOF0gLyBzY2FsZS54LCBtWzldIC8gc2NhbGUueSwgbVsxMF0gLyBzY2FsZS56LCAwLFxuXHRcdFx0XHQwLFx0ICAgMCxcdCAgMCwgXHQxXG5cdFx0KTtcblx0fVxuXG5cdHN0YXRpYyBHZXRQb3NpdGlvbihtKSB7XG5cdFx0cmV0dXJuIG5ldyBWZWMobVsxMl0sIG1bMTNdLCBtWzE0XSk7XG5cdH1cblxuICAgIHN0YXRpYyBFcXVhbHMobSxuKSB7XG5cdFx0cmV0dXJuXHRtWyAwXSA9PSBuWyAwXSAmJiBtWyAxXSA9PSBuWyAxXSAmJiBtWyAyXSA9PSBuWyAyXSAmJiBtWyAzXSA9PSBuWyAzXSAmJlxuXHRcdFx0XHRtWyA0XSA9PSBuWyA0XSAmJiBtWyA1XSA9PSBuWyA1XSAmJiBtWyA2XSA9PSBuWyA2XSAmJiBtWyA3XSA9PSBuWyA3XSAmJlxuXHRcdFx0XHRtWyA4XSA9PSBuWyA4XSAmJiBtWyA5XSA9PSBuWyA5XSAmJiBtWzEwXSA9PSBuWzEwXSAmJiBtWzExXSA9PSBuWzExXSAmJlxuXHRcdFx0XHRtWzEyXSA9PSBuWzEyXSAmJiBtWzEzXSA9PSBuWzEzXSAmJiBtWzE0XSA9PSBuWzE0XSAmJiBtWzE1XSA9PSBuWzE1XTtcblx0fVxuXG4gICAgc3RhdGljIFRyYW5zZm9ybURpcmVjdGlvbihNLCAvKiBWZWMgKi8gZGlyKSB7XG5cdFx0Y29uc3QgZGlyZWN0aW9uID0gbmV3IFZlYyhkaXIpO1xuXHRcdGNvbnN0IHRyeCA9IG5ldyBNYXQ0KE0pO1xuXHRcdHRyeC5zZXRSb3coMywgbmV3IFZlYygwLCAwLCAwLCAxKSk7XG5cdFx0ZGlyZWN0aW9uLmFzc2lnbih0cngubXVsdFZlY3RvcihkaXJlY3Rpb24pLnh5eik7XG5cdFx0ZGlyZWN0aW9uLm5vcm1hbGl6ZSgpO1xuXHRcdHJldHVybiBkaXJlY3Rpb247XG5cdH1cblxuICAgIHN0YXRpYyBJc05hbigpIHtcblx0XHRyZXR1cm5cdGlzTmFOKHRoaXNbIDBdKSB8fCBpc05hTih0aGlzWyAxXSkgfHwgaXNOYU4odGhpc1sgMl0pIHx8IGlzTmFOKHRoaXNbIDNdKSB8fFxuXHRcdFx0XHRpc05hTih0aGlzWyA0XSkgfHwgaXNOYU4odGhpc1sgNV0pIHx8IGlzTmFOKHRoaXNbIDZdKSB8fCBpc05hTih0aGlzWyA3XSkgfHxcblx0XHRcdFx0aXNOYU4odGhpc1sgOF0pIHx8IGlzTmFOKHRoaXNbIDldKSB8fCBpc05hTih0aGlzWzEwXSkgfHwgaXNOYU4odGhpc1sxMV0pIHx8XG5cdFx0XHRcdGlzTmFOKHRoaXNbMTJdKSB8fCBpc05hTih0aGlzWzEzXSkgfHwgaXNOYU4odGhpc1sxNF0pIHx8IGlzTmFOKHRoaXNbMTVdKTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgTWF0NDogTWF0NFxufVxuIiwiaW1wb3J0IFZlY3RvclV0aWxzIGZyb20gXCIuL1ZlY3Rvci5qc1wiO1xuXG5jb25zdCBWZWMgPSBWZWN0b3JVdGlscy5WZWM7XG5cbmNsYXNzIFF1YXQgZXh0ZW5kcyBWZWMge1xuICAgIGNvbnN0cnVjdG9yKGEsYixjLGQpIHtcbiAgICAgICAgc3VwZXIoMCwwLDAsMCk7XG5cbiAgICAgICAgaWYgKGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgVmVjLlplcm8odGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAoYS5sZW5ndGggPT09IDQpIHtcbiAgICAgICAgICAgICAgICBWZWMuQXNzaWduKHRoaXMsIGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoYS5sZW5ndGggPT09IDkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmluaXRXaXRoTWF0cml4MyhhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGEubGVuZ3RoID09PSAxNikge1xuICAgICAgICAgICAgICAgIHRoaXMuaW5pdFdpdGhNYXRyaXg0KGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBwYXJhbWV0ZXIgaW5pdGlhbGl6aW5nIFF1YXRlcm5pb25cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYSAhPT0gdW5kZWZpbmVkICYmIGIgIT09IHVuZGVmaW5lZCAmJiBjICE9PSB1bmRlZmluZWQgJiYgZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLmluaXRXaXRoVmFsdWVzKGEsIGIsIGMsIGQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBwYXJhbWV0ZXJzIGluaXRpYWxpemluZyBRdWF0ZXJuaW9uXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaW5pdFdpdGhNYXRyaXgzKG0pIHtcbiAgICAgICAgY29uc3QgdyA9IE1hdGguc3FydCgxICsgbVswXSArIG1bNF0gKyBtWzhdKSAvIDI7XG4gICAgICAgIGNvbnN0IHc0ID0gNCAqIHc7XG4gICAgICAgIFxuICAgICAgICB0aGlzWzBdID0gKG1bN10gLSBtWzVdKSAvIHc7XG4gICAgICAgIHRoaXNbMV0gPSAobVsyXSAtIG1bNl0pIC8gdzQ7XG4gICAgICAgIHRoaXNbMl0gPSAobVszXSAtIG1bMV0pIC8gdzQ7XG4gICAgICAgIHRoaXNbM10gPSB3O1xuICAgIH1cblxuICAgIGluaXRXaXRoTWF0cml4NChtKSB7XG4gICAgICAgIGNvbnN0IHcgPSBNYXRoLnNxcnQoMSArIG1bMF0gKyBtWzVdICsgbVsxMF0pIC8gMjtcbiAgICAgICAgY29uc3QgdzQgPSA0ICogdztcbiAgICAgICAgXG4gICAgICAgIHRoaXNbMF0gPSAobVs5XSAtIG1bNl0pIC8gdztcbiAgICAgICAgdGhpc1sxXSA9IChtWzJdIC0gbVs4XSkgLyB3NDtcbiAgICAgICAgdGhpc1syXSA9IChtWzRdIC0gbVsxXSkgLyB3NDtcbiAgICAgICAgdGhpc1szXSA9IHc7XG4gICAgfVxuXG4gICAgaW5pdFdpdGhWYWx1ZXMoYWxwaGEsIHgsIHksIHopIHtcbiAgICAgICAgdGhpc1swXSA9IHggKiBNYXRoLnNpbiggYWxwaGEgLyAyICk7XG4gICAgICAgIHRoaXNbMV0gPSB5ICogTWF0aC5zaW4oIGFscGhhIC8gMiApO1xuICAgICAgICB0aGlzWzJdID0geiAqIE1hdGguc2luKCBhbHBoYSAvIDIgKTtcbiAgICAgICAgdGhpc1szXSA9IE1hdGguY29zKCBhbHBoYSAvIDIgKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgUXVhdDogUXVhdFxufVxuXG4iLCJcbmltcG9ydCB7XG4gICAgQXhpcyxcbiAgICBQSSxcbiAgICBERUdfVE9fUkFELFxuICAgIFJBRF9UT19ERUcsXG4gICAgUElfMixcbiAgICBQSV80LFxuICAgIFBJXzgsXG4gICAgVFdPX1BJLFxuICAgIEVQU0lMT04sXG4gICAgTnVtZXJpY0FycmF5LFxuICAgIE51bWVyaWNBcnJheUhpZ2hQLFxuICAgIEZMT0FUX01BWFxufSBmcm9tIFwiLi9jb25zdGFudHMuanNcIjtcblxuaW1wb3J0IHtcbiAgICBjaGVja1Bvd2VyT2ZUd28sXG4gICAgY2hlY2taZXJvLFxuICAgIGlzWmVybyxcbiAgICBlcXVhbHMsXG4gICAgZGVncmVlc1RvUmFkaWFucyxcbiAgICByYWRpYW5zVG9EZWdyZWVzLFxuICAgIHNpbixcbiAgICBjb3MsXG4gICAgdGFuLFxuICAgIGNvdGFuLFxuICAgIGF0YW4sXG4gICAgYXRhbjIsXG4gICAgcmFuZG9tLFxuICAgIHNlZWRlZFJhbmRvbSxcbiAgICBtYXgsXG4gICAgbWluLFxuICAgIGFicyxcbiAgICBzcXJ0LFxuICAgIGxlcnAsXG4gICAgc3F1YXJlXG59IGZyb20gXCIuL2Z1bmN0aW9ucy5qc1wiO1xuXG5pbXBvcnQgVmVjdG9yVXRpbHMgZnJvbSAnLi9WZWN0b3IuanMnO1xuXG5pbXBvcnQgTWF0cml4M1V0aWxzIGZyb20gXCIuL01hdHJpeDMuanNcIjtcblxuaW1wb3J0IE1hdHJpeDRVdGlscyBmcm9tICcuL01hdHJpeDQuanMnO1xuXG5pbXBvcnQgUXVhdGVybmlvbiBmcm9tIFwiLi9RdWF0ZXJuaW9uLmpzXCI7XG5cbmV4cG9ydCBjb25zdCBtYXRoID0ge1xuICAgIEF4aXMsXG4gICAgUEksXG4gICAgREVHX1RPX1JBRCxcbiAgICBSQURfVE9fREVHLFxuICAgIFBJXzIsXG4gICAgUElfNCxcbiAgICBQSV84LFxuICAgIFRXT19QSSxcbiAgICBFUFNJTE9OLFxuICAgIE51bWVyaWNBcnJheSxcbiAgICBOdW1lcmljQXJyYXlIaWdoUCxcbiAgICBGTE9BVF9NQVgsXG5cbiAgICBjaGVja1Bvd2VyT2ZUd28sXG4gICAgY2hlY2taZXJvLFxuICAgIGlzWmVybyxcbiAgICBlcXVhbHMsXG4gICAgZGVncmVlc1RvUmFkaWFucyxcbiAgICByYWRpYW5zVG9EZWdyZWVzLFxuICAgIHNpbixcbiAgICBjb3MsXG4gICAgdGFuLFxuICAgIGNvdGFuLFxuICAgIGF0YW4sXG4gICAgYXRhbjIsXG4gICAgcmFuZG9tLFxuICAgIHNlZWRlZFJhbmRvbSxcbiAgICBtYXgsXG4gICAgbWluLFxuICAgIGFicyxcbiAgICBzcXJ0LFxuICAgIGxlcnAsXG4gICAgc3F1YXJlXG59O1xuXG5leHBvcnQgY29uc3QgVmVjID0gVmVjdG9yVXRpbHMuVmVjO1xuZXhwb3J0IGNvbnN0IE1hdDMgPSBNYXRyaXgzVXRpbHMuTWF0MztcbmV4cG9ydCBjb25zdCBNYXQ0ID0gTWF0cml4NFV0aWxzLk1hdDQ7XG5leHBvcnQgY29uc3QgUXVhdCA9IFF1YXRlcm5pb24uUXVhdDtcblxuIl0sIm5hbWVzIjpbIlBJIiwidGFuIiwiVmVjIiwiTWF0MyIsIk1hdHJpeFV0aWxzIiwiTWF0NCIsIlF1YXQiXSwibWFwcGluZ3MiOiJBQUNPLE1BQU0sSUFBSSxHQUFHO0FBQ3BCLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDUixDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ0wsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUNMLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDTCxJQUFJLElBQUksRUFBRSxDQUFDLElBQUksS0FBSztBQUNwQixRQUFRLFFBQVEsSUFBSTtB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QUFjLEdBQUcsSUFBSSxHQUFHLEtBQUssSUFBSSxNQUFNLENBQUM7QUFDOUQsSUFBSSxNQUFNLEdBQUcsR0FBRyxjQUFjLEdBQUcsTUFBTSxDQUFDO0FBQ3hDO0FBQ0EsSUFBSSxPQUFPLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ25DLEVBQUM7QUFDRDtBQUNPLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSztBQUM1QixJQUFJLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3RDLEVBQUM7QUFDRDtBQUNPLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSztBQUM1QixJQUFJLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3RDLEVBQUM7QUFDRDtBQUNPLE1BQU0sR0FBRyxHQUFHLENBQUMsR0FBRyxLQUFLO0FBQzVCLElBQUksT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN0QyxFQUFDO0FBQ0Q7QUFDTyxNQUFNLElBQUksR0FBRyxDQUFDLEdBQUcsS0FBSztBQUM3QixJQUFJLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsRUFBQztBQUNEO0FBQ08sTUFBTSxJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUMsS0FBSztBQUNyQyxJQUFJLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztBQUNsRCxFQUFDO0FBQ0Q7QUFDTyxNQUFNLE1BQU0sR0FB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Q2xDLFFBQVEsS0FBSyxDQUFDO0FBQ2QsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNsQyxRQUFRLEtBQUssQ0FBQztBQUNkLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbEMsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNsQyxZQUFZLE1BQU07QUFDbEIsUUFBUTtBQUNSLFlBQVksTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDckUsU0FBUztBQUNULFFBQVEsT0FBTyxJQUFJLENBQUM7QUFDcEIsS0FBSztBQUNMO0FBQ0EsSUFBSSxNQUFNLENBQUMsR0FBRyxFQUFFO0FBQ2hCLFFBQVEsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ25DLFFBQVEsUUFBUSxJQUFJLENBQUMsTUFBTTtBQUMzQixRQUFRLEtBQUssQ0FBQztBQUNkLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM3QixRQUFRLEtBQUssQ0FBQztBQUNkLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM3QixRQUFRLEtBQUssQ0FBQztBQUNkLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM3QixZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDN0IsWUFBWSxNQUFNO0FBQ2xCLFFBQVE7QUFDUixZQUFZLE1BQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3JFLFNBQVM7QUFDVCxLQUFLO0FBQ0w7QUFDQSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxHQUFHLElBQUksRUFBRTtBQUNsQyxRQUFRLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDL0IsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3hCLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN4QixTQUFTO0FBQ1QsYUFBYSxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLEVBQUU7QUFDbEQsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3hCLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN4QixZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDeEIsU0FBUztBQUNULGFBQWEsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxFQUFFO0FBQ2xELFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN4QixZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDeEIsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3hCLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN4QixTQUFTO0FBQ1QsYUFBYTtBQUNiLFlBQVksTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25ILFNBQVM7QUFDVCxLQUFLO0FBQ0w7QUFDQSxJQUFJLEtBQUssQ0FBQyxDQUFDLEVBQUU7QUFDYixRQUFRLFFBQVEsSUFBSSxDQUFDLE1BQU07QUFDM0IsUUFBUSxLQUFLLENBQUM7QUFDZCxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2xDLFFBQVEsS0FBSyxDQUFDO0FBQ2QsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNsQyxRQUFRLEtBQUssQ0FBQztBQUNkLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbEMsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNsQyxZQUFZLE1BQU07QUFDbEIsUUFBUTtBQUNSLFlBQVksTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLHFCQUFxQixHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDbEUsU0FBUztBQUNULFFBQVEsT0FBTyxJQUFJLENBQUM7QUFDcEIsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLENBQUMsR0FBRztBQUNaLFFBQVEsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkIsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLENBQUMsR0FBRztBQUNaLFFBQVEsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkIsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLENBQUMsR0FBRztBQUNaLFFBQVEsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkIsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLENBQUMsR0FBRztBQUNa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QUFDZixRQUFRLEtBQUssQ0FBQztBQUNkLFlBQVksT0FBTyxJQUFJLFlBQVksQ0FBQztBQUNwQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMzQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMzQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMzQyxhQUFhLENBQUMsQ0FBQztBQUNmLFFBQVEsS0FBSyxDQUFDO0FBQ2QsWUFBWSxPQUFPLElBQUksWUFBWSxDQUFDO0FBQ3BDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzNDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzNDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzNDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzNDLGFBQWEsQ0FBQyxDQUFDO0FB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TyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3hELFFBQVEsS0FBSyxDQUFDO0FBQ2QsWUFBWSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN0RSxRQUFRLEtBQUssQ0FBQztBQUNkLFlBQVksT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwRixRQUFRO0FBQ1IsWUFBWSxNQUFNLElBQUksS0FBSyxDQUFDLENBQUMscUJBQXFCLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNsRSxTQUFTO0FBQ1QsS0FBSztBQUNMO0FBQ0EsSUFBSSxPQUFPLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzNCLFFBQVEsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2hDLFFBQVEsT0FBT0EsS0FBRyxDQUFDLFNBQVMsQ0FBQ0EsS0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUM3QyxLQUFLO0FBQ0w7QUFDQSxJQUFJLE9BQU8sR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDdEIsUUFBUSxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDaEMsUUFBUSxRQUFRLEVBQUUsQ0FBQyxNQUFNO0FBQ3pCLFFBQVEsS0FBSyxDQUFDO0FBQ2QsWUFBWSxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqRCxRQUFRLEtBQUssQ0FBQztBQUNkLFlBQVksT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqRSxRQUFRLEtBQUssQ0FBQztBQUNkLFlBQVksT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pGLFFBQVE7QUFDUixZQUFZLE1BQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxxQkFBcUIsR0FBRyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ25FLFNBQVM7QUFDVCxLQUFLO0FBQ0w7QUFDQSxJQUFJLE9BQU8sS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDeEIsUUFBUSxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDaEMsUUFBUSxRQUFRLEVBQUUsQ0FBQyxNQUFNO0FBQ3pCLFFBQVEsS0FBSyxDQUFDO0FBQ2QsWUFBWSxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqRCxRQUFRLEtBQUssQ0FBQztBQUNkLFlBQVksT0FBTyxJQUFJLFlBQVksQ0FBQztBQUNwQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUM3QyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUM3QyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUM3QyxhQUFhLENBQUMsQ0FBQztBQUNmLFFBQVE7QUFDUixZQUFZLE1BQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyx1Q0FBdUMsR0FBRyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3JGLFNBQVM7QUFDVCxLQUFLO0FBQ0w7QUFDQSxJQUFJLE9BQU8sVUFBVSxDQUFDLENBQUMsRUFBRTtBQUN6QixRQUFRLE1BQU0sQ0FBQyxHQUFHQSxLQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25DLFFBQVEsUUFBUSxDQUFDLENBQUMsTUFBTTtBQUN4QixRQUFRLEtBQUssQ0FBQztBQUNkLFlBQVksT0FBTyxJQUFJLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDNUQsUUFBUSxLQUFLLENBQUM7QUFDZCxZQUFZLE9BQU8sSUFBSSxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEUsUUFBUSxLQUFLLENBQUM7QUFDZCxZQUFZLE9BQU8sSUFBSSxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7QUFDL0UsUUFBUTtBQUNSLFlBQVksTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLHFCQUFxQixHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDbEUsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNBLElBQUksT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUNyQixRQUFRLFFBQVEsQ0FBQyxDQUFDLE1BQU07QUFDeEIsUUFBUSxLQUFLLENBQUM7QUFDZCxZQUFZLE9BQU8sSUFBSSxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzVELFFBQVEsS0FBSyxDQUFDO0FBQ2QsWUFBWSxPQUFPLElBQUksWUFBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENB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QUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM5QyxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM5QyxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM5QyxRQUFRLE9BQU8sSUFBSSxDQUFDO0FBQ3BCLEtBQUs7QUFDTDtBQUNBLElBQUksSUFBSSxHQUFHO0FBQ1gsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDOUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDOUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDOUMsUUFBUSxPQUFPLElBQUksQ0FBQztBQUNwQixLQUFLO0FBQ0w7QUFDQSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEVBQUU7QUFDWCxRQUFRLE9BQU8sSUFBSUQsS0FBRztBQUN0QixZQUFZLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxD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QyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0QsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEQsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDbkQsU0FBUztBQUNULGFBQWE7QUFDYixZQUFZLE1BQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDLENBQUM7QUFDdEUsU0FBUztBQUNULFFBQVEsT0FBTyxJQUFJLENBQUM7QUFDcEIsS0FBSztBQUNMO0FBQ0EsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDcEIsRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLElBQUlBLEtBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2RSxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsSUFBSUEsS0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZFLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxJQUFJQSxLQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDakQsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDakQsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDakQsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkLEVBQUU7QUFDRjtBQUNBLElBQUksUUFBUSxHQUFHO0FBQ2YsUUFBUSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0IsUUFBUSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0IsUUFBUSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0IsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFCLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxQixRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUIsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3JCLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNyQixRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDckIsUUFBUSxPQUFPLElBQUksQ0FBQztBQUNwQixLQUFLO0FBQ0w7QUFDQSxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUU7QUFDWixRQUFRLElBQUksT0FBTyxDQUFDLENBQUMsS0FBSyxRQUFRLEVBQUU7QUFDcEMsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDckQsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDckQsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDckQsU0FBUztBQUNULGFBQWEsSUFBSSxDQUFDLFlBQVksWUFBWSxJQUFJLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQzlELFlBQVksTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuQyxZQUFZLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkMsWUFBWSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25DLFlBQVksTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoQyxZQUFZLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEMsWUFBWSxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hDO0FBQ0EsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUdBLEtBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHQSxLQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBR0EsS0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDekYsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUdBLEtBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHQSxLQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBR0EsS0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDekYsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUdBLEtBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxD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Q0FBQyxHQUFHQSxNQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDdEM7QUFDQSxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUlELEtBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVJLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSUEsS0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMs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QyxDQUFDLENBQUMsRUFBRTtBQUN2QixRQUFRLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVELGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDN0QsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlELEtBQUs7QUFDTDtBQUNBLElBQUksT0FBTyxLQUFLLENBQUMsQ0FBQyxFQUFFO0FBQ3BCLFFBQVEsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDeEQsZ0JBQWdCLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN6RCxnQkFBZ0IsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUQsS0FBSztBQUNMLENBQ0E7QUFDQSxtQkFBZTtBQUNmLElBQUksSUFBSSxFQUFFQyxNQUFJO0FBQ2Q7O0FDbE9BLE1BQU1ELEtBQUcsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDO0FBQzVCLE1BQU1DLE1BQUksR0FBR0MsWUFBVyxDQUFDLElBQUksQ0FBQztBQUM5QjtBQUNBLE1BQU1DLE1BQUksU0FBUyxZQUFZLENBQUM7QUFDaEMsSUFBSSxXQUFXLEdBQUc7QUFDbEIsUUFBUSxNQUFNLFFBQVEsR0FBRztBQUN6QixZQUFZLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDdEIsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ3RCLFlBQVksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUN0QixZQUFZLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDdEIsU0FBUyxDQUFDO0FBQ1Y7QUFDQTtBQUNBLFFBQVEsSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUNwQyxZQUFZLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkMsWUFBWSxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLFlBQVksUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QztBQUNBLFlBQVksUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QyxZQUFZLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkMsWUFBWSxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDO0FBQ0EsWUFBWSxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLFlBQVksUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QyxZQUFZLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDeEM7QUFDQSxZQUFZLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDN0IsU0FBUztBQUNULGFBQWEsSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUN0RSxZQUFZLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0MsWUFBWSxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNDLFlBQVksUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzQztBQUNBLFlBQVksUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzQyxZQUFZLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0MsWUFBWSxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNDO0FBQ0EsWUFBWSxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNDLFlBQVksUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzQyxZQUFZLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0M7QUFDQSxZQUFZLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDN0IsU0FBUztBQUNUO0FBQ0EsYUFBYSxJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssRUFBRSxFQUFFO0FBQzFDLFlBQVksUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN4QyxZQUFZLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDekMsWUFBWSxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ3pDLFlBQVksUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUN6QztBQUNBLFlBQVksUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUN6QyxZQUFZLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDekMsWUFBWSxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ3pDLFlBQVksUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUN6QztBQUNBLFlBQVksUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUN6QyxZQUFZLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDekMsWUFBWSxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3pDLFlBQVksUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN6QztBQUNBLFlBQVksUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN6QyxZQUFZLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDekMsWUFBWSxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3pDLFlBQVksUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN6QyxTQUFTO0FBQ1QsYUFBYSxJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssRUFBRSxFQUFFO0FBQ3ZFLFlBQVksUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzQyxZQUFZLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDNUMsWUFBWSxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQzVDLFlBQVksUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUM1QztBQUNBLFlBQVksUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUM1QyxZQUFZLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDNUMsWUFBWSxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQzVDLFlBQVksUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUM1QztBQUNBLFlBQVksUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUM1QyxZQUFZLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDNUMsWUFBWSxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzVDLFlBQVksUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM1QztBQUNBLFlBQVksUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM1QyxZQUFZLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDNUMsWUFBWSxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzVDLFlBQVksUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM1QyxTQUFTO0FBQ1QsYUFBYSxJQUFJLFNBQVMsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO0FBQ3hDLFlBQVksTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLDZDQUE2QyxDQUFDLENBQUMsQ0FBQztBQUM3RSxTQUFTO0FBQ1Q7QUFDQSxRQUFRLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN4QixLQUFLO0FBQ0w7QUFDQTtBQUNBLElBQUksUUFBUSxHQUFHO0FBQ2YsUUFBUSxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBQztBQUM5RCxRQUFRLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFDO0FBQzlELFFBQVEsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUM7QUFDOUQsUUFBUSxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBQztBQUM5RCxRQUFRLE9BQU8sSUFBSSxDQUFDO0FBQ3BCLEtBQUs7QUFDTDtBQUNBLElBQUksSUFBSSxHQUFHO0FBQ1gsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3pELEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN6RCxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDekQsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3pELEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZCxFQUFFO0FBQ0Y7QUFDQSxJQUFJLFdBQVcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUU7QUFDbkQsRUFBRSxJQUFJLEtBQUssR0FBRyxHQUFHLENBQUMsSUFBSSxHQUFHLEVBQUUsR0FBRyxLQUFLLENBQUMsR0FBRyxTQUFTLENBQUM7QUFDakQsRUFBRSxJQUFJLFdBQVcsR0FBRyxLQUFLLEdBQUcsTUFBTSxDQUFDO0FBQ25DLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN6RSxRQUFRLE9BQU8sSUFBSSxDQUFDO0FBQ3BCLEVBQUU7QUFDRjtBQUNBLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFO0FBQ3hELEVBQUUsSUFBSSxDQUFDLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQztBQUN2QixFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUM7QUFDckIsRUFBRSxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDO0FBQzdCO0FBQ0EsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJSCxLQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzFELEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSUEsS0FBRyxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUMxRCxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUlBLEtBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN6RixFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUlBLEtBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN0RTtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZCxFQUFFO0FBQ0Y7QUFDQSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRTtBQUN0RCxFQUFFLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7QUFDckIsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDO0FBQ3JCLEVBQUUsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FDNUI7QUFDQSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzdELEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDN0QsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzdELEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxD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QixDQUFDLElBQUksR0FBRyxHQUFHLEVBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUM5QixDQUFDLElBQUksR0FBRyxHQUFHLEVBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUM5QixDQUFDLElBQUksR0FBRyxHQUFHLEVBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUM5QixDQUFDLElBQUksR0FBRyxHQUFHLEVBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUM5QixDQUFDLElBQUksR0FBRyxHQUFHLEVBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUM5QixDQUFDLElBQUksR0FBRyxHQUFHLEVBQUUsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTtBQUMvQixDQUFDLElBQUksR0FBRyxHQUFHLEVBQUUsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTtBQUMvQixDQUFDLElBQUksR0FBRyxHQUFHLEVBQUUsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTtBQUMvQixDQUFDLElBQUksR0FBRyxHQUFHLEVBQUUsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTtBQUMvQixDQUFDLElBQUksR0FBRyxHQUFHLEVBQUUsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTtBQUMvQixDQUFDLElBQUksR0FBRyxHQUFHLEVBQUUsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTtBQUMvQjtBQUNBLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQzVCLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQzVCLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQzVCLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQzVCLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQzVCLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQzVCLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQzVCLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQzVCLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQzVCLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQzVCLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQzdCLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQzdCLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQzdCLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQzdCLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQzdCLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQzdCO0FBQ0EsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQ1gsUUFBUSxPQUFPLElBQUlBLEtBQUc7QUFDdEIsWUFBWSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN2QixZQUFZLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMzQixZQUFZLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMzQixZQUFZLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDN0IsS0FBSztBQUNMO0FBQ0EsSUFBSSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxHQUFHLElBQUksRUFBRTtBQUMvQyxRQUFRLElBQUksQ0FBQyxZQUFZLFlBQVksSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRTtBQUN0RCxZQUFZLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BDLFlBQVksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BDLFlBQVksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxD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QUFHLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbkUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2hFLEdBQUc7QUFDSCxPQUFPLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUU7QUFDekIsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3pFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN6RSxHQUFHLElBQUksQ0FBQyxD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QUFFLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUM1RCxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDN0QsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxVQUFVLEdBQUc7QUFDZCxFQUFFLE9BQU8sSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDakUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUM1RCxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQzVELElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM3RCxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0EsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDcEIsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDRyxNQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzQyxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2QsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ3hCLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQ0EsTUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9DLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZCxFQUFFO0FBQ0Y7QUFDQSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUNoQixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUNBLE1BQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JDLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZCxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLFFBQVEsR0FBRztBQUNmLFFBQVEsUUFBUSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ3hFLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ3hFLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ3hFLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDekUsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQ3BCLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSUgsS0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JFLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSUEsS0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JFLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSUEsS0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3RFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2pELEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2pELEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2xELEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZCxFQUFFO0FBQ0Y7QUFDQSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUN0QixFQUFFLElBQUksT0FBTyxHQUFHLENBQUMsRUFBRSxRQUFRLEVBQUU7QUFDN0IsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ2xCLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNoQixHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDaEIsR0FBRztBQUNILE9BQU87QUFDUCxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3BCLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDcEIsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNwQixHQUFHO0FBQ0gsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkLEVBQUU7QUFDRjtBQUNBO0FBQ0EsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFO0FBQ1osRUFBRSxJQUFJLE9BQU8sQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFO0FBQzNCLEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM5RCxHQUFHLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDOUQsR0FBRyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzlELEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM5RCxHQUFHLE9BQU8sSUFBSSxDQUFDO0FBQ2YsR0FBRztBQUNIO0FBQ0EsUUFBUSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9CLFFBQVEsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvQixRQUFRLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDL0IsUUFBUSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9CLFFBQVEsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1QixRQUFRLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUIsUUFBUSxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVCLFFBQVEsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1QjtBQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHQSxLQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBR0EsS0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUdBLEtBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHQSxLQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUN2SCxRQUFRLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBR0EsS0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUdBLEtBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHQSxLQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBR0EsS0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDdkgsUUFBUSxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUdBLEtBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHQSxLQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBR0EsS0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUdBLEtBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZILFFBQVEsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHQSxLQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBR0EsS0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUdBLEtBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHQSxLQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUN2SDtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZCxFQUFFO0FBQ0Y7QUFDQSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUU7QUFDakIsUUFBUSxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFO0FBQzFCLFlBQVksTUFBTSxJQUFJLEtBQUssQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDO0FBQzVFLFNBQVM7QUFDVDtBQUNBLEVBQUUsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25CLEVBQUUsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25CLEVBQUUsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25CLEVBQUUsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUN6QztBQUNBLEVBQUUsT0FBTyxJQUFJQSxLQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDekUsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUM3RCxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDO0FBQzdELE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQy9ELEVBQUU7QUFDRjtBQUNBLENBQUMsTUFBTSxHQUFHO0FBQ1YsRUFBRSxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3JFLFdBQVcsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDeEUsV0FBVyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztBQUN6RSxXQUFXLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDMUU7QUFDQSxLQUFLLE1BQU0sR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDdEMsV0FBVyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztBQUN0QyxXQUFXLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO0FBQ3RDLFdBQVcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDdEMsV0FBVyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztBQUN0QyxXQUFXLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO0FBQ3RDLFdBQVcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDdEMsV0FBVyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztBQUN0QyxXQUFXLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO0FBQ3RDLFdBQVcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDdEMsV0FBVyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztBQUN0QyxXQUFXLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFDdkM7QUFDQSxLQUFLLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQ3JGO0FBQ0EsS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFO0FBQ2YsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDZixNQUFNO0FBQ04sT0FBTztBQUNQLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFDbkI7QUFDQSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQztBQUN2RCxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQztBQUN2RCxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQztBQUN2RCxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQztBQUN2RCxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQztBQUN2RCxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQztBQUN2RCxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQztBQUN2RCxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQztBQUN2RCxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQztBQUN2RCxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQztBQUN2RCxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQztBQUN4RCxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQztBQUN4RCxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQztBQUN4RCxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQztBQUN4RCxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQztBQUN4RCxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQztBQUN4RCxHQUFHO0FBQ0g7QUFDQSxRQUFRLE9BQU8sSUFBSSxDQUFDO0FBQ3BCLEVBQUU7QUFDRjtBQUNBLENBQUMsUUFBUSxHQUFHO0FBQ1osRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJQSxLQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDM0QsRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJQSxLQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDM0QsRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJQSxLQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDM0QsRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJQSxLQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDM0Q7QUFDQSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3JCLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDckIsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUNyQixFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3JCLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZCxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksT0FBTyxZQUFZLEdBQUc7QUFDMUIsUUFBUSxNQUFNLENBQUMsR0FBRyxJQUFJRyxNQUFJLEVBQUUsQ0FBQztBQUM3QixRQUFRLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQzVCLEtBQUs7QUFDTDtBQUNBLENBQUMsT0FBTyxRQUFRLEdBQUc7QUFDbkIsRUFBRSxNQUFNLENBQUMsR0FBRyxJQUFJQSxNQUFJLEVBQUUsQ0FBQztBQUN2QixFQUFFLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ2xCLEVBQUU7QUFDRjtBQUNBLENBQUMsT0FBTyxrQkFBa0IsQ0FBQyxDQUFDLEVBQUU7QUFDOUIsRUFBRSxNQUFNLENBQUMsR0FBR0EsTUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0FBQ2hDO0FBQ0EsUUFBUSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJSCxLQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDL0ksUUFBUSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJQSxLQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakosUUFBUSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJQSxLQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDL0ksUUFBUSxPQUFPLENBQUMsQ0FBQztBQUNqQixFQUFFO0FBQ0Y7QUFDQSxJQUFJLE9BQU8sZUFBZSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ3BDLEVBQUUsSUFBSSxDQUFDLFlBQVksWUFBWSxJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO0FBQ2xELEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNaLEdBQUcsQ0FBQyxHQUFHLENB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LENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNiLEdBQUc7QUFDSCxFQUFFO0FBQ0Y7QUFDQTtBQUNBLElBQUksT0FBTyxlQUFlLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFO0FBQzlELEVBQUUsT0FBTyxDQUFDLElBQUlBLE1BQUksRUFBRSxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUNyRSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLE9BQU8sV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFO0FBQ25FLEVBQUUsT0FBTyxDQUFDLElBQUlBLE1BQUksRUFBRSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQzdFLEVBQUU7QUFDRjtBQUNBLENBQUMsT0FBTyxTQUFTLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUU7QUFDakUsRUFBRSxPQUFPLENBQUMsSUFBSUEsTUFBSSxFQUFFLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDM0UsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxPQUFPLFVBQVUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRTtBQUN2QyxFQUFFLE9BQU8sQ0FBQyxJQUFJQSxNQUFJLEVBQUUsRUFB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SztBQUNMO0FBQ0EsSUFBSSxlQUFlLENBQUMsQ0FBQyxFQUFFO0FBQ3ZCLFFBQVEsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDeEQsUUFBUSxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3pCO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNwQyxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3JDLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDckMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3BCLEtBQUs7QUFDTDtBQUNBLElBQUksZUFBZSxDQUFDLENBQUMsRUFBRTtBQUN2QixRQUFRLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3pELFFBQVEsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN6QjtBQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDcEMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNyQyxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3JDLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNwQixLQUFLO0FBQ0w7QUFDQSxJQUFJLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDbkMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxHQUFHLENBQUMsRUFBRSxDQUFDO0FBQzVDLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUM1QyxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLEdBQUcsQ0FBQyxFQUFFLENBQUM7QUFDNUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLEdBQUcsQ0FBQyxFQUFFLENBQUM7QUFDeEMsUUFBUSxPQUFPLElBQUksQ0FBQztBQUNwQixLQUFLO0FBQ0wsQ0FBQztBQUNEO0FBQ0EsaUJBQWU7QUFDZixJQUFJLElBQUksRUFBRUksTUFBSTtBQUNkOztBQ2pCWSxNQUFDLElBQUksR0FBRztBQUNwQixJQUFJLElBQUk7QUFDUixRQUFJTixJQUFFO0FBQ04sSUFBSSxVQUFVO0FBQ2QsSUFBSSxVQUFVO0FBQ2QsSUFBSSxJQUFJO0FBQ1IsSUFBSSxJQUFJO0FBQ1IsSUFBSSxJQUFJO0FBQ1IsSUFBSSxNQUFNO0FBQ1YsSUFBSSxPQUFPO0FBQ1gsSUFBSSxZQUFZO0FBQ2hCLElBQUksaUJBQWlCO0FBQ3JCLElBQUksU0FBUztBQUNiO0FBQ0EsSUFBSSxlQUFlO0FBQ25CLElBQUksU0FBUztBQUNiLElBQUksTUFBTTtBQUNWLElBQUksTUFBTTtBQUNWLElBQUksZ0JBQWdCO0FBQ3BCLElBQUksZ0JBQWdCO0FBQ3BCLElBQUksR0FBRztBQUNQLElBQUksR0FBRztBQUNQLFNBQUlDLEtBQUc7QUFDUCxJQUFJLEtBQUs7QUFDVCxJQUFJLElBQUk7QUFDUixJQUFJLEtBQUs7QUFDVCxJQUFJLE1BQU07QUFDVixJQUFJLFlBQVk7QUFDaEIsSUFBSSxHQUFHO0FBQ1AsSUFBSSxHQUFHO0FBQ1AsSUFBSSxHQUFHO0FBQ1AsSUFBSSxJQUFJO0FBQ1IsSUFBSSxJQUFJO0FBQ1IsSUFBSSxNQUFNO0FBQ1YsRUFBRTtBQUNGO0FBQ1ksTUFBQyxHQUFHLEdBQUcsV0FBVyxDQUFDLElBQUk7QUFDdkIsTUFBQyxJQUFJLEdBQUcsWUFBWSxDQUFDLEtBQUs7QUFDMUIsTUFBQyxJQUFJLEdBQUcsWUFBWSxDQUFDLEtBQUs7QUFDMUIsTUFBQyxJQUFJLEdBQUcsVUFBVSxDQUFDOzs7OyJ9
