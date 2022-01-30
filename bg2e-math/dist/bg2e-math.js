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
        if (a?.length>=3) {
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
        if (a?.length>=3) {
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
        return	isZero(v[0]) && isZero(v[1]) && isZero(v[2]) &&
                isZero(v[3]) && isZero(v[4]) && isZero(v[5]) &&
                isZero(v[6]) && isZero(v[7]) && isZero(v[8]);
    }
    
    static IsIdentity(m) {
        return	equals(v[0], 1) && isZero(v[1]) && isZero(v[2]) &&
                isZero(v[3]) && equals(v[4], 1) && isZero(v[5]) &&
                isZero(v[6]) && isZero(v[7]) && equals(v[8], 1);
    }

    static GetScale(m) {
        return new Vec$3(
            Vec$3.Magnitude(new Vec$3(m[0], m[3], m[6])),
            Vec$3.Magnitude(new Vec$3(m[1], m[4], m[7])),
            Vec$3.Magnitude(new Vec$3(m[2], m[5], m[8]))
        );
    }

    static Equals(a,b) {
        return	equals(a[0], b[0]) && equals(a[1], b[1])  && equals(a[2], b[2]) &&
                equals(a[3], b[3]) && equals(a[4], b[4])  && equals(a[5], b[5]) &&
                equals(a[6], b[6]) && equals(a[7], b[7])  && equals(a[8], b[8]);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmcyZS1tYXRoLmpzIiwic291cmNlcyI6WyIuLi9zcmMvanMvY29uc3RhbnRzLmpzIiwiLi4vc3JjL2pzL2Z1bmN0aW9ucy5qcyIsIi4uL3NyYy9qcy9WZWN0b3IuanMiLCIuLi9zcmMvanMvTWF0cml4My5qcyIsIi4uL3NyYy9qcy9NYXRyaXg0LmpzIiwiLi4vc3JjL2pzL1F1YXRlcm5pb24uanMiLCIuLi9zcmMvanMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiXG5leHBvcnQgY29uc3QgQXhpcyA9IHtcblx0Tk9ORTogMCxcblx0WDogMSxcblx0WTogMixcblx0WjogMyxcbiAgICBuYW1lOiAoYXhpcykgPT4ge1xuICAgICAgICBzd2l0Y2ggKGF4aXMpIHtcbiAgICAgICAgY2FzZSBBeGlzLk5PTkU6XG4gICAgICAgICAgICByZXR1cm4gXCJOT05FXCI7XG4gICAgICAgIGNhc2UgQXhpcy5YOlxuICAgICAgICAgICAgcmV0dXJuIFwiWFwiO1xuICAgICAgICBjYXNlIEF4aXMuWTpcbiAgICAgICAgICAgIHJldHVybiBcIllcIjtcbiAgICAgICAgY2FzZSBBeGlzLlo6XG4gICAgICAgICAgICByZXR1cm4gXCJaXCI7XG4gICAgICAgIGNhc2UgQXhpcy5XOlxuICAgICAgICAgICAgcmV0dXJuIFwiV1wiO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIFwiVU5LTk9XTlwiXG4gICAgICAgIH07XG4gICAgfVxufTtcblxuZXhwb3J0IGNvbnN0IFBJID0gMy4xNDE1OTI2NTM1ODk3OTM7XG5leHBvcnQgY29uc3QgREVHX1RPX1JBRCA9IDAuMDE3NDUzMjkyNTE5OTQ7XG5leHBvcnQgY29uc3QgUkFEX1RPX0RFRyA9IDU3LjI5NTc3OTUxMzA4MjMzO1xuZXhwb3J0IGNvbnN0IFBJXzIgPSAxLjU3MDc5NjMyNjc5NDg5NjY7XG5leHBvcnQgY29uc3QgUElfNCA9IDAuNzg1Mzk4MTYzMzk3NDQ4O1xuZXhwb3J0IGNvbnN0IFBJXzggPSAwLjM5MjY5OTA4MTY5ODcyNDtcbmV4cG9ydCBjb25zdCBUV09fUEkgPSA2LjI4MzE4NTMwNzE3OTU4NjtcbmV4cG9ydCBjb25zdCBFUFNJTE9OID0gMC4wMDAwMDAxO1xuXG4vLyBEZWZhdWx0IGFycmF5OiAzMiBiaXRzXG5leHBvcnQgY29uc3QgTnVtZXJpY0FycmF5ID0gRmxvYXQzMkFycmF5O1xuZXhwb3J0IGNvbnN0IE51bWVyaWNBcnJheUhpZ2hQID0gRmxvYXQ2NEFycmF5O1xuZXhwb3J0IGNvbnN0IEZMT0FUX01BWCA9IDMuNDAyODIzZTM4O1xuIiwiXG5pbXBvcnQge1xuICAgIEVQU0lMT04sXG4gICAgREVHX1RPX1JBRCxcbiAgICBSQURfVE9fREVHXG59IGZyb20gJy4vY29uc3RhbnRzLmpzJztcblxubGV0IHNfYmdfbWF0aF9zZWVkID0gRGF0ZS5ub3coKTtcblxuZXhwb3J0IGNvbnN0IGNoZWNrUG93ZXJPZlR3byA9IChuKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBuICE9PSAnbnVtYmVyJykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gbiAmJiAobiAmIChuIC0gMSkpID09PSAwO1xuICAgIH0gIFxufVxuXG5leHBvcnQgY29uc3QgY2hlY2taZXJvID0gKHYpID0+IHtcbiAgICByZXR1cm4gdj4tRVBTSUxPTiAmJiB2PEVQU0lMT04gPyAwOnY7XG59XG5cbmV4cG9ydCBjb25zdCBpc1plcm8gPSAodikgPT4ge1xuICAgIHJldHVybiBjaGVja1plcm8odikgPT09IDA7XG59XG5cbmV4cG9ydCBjb25zdCBlcXVhbHMgPSAoYSxiKSA9PiB7XG4gICAgcmV0dXJuIE1hdGguYWJzKGEgLSBiKSA8IEVQU0lMT047XG59XG5cbmV4cG9ydCBjb25zdCBkZWdyZWVzVG9SYWRpYW5zID0gKGQpID0+IHtcbiAgICByZXR1cm4gTWF0aC5mcm91bmQoY2hlY2taZXJvKGQgKiBERUdfVE9fUkFEKSk7XG59XG5cbmV4cG9ydCBjb25zdCByYWRpYW5zVG9EZWdyZWVzID0gKHIpID0+IHtcbiAgICByZXR1cm4gTWF0aC5mcm91bmQoY2hlY2taZXJvKHIgKiBSQURfVE9fREVHKSk7XG59XG5cbmV4cG9ydCBjb25zdCBzaW4gPSAodmFsKSA9PiB7XG4gICAgcmV0dXJuIE1hdGguZnJvdW5kKGNoZWNrWmVybyhNYXRoLnNpbih2YWwpKSk7XG59XG5cbmV4cG9ydCBjb25zdCBjb3MgPSAodmFsKSA9PiB7XG4gICAgcmV0dXJuIE1hdGguZnJvdW5kKGNoZWNrWmVybyhNYXRoLmNvcyh2YWwpKSk7XG59XG5cbmV4cG9ydCBjb25zdCB0YW4gPSAodmFsKSA9PiB7XG4gICAgcmV0dXJuIE1hdGguZnJvdW5kKGNoZWNrWmVybyhNYXRoLnRhbih2YWwpKSk7XG59XG5cbmV4cG9ydCBjb25zdCBjb3RhbiA9ICh2YWwpID0+IHtcbiAgICByZXR1cm4gTWF0aC5mcm91bmQoY2hlY2taZXJvKDEuMCAvIHRhbih2YWwpKSk7XG59XG5cbmV4cG9ydCBjb25zdCBhdGFuID0gKHZhbCkgPT4ge1xuICAgIHJldHVybiBNYXRoLmZyb3VuZChjaGVja1plcm8oTWF0aC5hdGFuKHZhbCkpKTtcbn1cblxuZXhwb3J0IGNvbnN0IGF0YW4yID0gKGksIGopID0+IHtcbiAgICByZXR1cm4gTWF0aC5mcm91bmQoY2hlY2taZXJvKE1hdGguYXRhbjJmKGksIGopKSk7XG59XG5cbmV4cG9ydCBjb25zdCByYW5kb20gPSAoKSA9PiB7XG4gICAgcmV0dXJuIE1hdGgucmFuZG9tKCk7XG59XG5cbmV4cG9ydCBjb25zdCBzZWVkZWRSYW5kb20gPSAoKSA9PiB7XG4gICAgY29uc3QgbWF4ID0gMTtcbiAgICBjb25zdCBtaW4gPSAwO1xuIFxuICAgIHNfYmdfbWF0aF9zZWVkID0gKHNfYmdfbWF0aF9zZWVkICogOTMwMSArIDQ5Mjk3KSAlIDIzMzI4MDtcbiAgICBjb25zdCBybmQgPSBzX2JnX21hdGhfc2VlZCAvIDIzMzI4MDtcbiBcbiAgICByZXR1cm4gbWluICsgcm5kICogKG1heCAtIG1pbik7XG59XG5cbmV4cG9ydCBjb25zdCBtYXggPSAoYSxiKSA9PiB7XG4gICAgcmV0dXJuIE1hdGguZnJvdW5kKE1hdGgubWF4KGEsYikpO1xufVxuXG5leHBvcnQgY29uc3QgbWluID0gKGEsYikgPT4ge1xuICAgIHJldHVybiBNYXRoLmZyb3VuZChNYXRoLm1pbihhLGIpKTtcbn1cblxuZXhwb3J0IGNvbnN0IGFicyA9ICh2YWwpID0+IHtcbiAgICByZXR1cm4gTWF0aC5mcm91bmQoTWF0aC5hYnModmFsKSk7XG59XG5cbmV4cG9ydCBjb25zdCBzcXJ0ID0gKHZhbCkgPT4ge1xuICAgIHJldHVybiBNYXRoLmZyb3VuZChNYXRoLnNxcnQodmFsKSk7XG59XG5cbmV4cG9ydCBjb25zdCBsZXJwID0gKGZyb20sIHRvLCB0KSA9PiB7XG4gICAgcmV0dXJuIE1hdGguZnJvdW5kKCgxLjAgLSB0KSAqIGZyb20gKyB0ICogdG8pO1xufVxuXG5leHBvcnQgY29uc3Qgc3F1YXJlID0gKG4pID0+IHtcbiAgICByZXR1cm4gTWF0aC5mcm91bmQobiAqIG4pO1xufVxuIiwiaW1wb3J0IHsgbWF0aCB9IGZyb20gXCIuLi8uLi9kaXN0L2JnMmUtbWF0aC5qc1wiO1xuaW1wb3J0IHsgTnVtZXJpY0FycmF5IH0gZnJvbSBcIi4vY29uc3RhbnRzLmpzXCI7XG5pbXBvcnQgeyBpc1plcm8sIGVxdWFscyB9IGZyb20gXCIuL2Z1bmN0aW9ucy5qc1wiO1xuXG5jb25zdCBjaGVja0VxdWFsTGVuZ3RoID0gKHYxLHYyKSA9PiB7XG4gICAgaWYgKHYxLmxlbmd0aCE9djIubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIGxlbmd0aCBpbiBvcGVyYXRpb25gKTtcbn1cblxuY2xhc3MgVmVjIGV4dGVuZHMgTnVtZXJpY0FycmF5IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHNbMF0gaW5zdGFuY2VvZiBOdW1lcmljQXJyYXkgJiYgXG4gICAgICAgICAgICAgICAgYXJndW1lbnRzWzBdLmxlbmd0aCA9PT0gMiAmJlxuICAgICAgICAgICAgICAgIHR5cGVvZihhcmd1bWVudHNbMV0pID09PSBcIm51bWJlclwiXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBzdXBlcihbIGFyZ3VtZW50c1swXVswXSwgYXJndW1lbnRzWzBdWzFdLCBhcmd1bWVudHNbMV1dKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGFyZ3VtZW50c1swXSBpbnN0YW5jZW9mIE51bWVyaWNBcnJheSAmJiBcbiAgICAgICAgICAgICAgICBhcmd1bWVudHNbMF0ubGVuZ3RoID09PSAzICYmXG4gICAgICAgICAgICAgICAgdHlwZW9mKGFyZ3VtZW50c1sxXSkgPT09IFwibnVtYmVyXCJcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHN1cGVyKFsgYXJndW1lbnRzWzBdWzBdLCBhcmd1bWVudHNbMF1bMV0sIGFyZ3VtZW50c1swXVsyXSwgYXJndW1lbnRzWzFdXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh0eXBlb2YoYXJndW1lbnRzWzBdKSA9PT0gXCJudW1iZXJcIiAmJlxuICAgICAgICAgICAgICAgIHR5cGVvZihhcmd1bWVudHNbMV0pID09PSBcIm51bWJlclwiXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBzdXBlcihbYXJndW1lbnRzWzBdLGFyZ3VtZW50c1sxXV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHNbMF0gaW5zdGFuY2VvZiBOdW1lcmljQXJyYXkgJiZcbiAgICAgICAgICAgICAgICBhcmd1bWVudHNbMF0ubGVuZ3RoID09PSAyICYmXG4gICAgICAgICAgICAgICAgdHlwZW9mKGFyZ3VtZW50c1sxXSkgPT09IFwibnVtYmVyXCIgJiYgdHlwZW9mKGFyZ3VtZW50c1syXSkgPT09IFwibnVtYmVyXCJcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHN1cGVyKFsgYXJndW1lbnRzWzBdWzBdLCBhcmd1bWVudHNbMF1bMV0sIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdXSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZihhcmd1bWVudHNbMF0pID09PSBcIm51bWJlclwiICYmXG4gICAgICAgICAgICAgICAgdHlwZW9mKGFyZ3VtZW50c1sxXSkgPT09IFwibnVtYmVyXCIgJiZcbiAgICAgICAgICAgICAgICB0eXBlb2YoYXJndW1lbnRzWzJdKSA9PT0gXCJudW1iZXJcIlxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoW2FyZ3VtZW50c1swXSxhcmd1bWVudHNbMV0sYXJndW1lbnRzWzJdXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgc3VwZXIoW2FyZ3VtZW50c1swXSxhcmd1bWVudHNbMV0sYXJndW1lbnRzWzJdLGFyZ3VtZW50c1szXV0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHNbMF0gaW5zdGFuY2VvZiBOdW1lcmljQXJyYXkgJiZcbiAgICAgICAgICAgICAgICBhcmd1bWVudHNbMF0ubGVuZ3RoPjEgJiYgYXJndW1lbnRzWzBdLmxlbmd0aDw1KVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHN1cGVyKGFyZ3VtZW50c1swXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBwYXJhbWV0ZXJzIGluIFZlYyBjb25zdHJ1Y3RvcmApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbm9ybWFsaXplKCkge1xuICAgICAgICBjb25zdCBtID0gVmVjLk1hZ25pdHVkZSh0aGlzKTtcbiAgICAgICAgc3dpdGNoICh0aGlzLmxlbmd0aCkge1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICB0aGlzWzNdID0gdGhpc1szXSAvIG07XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHRoaXNbMl0gPSB0aGlzWzJdIC8gbTtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgdGhpc1sxXSA9IHRoaXNbMV0gLyBtOyAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpc1swXSA9IHRoaXNbMF0gLyBtO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHRoaXMubGVuZ3RoIH1gKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBhc3NpZ24oc3JjKSB7XG4gICAgICAgIGNoZWNrRXF1YWxMZW5ndGgodGhpcyxzcmMpO1xuICAgICAgICBzd2l0Y2ggKHRoaXMubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHRoaXNbM10gPSBzcmNbM107XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHRoaXNbMl0gPSBzcmNbMl07XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHRoaXNbMV0gPSBzcmNbMV07XG4gICAgICAgICAgICB0aGlzWzBdID0gc3JjWzBdO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHRoaXMubGVuZ3RoIH1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldCh4LCB5LCB6ID0gbnVsbCwgdyA9IG51bGwpIHtcbiAgICAgICAgaWYgKHRoaXMubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICB0aGlzWzBdID0geDtcbiAgICAgICAgICAgIHRoaXNbMV0gPSB5O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMubGVuZ3RoID09PSAzICYmIHogIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXNbMF0gPSB4O1xuICAgICAgICAgICAgdGhpc1sxXSA9IHk7XG4gICAgICAgICAgICB0aGlzWzJdID0gejtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLmxlbmd0aCA9PT0gNCAmJiB3ICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzWzBdID0geDtcbiAgICAgICAgICAgIHRoaXNbMV0gPSB5O1xuICAgICAgICAgICAgdGhpc1syXSA9IHo7XG4gICAgICAgICAgICB0aGlzWzNdID0gdztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdGhpcy5sZW5ndGggfS4gVHJ5aW5nIHRvIHNldCB4PSR7eH0sIHk9JHt5fSwgej0ke3p9LCB3PSR7d31gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNjYWxlKHMpIHtcbiAgICAgICAgc3dpdGNoICh0aGlzLmxlbmd0aCkge1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICB0aGlzWzNdID0gdGhpc1szXSAqIHM7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHRoaXNbMl0gPSB0aGlzWzJdICogcztcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgdGhpc1sxXSA9IHRoaXNbMV0gKiBzO1xuICAgICAgICAgICAgdGhpc1swXSA9IHRoaXNbMF0gKiBzO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYubGVuZ3RoIH1gKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBnZXQgeCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMF07XG4gICAgfVxuXG4gICAgZ2V0IHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzFdO1xuICAgIH1cblxuICAgIGdldCB6KCkge1xuICAgICAgICByZXR1cm4gdGhpc1syXTtcbiAgICB9XG5cbiAgICBnZXQgdygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbM107XG4gICAgfVxuXG4gICAgc2V0IHgodikge1xuICAgICAgICB0aGlzWzBdID0gdjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgc2V0IHkodikge1xuICAgICAgICB0aGlzWzFdID0gdjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgc2V0IHoodikge1xuICAgICAgICB0aGlzWzJdID0gdjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgc2V0IHcodikge1xuICAgICAgICB0aGlzWzNdID0gdjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZ2V0IHh5KCkge1xuICAgICAgICBzd2l0Y2ggKHRoaXMubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHJldHVybiBuZXcgVmVjKHRoaXMpO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHJldHVybiBuZXcgVmVjKHRoaXNbMF0sIHRoaXNbMV0pO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB0aGlzLmxlbmd0aCB9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgeHooKSB7XG4gICAgICAgIHN3aXRjaCAodGhpcy5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICByZXR1cm4gbmV3IFZlYyh0aGlzWzBdLCB0aGlzWzJdKTtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB0aGlzLmxlbmd0aCB9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgeXooKSB7XG4gICAgICAgIHN3aXRjaCAodGhpcy5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICByZXR1cm4gbmV3IFZlYyh0aGlzWzFdLCB0aGlzWzJdKTtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB0aGlzLmxlbmd0aCB9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXQgeHkodikge1xuICAgICAgICB0aGlzWzBdID0gdlswXTtcbiAgICAgICAgdGhpc1sxXSA9IHZbMV07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHNldCB4eih2KSB7XG4gICAgICAgIGlmICh0aGlzLmxlbmd0aDwzKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgdmVjdG9yIHNpemUnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzWzBdID0gdlswXTtcbiAgICAgICAgdGhpc1syXSA9IHZbMV07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHNldCB5eih2KSB7XG4gICAgICAgIGlmICh0aGlzLmxlbmd0aDwzKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgdmVjdG9yIHNpemUnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzWzFdID0gdlswXTtcbiAgICAgICAgdGhpc1syXSA9IHZbMV07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGdldCB4eXooKSB7XG4gICAgICAgIGlmICh0aGlzLmxlbmd0aCA8IDMpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdGhpcy5sZW5ndGggfWApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgVmVjKHRoaXNbMF0sIHRoaXNbMV0sIHRoaXNbMl0pO1xuICAgIH1cblxuICAgIHNldCB4eXoodikge1xuICAgICAgICBpZiAodi5sZW5ndGg8MyB8fCB0aGlzLmxlbmd0aDwzKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemUgdG8gc2V0OiBsOyR7IHRoaXMubGVuZ3RoIH0sIHI6JHt2Lmxlbmd0aH1gKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzWzBdID0gdlswXTtcbiAgICAgICAgdGhpc1sxXSA9IHZbMV07XG4gICAgICAgIHRoaXNbMl0gPSB2WzJdO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvLyBDb3B5IG9wZXJhdG9yXG4gICAgZ2V0IHh5encoKSB7XG4gICAgICAgIGlmICh0aGlzLmxlbmd0aCA8IDQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdGhpcy5sZW5ndGggfSwgNCByZXF1aXJlZGApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgVmVjKHRoaXNbMF0sIHRoaXNbMV0sIHRoaXNbMl0sIHRoaXNbM10pO1xuICAgIH1cblxuICAgIC8vIEFzc2lnbiBvcGVyYXRvclxuICAgIHNldCB4eXp3KHYpIHtcbiAgICAgICAgaWYgKHRoaXMubGVuZ3RoIDwgNCB8fCB2Lmxlbmd0aDw0KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemUgdG8gc2V0OiBsOyR7IHRoaXMubGVuZ3RoIH0sIHI6JHt2Lmxlbmd0aH1gKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzWzBdID0gdlswXTtcbiAgICAgICAgdGhpc1sxXSA9IHZbMV07XG4gICAgICAgIHRoaXNbMl0gPSB2WzJdO1xuICAgICAgICB0aGlzWzNdID0gdlszXTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgc3RhdGljIENoZWNrRXF1YWxMZW5ndGgodjEsdjIpIHtcbiAgICAgICAgY2hlY2tFcXVhbExlbmd0aCh2MSx2Mik7XG4gICAgfVxuXG4gICAgc3RhdGljIE1heCh2MSx2Mikge1xuICAgICAgICBjaGVja0VxdWFsTGVuZ3RoKHYxLHYyKTtcbiAgICAgICAgc3dpdGNoICh2MS5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoW1xuICAgICAgICAgICAgICAgIHYxWzBdPnYyWzBdID8gdjFbMF0gOiB2MlswXSxcbiAgICAgICAgICAgICAgICB2MVsxXT52MlsxXSA/IHYxWzFdIDogdjJbMV1cbiAgICAgICAgICAgIF0pO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbXG4gICAgICAgICAgICAgICAgdjFbMF0+djJbMF0gPyB2MVswXSA6IHYyWzBdLFxuICAgICAgICAgICAgICAgIHYxWzFdPnYyWzFdID8gdjFbMV0gOiB2MlsxXSxcbiAgICAgICAgICAgICAgICB2MVsyXT52MlsyXSA/IHYxWzJdIDogdjJbMl1cbiAgICAgICAgICAgIF0pO1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbXG4gICAgICAgICAgICAgICAgdjFbMF0+djJbMF0gPyB2MVswXSA6IHYyWzBdLFxuICAgICAgICAgICAgICAgIHYxWzFdPnYyWzFdID8gdjFbMV0gOiB2MlsxXSxcbiAgICAgICAgICAgICAgICB2MVsyXT52MlsyXSA/IHYxWzJdIDogdjJbMl0sXG4gICAgICAgICAgICAgICAgdjFbM10+djJbM10gPyB2MVszXSA6IHYyWzNdXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdjEubGVuZ3RoIH1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBNaW4odjEsdjIpIHtcbiAgICAgICAgY2hlY2tFcXVhbExlbmd0aCh2MSx2Mik7XG4gICAgICAgIHN3aXRjaCAodjEubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFtcbiAgICAgICAgICAgICAgICB2MVswXTx2MlswXSA/IHYxWzBdIDogdjJbMF0sXG4gICAgICAgICAgICAgICAgdjFbMV08djJbMV0gPyB2MVsxXSA6IHYyWzFdXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoW1xuICAgICAgICAgICAgICAgIHYxWzBdPHYyWzBdID8gdjFbMF0gOiB2MlswXSxcbiAgICAgICAgICAgICAgICB2MVsxXTx2MlsxXSA/IHYxWzFdIDogdjJbMV0sXG4gICAgICAgICAgICAgICAgdjFbMl08djJbMl0gPyB2MVsyXSA6IHYyWzJdXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoW1xuICAgICAgICAgICAgICAgIHYxWzBdPHYyWzBdID8gdjFbMF0gOiB2MlswXSxcbiAgICAgICAgICAgICAgICB2MVsxXTx2MlsxXSA/IHYxWzFdIDogdjJbMV0sXG4gICAgICAgICAgICAgICAgdjFbMl08djJbMl0gPyB2MVsyXSA6IHYyWzJdLFxuICAgICAgICAgICAgICAgIHYxWzNdPHYyWzNdID8gdjFbM10gOiB2MlszXVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYxLmxlbmd0aCB9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgQWRkKHYxLHYyKSB7XG4gICAgICAgIGNoZWNrRXF1YWxMZW5ndGgodjEsdjIpO1xuICAgICAgICBzd2l0Y2ggKHYxLmxlbmd0aCkge1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbXG4gICAgICAgICAgICAgICAgdjFbMF0gKyB2MlswXSxcbiAgICAgICAgICAgICAgICB2MVsxXSArIHYyWzFdXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoW1xuICAgICAgICAgICAgICAgIHYxWzBdICsgdjJbMF0sXG4gICAgICAgICAgICAgICAgdjFbMV0gKyB2MlsxXSxcbiAgICAgICAgICAgICAgICB2MVsyXSArIHYyWzJdXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoW1xuICAgICAgICAgICAgICAgIHYxWzBdICsgdjJbMF0sXG4gICAgICAgICAgICAgICAgdjFbMV0gKyB2MlsxXSxcbiAgICAgICAgICAgICAgICB2MVsyXSArIHYyWzJdLFxuICAgICAgICAgICAgICAgIHYxWzNdICsgdjJbM11cbiAgICAgICAgICAgIF0pO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB2MS5sZW5ndGggfWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIFN1Yih2MSx2Mikge1xuICAgICAgICBjaGVja0VxdWFsTGVuZ3RoKHYxLHYyKTtcbiAgICAgICAgc3dpdGNoICh2MS5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoW1xuICAgICAgICAgICAgICAgIHYxWzBdIC0gdjJbMF0sXG4gICAgICAgICAgICAgICAgdjFbMV0gLSB2MlsxXVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFtcbiAgICAgICAgICAgICAgICB2MVswXSAtIHYyWzBdLFxuICAgICAgICAgICAgICAgIHYxWzFdIC0gdjJbMV0sXG4gICAgICAgICAgICAgICAgdjFbMl0gLSB2MlsyXVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFtcbiAgICAgICAgICAgICAgICB2MVswXSAtIHYyWzBdLFxuICAgICAgICAgICAgICAgIHYxWzFdIC0gdjJbMV0sXG4gICAgICAgICAgICAgICAgdjFbMl0gLSB2MlsyXSxcbiAgICAgICAgICAgICAgICB2MVszXSAtIHYyWzNdXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdjEubGVuZ3RoIH1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBNYWduaXR1ZGUodikge1xuICAgICAgICBzd2l0Y2ggKHYubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnNxcnQodlswXSAqIHZbMF0gKyB2WzFdICogdlsxXSk7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnNxcnQodlswXSAqIHZbMF0gKyB2WzFdICogdlsxXSArIHZbMl0gKiB2WzJdKTtcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgcmV0dXJuIE1hdGguc3FydCh2WzBdICogdlswXSArIHZbMV0gKiB2WzFdICsgdlsyXSAqIHZbMl0gKyB2WzNdICogdlszXSk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYubGVuZ3RoIH1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBEaXN0YW5jZSh2MSx2Mikge1xuICAgICAgICBjaGVja0VxdWFsTGVuZ3RoKHYxLHYyKTtcbiAgICAgICAgcmV0dXJuIFZlYy5NYWduaXR1ZGUoVmVjLlN1Yih2MSx2MikpO1xuICAgIH1cblxuICAgIHN0YXRpYyBEb3QodjEsdjIpIHtcbiAgICAgICAgY2hlY2tFcXVhbExlbmd0aCh2MSx2Mik7XG4gICAgICAgIHN3aXRjaCAodjEubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHJldHVybiB2MVswXSAqIHYyWzBdICsgdjFbMV0gKiB2MlsxXTtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgcmV0dXJuIHYxWzBdICogdjJbMF0gKyB2MVsxXSAqIHYyWzFdICsgdjFbMl0gKiB2MlsyXTtcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgcmV0dXJuIHYxWzBdICogdjJbMF0gKyB2MVsxXSAqIHYyWzFdICsgdjFbMl0gKiB2MlsyXSArIHYxWzNdICogdjJbM107XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYxLmxlbmd0aCB9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgQ3Jvc3ModjEsdjIpIHtcbiAgICAgICAgY2hlY2tFcXVhbExlbmd0aCh2MSx2Mik7XG4gICAgICAgIHN3aXRjaCAodjEubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHJldHVybiB2MVswXSAqIHYyWzFdIC0gdjFbMV0gLSB2MlswXTtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoW1xuICAgICAgICAgICAgICAgIHYxWzFdICogdjJbMl0gLSB2MVsyXSAqIHYyWzFdLFxuICAgICAgICAgICAgICAgIHYxWzJdICogdjJbMF0gLSB2MVswXSAqIHYyWzJdLFxuICAgICAgICAgICAgICAgIHYxWzBdICogdjJbMV0gLSB2MVsxXSAqIHYyWzBdLFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemUgZm9yIGNyb3NzIHByb2R1Y3Q6ICR7IHYxLmxlbmd0aCB9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgTm9ybWFsaXplZCh2KSB7XG4gICAgICAgIGNvbnN0IG0gPSBWZWMuTWFnbml0dWRlKHYpO1xuICAgICAgICBzd2l0Y2ggKHYubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFsgdlswXSAvIG0sIHZbMV0gLyBtIF0pO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbIHZbMF0gLyBtLCB2WzFdIC8gbSwgdlsyXSAvIG0gXSk7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFsgdlswXSAvIG0sIHZbMV0gLyBtLCB2WzJdIC8gbSwgdlszXSAvIG0gXSlcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdi5sZW5ndGggfWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIE11bHQodixzKSB7XG4gICAgICAgIHN3aXRjaCAodi5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoWyB2WzBdICogcywgdlsxXSAqIHMgXSk7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFsgdlswXSAqIHMsIHZbMV0gKiBzLCB2WzJdICogcyBdKTtcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoWyB2WzBdICogcywgdlsxXSAqIHMsIHZbMl0gKiBzLCB2WzNdICogcyBdKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdi5sZW5ndGggfWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIERpdih2LHMpIHtcbiAgICAgICAgc3dpdGNoICh2Lmxlbmd0aCkge1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbIHZbMF0gLyBzLCB2WzFdIC8gcyBdKTtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoWyB2WzBdIC8gcywgdlsxXSAvIHMsIHZbMl0gLyBzIF0pO1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbIHZbMF0gLyBzLCB2WzFdIC8gcywgdlsyXSAvIHMsIHZbM10gLyBzIF0pO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB2Lmxlbmd0aCB9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgRXF1YWxzKHYxLHYyKSB7XG4gICAgICAgIGlmICh2MS5sZW5ndGggIT0gdjIubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHYxLmxlbmd0aCkge1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIHJldHVybiAgZXF1YWxzKHYxWzBdLCB2MlswXSkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGVxdWFscyh2MVsxXSwgdjJbMV0pO1xuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgIHJldHVybiAgZXF1YWxzKHYxWzBdLCB2MlswXSkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGVxdWFscyh2MVsxXSwgdjJbMV0pICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBlcXVhbHModjFbMl0sIHYyWzJdKTtcbiAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICByZXR1cm4gIGVxdWFscyh2MVswXSwgdjJbMF0pICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBlcXVhbHModjFbMV0sIHYyWzFdKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgZXF1YWxzKHYxWzJdLCB2MlsyXSkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGVxdWFscyh2MVszXSwgdjJbM10pO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYxLmxlbmd0aCB9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgSXNaZXJvKHYpIHtcbiAgICAgICAgc3dpdGNoICh2Lmxlbmd0aCkge1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICByZXR1cm4gaXNaZXJvKHZbMF0pIHx8IGlzWmVybyh2WzFdKTtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgcmV0dXJuIGlzWmVybyh2WzBdKSB8fCBpc1plcm8odlsxXSkgfHwgaXNaZXJvKHZbMl0pO1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICByZXR1cm4gaXNaZXJvKHZbMF0pIHx8IGlzWmVybyh2WzFdKSB8fCBpc1plcm8odlsyXSkgfHwgaXNaZXJvKHZbM10pO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB2Lmxlbmd0aCB9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgSXNOYU4odikge1xuICAgICAgICBzd2l0Y2ggKHYubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHJldHVybiBpc05hTih2WzBdKSB8fCBpc05hTih2WzFdKTtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgcmV0dXJuIGlzTmFOKHZbMF0pIHx8IGlzTmFOKHZbMV0pIHx8IGlzTmFOKHZbMl0pO1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICByZXR1cm4gaXNOYU4odlswXSkgfHwgaXNOYU4odlsxXSkgfHwgaXNOYU4odlsyXSkgfHwgaXNOYU4odlszXSk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYubGVuZ3RoIH1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vLy8vLy8gQ29uc3RydWN0b3JzXG4gICAgc3RhdGljIFZlYzIoKSB7XG4gICAgICAgIHJldHVybiBuZXcgVmVjKDAsMCk7XG4gICAgfVxuXG4gICAgc3RhdGljIFZlYzMoKSB7XG4gICAgICAgIHJldHVybiBuZXcgVmVjKDAsMCwwKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgVmVjNCgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMoMCwwLDAsMCk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgVmVjOiBWZWNcbn1cblxuIiwiaW1wb3J0IHsgTnVtZXJpY0FycmF5IH0gZnJvbSBcIi4vY29uc3RhbnRzLmpzXCI7XG5pbXBvcnQgVmVjdG9yVXRpbHMgZnJvbSBcIi4vVmVjdG9yLmpzXCI7XG5pbXBvcnQgeyBpc1plcm8sIGVxdWFscyB9IGZyb20gXCIuL2Z1bmN0aW9ucy5qc1wiO1xuXG5jb25zdCBWZWMgPSBWZWN0b3JVdGlscy5WZWM7XG5cbmNsYXNzIE1hdDMgZXh0ZW5kcyBOdW1lcmljQXJyYXkge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gOSkge1xuICAgICAgICAgICAgc3VwZXIoYXJndW1lbnRzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxICYmIGFyZ3VtZW50c1swXS5sZW5ndGggPT09IDkpIHtcbiAgICAgICAgICAgIHN1cGVyKGFyZ3VtZW50c1swXSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgc3VwZXIoWzAsMCwwLDAsMCwwLDAsMCwwXSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcGFyYW1ldGVyIHNpemUgaW4gTWF0MyBjb25zdHJ1Y3RvcmApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWRlbnRpdHkoKSB7XG4gICAgICAgIHRoaXNbMF0gPSAxOyB0aGlzWzFdID0gMDsgdGhpc1syXSA9IDA7XG4gICAgICAgIHRoaXNbM10gPSAwOyB0aGlzWzRdID0gMTsgdGhpc1s1XSA9IDA7XG4gICAgICAgIHRoaXNbNl0gPSAwOyB0aGlzWzddID0gMDsgdGhpc1s4XSA9IDE7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHplcm8oKSB7XG4gICAgICAgIHRoaXNbMF0gPSAwOyB0aGlzWzFdID0gMDsgdGhpc1syXSA9IDA7XG4gICAgICAgIHRoaXNbM10gPSAwOyB0aGlzWzRdID0gMDsgdGhpc1s1XSA9IDA7XG4gICAgICAgIHRoaXNbNl0gPSAwOyB0aGlzWzddID0gMDsgdGhpc1s4XSA9IDA7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHJvdyhpKSB7XG4gICAgICAgIHJldHVybiBuZXcgVmVjKFxuICAgICAgICAgICAgdGhpc1tpICogM10sIFxuICAgICAgICAgICAgdGhpc1tpICogMyArIDFdLFxuICAgICAgICAgICAgdGhpc1sgaSogMyArIDJdKTtcbiAgICB9XG5cbiAgICBzZXRSb3coaSwgYSwgeSA9IG51bGwsIHogPSBudWxsKSB7XG4gICAgICAgIGlmIChhPy5sZW5ndGg+PTMpIHtcbiAgICAgICAgICAgIHRoaXNbaSAqIDNdICAgICAgPSBhWzBdO1xuICAgICAgICAgICAgdGhpc1tpICogMyArIDFdICA9IGFbMV07XG4gICAgICAgICAgICB0aGlzW2kgKiAzICsgMl0gID0gYVsyXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlb2YoYSkgPT09IFwibnVtYmVyXCIgJiYgXG4gICAgICAgICAgICB0eXBlb2YoeSkgPT09IFwibnVtYmVyXCIgJiYgXG4gICAgICAgICAgICB0eXBlb2YoeikgPT09IFwibnVtYmVyXCJcbiAgICAgICAgKSB7XG4gICAgICAgICAgICB0aGlzW2kgKiAzXSAgICAgID0gYTtcbiAgICAgICAgICAgIHRoaXNbaSAqIDMgKyAxXSAgPSB5O1xuICAgICAgICAgICAgdGhpc1tpICogMyArIDJdICA9IHo7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcGFyYW1ldGVyIHNldHRpbmcgbWF0cml4IHJvd2ApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvbChpKSB7XG4gICAgICAgIHJldHVybiBuZXcgVmVjKFxuICAgICAgICAgICAgdGhpc1tpXSxcbiAgICAgICAgICAgIHRoaXNbaSArIDNdLFxuICAgICAgICAgICAgdGhpc1tpICsgMyAqIDJdXG4gICAgICAgIClcbiAgICB9XG5cbiAgICBzZXRDb2woaSwgYSwgeSA9IG51bGwsIHogPSBudWxsKSB7XG4gICAgICAgIGlmIChhPy5sZW5ndGg+PTMpIHtcbiAgICAgICAgICAgIHRoaXNbaV0gICAgICAgICA9IGFbMF07XG4gICAgICAgICAgICB0aGlzW2kgKyAzXSAgICAgPSBhWzFdO1xuICAgICAgICAgICAgdGhpc1tpICsgMyAqIDJdID0gYVsyXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlb2YoYSkgPT09IFwibnVtYmVyXCIgJiYgXG4gICAgICAgICAgICB0eXBlb2YoeSkgPT09IFwibnVtYmVyXCIgJiYgXG4gICAgICAgICAgICB0eXBlb2YoeikgPT09IFwibnVtYmVyXCJcbiAgICAgICAgKSB7XG4gICAgICAgICAgICB0aGlzW2ldICAgICAgICAgPSBhO1xuICAgICAgICAgICAgdGhpc1tpICsgM10gICAgID0geTtcbiAgICAgICAgICAgIHRoaXNbaSArIDMgKiAyXSA9IHo7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcGFyYW1ldGVyIHNldHRpbmcgbWF0cml4IHJvd2ApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGFzc2lnbihtKSB7XG4gICAgICAgIGlmIChtLmxlbmd0aCA9PT0gOSkge1xuICAgICAgICAgICAgdGhpc1swXSA9IG1bMF07IHRoaXNbMV0gPSBtWzFdOyB0aGlzWzJdID0gbVsyXTtcblx0XHRcdHRoaXNbM10gPSBtWzNdOyB0aGlzWzRdID0gbVs0XTsgdGhpc1s1XSA9IG1bNV07XG5cdFx0XHR0aGlzWzZdID0gbVs2XTsgdGhpc1s3XSA9IG1bN107IHRoaXNbOF0gPSBtWzhdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG0ubGVuZ3RoID09PSAxNikge1xuICAgICAgICAgICAgdGhpc1swXSA9IG1bMF07IHRoaXNbMV0gPSBtWzFdOyB0aGlzWzJdID0gbVsyXTtcblx0XHRcdHRoaXNbM10gPSBtWzRdOyB0aGlzWzRdID0gbVs1XTsgdGhpc1s1XSA9IG1bNl07XG5cdFx0XHR0aGlzWzZdID0gbVs4XTsgdGhpc1s3XSA9IG1bOV07IHRoaXNbOF0gPSBtWzEwXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBwbGFyYW1ldGVyIHNldHRpbmcgbWF0cml4IGRhdGFgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzZXRTY2FsZSh4LHkseikgeyBcblx0XHRjb25zdCByeCA9IChuZXcgVmVjKHRoaXNbMF0sIHRoaXNbM10sIHRoaXNbNl0pKS5ub3JtYWxpemUoKS5zY2FsZSh4KTtcblx0XHRjb25zdCByeSA9IChuZXcgVmVjKHRoaXNbMV0sIHRoaXNbNF0sIHRoaXNbN10pKS5ub3JtYWxpemUoKS5zY2FsZSh5KTtcblx0XHRjb25zdCByeiA9IChuZXcgVmVjKHRoaXNbMl0sIHRoaXNbNV0sIHRoaXNbOF0pKS5ub3JtYWxpemUoKS5zY2FsZSh6KTtcblx0XHR0aGlzWzBdID0gcngueDsgdGhpc1szXSA9IHJ4Lnk7IHRoaXNbNl0gPSByeC56O1xuXHRcdHRoaXNbMV0gPSByeS54OyB0aGlzWzRdID0gcnkueTsgdGhpc1s3XSA9IHJ5Lno7XG5cdFx0dGhpc1syXSA9IHJ6Lng7IHRoaXNbNV0gPSByei55OyB0aGlzWzhdID0gcnouejtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG4gICAgdHJhc3Bvc2UoKSB7XG4gICAgICAgIGNvbnN0IG0zID0gdGhpc1szXTsgIC8vIDAsIDEsIDJcbiAgICAgICAgY29uc3QgbTcgPSB0aGlzWzddOyAgLy8gMywgNCwgNVxuICAgICAgICBjb25zdCBtNiA9IHRoaXNbNl07ICAvLyA2LCA3LCA4XG4gICAgICAgIHRoaXNbM10gPSB0aGlzWzFdO1xuICAgICAgICB0aGlzWzZdID0gdGhpc1syXTtcbiAgICAgICAgdGhpc1s3XSA9IHRoaXNbNV07XG4gICAgICAgIHRoaXNbMV0gPSBtMztcbiAgICAgICAgdGhpc1syXSA9IG02O1xuICAgICAgICB0aGlzWzVdID0gbTc7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIG11bHQoYSkge1xuICAgICAgICBpZiAodHlwZW9mKGEpID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICB0aGlzWzBdICo9IGE7IHRoaXNbMV0gKj0gYTsgdGhpc1syXSAqPSBhO1xuICAgICAgICAgICAgdGhpc1szXSAqPSBhOyB0aGlzWzRdICo9IGE7IHRoaXNbNV0gKj0gYTtcbiAgICAgICAgICAgIHRoaXNbNl0gKj0gYTsgdGhpc1s3XSAqPSBhOyB0aGlzWzhdICo9IGE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYSBpbnN0YW5jZW9mIE51bWVyaWNBcnJheSAmJiBhLmxlbmd0aCA9PT0gOSkge1xuICAgICAgICAgICAgY29uc3QgcjAgPSB0aGlzLnJvdygwKTtcbiAgICAgICAgICAgIGNvbnN0IHIxID0gdGhpcy5yb3coMSk7XG4gICAgICAgICAgICBjb25zdCByMiA9IHRoaXMucm93KDIpO1xuICAgICAgICAgICAgY29uc3QgYzAgPSBhLmNvbCgwKTtcbiAgICAgICAgICAgIGNvbnN0IGMxID0gYS5jb2woMSk7XG4gICAgICAgICAgICBjb25zdCBjMiA9IGEuY29sKDIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzWzBdID0gVmVjLkRvdChyMCxjMCk7IHRoaXNbMV0gPSBWZWMuRG90KHIwLGMxKTsgdGhpc1syXSA9IFZlYy5Eb3QocjAsYzIpO1xuICAgICAgICAgICAgdGhpc1szXSA9IFZlYy5Eb3QocjEsYzApOyB0aGlzWzRdID0gVmVjLkRvdChyMSxjMSk7IHRoaXNbNV0gPSBWZWMuRG90KHIxLGMyKTtcbiAgICAgICAgICAgIHRoaXNbNl0gPSBWZWMuRG90KHIyLGMwKTsgdGhpc1s3XSA9IFZlYy5Eb3QocjIsYzEpOyB0aGlzWzhdID0gVmVjLkRvdChyMixjMik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcGFyYW1ldGVyIGluIE1hdDMubXVsdCgpYCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgbXVsdFZlY3Rvcih2KSB7XG4gICAgICAgIGlmICh2Lmxlbmd0aCA9PT0gMiB8fCB2Lmxlbmd0aCA9PT0gMykge1xuICAgICAgICAgICAgY29uc3QgeCA9IHZbMF07XG4gICAgICAgICAgICBjb25zdCB5ID0gdlsxXTtcbiAgICAgICAgICAgIGNvbnN0IHogPSB2Lmxlbmd0aCA9PT0gMiA/IDEgOiB2WzJdO1xuICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBuZXcgVmVjKFx0dGhpc1swXSAqIHggKyB0aGlzWzNdICogeSArIHRoaXNbNl0gKiB6LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNbMV0gKiB4ICsgdGhpc1s0XSAqIHkgKyB0aGlzWzddICogeixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzWzJdICogeCArIHRoaXNbNV0gKiB5ICsgdGhpc1s4XSAqIHopO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHBhcmFtZXRlciBpbiBNYXQzLm11bHRWZWN0b3IoKWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiAgYFsgJHt0aGlzWzBdfSwgJHt0aGlzWzFdfSwgJHt0aGlzWzJdfVxcbmAgK1xuICAgICAgICAgICAgICAgIGAgICR7dGhpc1szXX0sICR7dGhpc1s0XX0sICR7dGhpc1s1XX1cXG5gICtcbiAgICAgICAgICAgICAgICBgICAke3RoaXNbNl19LCAke3RoaXNbN119LCAke3RoaXNbOF19IF1gO1xuICAgIH1cblxuICAgIHN0YXRpYyBNYWtlSWRlbnRpdHkoKSB7XG4gICAgICAgIGNvbnN0IG0gPSBuZXcgTWF0MygpO1xuICAgICAgICByZXR1cm4gbS5pZGVudGl0eSgpO1xuICAgIH1cblxuICAgIHN0YXRpYyBNYWtlWmVybygpIHtcbiAgICAgICAgY29uc3QgbSA9IG5ldyBNYXQzKCk7XG4gICAgICAgIHJldHVybiBtLnplcm8oKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgTWFrZVdpdGhRdWF0ZXJuaW9uKHEpIHtcbiAgICAgICAgY29uc3QgbSA9IE1hdDMuTWFrZUlkZW50aXR5KCk7XG4gICAgICAgIFxuICAgICAgICBtLnNldFJvdygwLCBuZXcgVmVjKCAxICAtIDIgKiBxWzFdICogcVsxXSAtIDIgKiBxWzJdICogcVsyXSwgMiAqIHFbMF0gKiBxWzFdIC0gMiAqIHFbMl0gKiBxWzNdLCAyICogcVswXSAqIHFbMl0gKyAyICogcVsxXSAqIHFbM10pKTtcbiAgICAgICAgbS5zZXRSb3coMSwgbmV3IFZlYyggMiAqIHFbMF0gKiBxWzFdICsgMiAqIHFbMl0gKiBxWzNdLCAxICAtIDIuMCAqIHFbMF0gKiBxWzBdIC0gMiAqIHFbMl0gKiBxWzJdLCAyICogcVsxXSAqIHFbMl0gLSAyICogcVswXSAqIHFbM10pKTtcbiAgICAgICAgbS5zZXRSb3coMiwgbmV3IFZlYyggMiAqIHFbMF0gKiBxWzJdIC0gMiAqIHFbMV0gKiBxWzNdLCAyICogcVsxXSAqIHFbMl0gKyAyICogcVswXSAqIHFbM10gLCAxIC0gMiAqIHFbMF0gKiBxWzBdIC0gMiAqIHFbMV0gKiBxWzFdKSk7XG5cbiAgICAgICAgcmV0dXJuIG07XG4gICAgfVxuXG4gICAgc3RhdGljIElzWmVybyhtKSB7XG4gICAgICAgIHJldHVyblx0aXNaZXJvKHZbMF0pICYmIGlzWmVybyh2WzFdKSAmJiBpc1plcm8odlsyXSkgJiZcbiAgICAgICAgICAgICAgICBpc1plcm8odlszXSkgJiYgaXNaZXJvKHZbNF0pICYmIGlzWmVybyh2WzVdKSAmJlxuICAgICAgICAgICAgICAgIGlzWmVybyh2WzZdKSAmJiBpc1plcm8odls3XSkgJiYgaXNaZXJvKHZbOF0pO1xuICAgIH1cbiAgICBcbiAgICBzdGF0aWMgSXNJZGVudGl0eShtKSB7XG4gICAgICAgIHJldHVyblx0ZXF1YWxzKHZbMF0sIDEpICYmIGlzWmVybyh2WzFdKSAmJiBpc1plcm8odlsyXSkgJiZcbiAgICAgICAgICAgICAgICBpc1plcm8odlszXSkgJiYgZXF1YWxzKHZbNF0sIDEpICYmIGlzWmVybyh2WzVdKSAmJlxuICAgICAgICAgICAgICAgIGlzWmVybyh2WzZdKSAmJiBpc1plcm8odls3XSkgJiYgZXF1YWxzKHZbOF0sIDEpO1xuICAgIH1cblxuICAgIHN0YXRpYyBHZXRTY2FsZShtKSB7XG4gICAgICAgIHJldHVybiBuZXcgVmVjKFxuICAgICAgICAgICAgVmVjLk1hZ25pdHVkZShuZXcgVmVjKG1bMF0sIG1bM10sIG1bNl0pKSxcbiAgICAgICAgICAgIFZlYy5NYWduaXR1ZGUobmV3IFZlYyhtWzFdLCBtWzRdLCBtWzddKSksXG4gICAgICAgICAgICBWZWMuTWFnbml0dWRlKG5ldyBWZWMobVsyXSwgbVs1XSwgbVs4XSkpXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgc3RhdGljIEVxdWFscyhhLGIpIHtcbiAgICAgICAgcmV0dXJuXHRlcXVhbHMoYVswXSwgYlswXSkgJiYgZXF1YWxzKGFbMV0sIGJbMV0pICAmJiBlcXVhbHMoYVsyXSwgYlsyXSkgJiZcbiAgICAgICAgICAgICAgICBlcXVhbHMoYVszXSwgYlszXSkgJiYgZXF1YWxzKGFbNF0sIGJbNF0pICAmJiBlcXVhbHMoYVs1XSwgYls1XSkgJiZcbiAgICAgICAgICAgICAgICBlcXVhbHMoYVs2XSwgYls2XSkgJiYgZXF1YWxzKGFbN10sIGJbN10pICAmJiBlcXVhbHMoYVs4XSwgYls4XSk7XG4gICAgfVxuXG4gICAgc3RhdGljIElzTmFOKG0pIHtcbiAgICAgICAgcmV0dXJuXHRpc05hTihtWzBdKSB8fCBpc05hTihtWzFdKSB8fCBpc05hTihtWzJdKSAmJlxuICAgICAgICAgICAgICAgIGlzTmFOKG1bM10pIHx8IGlzTmFOKG1bNF0pIHx8IGlzTmFOKG1bNV0pICYmXG4gICAgICAgICAgICAgICAgaXNOYU4obVs2XSkgfHwgaXNOYU4obVs3XSkgfHwgaXNOYU4obVs4XSk7XG4gICAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIE1hdDM6IE1hdDNcbn1cbiIsImltcG9ydCB7IE51bWVyaWNBcnJheSB9IGZyb20gXCIuL2NvbnN0YW50cy5qc1wiO1xuaW1wb3J0IFZlY3RvclV0aWxzIGZyb20gXCIuL1ZlY3Rvci5qc1wiO1xuaW1wb3J0IE1hdHJpeFV0aWxzIGZyb20gXCIuL01hdHJpeDMuanNcIjtcblxuY29uc3QgVmVjID0gVmVjdG9yVXRpbHMuVmVjO1xuY29uc3QgTWF0MyA9IE1hdHJpeFV0aWxzLk1hdDM7XG5cbmNsYXNzIE1hdDQgZXh0ZW5kcyBOdW1lcmljQXJyYXkge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBjb25zdCBpbk1hdHJpeCA9IFtcbiAgICAgICAgICAgIDAsIDAsIDAsIDAsXG4gICAgICAgICAgICAwLCAwLCAwLCAwLFxuICAgICAgICAgICAgMCwgMCwgMCwgMCxcbiAgICAgICAgICAgIDAsIDAsIDAsIDBcbiAgICAgICAgXTtcblxuICAgICAgICAvLyBDcmVhdGUgZnJvbSBtYXRyaXgzXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSA5KSB7XG4gICAgICAgICAgICBpbk1hdHJpeFswXSA9IGFyZ3VtZW50c1swXTsgXG4gICAgICAgICAgICBpbk1hdHJpeFsxXSA9IGFyZ3VtZW50c1sxXTtcbiAgICAgICAgICAgIGluTWF0cml4WzJdID0gYXJndW1lbnRzWzJdO1xuXG4gICAgICAgICAgICBpbk1hdHJpeFs0XSA9IGFyZ3VtZW50c1szXTsgXG4gICAgICAgICAgICBpbk1hdHJpeFs1XSA9IGFyZ3VtZW50c1s0XTtcbiAgICAgICAgICAgIGluTWF0cml4WzZdID0gYXJndW1lbnRzWzVdO1xuXG4gICAgICAgICAgICBpbk1hdHJpeFs4XSA9IGFyZ3VtZW50c1s2XTsgXG4gICAgICAgICAgICBpbk1hdHJpeFs5XSA9IGFyZ3VtZW50c1s3XTtcbiAgICAgICAgICAgIGluTWF0cml4WzEwXSA9IGFyZ3VtZW50c1s4XTtcblxuICAgICAgICAgICAgaW5NYXRyaXhbMTVdID0gMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxICYmIGFyZ3VtZW50c1swXS5sZW5ndGggPT09IDkpIHtcbiAgICAgICAgICAgIGluTWF0cml4WzBdICA9IGFyZ3VtZW50c1swXVswXTsgXG4gICAgICAgICAgICBpbk1hdHJpeFsxXSAgPSBhcmd1bWVudHNbMF1bMV07XG4gICAgICAgICAgICBpbk1hdHJpeFsyXSAgPSBhcmd1bWVudHNbMF1bMl07XG5cbiAgICAgICAgICAgIGluTWF0cml4WzRdICA9IGFyZ3VtZW50c1swXVszXTsgXG4gICAgICAgICAgICBpbk1hdHJpeFs1XSAgPSBhcmd1bWVudHNbMF1bNF07XG4gICAgICAgICAgICBpbk1hdHJpeFs2XSAgPSBhcmd1bWVudHNbMF1bNV07XG5cbiAgICAgICAgICAgIGluTWF0cml4WzhdICA9IGFyZ3VtZW50c1swXVs2XTsgXG4gICAgICAgICAgICBpbk1hdHJpeFs5XSAgPSBhcmd1bWVudHNbMF1bN107XG4gICAgICAgICAgICBpbk1hdHJpeFsxMF0gPSBhcmd1bWVudHNbMF1bOF07XG5cbiAgICAgICAgICAgIGluTWF0cml4WzE1XSA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ3JlYXRlIGZyb20gbWF0cml4NFxuICAgICAgICBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxNikge1xuICAgICAgICAgICAgaW5NYXRyaXhbMCBdID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgaW5NYXRyaXhbMSBdID0gYXJndW1lbnRzWzEgXTtcbiAgICAgICAgICAgIGluTWF0cml4WzIgXSA9IGFyZ3VtZW50c1syIF07XG4gICAgICAgICAgICBpbk1hdHJpeFszIF0gPSBhcmd1bWVudHNbMyBdO1xuXG4gICAgICAgICAgICBpbk1hdHJpeFs0IF0gPSBhcmd1bWVudHNbNCBdO1xuICAgICAgICAgICAgaW5NYXRyaXhbNSBdID0gYXJndW1lbnRzWzUgXTtcbiAgICAgICAgICAgIGluTWF0cml4WzYgXSA9IGFyZ3VtZW50c1s2IF07XG4gICAgICAgICAgICBpbk1hdHJpeFs3IF0gPSBhcmd1bWVudHNbNyBdO1xuXG4gICAgICAgICAgICBpbk1hdHJpeFs4IF0gPSBhcmd1bWVudHNbOCBdO1xuICAgICAgICAgICAgaW5NYXRyaXhbOSBdID0gYXJndW1lbnRzWzkgXTtcbiAgICAgICAgICAgIGluTWF0cml4WzEwXSA9IGFyZ3VtZW50c1sxMF07XG4gICAgICAgICAgICBpbk1hdHJpeFsxMV0gPSBhcmd1bWVudHNbMTFdO1xuXG4gICAgICAgICAgICBpbk1hdHJpeFsxMl0gPSBhcmd1bWVudHNbMTJdO1xuICAgICAgICAgICAgaW5NYXRyaXhbMTNdID0gYXJndW1lbnRzWzEzXTtcbiAgICAgICAgICAgIGluTWF0cml4WzE0XSA9IGFyZ3VtZW50c1sxNF07XG4gICAgICAgICAgICBpbk1hdHJpeFsxNV0gPSBhcmd1bWVudHNbMTVdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEgJiYgYXJndW1lbnRzWzBdLmxlbmd0aCA9PT0gMTYpIHtcbiAgICAgICAgICAgIGluTWF0cml4WzAgXSA9IGFyZ3VtZW50c1swXVswXTtcbiAgICAgICAgICAgIGluTWF0cml4WzEgXSA9IGFyZ3VtZW50c1swXVsxIF07XG4gICAgICAgICAgICBpbk1hdHJpeFsyIF0gPSBhcmd1bWVudHNbMF1bMiBdO1xuICAgICAgICAgICAgaW5NYXRyaXhbMyBdID0gYXJndW1lbnRzWzBdWzMgXTtcblxuICAgICAgICAgICAgaW5NYXRyaXhbNCBdID0gYXJndW1lbnRzWzBdWzQgXTtcbiAgICAgICAgICAgIGluTWF0cml4WzUgXSA9IGFyZ3VtZW50c1swXVs1IF07XG4gICAgICAgICAgICBpbk1hdHJpeFs2IF0gPSBhcmd1bWVudHNbMF1bNiBdO1xuICAgICAgICAgICAgaW5NYXRyaXhbNyBdID0gYXJndW1lbnRzWzBdWzcgXTtcblxuICAgICAgICAgICAgaW5NYXRyaXhbOCBdID0gYXJndW1lbnRzWzBdWzggXTtcbiAgICAgICAgICAgIGluTWF0cml4WzkgXSA9IGFyZ3VtZW50c1swXVs5IF07XG4gICAgICAgICAgICBpbk1hdHJpeFsxMF0gPSBhcmd1bWVudHNbMF1bMTBdO1xuICAgICAgICAgICAgaW5NYXRyaXhbMTFdID0gYXJndW1lbnRzWzBdWzExXTtcblxuICAgICAgICAgICAgaW5NYXRyaXhbMTJdID0gYXJndW1lbnRzWzBdWzEyXTtcbiAgICAgICAgICAgIGluTWF0cml4WzEzXSA9IGFyZ3VtZW50c1swXVsxM107XG4gICAgICAgICAgICBpbk1hdHJpeFsxNF0gPSBhcmd1bWVudHNbMF1bMTRdO1xuICAgICAgICAgICAgaW5NYXRyaXhbMTVdID0gYXJndW1lbnRzWzBdWzE1XTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoICE9IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBwYXJhbWV0ZXIgc2l6ZSBpbiBNYXRyaXgzIGNvbnN0cnVjdG9yYCk7XG4gICAgICAgIH1cblxuICAgICAgICBzdXBlcihpbk1hdHJpeCk7XG4gICAgfVxuXG4gICAgLy8vLy8vIEluaXRpYWxpemVyc1xuICAgIGlkZW50aXR5KCkge1xuICAgICAgICB0aGlzWzAgXSA9IDE7IHRoaXNbMSBdID0gMDsgdGhpc1syIF0gPSAwOyB0aGlzWzMgXSA9IDBcbiAgICAgICAgdGhpc1s0IF0gPSAwOyB0aGlzWzUgXSA9IDE7IHRoaXNbNiBdID0gMDsgdGhpc1s3IF0gPSAwXG4gICAgICAgIHRoaXNbOCBdID0gMDsgdGhpc1s5IF0gPSAwOyB0aGlzWzEwXSA9IDE7IHRoaXNbMTFdID0gMFxuICAgICAgICB0aGlzWzEyXSA9IDA7IHRoaXNbMTNdID0gMDsgdGhpc1sxNF0gPSAwOyB0aGlzWzE1XSA9IDFcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgemVybygpIHtcblx0XHR0aGlzWyAwXSA9IDA7IHRoaXNbIDFdID0gMDsgdGhpc1sgMl0gPSAwOyB0aGlzWyAzXSA9IDA7XG5cdFx0dGhpc1sgNF0gPSAwOyB0aGlzWyA1XSA9IDA7IHRoaXNbIDZdID0gMDsgdGhpc1sgN10gPSAwO1xuXHRcdHRoaXNbIDhdID0gMDsgdGhpc1sgOV0gPSAwOyB0aGlzWzEwXSA9IDA7IHRoaXNbMTFdID0gMDtcblx0XHR0aGlzWzEyXSA9IDA7IHRoaXNbMTNdID0gMDsgdGhpc1sxNF0gPSAwOyB0aGlzWzE1XSA9IDA7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuICAgIHBlcnNwZWN0aXZlKGZvdnksIGFzcGVjdCwgbmVhclBsYW5lLCBmYXJQbGFuZSkge1xuXHRcdGxldCBmb3Z5MiA9IHRhbihmb3Z5ICogUEkgLyAzNjAuMCkgKiBuZWFyUGxhbmU7XG5cdFx0bGV0IGZvdnkyYXNwZWN0ID0gZm92eTIgKiBhc3BlY3Q7XG5cdFx0dGhpcy5mcnVzdHVtKC1mb3Z5MmFzcGVjdCxmb3Z5MmFzcGVjdCwtZm92eTIsZm92eTIsbmVhclBsYW5lLGZhclBsYW5lKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cdH1cblxuXHRmcnVzdHVtKGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhclBsYW5lLCBmYXJQbGFuZSkge1xuXHRcdGxldCBBID0gcmlnaHQgLSBsZWZ0O1xuXHRcdGxldCBCID0gdG9wLWJvdHRvbTtcblx0XHRsZXQgQyA9IGZhclBsYW5lLW5lYXJQbGFuZTtcblx0XHRcblx0XHR0aGlzLnNldFJvdygwLCBuZXcgVmVjKG5lYXJQbGFuZSoyLjAvQSxcdDAuMCxcdDAuMCxcdDAuMCkpO1xuXHRcdHRoaXMuc2V0Um93KDEsIG5ldyBWZWMoMC4wLFx0bmVhclBsYW5lKjIuMC9CLFx0MC4wLFx0MC4wKSk7XG5cdFx0dGhpcy5zZXRSb3coMiwgbmV3IFZlYygocmlnaHQrbGVmdCkvQSxcdCh0b3ArYm90dG9tKS9CLFx0LShmYXJQbGFuZStuZWFyUGxhbmUpL0MsXHQtMS4wKSk7XG5cdFx0dGhpcy5zZXRSb3coMywgbmV3IFZlYygwLjAsXHQwLjAsXHQtKGZhclBsYW5lKm5lYXJQbGFuZSoyLjApL0MsXHQwLjApKTtcblx0XHRcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdG9ydGhvKGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhclBsYW5lLCBmYXJQbGFuZSkge1xuXHRcdGxldCBtID0gcmlnaHQtbGVmdDtcblx0XHRsZXQgbCA9IHRvcC1ib3R0b207XG5cdFx0bGV0IGsgPSBmYXJQbGFuZS1uZWFyUGxhbmU7O1xuXHRcdFxuXHRcdHRoaXNbMF0gPSAyL207IHRoaXNbMV0gPSAwOyAgIHRoaXNbMl0gPSAwOyAgICAgdGhpc1szXSA9IDA7XG5cdFx0dGhpc1s0XSA9IDA7ICAgdGhpc1s1XSA9IDIvbDsgdGhpc1s2XSA9IDA7ICAgICB0aGlzWzddID0gMDtcblx0XHR0aGlzWzhdID0gMDsgICB0aGlzWzldID0gMDsgICB0aGlzWzEwXSA9IC0yL2s7IHRoaXNbMTFdPSAwO1xuXHRcdHRoaXNbMTJdPS0obGVmdCtyaWdodCkvbTsgdGhpc1sxM10gPSAtKHRvcCtib3R0b20pL2w7IHRoaXNbMTRdID0gLShmYXJQbGFuZStuZWFyUGxhbmUpL2s7IHRoaXNbMTVdPTE7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXHRcdFxuXHRsb29rQXQocF9leWUsIHBfY2VudGVyLCBwX3VwKSB7XG4gICAgICAgIHRoaXMuaWRlbnRpdHkoKTtcblxuXHRcdGNvbnN0IHkgPSBuZXcgVmVjKHBfdXApO1xuXHRcdGNvbnN0IHogPSBWZWMzLlN1YihwX2V5ZSxwX2NlbnRlcik7XG5cdFx0ei5ub3JtYWxpemUoKTtcblx0XHRjb25zdCB4ID0gVmVjMy5Dcm9zcyh5LHopO1xuXHRcdHgubm9ybWFsaXplKCk7XG5cdFx0eS5ub3JtYWxpemUoKTtcblxuXHRcdHRoaXMubTAwID0geC54O1xuXHRcdHRoaXMubTEwID0geC55O1xuXHRcdHRoaXMubTIwID0geC56O1xuXHRcdHRoaXMubTMwID0gLVZlYzMuRG90KHgsIHBfZXllKTtcblx0XHR0aGlzLm0wMSA9IHkueDtcblx0XHR0aGlzLm0xMSA9IHkueTtcblx0XHR0aGlzLm0yMSA9IHkuejtcblx0XHR0aGlzLm0zMSA9IC1WZWMzLkRvdCh5LCBwX2V5ZSk7XG5cdFx0dGhpcy5tMDIgPSB6Lng7XG5cdFx0dGhpcy5tMTIgPSB6Lnk7XG5cdFx0dGhpcy5tMjIgPSB6Lno7XG5cdFx0dGhpcy5tMzIgPSAtVmVjMy5Eb3QoeiwgcF9leWUpO1xuXHRcdHRoaXMubTAzID0gMDtcblx0XHR0aGlzLm0xMyA9IDA7XG5cdFx0dGhpcy5tMjMgPSAwO1xuXHRcdHRoaXMubTMzID0gMTtcblx0XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cblxuXG4gICAgLy8vLy8gU2V0dGVycyBhbmQgZ2V0dGVyc1xuICAgIGdldCBtMDAoKSB7IHJldHVybiB0aGlzWzBdOyB9XG5cdGdldCBtMDEoKSB7IHJldHVybiB0aGlzWzFdOyB9XG5cdGdldCBtMDIoKSB7IHJldHVybiB0aGlzWzJdOyB9XG5cdGdldCBtMDMoKSB7IHJldHVybiB0aGlzWzNdOyB9XG5cdGdldCBtMTAoKSB7IHJldHVybiB0aGlzWzRdOyB9XG5cdGdldCBtMTEoKSB7IHJldHVybiB0aGlzWzVdOyB9XG5cdGdldCBtMTIoKSB7IHJldHVybiB0aGlzWzZdOyB9XG5cdGdldCBtMTMoKSB7IHJldHVybiB0aGlzWzddOyB9XG5cdGdldCBtMjAoKSB7IHJldHVybiB0aGlzWzhdOyB9XG5cdGdldCBtMjEoKSB7IHJldHVybiB0aGlzWzldOyB9XG5cdGdldCBtMjIoKSB7IHJldHVybiB0aGlzWzEwXTsgfVxuXHRnZXQgbTIzKCkgeyByZXR1cm4gdGhpc1sxMV07IH1cblx0Z2V0IG0zMCgpIHsgcmV0dXJuIHRoaXNbMTJdOyB9XG5cdGdldCBtMzEoKSB7IHJldHVybiB0aGlzWzEzXTsgfVxuXHRnZXQgbTMyKCkgeyByZXR1cm4gdGhpc1sxNF07IH1cblx0Z2V0IG0zMygpIHsgcmV0dXJuIHRoaXNbMTVdOyB9XG5cdFxuXHRzZXQgbTAwKHYpIHsgdGhpc1swXSA9IHY7IH1cblx0c2V0IG0wMSh2KSB7IHRoaXNbMV0gPSB2OyB9XG5cdHNldCBtMDIodikgeyB0aGlzWzJdID0gdjsgfVxuXHRzZXQgbTAzKHYpIHsgdGhpc1szXSA9IHY7IH1cblx0c2V0IG0xMCh2KSB7IHRoaXNbNF0gPSB2OyB9XG5cdHNldCBtMTEodikgeyB0aGlzWzVdID0gdjsgfVxuXHRzZXQgbTEyKHYpIHsgdGhpc1s2XSA9IHY7IH1cblx0c2V0IG0xMyh2KSB7IHRoaXNbN10gPSB2OyB9XG5cdHNldCBtMjAodikgeyB0aGlzWzhdID0gdjsgfVxuXHRzZXQgbTIxKHYpIHsgdGhpc1s5XSA9IHY7IH1cblx0c2V0IG0yMih2KSB7IHRoaXNbMTBdID0gdjsgfVxuXHRzZXQgbTIzKHYpIHsgdGhpc1sxMV0gPSB2OyB9XG5cdHNldCBtMzAodikgeyB0aGlzWzEyXSA9IHY7IH1cblx0c2V0IG0zMSh2KSB7IHRoaXNbMTNdID0gdjsgfVxuXHRzZXQgbTMyKHYpIHsgdGhpc1sxNF0gPSB2OyB9XG5cdHNldCBtMzModikgeyB0aGlzWzE1XSA9IHY7IH1cblxuICAgIHJvdyhpKSB7XG4gICAgICAgIHJldHVybiBuZXcgVmVjKFxuICAgICAgICAgICAgdGhpc1tpICogNF0sIFxuICAgICAgICAgICAgdGhpc1tpICogNCArIDFdLFxuICAgICAgICAgICAgdGhpc1tpICogNCArIDJdLFxuICAgICAgICAgICAgdGhpc1tpICogNCArIDNdKTtcbiAgICB9XG5cbiAgICBzZXRSb3coaSwgYSwgeSA9IG51bGwsIHogPSBudWxsLCB3ID0gbnVsbCkge1xuICAgICAgICBpZiAoYSBpbnN0YW5jZW9mIE51bWVyaWNBcnJheSAmJiBhLmxlbmd0aD49NCkge1xuICAgICAgICAgICAgdGhpc1tpICogNF0gICAgICA9IGFbMF07XG4gICAgICAgICAgICB0aGlzW2kgKiA0ICsgMV0gID0gYVsxXTtcbiAgICAgICAgICAgIHRoaXNbaSAqIDQgKyAyXSAgPSBhWzJdO1xuICAgICAgICAgICAgdGhpc1tpICogNCArIDNdICA9IGFbM107XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mKGEpID09PSBcIm51bWJlclwiICYmIFxuICAgICAgICAgICAgdHlwZW9mKHkpID09PSBcIm51bWJlclwiICYmIFxuICAgICAgICAgICAgdHlwZW9mKHopID09PSBcIm51bWJlclwiICYmXG4gICAgICAgICAgICB0eXBlb2YodykgPT09IFwibnVtYmVyXCJcbiAgICAgICAgKSB7XG4gICAgICAgICAgICB0aGlzW2kgKiA0XSAgICAgID0gYTtcbiAgICAgICAgICAgIHRoaXNbaSAqIDQgKyAxXSAgPSB5O1xuICAgICAgICAgICAgdGhpc1tpICogNCArIDJdICA9IHo7XG4gICAgICAgICAgICB0aGlzW2kgKiA0ICsgM10gID0gdztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBwYXJhbWV0ZXIgc2V0dGluZyBtYXRyaXggcm93YCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY29sKGkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMoXG4gICAgICAgICAgICB0aGlzW2ldLFxuICAgICAgICAgICAgdGhpc1tpICsgNF0sXG4gICAgICAgICAgICB0aGlzW2kgKyA0ICogMl0sXG4gICAgICAgICAgICB0aGlzW2kgKyA0ICogM11cbiAgICAgICAgKVxuICAgIH1cblxuICAgIHNldENvbChpLCBhLCB5ID0gbnVsbCwgeiA9IG51bGwsIHcgPSBudWxsKSB7XG4gICAgICAgIGlmIChhIGluc3RhbmNlb2YgTnVtZXJpY0FycmF5ICYmIGEubGVuZ3RoPj00KSB7XG4gICAgICAgICAgICB0aGlzW2ldICAgICAgICAgPSBhWzBdO1xuICAgICAgICAgICAgdGhpc1tpICsgNF0gICAgID0gYVsxXTtcbiAgICAgICAgICAgIHRoaXNbaSArIDQgKiAyXSA9IGFbMl07XG4gICAgICAgICAgICB0aGlzW2kgKyA0ICogM10gPSBhWzNdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZihhKSA9PT0gXCJudW1iZXJcIiAmJiBcbiAgICAgICAgICAgIHR5cGVvZih5KSA9PT0gXCJudW1iZXJcIiAmJiBcbiAgICAgICAgICAgIHR5cGVvZih6KSA9PT0gXCJudW1iZXJcIiAmJlxuICAgICAgICAgICAgdHlwZW9mKHcpID09PSBcIm51bWJlclwiXG4gICAgICAgICkge1xuICAgICAgICAgICAgdGhpc1tpXSAgICAgICAgID0gYTtcbiAgICAgICAgICAgIHRoaXNbaSArIDRdICAgICA9IHk7XG4gICAgICAgICAgICB0aGlzW2kgKyA0ICogMl0gPSB6O1xuICAgICAgICAgICAgdGhpc1tpICsgNCAqIDNdID0gdztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBwYXJhbWV0ZXIgc2V0dGluZyBtYXRyaXggcm93YCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgbWF0MygpIHtcblx0XHRyZXR1cm4gbmV3IE1hdDModGhpc1swXSwgdGhpc1sxXSwgdGhpc1sgMl0sXG5cdFx0XHRcdFx0XHR0aGlzWzRdLCB0aGlzWzVdLCB0aGlzWyA2XSxcblx0XHRcdFx0XHRcdHRoaXNbOF0sIHRoaXNbOV0sIHRoaXNbMTBdKTtcblx0fVxuXG4gICAgYXNzaWduKGEpIHtcblx0XHRpZiAoYS5sZW5ndGg9PTkpIHtcblx0XHRcdHRoaXNbMF0gID0gYVswXTsgdGhpc1sxXSAgPSBhWzFdOyB0aGlzWzJdICA9IGFbMl07IHRoaXNbM10gID0gMDtcblx0XHRcdHRoaXNbNF0gID0gYVszXTsgdGhpc1s1XSAgPSBhWzRdOyB0aGlzWzZdICA9IGFbNV07IHRoaXNbN10gID0gMDtcblx0XHRcdHRoaXNbOF0gID0gYVs2XTsgdGhpc1s5XSAgPSBhWzddOyB0aGlzWzEwXSA9IGFbOF07IHRoaXNbMTFdID0gMDtcblx0XHRcdHRoaXNbMTJdID0gMDtcdCB0aGlzWzEzXSA9IDA7XHQgIHRoaXNbMTRdID0gMDtcdCAgIHRoaXNbMTVdID0gMTtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoYS5sZW5ndGg9PTE2KSB7XG5cdFx0XHR0aGlzWzBdICA9IGFbMF07ICB0aGlzWzFdICA9IGFbMV07ICB0aGlzWzJdICA9IGFbMl07ICB0aGlzWzNdICA9IGFbM107XG5cdFx0XHR0aGlzWzRdICA9IGFbNF07ICB0aGlzWzVdICA9IGFbNV07ICB0aGlzWzZdICA9IGFbNl07ICB0aGlzWzddICA9IGFbN107XG5cdFx0XHR0aGlzWzhdICA9IGFbOF07ICB0aGlzWzldICA9IGFbOV07ICB0aGlzWzEwXSA9IGFbMTBdOyB0aGlzWzExXSA9IGFbMTFdO1xuXHRcdFx0dGhpc1sxMl0gPSBhWzEyXTsgdGhpc1sxM10gPSBhWzEzXTtcdHRoaXNbMTRdID0gYVsxNF07IHRoaXNbMTVdID0gYVsxNV07XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cbiAgICBnZXQgZm9yd2FyZFZlY3RvcigpIHtcblx0XHRyZXR1cm4gTWF0NC5UcmFuc2Zvcm1EaXJlY3Rpb24odGhpcywgbmV3IFZlYygwLjAsIDAuMCwgMS4wKSk7XG5cdH1cblx0XG5cdGdldCByaWdodFZlY3RvcigpIHtcblx0XHRyZXR1cm4gTWF0NC5UcmFuc2Zvcm1EaXJlY3Rpb24odGhpcywgbmV3IFZlYygxLjAsIDAuMCwgMC4wKSk7XG5cdH1cblx0XG5cdGdldCB1cFZlY3RvcigpIHtcblx0XHRyZXR1cm4gTWF0NC5UcmFuc2Zvcm1EaXJlY3Rpb24odGhpcywgbmV3IFZlYygwLjAsIDEuMCwgMC4wKSk7XG5cdH1cblx0XG5cdGdldCBiYWNrd2FyZFZlY3RvcigpIHtcblx0XHRyZXR1cm4gTWF0NC5UcmFuc2Zvcm1EaXJlY3Rpb24odGhpcywgbmV3IFZlYygwLjAsIDAuMCwgLTEuMCkpO1xuXHR9XG5cdFxuXHRnZXQgbGVmdFZlY3RvcigpIHtcblx0XHRyZXR1cm4gTWF0NC5UcmFuc2Zvcm1EaXJlY3Rpb24odGhpcywgbmV3IFZlYygtMS4wLCAwLjAsIDAuMCkpO1xuXHR9XG5cdFxuXHRnZXQgZG93blZlY3RvcigpIHtcblx0XHRyZXR1cm4gTWF0NC5UcmFuc2Zvcm1EaXJlY3Rpb24odGhpcywgbmV3IFZlYygwLjAsIC0xLjAsIDAuMCkpO1xuXHR9XG5cblxuICAgIC8vLy8vLy8gUXVlcnkgZnVuY3Rpb25zXG4gICAgaXNaZXJvKCkge1xuXHRcdHJldHVyblx0dGhpc1sgMF09PTAgJiYgdGhpc1sgMV09PTAgJiYgdGhpc1sgMl09PTAgJiYgdGhpc1sgM109PTAgJiZcblx0XHRcdFx0dGhpc1sgNF09PTAgJiYgdGhpc1sgNV09PTAgJiYgdGhpc1sgNl09PTAgJiYgdGhpc1sgN109PTAgJiZcblx0XHRcdFx0dGhpc1sgOF09PTAgJiYgdGhpc1sgOV09PTAgJiYgdGhpc1sxMF09PTAgJiYgdGhpc1sxMV09PTAgJiZcblx0XHRcdFx0dGhpc1sxMl09PTAgJiYgdGhpc1sxM109PTAgJiYgdGhpc1sxNF09PTAgJiYgdGhpc1sxNV09PTA7XG5cdH1cblx0XG5cdGlzSWRlbnRpdHkoKSB7XG5cdFx0cmV0dXJuXHR0aGlzWyAwXT09MSAmJiB0aGlzWyAxXT09MCAmJiB0aGlzWyAyXT09MCAmJiB0aGlzWyAzXT09MCAmJlxuXHRcdFx0XHR0aGlzWyA0XT09MCAmJiB0aGlzWyA1XT09MSAmJiB0aGlzWyA2XT09MCAmJiB0aGlzWyA3XT09MCAmJlxuXHRcdFx0XHR0aGlzWyA4XT09MCAmJiB0aGlzWyA5XT09MCAmJiB0aGlzWzEwXT09MSAmJiB0aGlzWzExXT09MCAmJlxuXHRcdFx0XHR0aGlzWzEyXT09MCAmJiB0aGlzWzEzXT09MCAmJiB0aGlzWzE0XT09MCAmJiB0aGlzWzE1XT09MTtcblx0fVxuXG5cbiAgICAvLy8vLy8vIFRyYW5zZm9ybSBmdW5jdGlvbnNcblx0dHJhbnNsYXRlKHgsIHksIHopIHtcblx0XHR0aGlzLm11bHQoTWF0NC5NYWtlVHJhbnNsYXRpb24oeCwgeSwgeikpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0cm90YXRlKGFscGhhLCB4LCB5LCB6KSB7XG5cdFx0dGhpcy5tdWx0KE1hdDQuTWFrZVJvdGF0aW9uKGFscGhhLCB4LCB5LCB6KSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0XG5cdHNjYWxlKHgsIHksIHopIHtcblx0XHR0aGlzLm11bHQoTWF0NC5NYWtlU2NhbGUoeCwgeSwgeikpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblxuXG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuICBgWyAke3RoaXNbIDBdfSwgJHt0aGlzWyAxXX0sICR7dGhpc1sgMl19LCAke3RoaXNbIDNdfVxcbmAgK1xuICAgICAgICAgICAgICAgIGAgICR7dGhpc1sgNF19LCAke3RoaXNbIDVdfSwgJHt0aGlzWyA2XX0sICR7dGhpc1sgN119XFxuYCArXG4gICAgICAgICAgICAgICAgYCAgJHt0aGlzWyA4XX0sICR7dGhpc1sgOV19LCAke3RoaXNbMTBdfSwgJHt0aGlzWzExXX1cXG5gICtcbiAgICAgICAgICAgICAgICBgICAke3RoaXNbMTJdfSwgJHt0aGlzWzEzXX0sICR7dGhpc1sxNF19LCAke3RoaXNbMTVdfSBdYDtcbiAgICB9XG5cblxuICAgIC8vLy8vLyBVdGlsaXRpZXNcbiAgICBzZXRTY2FsZSh4LHkseikge1xuXHRcdGNvbnN0IHJ4ID0gbmV3IFZlYyh0aGlzWzBdLCB0aGlzWzRdLCB0aGlzWzhdKS5ub3JtYWxpemUoKS5zY2FsZSh4KTtcblx0XHRjb25zdCByeSA9IG5ldyBWZWModGhpc1sxXSwgdGhpc1s1XSwgdGhpc1s5XSkubm9ybWFsaXplKCkuc2NhbGUoeSk7XG5cdFx0Y29uc3QgcnogPSBuZXcgVmVjKHRoaXNbMl0sIHRoaXNbNl0sIHRoaXNbMTBdKS5ub3JtYWxpemUoKS5zY2FsZSh6KTtcblx0XHR0aGlzWzBdID0gcngueDsgdGhpc1s0XSA9IHJ4Lnk7IHRoaXNbOF0gPSByeC56O1xuXHRcdHRoaXNbMV0gPSByeS54OyB0aGlzWzVdID0gcnkueTsgdGhpc1s5XSA9IHJ5Lno7XG5cdFx0dGhpc1syXSA9IHJ6Lng7IHRoaXNbNl0gPSByei55OyB0aGlzWzEwXSA9IHJ6Lno7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRzZXRQb3NpdGlvbihwb3MseSx6KSB7XG5cdFx0aWYgKHR5cGVvZihwb3MpPT1cIm51bWJlclwiKSB7XG5cdFx0XHR0aGlzWzEyXSA9IHBvcztcblx0XHRcdHRoaXNbMTNdID0geTtcblx0XHRcdHRoaXNbMTRdID0gejtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHR0aGlzWzEyXSA9IHBvcy54O1xuXHRcdFx0dGhpc1sxM10gPSBwb3MueTtcblx0XHRcdHRoaXNbMTRdID0gcG9zLno7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cbiAgICAvLy8vLy8vIE9wZXJhdGlvbnNcbiAgICBtdWx0KGEpIHtcblx0XHRpZiAodHlwZW9mKGEpPT0nbnVtYmVyJykge1xuXHRcdFx0dGhpc1sgMF0gKj0gYTsgdGhpc1sgMV0gKj0gYTsgdGhpc1sgMl0gKj0gYTsgdGhpc1sgM10gKj0gYTtcblx0XHRcdHRoaXNbIDRdICo9IGE7IHRoaXNbIDVdICo9IGE7IHRoaXNbIDZdICo9IGE7IHRoaXNbIDddICo9IGE7XG5cdFx0XHR0aGlzWyA4XSAqPSBhOyB0aGlzWyA5XSAqPSBhOyB0aGlzWzEwXSAqPSBhOyB0aGlzWzExXSAqPSBhO1xuXHRcdFx0dGhpc1sxMl0gKj0gYTsgdGhpc1sxM10gKj0gYTsgdGhpc1sxNF0gKj0gYTsgdGhpc1sxNV0gKj0gYTtcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuICAgICAgICBjb25zdCByMCA9IHRoaXMucm93KDApO1xuICAgICAgICBjb25zdCByMSA9IHRoaXMucm93KDEpO1xuICAgICAgICBjb25zdCByMiA9IHRoaXMucm93KDIpO1xuICAgICAgICBjb25zdCByMyA9IHRoaXMucm93KDMpO1xuICAgICAgICBjb25zdCBjMCA9IGEuY29sKDApO1xuICAgICAgICBjb25zdCBjMSA9IGEuY29sKDEpO1xuICAgICAgICBjb25zdCBjMiA9IGEuY29sKDIpO1xuICAgICAgICBjb25zdCBjMyA9IGEuY29sKDMpO1xuXG4gICAgICAgIHRoaXNbMCBdID0gVmVjLkRvdChyMCwgYzApOyB0aGlzWzEgXSA9IFZlYy5Eb3QocjAsIGMxKTsgdGhpc1syIF0gPSBWZWMuRG90KHIwLCBjMik7IHRoaXNbMyBdID0gVmVjLkRvdChyMCwgYzMpO1xuICAgICAgICB0aGlzWzQgXSA9IFZlYy5Eb3QocjEsIGMwKTsgdGhpc1s1IF0gPSBWZWMuRG90KHIxLCBjMSk7IHRoaXNbNiBdID0gVmVjLkRvdChyMSwgYzIpOyB0aGlzWzcgXSA9IFZlYy5Eb3QocjEsIGMzKTtcbiAgICAgICAgdGhpc1s4IF0gPSBWZWMuRG90KHIyLCBjMCk7IHRoaXNbOSBdID0gVmVjLkRvdChyMiwgYzEpOyB0aGlzWzEwXSA9IFZlYy5Eb3QocjIsIGMyKTsgdGhpc1sxMV0gPSBWZWMuRG90KHIyLCBjMyk7XG4gICAgICAgIHRoaXNbMTJdID0gVmVjLkRvdChyMywgYzApOyB0aGlzWzEzXSA9IFZlYy5Eb3QocjMsIGMxKTsgdGhpc1sxNF0gPSBWZWMuRG90KHIzLCBjMik7IHRoaXNbMTVdID0gVmVjLkRvdChyMywgYzMpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRtdWx0VmVjdG9yKHZlYykge1xuICAgICAgICBpZiAodmVjLmxlbmd0aDwzKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHBhcmFtZXRlciBtdWx0aXBseWluZyBNYXQ0IGJ5IHZlY3RvclwiKTtcbiAgICAgICAgfVxuXG5cdFx0Y29uc3QgeCA9IHZlY1swXTtcblx0XHRjb25zdCB5ID0gdmVjWzFdO1xuXHRcdGNvbnN0IHogPSB2ZWNbMl07XG5cdFx0Y29uc3QgdyA9IHZlYy5sZW5ndGggPjMgPyB2ZWNbM10gOiAxLjA7XG5cdFxuXHRcdHJldHVybiBuZXcgVmVjKCB0aGlzWzBdICogeCArIHRoaXNbNF0gKiB5ICsgdGhpc1sgOF0gKiB6ICsgdGhpc1sxMl0gKiB3LFxuXHRcdFx0XHRcdFx0dGhpc1sxXSAqIHggKyB0aGlzWzVdICogeSArIHRoaXNbIDldICogeiArIHRoaXNbMTNdICogdyxcblx0XHRcdFx0XHRcdHRoaXNbMl0gKiB4ICsgdGhpc1s2XSAqIHkgKyB0aGlzWzEwXSAqIHogKyB0aGlzWzE0XSAqIHcsXG5cdFx0XHRcdFx0XHR0aGlzWzNdICogeCArIHRoaXNbN10gKiB5ICsgdGhpc1sxMV0gKiB6ICsgdGhpc1sxNV0gKiB3KTtcblx0fVxuXHRcblx0aW52ZXJ0KCkge1xuXHRcdGNvbnN0IGEwMCA9IHRoaXNbMF0sICBhMDEgPSB0aGlzWzFdLCAgYTAyID0gdGhpc1syXSwgIGEwMyA9IHRoaXNbM10sXG5cdCAgICAgICAgICBhMTAgPSB0aGlzWzRdLCAgYTExID0gdGhpc1s1XSwgIGExMiA9IHRoaXNbNl0sICBhMTMgPSB0aGlzWzddLFxuXHQgICAgICAgICAgYTIwID0gdGhpc1s4XSwgIGEyMSA9IHRoaXNbOV0sICBhMjIgPSB0aGlzWzEwXSwgYTIzID0gdGhpc1sxMV0sXG5cdCAgICAgICAgICBhMzAgPSB0aGlzWzEyXSwgYTMxID0gdGhpc1sxM10sIGEzMiA9IHRoaXNbMTRdLCBhMzMgPSB0aGlzWzE1XTtcblxuXHQgICAgY29uc3QgYjAwID0gYTAwICogYTExIC0gYTAxICogYTEwLFxuXHQgICAgICAgICAgYjAxID0gYTAwICogYTEyIC0gYTAyICogYTEwLFxuXHQgICAgICAgICAgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwLFxuXHQgICAgICAgICAgYjAzID0gYTAxICogYTEyIC0gYTAyICogYTExLFxuXHQgICAgICAgICAgYjA0ID0gYTAxICogYTEzIC0gYTAzICogYTExLFxuXHQgICAgICAgICAgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyLFxuXHQgICAgICAgICAgYjA2ID0gYTIwICogYTMxIC0gYTIxICogYTMwLFxuXHQgICAgICAgICAgYjA3ID0gYTIwICogYTMyIC0gYTIyICogYTMwLFxuXHQgICAgICAgICAgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwLFxuXHQgICAgICAgICAgYjA5ID0gYTIxICogYTMyIC0gYTIyICogYTMxLFxuXHQgICAgICAgICAgYjEwID0gYTIxICogYTMzIC0gYTIzICogYTMxLFxuXHQgICAgICAgICAgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyO1xuXG5cdCAgICBsZXQgZGV0ID0gYjAwICogYjExIC0gYjAxICogYjEwICsgYjAyICogYjA5ICsgYjAzICogYjA4IC0gYjA0ICogYjA3ICsgYjA1ICogYjA2O1xuXG5cdCAgICBpZiAoIWRldCkge1xuXHRcdFx0dGhpcy56ZXJvKCk7XG5cdCAgICB9XG5cdFx0ZWxzZSB7XG5cdFx0XHRkZXQgPSAxLjAgLyBkZXQ7XG5cblx0XHRcdHRoaXNbMF0gPSAoYTExICogYjExIC0gYTEyICogYjEwICsgYTEzICogYjA5KSAqIGRldDtcblx0XHRcdHRoaXNbMV0gPSAoYTAyICogYjEwIC0gYTAxICogYjExIC0gYTAzICogYjA5KSAqIGRldDtcblx0XHRcdHRoaXNbMl0gPSAoYTMxICogYjA1IC0gYTMyICogYjA0ICsgYTMzICogYjAzKSAqIGRldDtcblx0XHRcdHRoaXNbM10gPSAoYTIyICogYjA0IC0gYTIxICogYjA1IC0gYTIzICogYjAzKSAqIGRldDtcblx0XHRcdHRoaXNbNF0gPSAoYTEyICogYjA4IC0gYTEwICogYjExIC0gYTEzICogYjA3KSAqIGRldDtcblx0XHRcdHRoaXNbNV0gPSAoYTAwICogYjExIC0gYTAyICogYjA4ICsgYTAzICogYjA3KSAqIGRldDtcblx0XHRcdHRoaXNbNl0gPSAoYTMyICogYjAyIC0gYTMwICogYjA1IC0gYTMzICogYjAxKSAqIGRldDtcblx0XHRcdHRoaXNbN10gPSAoYTIwICogYjA1IC0gYTIyICogYjAyICsgYTIzICogYjAxKSAqIGRldDtcblx0XHRcdHRoaXNbOF0gPSAoYTEwICogYjEwIC0gYTExICogYjA4ICsgYTEzICogYjA2KSAqIGRldDtcblx0XHRcdHRoaXNbOV0gPSAoYTAxICogYjA4IC0gYTAwICogYjEwIC0gYTAzICogYjA2KSAqIGRldDtcblx0XHRcdHRoaXNbMTBdID0gKGEzMCAqIGIwNCAtIGEzMSAqIGIwMiArIGEzMyAqIGIwMCkgKiBkZXQ7XG5cdFx0XHR0aGlzWzExXSA9IChhMjEgKiBiMDIgLSBhMjAgKiBiMDQgLSBhMjMgKiBiMDApICogZGV0O1xuXHRcdFx0dGhpc1sxMl0gPSAoYTExICogYjA3IC0gYTEwICogYjA5IC0gYTEyICogYjA2KSAqIGRldDtcblx0XHRcdHRoaXNbMTNdID0gKGEwMCAqIGIwOSAtIGEwMSAqIGIwNyArIGEwMiAqIGIwNikgKiBkZXQ7XG5cdFx0XHR0aGlzWzE0XSA9IChhMzEgKiBiMDEgLSBhMzAgKiBiMDMgLSBhMzIgKiBiMDApICogZGV0O1xuXHRcdFx0dGhpc1sxNV0gPSAoYTIwICogYjAzIC0gYTIxICogYjAxICsgYTIyICogYjAwKSAqIGRldDtcblx0XHR9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cdH1cblx0XG5cdHRyYXNwb3NlKCkge1xuXHRcdGNvbnN0IHIwID0gbmV3IFZlYyh0aGlzWzBdLCB0aGlzWzRdLCB0aGlzWyA4XSwgdGhpc1sxMl0pO1xuXHRcdGNvbnN0IHIxID0gbmV3IFZlYyh0aGlzWzFdLCB0aGlzWzVdLCB0aGlzWyA5XSwgdGhpc1sxM10pO1xuXHRcdGNvbnN0IHIyID0gbmV3IFZlYyh0aGlzWzJdLCB0aGlzWzZdLCB0aGlzWzEwXSwgdGhpc1sxNF0pO1xuXHRcdGNvbnN0IHIzID0gbmV3IFZlYyh0aGlzWzNdLCB0aGlzWzddLCB0aGlzWzExXSwgdGhpc1sxNV0pO1xuXHRcblx0XHR0aGlzLnNldFJvdygwLCByMCk7XG5cdFx0dGhpcy5zZXRSb3coMSwgcjEpO1xuXHRcdHRoaXMuc2V0Um93KDIsIHIyKTtcblx0XHR0aGlzLnNldFJvdygzLCByMyk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXG5cblxuICAgIC8vLy8vLy8vLyBGYWN0b3J5IG1ldGhvZHNcbiAgICBzdGF0aWMgTWFrZUlkZW50aXR5KCkge1xuICAgICAgICBjb25zdCBtID0gbmV3IE1hdDQoKTtcbiAgICAgICAgcmV0dXJuIG0uaWRlbnRpdHkoKTtcbiAgICB9XG5cblx0c3RhdGljIE1ha2VaZXJvKCkge1xuXHRcdGNvbnN0IG0gPSBuZXcgTWF0NCgpO1xuXHRcdHJldHVybiBtLnplcm8oKTtcblx0fVxuXG5cdHN0YXRpYyBNYWtlV2l0aFF1YXRlcm5pb24ocSkge1xuXHRcdGNvbnN0IG0gPSBNYXQ0Lk1ha2VJZGVudGl0eSgpO1xuICAgICAgICBcbiAgICAgICAgbS5zZXRSb3coMCwgbmV3IFZlYyggMSAgLSAyICogcVsxXSAqIHFbMV0gLSAyICogcVsyXSAqIHFbMl0sIDIgKiBxWzBdICogcVsxXSAtIDIgKiBxWzJdICogcVszXSwgMiAqIHFbMF0gKiBxWzJdICsgMiAqIHFbMV0gKiBxWzNdLCAwKSk7XG4gICAgICAgIG0uc2V0Um93KDEsIG5ldyBWZWMoIDIgKiBxWzBdICogcVsxXSArIDIgKiBxWzJdICogcVszXSwgMSAgLSAyLjAgKiBxWzBdICogcVswXSAtIDIgKiBxWzJdICogcVsyXSwgMiAqIHFbMV0gKiBxWzJdIC0gMiAqIHFbMF0gKiBxWzNdLCAwKSk7XG4gICAgICAgIG0uc2V0Um93KDIsIG5ldyBWZWMoIDIgKiBxWzBdICogcVsyXSAtIDIgKiBxWzFdICogcVszXSwgMiAqIHFbMV0gKiBxWzJdICsgMiAqIHFbMF0gKiBxWzNdICwgMSAtIDIgKiBxWzBdICogcVswXSAtIDIgKiBxWzFdICogcVsxXSwgMCkpOy8vXG4gICAgICAgIHJldHVybiBtO1xuXHR9XG5cdFxuICAgIHN0YXRpYyBNYWtlVHJhbnNsYXRpb24oeCwgeSwgeikge1xuXHRcdGlmICh4IGluc3RhbmNlb2YgTnVtZXJpY0FycmF5ICYmIHgubGVuZ3RoID49IDMpIHtcblx0XHRcdHkgPSB4WzFdO1xuXHRcdFx0eiA9IHhbMl07XG5cdFx0XHR4ID0geFswXTtcblx0XHR9XG5cdFx0cmV0dXJuIG5ldyBNYXQ0KFxuXHRcdFx0MS4wLCAwLjAsIDAuMCwgMC4wLFxuXHRcdFx0MC4wLCAxLjAsIDAuMCwgMC4wLFxuXHRcdFx0MC4wLCAwLjAsIDEuMCwgMC4wLFxuXHRcdFx0ICB4LCAgIHksICAgeiwgMS4wXG5cdFx0KTtcblx0fVxuXHRcdFxuXHRzdGF0aWMgTWFrZVJvdGF0aW9uKGFscGhhLCB4LCB5LCB6KSB7XG5cdFx0Y29uc3QgYXhpcyA9IG5ldyBWZWMoeCx5LHopO1xuXHRcdGF4aXMubm9ybWFsaXplKCk7XG5cdFx0XHRcdFxuXHRcdHZhciBjb3NBbHBoYSA9IE1hdGguY29zKGFscGhhKTtcblx0XHR2YXIgYWNvc0FscGhhID0gMS4wIC0gY29zQWxwaGE7XG5cdFx0dmFyIHNpbkFscGhhID0gTWF0aC5zaW4oYWxwaGEpO1xuXHRcdFxuXHRcdHJldHVybiBuZXcgTWF0NChcblx0XHRcdGF4aXMueCAqIGF4aXMueCAqIGFjb3NBbHBoYSArIGNvc0FscGhhLCBheGlzLnggKiBheGlzLnkgKiBhY29zQWxwaGEgKyBheGlzLnogKiBzaW5BbHBoYSwgYXhpcy54ICogYXhpcy56ICogYWNvc0FscGhhIC0gYXhpcy55ICogc2luQWxwaGEsIDAsXG5cdFx0XHRheGlzLnkgKiBheGlzLnggKiBhY29zQWxwaGEgLSBheGlzLnogKiBzaW5BbHBoYSwgYXhpcy55ICogYXhpcy55ICogYWNvc0FscGhhICsgY29zQWxwaGEsIGF4aXMueSAqIGF4aXMueiAqIGFjb3NBbHBoYSArIGF4aXMueCAqIHNpbkFscGhhLCAwLFxuXHRcdFx0YXhpcy56ICogYXhpcy54ICogYWNvc0FscGhhICsgYXhpcy55ICogc2luQWxwaGEsIGF4aXMueiAqIGF4aXMueSAqIGFjb3NBbHBoYSAtIGF4aXMueCAqIHNpbkFscGhhLCBheGlzLnogKiBheGlzLnogKiBhY29zQWxwaGEgKyBjb3NBbHBoYSwgMCxcblx0XHRcdDAsMCwwLDFcblx0XHQpO1xuXHR9XG5cblx0c3RhdGljIE1ha2VTY2FsZSh4LCB5LCB6KSB7XG5cdFx0aWYgKHggaW5zdGFuY2VvZiBOdW1lcmljQXJyYXkgICYmIHgubGVuZ3RoID49IDMpIHtcbiAgICAgICAgICAgIHkgPSB4WzFdO1xuXHRcdFx0eiA9IHhbMl07XG5cdFx0XHR4ID0geFswXTtcblx0XHR9XG5cdFx0cmV0dXJuIG5ldyBNYXQ0KFxuXHRcdFx0eCwgMCwgMCwgMCxcblx0XHRcdDAsIHksIDAsIDAsXG5cdFx0XHQwLCAwLCB6LCAwLFxuXHRcdFx0MCwgMCwgMCwgMVxuXHRcdClcblx0fVxuICAgIFxuXG4gICAgc3RhdGljIE1ha2VQZXJzcGVjdGl2ZShmb3Z5LCBhc3BlY3QsIG5lYXJQbGFuZSwgZmFyUGxhbmUpIHtcblx0XHRyZXR1cm4gKG5ldyBNYXQ0KCkpLnBlcnNwZWN0aXZlKGZvdnksIGFzcGVjdCwgbmVhclBsYW5lLCBmYXJQbGFuZSk7XG5cdH1cblx0XG5cdHN0YXRpYyBNYWtlRnJ1c3R1bShsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIG5lYXJQbGFuZSwgZmFyUGxhbmUpIHtcblx0XHRyZXR1cm4gKG5ldyBNYXQ0KCkpLmZydXN0dW0obGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyUGxhbmUsIGZhclBsYW5lKTtcblx0fVxuXHRcblx0c3RhdGljIE1ha2VPcnRobyhsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIG5lYXJQbGFuZSwgZmFyUGxhbmUpIHtcblx0XHRyZXR1cm4gKG5ldyBNYXQ0KCkpLm9ydGhvKGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhclBsYW5lLCBmYXJQbGFuZSk7XG5cdH1cblxuXHRzdGF0aWMgTWFrZUxvb2tBdChvcmlnaW4sIHRhcmdldCwgdXApIHtcblx0XHRyZXR1cm4gKG5ldyBNYXQ0KCkpLkxvb2tBdChvcmlnaW4sdGFyZ2V0LHVwKTtcblx0fVxuXG5cblxuXG5cbiAgICAvLy8vLy8vIFN0YXRpYyBVdGlsaXRpZXNcbiAgICBzdGF0aWMgVW5wcm9qZWN0KHgsIHksIGRlcHRoLCBtdk1hdCwgcE1hdCwgdmlld3BvcnQpIHtcblx0XHRsZXQgbXZwID0gbmV3IE1hdDQocE1hdCk7XG5cdFx0bXZwLm11bHQobXZNYXQpO1xuXHRcdG12cC5pbnZlcnQoKTtcblxuXHRcdGNvbnN0IHZpbiA9IG5ldyBWZWMoKCh4IC0gdmlld3BvcnQueSkgLyB2aWV3cG9ydC53aWR0aCkgKiAyLjAgLSAxLjAsXG5cdFx0XHRcdFx0XHRcdFx0KCh5IC0gdmlld3BvcnQueCkgLyB2aWV3cG9ydC5oZWlnaHQpICogMi4wIC0gMS4wLFxuXHRcdFx0XHRcdFx0XHRcdGRlcHRoICogMi4wIC0gMS4wLFxuXHRcdFx0XHRcdFx0XHRcdDEuMCk7XG5cdFx0XG5cdFx0Y29uc3QgcmVzdWx0ID0gbmV3IFZlYzQobXZwLm11bHRWZWN0b3IodmluKSk7XG5cdFx0aWYgKHJlc3VsdC56PT0wKSB7XG5cdFx0XHRyZXN1bHQuc2V0KDApO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHJlc3VsdC5zZXQoXHRyZXN1bHQueC9yZXN1bHQudyxcblx0XHRcdFx0XHRcdHJlc3VsdC55L3Jlc3VsdC53LFxuXHRcdFx0XHRcdFx0cmVzdWx0LnovcmVzdWx0LncsXG5cdFx0XHRcdFx0XHRyZXN1bHQudy9yZXN1bHQudyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG4gICAgc3RhdGljIEdldFNjYWxlKG0pIHtcblx0XHRyZXR1cm4gbmV3IFZlYzMoXG4gICAgICAgICAgICBuZXcgVmVjKG1bMV0sIG1bNV0sIG1bOV0pLm1hZ25pdHVkZSgpLFxuXHRcdFx0bmV3IFZlYyhtWzBdLCBtWzRdLCBtWzhdKS5tYWduaXR1ZGUoKSxcblx0XHRcdG5ldyBWZWMobVsyXSwgbVs2XSwgbVsxMF0pLm1hZ25pdHVkZSgpXG5cdFx0KTtcblx0fVxuXG4gICAgc3RhdGljIEdldFJvdGF0aW9uKG0pIHtcblx0XHRjb25zdCBzY2FsZSA9IE1hdDQuR2V0U2NhbGUoKTtcblx0XHRyZXR1cm4gbmV3IE1hdDQoXG5cdFx0XHRcdG1bMF0gLyBzY2FsZS54LCBtWzFdIC8gc2NhbGUueSwgbVsgMl0gLyBzY2FsZS56LCAwLFxuXHRcdFx0XHRtWzRdIC8gc2NhbGUueCwgbVs1XSAvIHNjYWxlLnksIG1bIDZdIC8gc2NhbGUueiwgMCxcblx0XHRcdFx0bVs4XSAvIHNjYWxlLngsIG1bOV0gLyBzY2FsZS55LCBtWzEwXSAvIHNjYWxlLnosIDAsXG5cdFx0XHRcdDAsXHQgICAwLFx0ICAwLCBcdDFcblx0XHQpO1xuXHR9XG5cblx0c3RhdGljIEdldFBvc2l0aW9uKG0pIHtcblx0XHRyZXR1cm4gbmV3IFZlYyhtWzEyXSwgbVsxM10sIG1bMTRdKTtcblx0fVxuXG4gICAgc3RhdGljIEVxdWFscyhtLG4pIHtcblx0XHRyZXR1cm5cdG1bIDBdID09IG5bIDBdICYmIG1bIDFdID09IG5bIDFdICYmIG1bIDJdID09IG5bIDJdICYmIG1bIDNdID09IG5bIDNdICYmXG5cdFx0XHRcdG1bIDRdID09IG5bIDRdICYmIG1bIDVdID09IG5bIDVdICYmIG1bIDZdID09IG5bIDZdICYmIG1bIDddID09IG5bIDddICYmXG5cdFx0XHRcdG1bIDhdID09IG5bIDhdICYmIG1bIDldID09IG5bIDldICYmIG1bMTBdID09IG5bMTBdICYmIG1bMTFdID09IG5bMTFdICYmXG5cdFx0XHRcdG1bMTJdID09IG5bMTJdICYmIG1bMTNdID09IG5bMTNdICYmIG1bMTRdID09IG5bMTRdICYmIG1bMTVdID09IG5bMTVdO1xuXHR9XG5cbiAgICBzdGF0aWMgVHJhbnNmb3JtRGlyZWN0aW9uKE0sIC8qIFZlYyAqLyBkaXIpIHtcblx0XHRjb25zdCBkaXJlY3Rpb24gPSBuZXcgVmVjKGRpcik7XG5cdFx0Y29uc3QgdHJ4ID0gbmV3IE1hdDQoTSk7XG5cdFx0dHJ4LnNldFJvdygzLCBuZXcgVmVjKDAsIDAsIDAsIDEpKTtcblx0XHRkaXJlY3Rpb24uYXNzaWduKHRyeC5tdWx0VmVjdG9yKGRpcmVjdGlvbikueHl6KTtcblx0XHRkaXJlY3Rpb24ubm9ybWFsaXplKCk7XG5cdFx0cmV0dXJuIGRpcmVjdGlvbjtcblx0fVxuXG4gICAgc3RhdGljIElzTmFuKCkge1xuXHRcdHJldHVyblx0aXNOYU4odGhpc1sgMF0pIHx8IGlzTmFOKHRoaXNbIDFdKSB8fCBpc05hTih0aGlzWyAyXSkgfHwgaXNOYU4odGhpc1sgM10pIHx8XG5cdFx0XHRcdGlzTmFOKHRoaXNbIDRdKSB8fCBpc05hTih0aGlzWyA1XSkgfHwgaXNOYU4odGhpc1sgNl0pIHx8IGlzTmFOKHRoaXNbIDddKSB8fFxuXHRcdFx0XHRpc05hTih0aGlzWyA4XSkgfHwgaXNOYU4odGhpc1sgOV0pIHx8IGlzTmFOKHRoaXNbMTBdKSB8fCBpc05hTih0aGlzWzExXSkgfHxcblx0XHRcdFx0aXNOYU4odGhpc1sxMl0pIHx8IGlzTmFOKHRoaXNbMTNdKSB8fCBpc05hTih0aGlzWzE0XSkgfHwgaXNOYU4odGhpc1sxNV0pO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBNYXQ0OiBNYXQ0XG59XG4iLCJpbXBvcnQgVmVjdG9yVXRpbHMgZnJvbSBcIi4vVmVjdG9yLmpzXCI7XG5cbmNvbnN0IFZlYyA9IFZlY3RvclV0aWxzLlZlYztcblxuY2xhc3MgUXVhdCBleHRlbmRzIFZlYyB7XG4gICAgY29uc3RydWN0b3IoYSxiLGMsZCkge1xuICAgICAgICBzdXBlcigwLDAsMCwwKTtcblxuICAgICAgICBpZiAoYSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBWZWMuWmVybyh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChiID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGlmIChhLmxlbmd0aCA9PT0gNCkge1xuICAgICAgICAgICAgICAgIFZlYy5Bc3NpZ24odGhpcywgYSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChhLmxlbmd0aCA9PT0gOSkge1xuICAgICAgICAgICAgICAgIHRoaXMuaW5pdFdpdGhNYXRyaXgzKGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoYS5sZW5ndGggPT09IDE2KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0V2l0aE1hdHJpeDQoYSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHBhcmFtZXRlciBpbml0aWFsaXppbmcgUXVhdGVybmlvblwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChhICE9PSB1bmRlZmluZWQgJiYgYiAhPT0gdW5kZWZpbmVkICYmIGMgIT09IHVuZGVmaW5lZCAmJiBkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMuaW5pdFdpdGhWYWx1ZXMoYSwgYiwgYywgZCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHBhcmFtZXRlcnMgaW5pdGlhbGl6aW5nIFF1YXRlcm5pb25cIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpbml0V2l0aE1hdHJpeDMobSkge1xuICAgICAgICBjb25zdCB3ID0gTWF0aC5zcXJ0KDEgKyBtWzBdICsgbVs0XSArIG1bOF0pIC8gMjtcbiAgICAgICAgY29uc3QgdzQgPSA0ICogdztcbiAgICAgICAgXG4gICAgICAgIHRoaXNbMF0gPSAobVs3XSAtIG1bNV0pIC8gdztcbiAgICAgICAgdGhpc1sxXSA9IChtWzJdIC0gbVs2XSkgLyB3NDtcbiAgICAgICAgdGhpc1syXSA9IChtWzNdIC0gbVsxXSkgLyB3NDtcbiAgICAgICAgdGhpc1szXSA9IHc7XG4gICAgfVxuXG4gICAgaW5pdFdpdGhNYXRyaXg0KG0pIHtcbiAgICAgICAgY29uc3QgdyA9IE1hdGguc3FydCgxICsgbVswXSArIG1bNV0gKyBtWzEwXSkgLyAyO1xuICAgICAgICBjb25zdCB3NCA9IDQgKiB3O1xuICAgICAgICBcbiAgICAgICAgdGhpc1swXSA9IChtWzldIC0gbVs2XSkgLyB3O1xuICAgICAgICB0aGlzWzFdID0gKG1bMl0gLSBtWzhdKSAvIHc0O1xuICAgICAgICB0aGlzWzJdID0gKG1bNF0gLSBtWzFdKSAvIHc0O1xuICAgICAgICB0aGlzWzNdID0gdztcbiAgICB9XG5cbiAgICBpbml0V2l0aFZhbHVlcyhhbHBoYSwgeCwgeSwgeikge1xuICAgICAgICB0aGlzWzBdID0geCAqIE1hdGguc2luKCBhbHBoYSAvIDIgKTtcbiAgICAgICAgdGhpc1sxXSA9IHkgKiBNYXRoLnNpbiggYWxwaGEgLyAyICk7XG4gICAgICAgIHRoaXNbMl0gPSB6ICogTWF0aC5zaW4oIGFscGhhIC8gMiApO1xuICAgICAgICB0aGlzWzNdID0gTWF0aC5jb3MoIGFscGhhIC8gMiApO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBRdWF0OiBRdWF0XG59XG5cbiIsIlxuaW1wb3J0IHtcbiAgICBBeGlzLFxuICAgIFBJLFxuICAgIERFR19UT19SQUQsXG4gICAgUkFEX1RPX0RFRyxcbiAgICBQSV8yLFxuICAgIFBJXzQsXG4gICAgUElfOCxcbiAgICBUV09fUEksXG4gICAgRVBTSUxPTixcbiAgICBOdW1lcmljQXJyYXksXG4gICAgTnVtZXJpY0FycmF5SGlnaFAsXG4gICAgRkxPQVRfTUFYXG59IGZyb20gXCIuL2NvbnN0YW50cy5qc1wiO1xuXG5pbXBvcnQge1xuICAgIGNoZWNrUG93ZXJPZlR3byxcbiAgICBjaGVja1plcm8sXG4gICAgaXNaZXJvLFxuICAgIGVxdWFscyxcbiAgICBkZWdyZWVzVG9SYWRpYW5zLFxuICAgIHJhZGlhbnNUb0RlZ3JlZXMsXG4gICAgc2luLFxuICAgIGNvcyxcbiAgICB0YW4sXG4gICAgY290YW4sXG4gICAgYXRhbixcbiAgICBhdGFuMixcbiAgICByYW5kb20sXG4gICAgc2VlZGVkUmFuZG9tLFxuICAgIG1heCxcbiAgICBtaW4sXG4gICAgYWJzLFxuICAgIHNxcnQsXG4gICAgbGVycCxcbiAgICBzcXVhcmVcbn0gZnJvbSBcIi4vZnVuY3Rpb25zLmpzXCI7XG5cbmltcG9ydCBWZWN0b3JVdGlscyBmcm9tICcuL1ZlY3Rvci5qcyc7XG5cbmltcG9ydCBNYXRyaXgzVXRpbHMgZnJvbSBcIi4vTWF0cml4My5qc1wiO1xuXG5pbXBvcnQgTWF0cml4NFV0aWxzIGZyb20gJy4vTWF0cml4NC5qcyc7XG5cbmltcG9ydCBRdWF0ZXJuaW9uIGZyb20gXCIuL1F1YXRlcm5pb24uanNcIjtcblxuZXhwb3J0IGNvbnN0IG1hdGggPSB7XG4gICAgQXhpcyxcbiAgICBQSSxcbiAgICBERUdfVE9fUkFELFxuICAgIFJBRF9UT19ERUcsXG4gICAgUElfMixcbiAgICBQSV80LFxuICAgIFBJXzgsXG4gICAgVFdPX1BJLFxuICAgIEVQU0lMT04sXG4gICAgTnVtZXJpY0FycmF5LFxuICAgIE51bWVyaWNBcnJheUhpZ2hQLFxuICAgIEZMT0FUX01BWCxcblxuICAgIGNoZWNrUG93ZXJPZlR3byxcbiAgICBjaGVja1plcm8sXG4gICAgaXNaZXJvLFxuICAgIGVxdWFscyxcbiAgICBkZWdyZWVzVG9SYWRpYW5zLFxuICAgIHJhZGlhbnNUb0RlZ3JlZXMsXG4gICAgc2luLFxuICAgIGNvcyxcbiAgICB0YW4sXG4gICAgY290YW4sXG4gICAgYXRhbixcbiAgICBhdGFuMixcbiAgICByYW5kb20sXG4gICAgc2VlZGVkUmFuZG9tLFxuICAgIG1heCxcbiAgICBtaW4sXG4gICAgYWJzLFxuICAgIHNxcnQsXG4gICAgbGVycCxcbiAgICBzcXVhcmVcbn07XG5cbmV4cG9ydCBjb25zdCBWZWMgPSBWZWN0b3JVdGlscy5WZWM7XG5leHBvcnQgY29uc3QgTWF0MyA9IE1hdHJpeDNVdGlscy5NYXQzO1xuZXhwb3J0IGNvbnN0IE1hdDQgPSBNYXRyaXg0VXRpbHMuTWF0NDtcbmV4cG9ydCBjb25zdCBRdWF0ID0gUXVhdGVybmlvbi5RdWF0O1xuXG4iXSwibmFtZXMiOlsiUEkiLCJ0YW4iLCJWZWMiLCJNYXQzIiwiTWF0cml4VXRpbHMiLCJNYXQ0IiwiUXVhdCJdLCJtYXBwaW5ncyI6IkFBQ08sTUFBTSxJQUFJLEdBQUc7QUFDcEIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNSLENBQUMsQ0FB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Q0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakQsRUFBQztBQUNEO0FBQ08sTUFBTSxHQUFHLEdBQUcsQ0FBQyxHQUFHLEtBQUs7QUFDNUIsSUFBSSxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pELEVBQUM7QUFDRDtBQUNPLE1BQU1DLEtBQUcsR0FBRyxDQUFDLEdBQUcsS0FBSztBQUM1QixJQUFJLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakQsRUFBQztBQUNEO0FBQ08sTUFBTSxLQUFLLEdBQUcsQ0FBQyxHQUFHLEtBQUs7QUFDOUIsSUFBSSxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBR0EsS0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsRCxFQUFDO0FBQ0Q7QUFDTyxNQUFNLElBQUksR0FBRyxDQUFDLEdBQUcsS0FBSztBQUM3QixJQUFJLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEQsRUFBQztBQUNEO0FBQ08sTUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLO0FBQy9CLElBQUksT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckQsRUFBQztBQUNEO0FBQ08sTUFBTSxNQUFNLEdBQUcsTUFBTTtBQUM1QixJQUFJLE9BQU8sSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ3pCLEVBQUM7QUFDRDtBQUNPLE1BQU0s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MENBQTBDLENBQUMsQ0FBQyxDQUFDO0FBQzFFLFNBQVM7QUFDVCxLQUFLO0FBQ0w7QUFDQSxJQUFJLFFBQVEsR0FBRztBQUNmLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzlDLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzlDLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzlDLFFBQVEsT0FBTyxJQUFJLENBQUM7QUFDcEIsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLEdBQUc7QUFDWCxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM5QyxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM5QyxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM5QyxRQUFRLE9BQU8sSUFBSSxDQUFDO0FBQ3BCLEtBQUs7QUFDTDtBQUNBLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRTtBQUNYLFFBQVEsT0FBTyxJQUFJRCxLQUFHO0FBQ3RCLFlBQVksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdkIsWUFBWSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDM0IsWUFBWSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdCLEtBQUs7QUFDTDtBQUNBLElBQUksTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEdBQUcsSUFBSSxFQUFFO0FBQ3JDLFFBQVEsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRTtBQUMxQixZQUFZLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BDLFlBQVksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BDLFlBQVksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BDLFNBQVM7QUFDVCxhQUFhLElBQUksT0FBTyxDQUFDLENBQUMsS0FBSyxRQUFRO0FBQ3ZDLFlBQVksT0FBTyxDQUFDLENBQUMsS0FBSyxRQUFRO0FBQ2xDLFlBQVksT0FBTyxDQUFDLENBQUMsS0FBSyxRQUFRO0FBQ2xDLFVBQVU7QUFDVixZQUFZLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2pDLFlBQVksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2pDLFlBQVksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFD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LENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNELEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xELEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ25ELFNBQVM7QUFDVCxhQUFhO0FBQ2IsWUFBWSxNQUFNLElBQUksS0FBSyxDQUFDLENBQUMsc0NBQXNDLENBQUMsQ0FBQyxDQUFDO0FBQ3RFLFNBQVM7QUFDVCxRQUFRLE9BQU8sSUFBSSxDQUFDO0FBQ3BCLEtBQUs7QUFDTDtBQUNBLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQ3BCLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxJQUFJQSxLQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkUsRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLElBQUlBLEtBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2RSxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsSUFBSUEsS0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2pELEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2pELEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2pELEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZCxFQUFFO0FBQ0Y7QUFDQSxJQUFJLFFBQVEsR0FBRztBQUNmLFFBQVEsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNCLFFBQVEsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNCLFFBQVEsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNCLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxQixRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUIsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFCLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNyQixRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDckIsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3JCLFFBQVEsT0FBTyxJQUFJLENBQUM7QUFDcEIsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFO0FBQ1osUUFBUSxJQUFJLE9BQU8sQ0FBQyxDQUFDLEtBQUssUUFBUSxFQUFFO0FBQ3BDLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3JELFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3JELFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3JELFNBQVM7QUFDVCxhQUFhLElBQUksQ0FB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RUFBRSxDQUFDO0FBQ3hCLEtBQUs7QUFDTDtBQUNBLElBQUksT0FBTyxrQkFBa0IsQ0FBQyxDQUFDLEVBQUU7QUFDakMsUUFBUSxNQUFNLENBQUMsR0FBR0EsTUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0FBQ3RDO0FBQ0EsUUFBUSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJRCxLQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1SSxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUlBLEtBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlJLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSUEsS0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUk7QUFDQSxRQUFRLE9BQU8sQ0FBQyxDQUFDO0FBQ2pCLEtBQUs7QUFDTDtBQUNBLElBQUksT0FBTyxNQUFNLENBQUMsQ0FBQyxFQUFFO0FBQ3JCLFFBQVEsT0FBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0QsZ0JBQWdCLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1RCxnQkFBZ0IsTUFBTSxDQUFDLENBQUMs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U0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLFlBQVksUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QyxZQUFZLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkM7QUFDQSxZQUFZLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkMsWUFBWSxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLFlBQVksUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QztBQUNBLFlBQVksUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QyxZQUFZLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkMsWUFBWSxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3hDO0FBQ0EsWUFBWSxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzdCLFNBQVM7QUFDVCxhQUFhLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDdEUsWUFBWSxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNDLFlBQVksUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzQyxZQUFZLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0M7QUFDQSxZQUFZLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0MsWUFBWSxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNDLFlBQVksUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzQztBQUNBLFlBQVksUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzQyxZQUFZLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0MsWUFBWSxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNDO0FBQ0EsWUFBWSxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzdCLFNBQVM7QUFDVDtBQUNBLGFBQWEsSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLEVBQUUsRUFBRTtBQUMxQyxZQUFZLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDeEMsWUFBWSxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ3pDLFlBQVksUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUN6QyxZQUFZLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDekM7QUFDQSxZQUFZLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDekMsWUFBWSxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ3pDLFlBQVksUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUN6QyxZQUFZLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDekM7QUFDQSxZQUFZLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDekMsWUFBWSxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ3pDLFlBQVksUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN6QyxZQUFZLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDekM7QUFDQSxZQUFZLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDekMsWUFBWSxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3pDLFlBQVksUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN6QyxZQUFZLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDekMsU0FBUztBQUNULGFBQWEsSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLEVBQUUsRUFBRTtBQUN2RSxZQUFZLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0MsWUFBWSxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQzVDLFlBQVksUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUM1QyxZQUFZLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDNUM7QUFDQSxZQUFZLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDNUMsWUFBWSxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQzVDLFlBQVksUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUM1QyxZQUFZLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDNUM7QUFDQSxZQUFZLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDNUMsWUFBWSxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQzVDLFlBQVksUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM1QyxZQUFZLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDNUM7QUFDQSxZQUFZLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDNUMsWUFBWSxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzVDLFlBQVksUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM1QyxZQUFZLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDNUMsU0FBUztBQUNULGFBQWEsSUFBSSxTQUFTLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtBQUN4QyxZQUFZLE1BQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDLENBQUM7QUFDN0UsU0FBUztBQUNUO0FBQ0EsUUFBUSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDeEIsS0FBSztBQUNMO0FBQ0E7QUFDQSxJQUFJLFFBQVEsR0FBRztBQUNmLFFBQVEsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUM7QUFDOUQsUUFBUSxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBQztBQUM5RCxRQUFRLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFDO0FBQzlELFFBQVEsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUM7QUFDOUQsUUFBUSxPQUFPLElBQUksQ0FBQztBQUNwQixLQUFLO0FBQ0w7QUFDQSxJQUFJLElBQUksR0FBRztBQUNYLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN6RCxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDekQsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3pELEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN6RCxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2QsRUFBRTtBQUNGO0FBQ0EsSUFBSSxXQUFXLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFO0FBQ25ELEVBQUUsSUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDLElBQUksR0FBRyxFQUFFLEdBQUcsS0FBSyxDQUFDLEdBQUcsU0FBUyxDQUFDO0FBQ2pELEVBQUUsSUFBSSxXQUFXLEdBQUcsS0FBSyxHQUFHLE1BQU0sQ0FBQztBQUNuQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDekUsUUFBUSxPQUFPLElBQUksQ0FBQztBQUNwQixFQUFFO0FBQ0Y7QUFDQSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRTtBQUN4RCxFQUFFLElBQUksQ0FBQyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDdkIsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDO0FBQ3JCLEVBQUUsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQztBQUM3QjtBQUNBLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSUgsS0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUMxRCxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUlBLEtBQUcsQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDMUQsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJQSxLQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDekYsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJQSxLQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdEU7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2QsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUU7QUFDdEQsRUFBRSxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO0FBQ3JCLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQztBQUNyQixFQUFFLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQzVCO0FBQ0EsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM3RCxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzdELEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM3RCxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkc7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2QsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUU7QUFDL0IsUUFBUSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDeEI7QUFDQSxFQUFFLE1BQU0sQ0FBQyxHQUFHLElBQUlBLEtBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMxQixFQUFFLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3JDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ2hCLEVBQUUsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUIsRUFBRSxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDaEIsRUFBRSxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDaEI7QUFDQSxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQixFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQixFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQixFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNqQyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQixFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQixFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQixFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNqQyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQixFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQixFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQixFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNqQyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ2YsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNmLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDZixFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ2Y7QUFDQSxFQUFFLE9BQU8sTUFBTSxDQUFDO0FBQ2hCLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxJQUFJLEdBQUcsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDakMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDOUIsQ0FBQyxJQUFJLEdBQUcsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDOUIsQ0FBQyxJQUFJLEdBQUcsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDOUIsQ0FBQyxJQUFJLEdBQUcsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDOUIsQ0FBQyxJQUFJLEdBQUcsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDOUIsQ0FBQyxJQUFJLEdBQUcsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDOUIsQ0FBQyxJQUFJLEdBQUcsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDOUIsQ0FBQyxJQUFJLEdBQUcsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDOUIsQ0FBQyxJQUFJLEdBQUcsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDOUIsQ0FBQyxJQUFJLEdBQUcsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7QUFDL0IsQ0FBQyxJQUFJLEdBQUcsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7QUFDL0IsQ0FBQyxJQUFJLEdBQUcsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7QUFDL0IsQ0FBQyxJQUFJLEdBQUcsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7QUFDL0IsQ0FBQyxJQUFJLEdBQUcsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7QUFDL0IsQ0FBQyxJQUFJLEdBQUcsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7QUFDL0I7QUFDQSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUM1QixDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUM1QixDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUM1QixDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUM1QixDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUM1QixDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUM1QixDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUM1QixDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUM1QixDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUM1QixDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUM1QixDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUM3QixDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUM3QixDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUM3QixDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUM3QixDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUM3QixDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUM3QjtBQUNBLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRTtBQUNYLFFBQVEsT0FBTyxJQUFJQSxLQUFHO0FBQ3RCLFlBQVksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdkIsWUFBWSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDM0IsWUFBWSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDM0IsWUFBWSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdCLEtBQUs7QUFDTDtBQUNBLElBQUksTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLEVBQUU7QUFDL0MsUUFBUSxJQUFJLENBQUMsWUFBWSxZQUFZLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUU7QUFDdEQsWUFBWSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwQyxZQUFZLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwQyxZQUFZLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwQyxZQUFZLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwQyxTQUFTO0FBQ1QsYUFBYSxJQUFJLE9BQU8sQ0FBQyxDQUFDLEtBQUssUUFBUTtBQUN2QyxZQUFZLE9BQU8sQ0FBQyxDQUFDLEtBQUssUUFBUTtBQUNsQyxZQUFZLE9BQU8sQ0FBQyxDQUFDLEtBQUssUUFBUTtBQUNsQyxZQUFZLE9BQU8sQ0FBQyxDQUFDLEtBQUssUUFBUTtBQUNsQyxVQUFVO0FBQ1YsWUFBWSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNqQyxZQUFZLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNqQyxZQUFZLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNqQyxZQUFZLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNqQyxTQUFTO0FBQ1QsYUFBYTtBQUNiLFlBQVksTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLG9D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LENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNuRSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbkUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ25FLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNoRSxHQUFHO0FBQ0gsT0FBTyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFO0FBQ3pCLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN6RSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDekUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUMxRSxHQUFHO0FBQ0gsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkLEVBQUU7QUFDRjtBQUNBLElBQUksSUFBSSxhQUFhLEdBQUc7QUFDeEIsRUFBRSxPQUFPRSxNQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxFQUFFLElBQUlILEtBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDL0QsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxJQUFJLFdBQVcsR0FBRztBQUNuQixFQUFFLE9BQU9HLE1BQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsSUFBSUgsS0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUMvRCxFQUFFO0FBQ0Y7QUFDQSxDQUFDLElBQUksUUFBUSxHQUFHO0FBQ2hCLEVBQUUsT0FBT0csTUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksRUFBRSxJQUFJSCxLQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQy9ELEVBQUU7QUFDRjtBQUNBLENBQUMsSUFBSSxjQUFjLEdBQUc7QUFDdEIsRUFBRSxPQUFPRyxNQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxFQUFFLElBQUlILEtBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNoRSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLElBQUksVUFBVSxHQUFHO0FBQ2xCLEVBQUUsT0FBT0csTUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksRUFBRSxJQUFJSCxLQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDaEUsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxJQUFJLFVBQVUsR0FBRztBQUNsQixFQUFFLE9BQU9HLE1BQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsSUFBSUgsS0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2hFLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQSxJQUFJLE1BQU0sR0FBRztBQUNiLEVBQUUsT0FBTyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUNqRSxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQzVELElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDNUQsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzdELEVBQUU7QUFDRjtBQUNBLENBQUMsVUFBVSxHQUFHO0FBQ2QsRUFBRSxPQUFPLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ2pFLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDNUQsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUM1RCxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDN0QsRUFBRTtBQUNGO0FBQ0E7QUFDQTtBQUNBLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ3BCLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQ0csTUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0MsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkLEVBQUU7QUFDRjtBQUNBLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUN4QixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUNBLE1BQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvQyxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2QsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDaEIsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDQSxNQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyQyxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2QsRUFBRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxRQUFRLEdBQUc7QUFDZixRQUFRLFFBQVEsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUN4RSxnQkFBZ0IsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUN4RSxnQkFBZ0IsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUN4RSxnQkFBZ0IsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3pFLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUNwQixFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUlILEtBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyRSxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUlBLEtBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyRSxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUlBLEtBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN0RSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNqRCxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNqRCxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNsRCxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2QsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDdEIsRUFBRSxJQUFJLE9BQU8sR0FBRyxDQUFDLEVBQUUsUUFBUSxFQUFFO0FBQzdCLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUNsQixHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDaEIsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2hCLEdBQUc7QUFDSCxPQUFPO0FBQ1AsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNwQixHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3BCLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDcEIsR0FBRztBQUNILEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZCxFQUFFO0FBQ0Y7QUFDQTtBQUNBLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRTtBQUNaLEVBQUUsSUFBSSxPQUFPLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRTtBQUMzQixHQUFHLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDOUQsR0FBRyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzlELEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM5RCxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDOUQsR0FBRyxPQUFPLElBQUksQ0FBQztBQUNmLEdBQUc7QUFDSDtBQUNBLFFBQVEsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvQixRQUFRLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDL0IsUUFBUSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9CLFFBQVEsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvQixRQUFRLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUIsUUFBUSxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVCLFFBQVEsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1QixRQUFRLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUI7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBR0EsS0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUdBLEtBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHQSxLQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBR0EsS0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDdkgsUUFBUSxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUdBLEtBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHQSxLQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBR0EsS0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUdBLEtBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZILFFBQVEsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHQSxLQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBR0EsS0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUdBLEtBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHQSxLQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUN2SCxRQUFRLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBR0EsS0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUdBLEtBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHQSxLQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBR0EsS0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDdkg7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2QsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFO0FBQ2pCLFFBQVEsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRTtBQUMxQixZQUFZLE1BQU0sSUFBSSxLQUFLLENBQUMsOENBQThDLENBQUMsQ0FBQztBQUM1RSxTQUFTO0FBQ1Q7QUFDQSxFQUFFLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuQixFQUFFLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuQixFQUFFLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuQixFQUFFLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDekM7QUFDQSxFQUFFLE9BQU8sSUFBSUEsS0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ3pFLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDN0QsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUM3RCxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUMvRCxFQUFFO0FBQ0Y7QUFDQSxDQUFDLE1BQU0sR0FBRztBQUNWLEVBQUUsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNyRSxXQUFXLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3hFLFdBQVcsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7QUFDekUsV0FBVyxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzFFO0FBQ0EsS0FBSyxNQUFNLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO0FBQ3RDLFdBQVcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDdEMsV0FBVyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztBQUN0QyxXQUFXLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO0FBQ3RDLFdBQVcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDdEMsV0FBVyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztBQUN0QyxXQUFXLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO0FBQ3RDLFdBQVcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDdEMsV0FBVyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztBQUN0QyxXQUFXLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO0FBQ3RDLFdBQVcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDdEMsV0FBVyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQ3ZDO0FBQ0EsS0FBSyxJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztBQUNyRjtBQUNBLEtBQUssSUFBSSxDQUFDLEdBQUcsRUFBRTtBQUNmLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ2YsTUFBTTtBQUNOLE9BQU87QUFDUCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQ25CO0FBQ0EsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUM7QUFDdkQsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUM7QUFDdkQsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUM7QUFDdkQsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUM7QUFDdkQsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUM7QUFDdkQsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUM7QUFDdkQsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUM7QUFDdkQsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUM7QUFDdkQsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUM7QUFDdkQsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUM7QUFDdkQsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUM7QUFDeEQsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUM7QUFDeEQsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUM7QUFDeEQsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUM7QUFDeEQsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUM7QUFDeEQsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUM7QUFDeEQsR0FBRztBQUNIO0FBQ0EsUUFBUSxPQUFPLElBQUksQ0FBQztBQUNwQixFQUFFO0FBQ0Y7QUFDQSxDQUFDLFFBQVEsR0FBRztBQUNaLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSUEsS0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzNELEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSUEsS0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzNELEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSUEsS0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzNELEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSUEsS0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzNEO0FBQ0EsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUNyQixFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3JCLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDckIsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUNyQixFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2QsRUFBRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLE9BQU8sWUFBWSxHQUFHO0FBQzFCLFFBQVEsTUFBTSxDQUFDLEdBQUcsSUFBSUcsTUFBSSxFQUFFLENBQUM7QUFDN0IsUUFBUSxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUM1QixLQUFLO0FBQ0w7QUFDQSxDQUFDLE9BQU8sUUFBUSxHQUFHO0FBQ25CLEVBQUUsTUFBTSxDQUFDLEdBQUcsSUFBSUEsTUFBSSxFQUFFLENBQUM7QUFDdkIsRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNsQixFQUFFO0FBQ0Y7QUFDQSxDQUFDLE9BQU8sa0JBQWtCLENBQUMsQ0FBQyxFQUFFO0FBQzlCLEVBQUUsTUFBTSxDQUFDLEdBQUdBLE1BQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztBQUNoQztBQUNBLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSUgsS0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9JLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSUEsS0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pKLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSUEsS0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9JLFFBQVEsT0FBTyxDQUFDLENBQUM7QUFDakIsRUFBRTtBQUNGO0FBQ0EsSUFBSSxPQUFPLGVBQWUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUNwQyxFQUFFLElBQUksQ0FBQyxZQUFZLFlBQVksSUFBSSxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtBQUNsRCxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDWixHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDWixHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDWixHQUFHO0FBQ0gsRUFBRSxPQUFPLElBQUlHLE1BQUk7QUFDakIsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHO0FBQ3JCLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRztBQUNyQixHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUc7QUFDckIsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHO0FBQ3JCLEdBQUcsQ0FBQztBQUNKLEVBQUU7QUFDRjtBQUNBLENBQUMsT0FBTyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ3JDLEVBQUUsTUFBTSxJQUFJLEdBQUcsSUFBSUgsS0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDOUIsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDbkI7QUFDQSxFQUFFLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDakMsRUFBRSxJQUFJLFNBQVMsR0FBRyxHQUFHLEdBQUcsUUFBUSxDQUFDO0FBQ2pDLEVBQUUsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNqQztBQUNBLEVBQUUsT0FBTyxJQUFJRyxNQUFJO0FBQ2pCLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLFNBQVMsR0FBRyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLFNBQVMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsU0FBUyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsUUFBUSxFQUFFLENBQUM7QUFDOUksR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsU0FBUyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxTQUFTLEdBQUcsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxRQUFRLEVBQUUsQ0FBQztBQUM5SSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLFNBQVMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsU0FBUyxHQUFHLFFBQVEsRUFBRSxDQUFDO0FBQzlJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNWLEdBQUcs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QyxHQUFHLENBQUMsQ0FBQztBQUNwQixLQUFLO0FBQ0w7QUFDQSxJQUFJLGVBQWUsQ0FBQyxDQUFDLEVBQUU7QUFDdkIsUUFBUSxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN6RCxRQUFRLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDekI7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3BDLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDckMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNyQyxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDcEIsS0FBSztBQUNMO0FBQ0EsSUFBSSxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ25DLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUM1QyxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLEdBQUcsQ0FBQyxFQUFFLENBQUM7QUFDNUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxHQUFHLENBQUMsRUFBRSxDQUFDO0FBQzVDLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxHQUFHLENBQUMsRUFBRSxDQUFDO0FBQ3hDLFFBQVEsT0FBTyxJQUFJLENBQUM7QUFDcEIsS0FBSztBQUNMLENBQUM7QUFDRDtBQUNBLGlCQUFlO0FBQ2YsSUFBSSxJQUFJLEVBQUVJLE1BQUk7QUFDZDs7QUNqQlksTUFBQyxJQUFJLEdBQUc7QUFDcEIsSUFBSSxJQUFJO0FBQ1IsUUFBSU4sSUFBRTtBQUNOLElBQUksVUFBVTtBQUNkLElBQUksVUFBVTtBQUNkLElBQUksSUFBSTtBQUNSLElBQUksSUFBSTtBQUNSLElBQUksSUFBSTtBQUNSLElBQUksTUFBTTtBQUNWLElBQUksT0FBTztBQUNYLElBQUksWUFBWTtBQUNoQixJQUFJLGlCQUFpQjtBQUNyQixJQUFJLFNBQVM7QUFDYjtBQUNBLElBQUksZUFBZTtBQUNuQixJQUFJLFNBQVM7QUFDYixJQUFJLE1BQU07QUFDVixJQUFJLE1BQU07QUFDVixJQUFJLGdCQUFnQjtBQUNwQixJQUFJLGdCQUFnQjtBQUNwQixJQUFJLEdBQUc7QUFDUCxJQUFJLEdBQUc7QUFDUCxTQUFJQyxLQUFHO0FBQ1AsSUFBSSxLQUFLO0FBQ1QsSUFBSSxJQUFJO0FBQ1IsSUFBSSxLQUFLO0FBQ1QsSUFBSSxNQUFNO0FBQ1YsSUFBSSxZQUFZO0FBQ2hCLElBQUksR0FBRztBQUNQLElBQUksR0FBRztBQUNQLElBQUksR0FBRztBQUNQLElBQUksSUFBSTtBQUNSLElBQUksSUFBSTtBQUNSLElBQUksTUFBTTtBQUNWLEVBQUU7QUFDRjtBQUNZLE1BQUMsR0FBRyxHQUFHLFdBQVcsQ0FBQyxJQUFJO0FBQ3ZCLE1BQUMsSUFBSSxHQUFHLFlBQVksQ0FBQyxLQUFLO0FBQzFCLE1BQUMsSUFBSSxHQUFHLFlBQVksQ0FBQyxLQUFLO0FBQzFCLE1BQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQzs7OzsifQ==
