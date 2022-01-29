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
        const m = this.magnitude();
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

    magnitude() {
        switch (this.length) {
        case 2:
            return Math.sqrt(this[0] * this[0] + this[1] * this[1]);
        case 3:
            return Math.sqrt(this[0] * this[0] + this[1] * this[1] + this[2] * this[2]);
        case 4:
            return Math.sqrt(this[0] * this[0] + this[1] * this[1] + this[2] * this[2] + this[3] * this[3]);
        default:
            throw new Error(`Invalid vector size: ${ this.length }`);
        }
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

    get xyz() {
        if (this.length !== 4) {
            throw new Error(`Invalid vector size: ${ this.length }`);
        }
        return new Vec$4(this[0], this[1], this[2]);
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
                return v1[0] === v2[0] && v1[1] === v2[1];
            case 3:
                return v1[0] === v2[0] && v1[1] === v2[1] && v1[2] === v2[2];
            case 4:
                return v1[0] === v2[0] && v1[1] === v2[1] && v1[2] === v2[2] && v1[3] === v2[3];
            default:
                throw new Error(`Invalid vector size: ${ v1.length }`);
            }
        }
    }

    static Assign(dst,src) {
        checkEqualLength(dst,src);
        switch (dst.length) {
        case 4:
            dst[3] = src[3];
        case 3:
            dst[2] = src[2];
        case 2:
            dst[1] = src[1];
            dst[0] = src[0];
            break;
        default:
            throw new Error(`Invalid vector size: ${ dst.length }`);
        }
    }

    static Set(v, x, y, z = null, w = null) {
        if (v.length === 2) {
            v[0] = x;
            v[1] = y;
        }
        else if (v.length === 3 && z !== null) {
            v[0] = x;
            v[1] = y;
            v[2] = z;
        }
        else if (v.length === 4 && w !== null) {
            v[0] = x;
            v[1] = y;
            v[2] = z;
            v[3] = w;
        }
        else {
            throw new Error(`Invalid vector size: ${ v.length }. Trying to set x=${x}, y=${y}, z=${z}, w=${w}`);
        }
    }

    static Zero(v) {
        Vec$4.Set(v, 0, 0, 0, 0);
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
}

var VectorUtils = {
    Vec: Vec$4,

//   vec: {
//       
//
//       xy(v) {
//           switch (v.length) {
//           case 2:
//               return new Vector(v);
//           case 3:
//           case 4:
//               return new Vector(v[0], v[1]);
//           default:
//               throw new Error(`Invalid vector size: ${ v.length }`);
//           }
//       },
//
//       xz(v) {
//           switch (v.length) {
//           case 3:
//           case 4:
//               return new Vector(v[0], v[2]);
//           case 2:
//           default:
//               throw new Error(`Invalid vector size: ${ v.length }`);
//           }
//       },
//
//       yz(v) {
//           switch (v.length) {
//           case 3:
//           case 4:
//               return new Vector(v[1], v[2]);
//           case 2:
//           default:
//               throw new Error(`Invalid vector size: ${ v.length }`);
//           }
//       },
//
//       xyz(v) {
//           if (v.length !== 4) {
//               throw new Error(`Invalid vector size: ${ v.length }`);
//           }
//           return new Vector(v[0],v[1],v[2]);
//       }
//   }    
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmcyZS1tYXRoLmpzIiwic291cmNlcyI6WyIuLi9zcmMvanMvY29uc3RhbnRzLmpzIiwiLi4vc3JjL2pzL2Z1bmN0aW9ucy5qcyIsIi4uL3NyYy9qcy9WZWN0b3IuanMiLCIuLi9zcmMvanMvTWF0cml4My5qcyIsIi4uL3NyYy9qcy9NYXRyaXg0LmpzIiwiLi4vc3JjL2pzL1F1YXRlcm5pb24uanMiLCIuLi9zcmMvanMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiXG5leHBvcnQgY29uc3QgQXhpcyA9IHtcblx0Tk9ORTogMCxcblx0WDogMSxcblx0WTogMixcblx0WjogMyxcbiAgICBuYW1lOiAoYXhpcykgPT4ge1xuICAgICAgICBzd2l0Y2ggKGF4aXMpIHtcbiAgICAgICAgY2FzZSBBeGlzLk5PTkU6XG4gICAgICAgICAgICByZXR1cm4gXCJOT05FXCI7XG4gICAgICAgIGNhc2UgQXhpcy5YOlxuICAgICAgICAgICAgcmV0dXJuIFwiWFwiO1xuICAgICAgICBjYXNlIEF4aXMuWTpcbiAgICAgICAgICAgIHJldHVybiBcIllcIjtcbiAgICAgICAgY2FzZSBBeGlzLlo6XG4gICAgICAgICAgICByZXR1cm4gXCJaXCI7XG4gICAgICAgIGNhc2UgQXhpcy5XOlxuICAgICAgICAgICAgcmV0dXJuIFwiV1wiO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIFwiVU5LTk9XTlwiXG4gICAgICAgIH07XG4gICAgfVxufTtcblxuZXhwb3J0IGNvbnN0IFBJID0gMy4xNDE1OTI2NTM1ODk3OTM7XG5leHBvcnQgY29uc3QgREVHX1RPX1JBRCA9IDAuMDE3NDUzMjkyNTE5OTQ7XG5leHBvcnQgY29uc3QgUkFEX1RPX0RFRyA9IDU3LjI5NTc3OTUxMzA4MjMzO1xuZXhwb3J0IGNvbnN0IFBJXzIgPSAxLjU3MDc5NjMyNjc5NDg5NjY7XG5leHBvcnQgY29uc3QgUElfNCA9IDAuNzg1Mzk4MTYzMzk3NDQ4O1xuZXhwb3J0IGNvbnN0IFBJXzggPSAwLjM5MjY5OTA4MTY5ODcyNDtcbmV4cG9ydCBjb25zdCBUV09fUEkgPSA2LjI4MzE4NTMwNzE3OTU4NjtcbmV4cG9ydCBjb25zdCBFUFNJTE9OID0gMC4wMDAwMDAxO1xuXG4vLyBEZWZhdWx0IGFycmF5OiAzMiBiaXRzXG5leHBvcnQgY29uc3QgTnVtZXJpY0FycmF5ID0gRmxvYXQzMkFycmF5O1xuZXhwb3J0IGNvbnN0IE51bWVyaWNBcnJheUhpZ2hQID0gRmxvYXQ2NEFycmF5O1xuZXhwb3J0IGNvbnN0IEZMT0FUX01BWCA9IDMuNDAyODIzZTM4O1xuIiwiXG5pbXBvcnQge1xuICAgIEVQU0lMT04sXG4gICAgREVHX1RPX1JBRCxcbiAgICBSQURfVE9fREVHXG59IGZyb20gJy4vY29uc3RhbnRzLmpzJztcblxubGV0IHNfYmdfbWF0aF9zZWVkID0gRGF0ZS5ub3coKTtcblxuZXhwb3J0IGNvbnN0IGNoZWNrUG93ZXJPZlR3byA9IChuKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBuICE9PSAnbnVtYmVyJykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gbiAmJiAobiAmIChuIC0gMSkpID09PSAwO1xuICAgIH0gIFxufVxuXG5leHBvcnQgY29uc3QgY2hlY2taZXJvID0gKHYpID0+IHtcbiAgICByZXR1cm4gdj4tRVBTSUxPTiAmJiB2PEVQU0lMT04gPyAwOnY7XG59XG5cbmV4cG9ydCBjb25zdCBlcXVhbHMgPSAoYSxiKSA9PiB7XG4gICAgcmV0dXJuIE1hdGguYWJzKGEgLSBiKSA8IEVQU0lMT047XG59XG5cbmV4cG9ydCBjb25zdCBkZWdyZWVzVG9SYWRpYW5zID0gKGQpID0+IHtcbiAgICByZXR1cm4gTWF0aC5mcm91bmQoY2hlY2taZXJvKGQgKiBERUdfVE9fUkFEKSk7XG59XG5cbmV4cG9ydCBjb25zdCByYWRpYW5zVG9EZWdyZWVzID0gKHIpID0+IHtcbiAgICByZXR1cm4gTWF0aC5mcm91bmQoY2hlY2taZXJvKHIgKiBSQURfVE9fREVHKSk7XG59XG5cbmV4cG9ydCBjb25zdCBzaW4gPSAodmFsKSA9PiB7XG4gICAgcmV0dXJuIE1hdGguZnJvdW5kKGNoZWNrWmVybyhNYXRoLnNpbih2YWwpKSk7XG59XG5cbmV4cG9ydCBjb25zdCBjb3MgPSAodmFsKSA9PiB7XG4gICAgcmV0dXJuIE1hdGguZnJvdW5kKGNoZWNrWmVybyhNYXRoLmNvcyh2YWwpKSk7XG59XG5cbmV4cG9ydCBjb25zdCB0YW4gPSAodmFsKSA9PiB7XG4gICAgcmV0dXJuIE1hdGguZnJvdW5kKGNoZWNrWmVybyhNYXRoLnRhbih2YWwpKSk7XG59XG5cbmV4cG9ydCBjb25zdCBjb3RhbiA9ICh2YWwpID0+IHtcbiAgICByZXR1cm4gTWF0aC5mcm91bmQoY2hlY2taZXJvKDEuMCAvIHRhbih2YWwpKSk7XG59XG5cbmV4cG9ydCBjb25zdCBhdGFuID0gKHZhbCkgPT4ge1xuICAgIHJldHVybiBNYXRoLmZyb3VuZChjaGVja1plcm8oTWF0aC5hdGFuKHZhbCkpKTtcbn1cblxuZXhwb3J0IGNvbnN0IGF0YW4yID0gKGksIGopID0+IHtcbiAgICByZXR1cm4gTWF0aC5mcm91bmQoY2hlY2taZXJvKE1hdGguYXRhbjJmKGksIGopKSk7XG59XG5cbmV4cG9ydCBjb25zdCByYW5kb20gPSAoKSA9PiB7XG4gICAgcmV0dXJuIE1hdGgucmFuZG9tKCk7XG59XG5cbmV4cG9ydCBjb25zdCBzZWVkZWRSYW5kb20gPSAoKSA9PiB7XG4gICAgY29uc3QgbWF4ID0gMTtcbiAgICBjb25zdCBtaW4gPSAwO1xuIFxuICAgIHNfYmdfbWF0aF9zZWVkID0gKHNfYmdfbWF0aF9zZWVkICogOTMwMSArIDQ5Mjk3KSAlIDIzMzI4MDtcbiAgICBjb25zdCBybmQgPSBzX2JnX21hdGhfc2VlZCAvIDIzMzI4MDtcbiBcbiAgICByZXR1cm4gbWluICsgcm5kICogKG1heCAtIG1pbik7XG59XG5cbmV4cG9ydCBjb25zdCBtYXggPSAoYSxiKSA9PiB7XG4gICAgcmV0dXJuIE1hdGguZnJvdW5kKE1hdGgubWF4KGEsYikpO1xufVxuXG5leHBvcnQgY29uc3QgbWluID0gKGEsYikgPT4ge1xuICAgIHJldHVybiBNYXRoLmZyb3VuZChNYXRoLm1pbihhLGIpKTtcbn1cblxuZXhwb3J0IGNvbnN0IGFicyA9ICh2YWwpID0+IHtcbiAgICByZXR1cm4gTWF0aC5mcm91bmQoTWF0aC5hYnModmFsKSk7XG59XG5cbmV4cG9ydCBjb25zdCBzcXJ0ID0gKHZhbCkgPT4ge1xuICAgIHJldHVybiBNYXRoLmZyb3VuZChNYXRoLnNxcnQodmFsKSk7XG59XG5cbmV4cG9ydCBjb25zdCBsZXJwID0gKGZyb20sIHRvLCB0KSA9PiB7XG4gICAgcmV0dXJuIE1hdGguZnJvdW5kKCgxLjAgLSB0KSAqIGZyb20gKyB0ICogdG8pO1xufVxuXG5leHBvcnQgY29uc3Qgc3F1YXJlID0gKG4pID0+IHtcbiAgICByZXR1cm4gTWF0aC5mcm91bmQobiAqIG4pO1xufVxuIiwiaW1wb3J0IHsgTnVtZXJpY0FycmF5IH0gZnJvbSBcIi4vY29uc3RhbnRzLmpzXCI7XG5cbmNvbnN0IGNoZWNrRXF1YWxMZW5ndGggPSAodjEsdjIpID0+IHtcbiAgICBpZiAodjEubGVuZ3RoIT12Mi5sZW5ndGgpIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3IgbGVuZ3RoIGluIG9wZXJhdGlvbmApO1xufVxuXG5jbGFzcyBWZWMgZXh0ZW5kcyBOdW1lcmljQXJyYXkge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgaWYgKGFyZ3VtZW50c1swXSBpbnN0YW5jZW9mIE51bWVyaWNBcnJheSAmJiBcbiAgICAgICAgICAgICAgICBhcmd1bWVudHNbMF0ubGVuZ3RoID09PSAyICYmXG4gICAgICAgICAgICAgICAgdHlwZW9mKGFyZ3VtZW50c1sxXSkgPT09IFwibnVtYmVyXCJcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHN1cGVyKFsgYXJndW1lbnRzWzBdWzBdLCBhcmd1bWVudHNbMF1bMV0sIGFyZ3VtZW50c1sxXV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoYXJndW1lbnRzWzBdIGluc3RhbmNlb2YgTnVtZXJpY0FycmF5ICYmIFxuICAgICAgICAgICAgICAgIGFyZ3VtZW50c1swXS5sZW5ndGggPT09IDMgJiZcbiAgICAgICAgICAgICAgICB0eXBlb2YoYXJndW1lbnRzWzFdKSA9PT0gXCJudW1iZXJcIlxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoWyBhcmd1bWVudHNbMF1bMF0sIGFyZ3VtZW50c1swXVsxXSwgYXJndW1lbnRzWzBdWzJdLCBhcmd1bWVudHNbMV1dKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZihhcmd1bWVudHNbMF0pID09PSBcIm51bWJlclwiICYmXG4gICAgICAgICAgICAgICAgdHlwZW9mKGFyZ3VtZW50c1sxXSkgPT09IFwibnVtYmVyXCJcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHN1cGVyKFthcmd1bWVudHNbMF0sYXJndW1lbnRzWzFdXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgaWYgKGFyZ3VtZW50c1swXSBpbnN0YW5jZW9mIE51bWVyaWNBcnJheSAmJlxuICAgICAgICAgICAgICAgIGFyZ3VtZW50c1swXS5sZW5ndGggPT09IDIgJiZcbiAgICAgICAgICAgICAgICB0eXBlb2YoYXJndW1lbnRzWzFdKSA9PT0gXCJudW1iZXJcIiAmJiB0eXBlb2YoYXJndW1lbnRzWzJdKSA9PT0gXCJudW1iZXJcIlxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoWyBhcmd1bWVudHNbMF1bMF0sIGFyZ3VtZW50c1swXVsxXSwgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl1dKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mKGFyZ3VtZW50c1swXSkgPT09IFwibnVtYmVyXCIgJiZcbiAgICAgICAgICAgICAgICB0eXBlb2YoYXJndW1lbnRzWzFdKSA9PT0gXCJudW1iZXJcIiAmJlxuICAgICAgICAgICAgICAgIHR5cGVvZihhcmd1bWVudHNbMl0pID09PSBcIm51bWJlclwiXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBzdXBlcihbYXJndW1lbnRzWzBdLGFyZ3VtZW50c1sxXSxhcmd1bWVudHNbMl1dKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICBzdXBlcihbYXJndW1lbnRzWzBdLGFyZ3VtZW50c1sxXSxhcmd1bWVudHNbMl0sYXJndW1lbnRzWzNdXSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgaWYgKGFyZ3VtZW50c1swXSBpbnN0YW5jZW9mIE51bWVyaWNBcnJheSAmJlxuICAgICAgICAgICAgICAgIGFyZ3VtZW50c1swXS5sZW5ndGg+MSAmJiBhcmd1bWVudHNbMF0ubGVuZ3RoPDUpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgc3VwZXIoYXJndW1lbnRzWzBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHBhcmFtZXRlcnMgaW4gVmVjIGNvbnN0cnVjdG9yYCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBub3JtYWxpemUoKSB7XG4gICAgICAgIGNvbnN0IG0gPSB0aGlzLm1hZ25pdHVkZSgpO1xuICAgICAgICBzd2l0Y2ggKHRoaXMubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHRoaXNbM10gPSB0aGlzWzNdIC8gbTtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgdGhpc1syXSA9IHRoaXNbMl0gLyBtO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICB0aGlzWzFdID0gdGhpc1sxXSAvIG07ICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzWzBdID0gdGhpc1swXSAvIG07XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdGhpcy5sZW5ndGggfWApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIG1hZ25pdHVkZSgpIHtcbiAgICAgICAgc3dpdGNoICh0aGlzLmxlbmd0aCkge1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KHRoaXNbMF0gKiB0aGlzWzBdICsgdGhpc1sxXSAqIHRoaXNbMV0pO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KHRoaXNbMF0gKiB0aGlzWzBdICsgdGhpc1sxXSAqIHRoaXNbMV0gKyB0aGlzWzJdICogdGhpc1syXSk7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnNxcnQodGhpc1swXSAqIHRoaXNbMF0gKyB0aGlzWzFdICogdGhpc1sxXSArIHRoaXNbMl0gKiB0aGlzWzJdICsgdGhpc1szXSAqIHRoaXNbM10pO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB0aGlzLmxlbmd0aCB9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3NpZ24oc3JjKSB7XG4gICAgICAgIGNoZWNrRXF1YWxMZW5ndGgodGhpcyxzcmMpO1xuICAgICAgICBzd2l0Y2ggKHRoaXMubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHRoaXNbM10gPSBzcmNbM107XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHRoaXNbMl0gPSBzcmNbMl07XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHRoaXNbMV0gPSBzcmNbMV07XG4gICAgICAgICAgICB0aGlzWzBdID0gc3JjWzBdO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHRoaXMubGVuZ3RoIH1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldCh4LCB5LCB6ID0gbnVsbCwgdyA9IG51bGwpIHtcbiAgICAgICAgaWYgKHRoaXMubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICB0aGlzWzBdID0geDtcbiAgICAgICAgICAgIHRoaXNbMV0gPSB5O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMubGVuZ3RoID09PSAzICYmIHogIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXNbMF0gPSB4O1xuICAgICAgICAgICAgdGhpc1sxXSA9IHk7XG4gICAgICAgICAgICB0aGlzWzJdID0gejtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLmxlbmd0aCA9PT0gNCAmJiB3ICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzWzBdID0geDtcbiAgICAgICAgICAgIHRoaXNbMV0gPSB5O1xuICAgICAgICAgICAgdGhpc1syXSA9IHo7XG4gICAgICAgICAgICB0aGlzWzNdID0gdztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdGhpcy5sZW5ndGggfS4gVHJ5aW5nIHRvIHNldCB4PSR7eH0sIHk9JHt5fSwgej0ke3p9LCB3PSR7d31gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNjYWxlKHMpIHtcbiAgICAgICAgc3dpdGNoICh0aGlzLmxlbmd0aCkge1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICB0aGlzWzNdID0gdGhpc1szXSAqIHM7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHRoaXNbMl0gPSB0aGlzWzJdICogcztcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgdGhpc1sxXSA9IHRoaXNbMV0gKiBzO1xuICAgICAgICAgICAgdGhpc1swXSA9IHRoaXNbMF0gKiBzO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYubGVuZ3RoIH1gKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBnZXQgeCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMF07XG4gICAgfVxuXG4gICAgZ2V0IHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzFdO1xuICAgIH1cblxuICAgIGdldCB6KCkge1xuICAgICAgICByZXR1cm4gdGhpc1syXTtcbiAgICB9XG5cbiAgICBnZXQgdygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbM107XG4gICAgfVxuXG4gICAgZ2V0IHh5KCkge1xuICAgICAgICBzd2l0Y2ggKHRoaXMubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHJldHVybiBuZXcgVmVjKHRoaXMpO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHJldHVybiBuZXcgVmVjKHRoaXNbMF0sIHRoaXNbMV0pO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB0aGlzLmxlbmd0aCB9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgeHooKSB7XG4gICAgICAgIHN3aXRjaCAodGhpcy5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICByZXR1cm4gbmV3IFZlYyh0aGlzWzBdLCB0aGlzWzJdKTtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB0aGlzLmxlbmd0aCB9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgeXooKSB7XG4gICAgICAgIHN3aXRjaCAodGhpcy5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICByZXR1cm4gbmV3IFZlYyh0aGlzWzFdLCB0aGlzWzJdKTtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB0aGlzLmxlbmd0aCB9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgeHl6KCkge1xuICAgICAgICBpZiAodGhpcy5sZW5ndGggIT09IDQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdGhpcy5sZW5ndGggfWApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgVmVjKHRoaXNbMF0sIHRoaXNbMV0sIHRoaXNbMl0pO1xuICAgIH1cblxuICAgIHN0YXRpYyBDaGVja0VxdWFsTGVuZ3RoKHYxLHYyKSB7XG4gICAgICAgIGNoZWNrRXF1YWxMZW5ndGgodjEsdjIpO1xuICAgIH1cblxuICAgIHN0YXRpYyBNYXgodjEsdjIpIHtcbiAgICAgICAgY2hlY2tFcXVhbExlbmd0aCh2MSx2Mik7XG4gICAgICAgIHN3aXRjaCAodjEubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFtcbiAgICAgICAgICAgICAgICB2MVswXT52MlswXSA/IHYxWzBdIDogdjJbMF0sXG4gICAgICAgICAgICAgICAgdjFbMV0+djJbMV0gPyB2MVsxXSA6IHYyWzFdXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoW1xuICAgICAgICAgICAgICAgIHYxWzBdPnYyWzBdID8gdjFbMF0gOiB2MlswXSxcbiAgICAgICAgICAgICAgICB2MVsxXT52MlsxXSA/IHYxWzFdIDogdjJbMV0sXG4gICAgICAgICAgICAgICAgdjFbMl0+djJbMl0gPyB2MVsyXSA6IHYyWzJdXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoW1xuICAgICAgICAgICAgICAgIHYxWzBdPnYyWzBdID8gdjFbMF0gOiB2MlswXSxcbiAgICAgICAgICAgICAgICB2MVsxXT52MlsxXSA/IHYxWzFdIDogdjJbMV0sXG4gICAgICAgICAgICAgICAgdjFbMl0+djJbMl0gPyB2MVsyXSA6IHYyWzJdLFxuICAgICAgICAgICAgICAgIHYxWzNdPnYyWzNdID8gdjFbM10gOiB2MlszXVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYxLmxlbmd0aCB9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgTWluKHYxLHYyKSB7XG4gICAgICAgIGNoZWNrRXF1YWxMZW5ndGgodjEsdjIpO1xuICAgICAgICBzd2l0Y2ggKHYxLmxlbmd0aCkge1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbXG4gICAgICAgICAgICAgICAgdjFbMF08djJbMF0gPyB2MVswXSA6IHYyWzBdLFxuICAgICAgICAgICAgICAgIHYxWzFdPHYyWzFdID8gdjFbMV0gOiB2MlsxXVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFtcbiAgICAgICAgICAgICAgICB2MVswXTx2MlswXSA/IHYxWzBdIDogdjJbMF0sXG4gICAgICAgICAgICAgICAgdjFbMV08djJbMV0gPyB2MVsxXSA6IHYyWzFdLFxuICAgICAgICAgICAgICAgIHYxWzJdPHYyWzJdID8gdjFbMl0gOiB2MlsyXVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFtcbiAgICAgICAgICAgICAgICB2MVswXTx2MlswXSA/IHYxWzBdIDogdjJbMF0sXG4gICAgICAgICAgICAgICAgdjFbMV08djJbMV0gPyB2MVsxXSA6IHYyWzFdLFxuICAgICAgICAgICAgICAgIHYxWzJdPHYyWzJdID8gdjFbMl0gOiB2MlsyXSxcbiAgICAgICAgICAgICAgICB2MVszXTx2MlszXSA/IHYxWzNdIDogdjJbM11cbiAgICAgICAgICAgIF0pO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB2MS5sZW5ndGggfWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIEFkZCh2MSx2Mikge1xuICAgICAgICBjaGVja0VxdWFsTGVuZ3RoKHYxLHYyKTtcbiAgICAgICAgc3dpdGNoICh2MS5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoW1xuICAgICAgICAgICAgICAgIHYxWzBdICsgdjJbMF0sXG4gICAgICAgICAgICAgICAgdjFbMV0gKyB2MlsxXVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFtcbiAgICAgICAgICAgICAgICB2MVswXSArIHYyWzBdLFxuICAgICAgICAgICAgICAgIHYxWzFdICsgdjJbMV0sXG4gICAgICAgICAgICAgICAgdjFbMl0gKyB2MlsyXVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFtcbiAgICAgICAgICAgICAgICB2MVswXSArIHYyWzBdLFxuICAgICAgICAgICAgICAgIHYxWzFdICsgdjJbMV0sXG4gICAgICAgICAgICAgICAgdjFbMl0gKyB2MlsyXSxcbiAgICAgICAgICAgICAgICB2MVszXSArIHYyWzNdXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdjEubGVuZ3RoIH1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBTdWIodjEsdjIpIHtcbiAgICAgICAgY2hlY2tFcXVhbExlbmd0aCh2MSx2Mik7XG4gICAgICAgIHN3aXRjaCAodjEubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFtcbiAgICAgICAgICAgICAgICB2MVswXSAtIHYyWzBdLFxuICAgICAgICAgICAgICAgIHYxWzFdIC0gdjJbMV1cbiAgICAgICAgICAgIF0pO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbXG4gICAgICAgICAgICAgICAgdjFbMF0gLSB2MlswXSxcbiAgICAgICAgICAgICAgICB2MVsxXSAtIHYyWzFdLFxuICAgICAgICAgICAgICAgIHYxWzJdIC0gdjJbMl1cbiAgICAgICAgICAgIF0pO1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbXG4gICAgICAgICAgICAgICAgdjFbMF0gLSB2MlswXSxcbiAgICAgICAgICAgICAgICB2MVsxXSAtIHYyWzFdLFxuICAgICAgICAgICAgICAgIHYxWzJdIC0gdjJbMl0sXG4gICAgICAgICAgICAgICAgdjFbM10gLSB2MlszXVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYxLmxlbmd0aCB9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgTWFnbml0dWRlKHYpIHtcbiAgICAgICAgc3dpdGNoICh2Lmxlbmd0aCkge1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KHZbMF0gKiB2WzBdICsgdlsxXSAqIHZbMV0pO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KHZbMF0gKiB2WzBdICsgdlsxXSAqIHZbMV0gKyB2WzJdICogdlsyXSk7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnNxcnQodlswXSAqIHZbMF0gKyB2WzFdICogdlsxXSArIHZbMl0gKiB2WzJdICsgdlszXSAqIHZbM10pO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB2Lmxlbmd0aCB9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgRGlzdGFuY2UodjEsdjIpIHtcbiAgICAgICAgY2hlY2tFcXVhbExlbmd0aCh2MSx2Mik7XG4gICAgICAgIHJldHVybiBWZWMuTWFnbml0dWRlKFZlYy5TdWIodjEsdjIpKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgRG90KHYxLHYyKSB7XG4gICAgICAgIGNoZWNrRXF1YWxMZW5ndGgodjEsdjIpO1xuICAgICAgICBzd2l0Y2ggKHYxLmxlbmd0aCkge1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICByZXR1cm4gdjFbMF0gKiB2MlswXSArIHYxWzFdICogdjJbMV07XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHJldHVybiB2MVswXSAqIHYyWzBdICsgdjFbMV0gKiB2MlsxXSArIHYxWzJdICogdjJbMl07XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHJldHVybiB2MVswXSAqIHYyWzBdICsgdjFbMV0gKiB2MlsxXSArIHYxWzJdICogdjJbMl0gKyB2MVszXSAqIHYyWzNdO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB2MS5sZW5ndGggfWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIENyb3NzKHYxLHYyKSB7XG4gICAgICAgIGNoZWNrRXF1YWxMZW5ndGgodjEsdjIpO1xuICAgICAgICBzd2l0Y2ggKHYxLmxlbmd0aCkge1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICByZXR1cm4gdjFbMF0gKiB2MlsxXSAtIHYxWzFdIC0gdjJbMF07XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFtcbiAgICAgICAgICAgICAgICB2MVsxXSAqIHYyWzJdIC0gdjFbMl0gKiB2MlsxXSxcbiAgICAgICAgICAgICAgICB2MVsyXSAqIHYyWzBdIC0gdjFbMF0gKiB2MlsyXSxcbiAgICAgICAgICAgICAgICB2MVswXSAqIHYyWzFdIC0gdjFbMV0gKiB2MlswXSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplIGZvciBjcm9zcyBwcm9kdWN0OiAkeyB2MS5sZW5ndGggfWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIE5vcm1hbGl6ZWQodikge1xuICAgICAgICBjb25zdCBtID0gVmVjLk1hZ25pdHVkZSh2KTtcbiAgICAgICAgc3dpdGNoICh2Lmxlbmd0aCkge1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbIHZbMF0gLyBtLCB2WzFdIC8gbSBdKTtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoWyB2WzBdIC8gbSwgdlsxXSAvIG0sIHZbMl0gLyBtIF0pO1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbIHZbMF0gLyBtLCB2WzFdIC8gbSwgdlsyXSAvIG0sIHZbM10gLyBtIF0pXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYubGVuZ3RoIH1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBNdWx0KHYscykge1xuICAgICAgICBzd2l0Y2ggKHYubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFsgdlswXSAqIHMsIHZbMV0gKiBzIF0pO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbIHZbMF0gKiBzLCB2WzFdICogcywgdlsyXSAqIHMgXSk7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFsgdlswXSAqIHMsIHZbMV0gKiBzLCB2WzJdICogcywgdlszXSAqIHMgXSk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYubGVuZ3RoIH1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBEaXYodixzKSB7XG4gICAgICAgIHN3aXRjaCAodi5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoWyB2WzBdIC8gcywgdlsxXSAvIHMgXSk7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFsgdlswXSAvIHMsIHZbMV0gLyBzLCB2WzJdIC8gcyBdKTtcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoWyB2WzBdIC8gcywgdlsxXSAvIHMsIHZbMl0gLyBzLCB2WzNdIC8gcyBdKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdi5sZW5ndGggfWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIEVxdWFscyh2MSx2Mikge1xuICAgICAgICBpZiAodjEubGVuZ3RoICE9IHYyLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgc3dpdGNoICh2MS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdjFbMF0gPT09IHYyWzBdICYmIHYxWzFdID09PSB2MlsxXTtcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdjFbMF0gPT09IHYyWzBdICYmIHYxWzFdID09PSB2MlsxXSAmJiB2MVsyXSA9PT0gdjJbMl07XG4gICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHYxWzBdID09PSB2MlswXSAmJiB2MVsxXSA9PT0gdjJbMV0gJiYgdjFbMl0gPT09IHYyWzJdICYmIHYxWzNdID09PSB2MlszXTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB2MS5sZW5ndGggfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIEFzc2lnbihkc3Qsc3JjKSB7XG4gICAgICAgIGNoZWNrRXF1YWxMZW5ndGgoZHN0LHNyYyk7XG4gICAgICAgIHN3aXRjaCAoZHN0Lmxlbmd0aCkge1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICBkc3RbM10gPSBzcmNbM107XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIGRzdFsyXSA9IHNyY1syXTtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgZHN0WzFdID0gc3JjWzFdO1xuICAgICAgICAgICAgZHN0WzBdID0gc3JjWzBdO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IGRzdC5sZW5ndGggfWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIFNldCh2LCB4LCB5LCB6ID0gbnVsbCwgdyA9IG51bGwpIHtcbiAgICAgICAgaWYgKHYubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICB2WzBdID0geDtcbiAgICAgICAgICAgIHZbMV0gPSB5O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHYubGVuZ3RoID09PSAzICYmIHogIT09IG51bGwpIHtcbiAgICAgICAgICAgIHZbMF0gPSB4O1xuICAgICAgICAgICAgdlsxXSA9IHk7XG4gICAgICAgICAgICB2WzJdID0gejtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh2Lmxlbmd0aCA9PT0gNCAmJiB3ICE9PSBudWxsKSB7XG4gICAgICAgICAgICB2WzBdID0geDtcbiAgICAgICAgICAgIHZbMV0gPSB5O1xuICAgICAgICAgICAgdlsyXSA9IHo7XG4gICAgICAgICAgICB2WzNdID0gdztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdi5sZW5ndGggfS4gVHJ5aW5nIHRvIHNldCB4PSR7eH0sIHk9JHt5fSwgej0ke3p9LCB3PSR7d31gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBaZXJvKHYpIHtcbiAgICAgICAgVmVjLlNldCh2LCAwLCAwLCAwLCAwKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgSXNOYU4odikge1xuICAgICAgICBzd2l0Y2ggKHYubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHJldHVybiBpc05hTih2WzBdKSB8fCBpc05hTih2WzFdKTtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgcmV0dXJuIGlzTmFOKHZbMF0pIHx8IGlzTmFOKHZbMV0pIHx8IGlzTmFOKHZbMl0pO1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICByZXR1cm4gaXNOYU4odlswXSkgfHwgaXNOYU4odlsxXSkgfHwgaXNOYU4odlsyXSkgfHwgaXNOYU4odlszXSk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYubGVuZ3RoIH1gKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIFZlYzogVmVjLFxuXG4vLyAgIHZlYzoge1xuLy8gICAgICAgXG4vL1xuLy8gICAgICAgeHkodikge1xuLy8gICAgICAgICAgIHN3aXRjaCAodi5sZW5ndGgpIHtcbi8vICAgICAgICAgICBjYXNlIDI6XG4vLyAgICAgICAgICAgICAgIHJldHVybiBuZXcgVmVjdG9yKHYpO1xuLy8gICAgICAgICAgIGNhc2UgMzpcbi8vICAgICAgICAgICBjYXNlIDQ6XG4vLyAgICAgICAgICAgICAgIHJldHVybiBuZXcgVmVjdG9yKHZbMF0sIHZbMV0pO1xuLy8gICAgICAgICAgIGRlZmF1bHQ6XG4vLyAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdi5sZW5ndGggfWApO1xuLy8gICAgICAgICAgIH1cbi8vICAgICAgIH0sXG4vL1xuLy8gICAgICAgeHoodikge1xuLy8gICAgICAgICAgIHN3aXRjaCAodi5sZW5ndGgpIHtcbi8vICAgICAgICAgICBjYXNlIDM6XG4vLyAgICAgICAgICAgY2FzZSA0OlxuLy8gICAgICAgICAgICAgICByZXR1cm4gbmV3IFZlY3Rvcih2WzBdLCB2WzJdKTtcbi8vICAgICAgICAgICBjYXNlIDI6XG4vLyAgICAgICAgICAgZGVmYXVsdDpcbi8vICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB2Lmxlbmd0aCB9YCk7XG4vLyAgICAgICAgICAgfVxuLy8gICAgICAgfSxcbi8vXG4vLyAgICAgICB5eih2KSB7XG4vLyAgICAgICAgICAgc3dpdGNoICh2Lmxlbmd0aCkge1xuLy8gICAgICAgICAgIGNhc2UgMzpcbi8vICAgICAgICAgICBjYXNlIDQ6XG4vLyAgICAgICAgICAgICAgIHJldHVybiBuZXcgVmVjdG9yKHZbMV0sIHZbMl0pO1xuLy8gICAgICAgICAgIGNhc2UgMjpcbi8vICAgICAgICAgICBkZWZhdWx0OlxuLy8gICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYubGVuZ3RoIH1gKTtcbi8vICAgICAgICAgICB9XG4vLyAgICAgICB9LFxuLy9cbi8vICAgICAgIHh5eih2KSB7XG4vLyAgICAgICAgICAgaWYgKHYubGVuZ3RoICE9PSA0KSB7XG4vLyAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdi5sZW5ndGggfWApO1xuLy8gICAgICAgICAgIH1cbi8vICAgICAgICAgICByZXR1cm4gbmV3IFZlY3Rvcih2WzBdLHZbMV0sdlsyXSk7XG4vLyAgICAgICB9XG4vLyAgIH0gICAgXG59XG5cbiIsImltcG9ydCB7IE51bWVyaWNBcnJheSB9IGZyb20gXCIuL2NvbnN0YW50cy5qc1wiO1xuaW1wb3J0IFZlY3RvclV0aWxzIGZyb20gXCIuL1ZlY3Rvci5qc1wiO1xuXG5jb25zdCBWZWMgPSBWZWN0b3JVdGlscy5WZWM7XG5cbmNsYXNzIE1hdDMgZXh0ZW5kcyBOdW1lcmljQXJyYXkge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gOSkge1xuICAgICAgICAgICAgc3VwZXIoYXJndW1lbnRzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxICYmIGFyZ3VtZW50c1swXS5sZW5ndGggPT09IDkpIHtcbiAgICAgICAgICAgIHN1cGVyKGFyZ3VtZW50c1swXSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgc3VwZXIoWzAsMCwwLDAsMCwwLDAsMCwwXSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcGFyYW1ldGVyIHNpemUgaW4gTWF0MyBjb25zdHJ1Y3RvcmApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWRlbnRpdHkoKSB7XG4gICAgICAgIHRoaXNbMF0gPSAxOyB0aGlzWzFdID0gMDsgdGhpc1syXSA9IDA7XG4gICAgICAgIHRoaXNbM10gPSAwOyB0aGlzWzRdID0gMTsgdGhpc1s1XSA9IDA7XG4gICAgICAgIHRoaXNbNl0gPSAwOyB0aGlzWzddID0gMDsgdGhpc1s4XSA9IDE7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHplcm8oKSB7XG4gICAgICAgIHRoaXNbMF0gPSAwOyB0aGlzWzFdID0gMDsgdGhpc1syXSA9IDA7XG4gICAgICAgIHRoaXNbM10gPSAwOyB0aGlzWzRdID0gMDsgdGhpc1s1XSA9IDA7XG4gICAgICAgIHRoaXNbNl0gPSAwOyB0aGlzWzddID0gMDsgdGhpc1s4XSA9IDA7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHJvdyhpKSB7XG4gICAgICAgIHJldHVybiBuZXcgVmVjKFxuICAgICAgICAgICAgdGhpc1tpICogM10sIFxuICAgICAgICAgICAgdGhpc1tpICogMyArIDFdLFxuICAgICAgICAgICAgdGhpc1sgaSogMyArIDJdKTtcbiAgICB9XG5cbiAgICBzZXRSb3coaSwgYSwgeSA9IG51bGwsIHogPSBudWxsKSB7XG4gICAgICAgIGlmIChhIGluc3RhbmNlb2YgTnVtZXJpY0FycmF5ICYmIGEubGVuZ3RoPj0zKSB7XG4gICAgICAgICAgICB0aGlzW2kgKiAzXSAgICAgID0gYVswXTtcbiAgICAgICAgICAgIHRoaXNbaSAqIDMgKyAxXSAgPSBhWzFdO1xuICAgICAgICAgICAgdGhpc1tpICogMyArIDJdICA9IGFbMl07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mKGEpID09PSBcIm51bWJlclwiICYmIFxuICAgICAgICAgICAgdHlwZW9mKHkpID09PSBcIm51bWJlclwiICYmIFxuICAgICAgICAgICAgdHlwZW9mKHopID09PSBcIm51bWJlclwiXG4gICAgICAgICkge1xuICAgICAgICAgICAgdGhpc1tpICogM10gICAgICA9IGE7XG4gICAgICAgICAgICB0aGlzW2kgKiAzICsgMV0gID0geTtcbiAgICAgICAgICAgIHRoaXNbaSAqIDMgKyAyXSAgPSB6O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHBhcmFtZXRlciBzZXR0aW5nIG1hdHJpeCByb3dgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjb2woaSkge1xuICAgICAgICByZXR1cm4gbmV3IFZlYyhcbiAgICAgICAgICAgIHRoaXNbaV0sXG4gICAgICAgICAgICB0aGlzW2kgKyAzXSxcbiAgICAgICAgICAgIHRoaXNbaSArIDMgKiAyXVxuICAgICAgICApXG4gICAgfVxuXG4gICAgc2V0Q29sKGksIGEsIHkgPSBudWxsLCB6ID0gbnVsbCkge1xuICAgICAgICBpZiAoYSBpbnN0YW5jZW9mIE51bWVyaWNBcnJheSAmJiBhLmxlbmd0aD49Mykge1xuICAgICAgICAgICAgdGhpc1tpXSAgICAgICAgID0gYVswXTtcbiAgICAgICAgICAgIHRoaXNbaSArIDNdICAgICA9IGFbMV07XG4gICAgICAgICAgICB0aGlzW2kgKyAzICogMl0gPSBhWzJdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZihhKSA9PT0gXCJudW1iZXJcIiAmJiBcbiAgICAgICAgICAgIHR5cGVvZih5KSA9PT0gXCJudW1iZXJcIiAmJiBcbiAgICAgICAgICAgIHR5cGVvZih6KSA9PT0gXCJudW1iZXJcIlxuICAgICAgICApIHtcbiAgICAgICAgICAgIHRoaXNbaV0gICAgICAgICA9IGE7XG4gICAgICAgICAgICB0aGlzW2kgKyAzXSAgICAgPSB5O1xuICAgICAgICAgICAgdGhpc1tpICsgMyAqIDJdID0gejtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBwYXJhbWV0ZXIgc2V0dGluZyBtYXRyaXggcm93YCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgYXNzaWduKG0pIHtcbiAgICAgICAgaWYgKG0ubGVuZ3RoID09PSA5KSB7XG4gICAgICAgICAgICB0aGlzWzBdID0gbVswXTsgdGhpc1sxXSA9IG1bMV07IHRoaXNbMl0gPSBtWzJdO1xuXHRcdFx0dGhpc1szXSA9IG1bM107IHRoaXNbNF0gPSBtWzRdOyB0aGlzWzVdID0gbVs1XTtcblx0XHRcdHRoaXNbNl0gPSBtWzZdOyB0aGlzWzddID0gbVs3XTsgdGhpc1s4XSA9IG1bOF07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobS5sZW5ndGggPT09IDE2KSB7XG4gICAgICAgICAgICB0aGlzWzBdID0gbVswXTsgdGhpc1sxXSA9IG1bMV07IHRoaXNbMl0gPSBtWzJdO1xuXHRcdFx0dGhpc1szXSA9IG1bNF07IHRoaXNbNF0gPSBtWzVdOyB0aGlzWzVdID0gbVs2XTtcblx0XHRcdHRoaXNbNl0gPSBtWzhdOyB0aGlzWzddID0gbVs5XTsgdGhpc1s4XSA9IG1bMTBdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHBsYXJhbWV0ZXIgc2V0dGluZyBtYXRyaXggZGF0YWApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHNldFNjYWxlKHgseSx6KSB7IFxuXHRcdGNvbnN0IHJ4ID0gKG5ldyBWZWModGhpc1swXSwgdGhpc1szXSwgdGhpc1s2XSkpLm5vcm1hbGl6ZSgpLnNjYWxlKHgpO1xuXHRcdGNvbnN0IHJ5ID0gKG5ldyBWZWModGhpc1sxXSwgdGhpc1s0XSwgdGhpc1s3XSkpLm5vcm1hbGl6ZSgpLnNjYWxlKHkpO1xuXHRcdGNvbnN0IHJ6ID0gKG5ldyBWZWModGhpc1syXSwgdGhpc1s1XSwgdGhpc1s4XSkpLm5vcm1hbGl6ZSgpLnNjYWxlKHopO1xuXHRcdHRoaXNbMF0gPSByeC54OyB0aGlzWzNdID0gcngueTsgdGhpc1s2XSA9IHJ4Lno7XG5cdFx0dGhpc1sxXSA9IHJ5Lng7IHRoaXNbNF0gPSByeS55OyB0aGlzWzddID0gcnkuejtcblx0XHR0aGlzWzJdID0gcnoueDsgdGhpc1s1XSA9IHJ6Lnk7IHRoaXNbOF0gPSByei56O1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cbiAgICB0cmFzcG9zZSgpIHtcbiAgICAgICAgY29uc3QgbTMgPSB0aGlzWzNdOyAgLy8gMCwgMSwgMlxuICAgICAgICBjb25zdCBtNyA9IHRoaXNbN107ICAvLyAzLCA0LCA1XG4gICAgICAgIGNvbnN0IG02ID0gdGhpc1s2XTsgIC8vIDYsIDcsIDhcbiAgICAgICAgdGhpc1szXSA9IHRoaXNbMV07XG4gICAgICAgIHRoaXNbNl0gPSB0aGlzWzJdO1xuICAgICAgICB0aGlzWzddID0gdGhpc1s1XTtcbiAgICAgICAgdGhpc1sxXSA9IG0zO1xuICAgICAgICB0aGlzWzJdID0gbTY7XG4gICAgICAgIHRoaXNbNV0gPSBtNztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgbXVsdChhKSB7XG4gICAgICAgIGlmICh0eXBlb2YoYSkgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgIHRoaXNbMF0gKj0gYTsgdGhpc1sxXSAqPSBhOyB0aGlzWzJdICo9IGE7XG4gICAgICAgICAgICB0aGlzWzNdICo9IGE7IHRoaXNbNF0gKj0gYTsgdGhpc1s1XSAqPSBhO1xuICAgICAgICAgICAgdGhpc1s2XSAqPSBhOyB0aGlzWzddICo9IGE7IHRoaXNbOF0gKj0gYTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChhIGluc3RhbmNlb2YgTnVtZXJpY0FycmF5ICYmIGEubGVuZ3RoID09PSA5KSB7XG4gICAgICAgICAgICBjb25zdCByMCA9IHRoaXMucm93KDApO1xuICAgICAgICAgICAgY29uc3QgcjEgPSB0aGlzLnJvdygxKTtcbiAgICAgICAgICAgIGNvbnN0IHIyID0gdGhpcy5yb3coMik7XG4gICAgICAgICAgICBjb25zdCBjMCA9IGEuY29sKDApO1xuICAgICAgICAgICAgY29uc3QgYzEgPSBhLmNvbCgxKTtcbiAgICAgICAgICAgIGNvbnN0IGMyID0gYS5jb2woMik7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXNbMF0gPSBWZWMuRG90KHIwLGMwKTsgdGhpc1sxXSA9IFZlYy5Eb3QocjAsYzEpOyB0aGlzWzJdID0gVmVjLkRvdChyMCxjMik7XG4gICAgICAgICAgICB0aGlzWzNdID0gVmVjLkRvdChyMSxjMCk7IHRoaXNbNF0gPSBWZWMuRG90KHIxLGMxKTsgdGhpc1s1XSA9IFZlYy5Eb3QocjEsYzIpO1xuICAgICAgICAgICAgdGhpc1s2XSA9IFZlYy5Eb3QocjIsYzApOyB0aGlzWzddID0gVmVjLkRvdChyMixjMSk7IHRoaXNbOF0gPSBWZWMuRG90KHIyLGMyKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBwYXJhbWV0ZXIgaW4gTWF0My5tdWx0KClgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBtdWx0VmVjdG9yKHYpIHtcbiAgICAgICAgaWYgKHYubGVuZ3RoID09PSAyIHx8IHYubGVuZ3RoID09PSAzKSB7XG4gICAgICAgICAgICBjb25zdCB4ID0gdlswXTtcbiAgICAgICAgICAgIGNvbnN0IHkgPSB2WzFdO1xuICAgICAgICAgICAgY29uc3QgeiA9IHYubGVuZ3RoID09PSAyID8gMSA6IHZbMl07XG4gICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIG5ldyBWZWMoXHR0aGlzWzBdICogeCArIHRoaXNbM10gKiB5ICsgdGhpc1s2XSAqIHosXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpc1sxXSAqIHggKyB0aGlzWzRdICogeSArIHRoaXNbN10gKiB6LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNbMl0gKiB4ICsgdGhpc1s1XSAqIHkgKyB0aGlzWzhdICogeik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcGFyYW1ldGVyIGluIE1hdDMubXVsdFZlY3RvcigpYCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuICBgWyAke3RoaXNbMF19LCAke3RoaXNbMV19LCAke3RoaXNbMl19XFxuYCArXG4gICAgICAgICAgICAgICAgYCAgJHt0aGlzWzNdfSwgJHt0aGlzWzRdfSwgJHt0aGlzWzVdfVxcbmAgK1xuICAgICAgICAgICAgICAgIGAgICR7dGhpc1s2XX0sICR7dGhpc1s3XX0sICR7dGhpc1s4XX0gXWA7XG4gICAgfVxuXG4gICAgc3RhdGljIE1ha2VJZGVudGl0eSgpIHtcbiAgICAgICAgY29uc3QgbSA9IG5ldyBNYXQzKCk7XG4gICAgICAgIHJldHVybiBtLmlkZW50aXR5KCk7XG4gICAgfVxuXG4gICAgc3RhdGljIE1ha2VaZXJvKCkge1xuICAgICAgICBjb25zdCBtID0gbmV3IE1hdDMoKTtcbiAgICAgICAgcmV0dXJuIG0uemVybygpO1xuICAgIH1cblxuICAgIHN0YXRpYyBNYWtlV2l0aFF1YXRlcm5pb24ocSkge1xuICAgICAgICBjb25zdCBtID0gTWF0My5NYWtlSWRlbnRpdHkoKTtcbiAgICAgICAgXG4gICAgICAgIG0uc2V0Um93KDAsIG5ldyBWZWMoIDEgIC0gMiAqIHFbMV0gKiBxWzFdIC0gMiAqIHFbMl0gKiBxWzJdLCAyICogcVswXSAqIHFbMV0gLSAyICogcVsyXSAqIHFbM10sIDIgKiBxWzBdICogcVsyXSArIDIgKiBxWzFdICogcVszXSkpO1xuICAgICAgICBtLnNldFJvdygxLCBuZXcgVmVjKCAyICogcVswXSAqIHFbMV0gKyAyICogcVsyXSAqIHFbM10sIDEgIC0gMi4wICogcVswXSAqIHFbMF0gLSAyICogcVsyXSAqIHFbMl0sIDIgKiBxWzFdICogcVsyXSAtIDIgKiBxWzBdICogcVszXSkpO1xuICAgICAgICBtLnNldFJvdygyLCBuZXcgVmVjKCAyICogcVswXSAqIHFbMl0gLSAyICogcVsxXSAqIHFbM10sIDIgKiBxWzFdICogcVsyXSArIDIgKiBxWzBdICogcVszXSAsIDEgLSAyICogcVswXSAqIHFbMF0gLSAyICogcVsxXSAqIHFbMV0pKTtcblxuICAgICAgICByZXR1cm4gbTtcbiAgICB9XG5cbiAgICBzdGF0aWMgSXNaZXJvKG0pIHtcbiAgICAgICAgcmV0dXJuXHR2WzBdPT0wICYmIHZbMV09PTAuMCAmJiB2WzJdPT0wLjAgJiZcbiAgICAgICAgICAgICAgICB2WzNdPT0wICYmIHZbNF09PTAuMCAmJiB2WzVdPT0wLjAgJiZcbiAgICAgICAgICAgICAgICB2WzZdPT0wICYmIHZbN109PTAuMCAmJiB2WzhdPT0wLjA7XG4gICAgfVxuICAgIFxuICAgIHN0YXRpYyBJc0lkZW50aXR5KG0pIHtcbiAgICAgICAgcmV0dXJuXHR2WzBdPT0xLjAgJiYgdlsxXT09MC4wICYmIHZbMl09PTAuMCAmJlxuICAgICAgICAgICAgICAgIHZbM109PTAuMCAmJiB2WzRdPT0xLjAgJiYgdls1XT09MC4wICYmXG4gICAgICAgICAgICAgICAgdls2XT09MC4wICYmIHZbN109PTAuMCAmJiB2WzhdPT0xLjA7XG4gICAgfVxuXG4gICAgc3RhdGljIEdldFNjYWxlKG0pIHtcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMoXG4gICAgICAgICAgICBWZWMuTWFnbml0dWRlKG5ldyBWZWMobVswXSwgbVszXSwgbVs2XSkpLFxuICAgICAgICAgICAgVmVjLk1hZ25pdHVkZShuZXcgVmVjKG1bMV0sIG1bNF0sIG1bN10pKSxcbiAgICAgICAgICAgIFZlYy5NYWduaXR1ZGUobmV3IFZlYyhtWzJdLCBtWzVdLCBtWzhdKSlcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgRXF1YWxzKGEsYikge1xuICAgICAgICByZXR1cm5cdGFbMF0gPT0gYlswXSAmJiBhWzFdID09IGJbMV0gICYmIGFbMl0gPT0gYlsyXSAmJlxuICAgICAgICAgICAgICAgIGFbM10gPT0gYlszXSAmJiBhWzRdID09IGJbNF0gICYmIGFbNV0gPT0gYls1XSAmJlxuICAgICAgICAgICAgICAgIGFbNl0gPT0gYls2XSAmJiBhWzddID09IGJbN10gICYmIGFbOF0gPT0gYls4XTtcbiAgICB9XG5cbiAgICBzdGF0aWMgSXNOYU4obSkge1xuICAgICAgICByZXR1cm5cdGlzTmFOKG1bMF0pIHx8IGlzTmFOKG1bMV0pIHx8IGlzTmFOKG1bMl0pICYmXG4gICAgICAgICAgICAgICAgaXNOYU4obVszXSkgfHwgaXNOYU4obVs0XSkgfHwgaXNOYU4obVs1XSkgJiZcbiAgICAgICAgICAgICAgICBpc05hTihtWzZdKSB8fCBpc05hTihtWzddKSB8fCBpc05hTihtWzhdKTtcbiAgICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgTWF0MzogTWF0M1xufVxuIiwiaW1wb3J0IHsgTnVtZXJpY0FycmF5IH0gZnJvbSBcIi4vY29uc3RhbnRzLmpzXCI7XG5pbXBvcnQgVmVjdG9yVXRpbHMgZnJvbSBcIi4vVmVjdG9yLmpzXCI7XG5pbXBvcnQgTWF0cml4VXRpbHMgZnJvbSBcIi4vTWF0cml4My5qc1wiO1xuXG5jb25zdCBWZWMgPSBWZWN0b3JVdGlscy5WZWM7XG5jb25zdCBNYXQzID0gTWF0cml4VXRpbHMuTWF0MztcblxuY2xhc3MgTWF0NCBleHRlbmRzIE51bWVyaWNBcnJheSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IGluTWF0cml4ID0gW1xuICAgICAgICAgICAgMCwgMCwgMCwgMCxcbiAgICAgICAgICAgIDAsIDAsIDAsIDAsXG4gICAgICAgICAgICAwLCAwLCAwLCAwLFxuICAgICAgICAgICAgMCwgMCwgMCwgMFxuICAgICAgICBdO1xuXG4gICAgICAgIC8vIENyZWF0ZSBmcm9tIG1hdHJpeDNcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDkpIHtcbiAgICAgICAgICAgIGluTWF0cml4WzBdID0gYXJndW1lbnRzWzBdOyBcbiAgICAgICAgICAgIGluTWF0cml4WzFdID0gYXJndW1lbnRzWzFdO1xuICAgICAgICAgICAgaW5NYXRyaXhbMl0gPSBhcmd1bWVudHNbMl07XG5cbiAgICAgICAgICAgIGluTWF0cml4WzRdID0gYXJndW1lbnRzWzNdOyBcbiAgICAgICAgICAgIGluTWF0cml4WzVdID0gYXJndW1lbnRzWzRdO1xuICAgICAgICAgICAgaW5NYXRyaXhbNl0gPSBhcmd1bWVudHNbNV07XG5cbiAgICAgICAgICAgIGluTWF0cml4WzhdID0gYXJndW1lbnRzWzZdOyBcbiAgICAgICAgICAgIGluTWF0cml4WzldID0gYXJndW1lbnRzWzddO1xuICAgICAgICAgICAgaW5NYXRyaXhbMTBdID0gYXJndW1lbnRzWzhdO1xuXG4gICAgICAgICAgICBpbk1hdHJpeFsxNV0gPSAxO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEgJiYgYXJndW1lbnRzWzBdLmxlbmd0aCA9PT0gOSkge1xuICAgICAgICAgICAgaW5NYXRyaXhbMF0gID0gYXJndW1lbnRzWzBdWzBdOyBcbiAgICAgICAgICAgIGluTWF0cml4WzFdICA9IGFyZ3VtZW50c1swXVsxXTtcbiAgICAgICAgICAgIGluTWF0cml4WzJdICA9IGFyZ3VtZW50c1swXVsyXTtcblxuICAgICAgICAgICAgaW5NYXRyaXhbNF0gID0gYXJndW1lbnRzWzBdWzNdOyBcbiAgICAgICAgICAgIGluTWF0cml4WzVdICA9IGFyZ3VtZW50c1swXVs0XTtcbiAgICAgICAgICAgIGluTWF0cml4WzZdICA9IGFyZ3VtZW50c1swXVs1XTtcblxuICAgICAgICAgICAgaW5NYXRyaXhbOF0gID0gYXJndW1lbnRzWzBdWzZdOyBcbiAgICAgICAgICAgIGluTWF0cml4WzldICA9IGFyZ3VtZW50c1swXVs3XTtcbiAgICAgICAgICAgIGluTWF0cml4WzEwXSA9IGFyZ3VtZW50c1swXVs4XTtcblxuICAgICAgICAgICAgaW5NYXRyaXhbMTVdID0gMTtcbiAgICAgICAgfVxuICAgICAgICAvLyBDcmVhdGUgZnJvbSBtYXRyaXg0XG4gICAgICAgIGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDE2KSB7XG4gICAgICAgICAgICBpbk1hdHJpeFswIF0gPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICBpbk1hdHJpeFsxIF0gPSBhcmd1bWVudHNbMSBdO1xuICAgICAgICAgICAgaW5NYXRyaXhbMiBdID0gYXJndW1lbnRzWzIgXTtcbiAgICAgICAgICAgIGluTWF0cml4WzMgXSA9IGFyZ3VtZW50c1szIF07XG5cbiAgICAgICAgICAgIGluTWF0cml4WzQgXSA9IGFyZ3VtZW50c1s0IF07XG4gICAgICAgICAgICBpbk1hdHJpeFs1IF0gPSBhcmd1bWVudHNbNSBdO1xuICAgICAgICAgICAgaW5NYXRyaXhbNiBdID0gYXJndW1lbnRzWzYgXTtcbiAgICAgICAgICAgIGluTWF0cml4WzcgXSA9IGFyZ3VtZW50c1s3IF07XG5cbiAgICAgICAgICAgIGluTWF0cml4WzggXSA9IGFyZ3VtZW50c1s4IF07XG4gICAgICAgICAgICBpbk1hdHJpeFs5IF0gPSBhcmd1bWVudHNbOSBdO1xuICAgICAgICAgICAgaW5NYXRyaXhbMTBdID0gYXJndW1lbnRzWzEwXTtcbiAgICAgICAgICAgIGluTWF0cml4WzExXSA9IGFyZ3VtZW50c1sxMV07XG5cbiAgICAgICAgICAgIGluTWF0cml4WzEyXSA9IGFyZ3VtZW50c1sxMl07XG4gICAgICAgICAgICBpbk1hdHJpeFsxM10gPSBhcmd1bWVudHNbMTNdO1xuICAgICAgICAgICAgaW5NYXRyaXhbMTRdID0gYXJndW1lbnRzWzE0XTtcbiAgICAgICAgICAgIGluTWF0cml4WzE1XSA9IGFyZ3VtZW50c1sxNV07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSAmJiBhcmd1bWVudHNbMF0ubGVuZ3RoID09PSAxNikge1xuICAgICAgICAgICAgaW5NYXRyaXhbMCBdID0gYXJndW1lbnRzWzBdWzBdO1xuICAgICAgICAgICAgaW5NYXRyaXhbMSBdID0gYXJndW1lbnRzWzBdWzEgXTtcbiAgICAgICAgICAgIGluTWF0cml4WzIgXSA9IGFyZ3VtZW50c1swXVsyIF07XG4gICAgICAgICAgICBpbk1hdHJpeFszIF0gPSBhcmd1bWVudHNbMF1bMyBdO1xuXG4gICAgICAgICAgICBpbk1hdHJpeFs0IF0gPSBhcmd1bWVudHNbMF1bNCBdO1xuICAgICAgICAgICAgaW5NYXRyaXhbNSBdID0gYXJndW1lbnRzWzBdWzUgXTtcbiAgICAgICAgICAgIGluTWF0cml4WzYgXSA9IGFyZ3VtZW50c1swXVs2IF07XG4gICAgICAgICAgICBpbk1hdHJpeFs3IF0gPSBhcmd1bWVudHNbMF1bNyBdO1xuXG4gICAgICAgICAgICBpbk1hdHJpeFs4IF0gPSBhcmd1bWVudHNbMF1bOCBdO1xuICAgICAgICAgICAgaW5NYXRyaXhbOSBdID0gYXJndW1lbnRzWzBdWzkgXTtcbiAgICAgICAgICAgIGluTWF0cml4WzEwXSA9IGFyZ3VtZW50c1swXVsxMF07XG4gICAgICAgICAgICBpbk1hdHJpeFsxMV0gPSBhcmd1bWVudHNbMF1bMTFdO1xuXG4gICAgICAgICAgICBpbk1hdHJpeFsxMl0gPSBhcmd1bWVudHNbMF1bMTJdO1xuICAgICAgICAgICAgaW5NYXRyaXhbMTNdID0gYXJndW1lbnRzWzBdWzEzXTtcbiAgICAgICAgICAgIGluTWF0cml4WzE0XSA9IGFyZ3VtZW50c1swXVsxNF07XG4gICAgICAgICAgICBpbk1hdHJpeFsxNV0gPSBhcmd1bWVudHNbMF1bMTVdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggIT0gMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHBhcmFtZXRlciBzaXplIGluIE1hdHJpeDMgY29uc3RydWN0b3JgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN1cGVyKGluTWF0cml4KTtcbiAgICB9XG5cbiAgICAvLy8vLy8gSW5pdGlhbGl6ZXJzXG4gICAgaWRlbnRpdHkoKSB7XG4gICAgICAgIHRoaXNbMCBdID0gMTsgdGhpc1sxIF0gPSAwOyB0aGlzWzIgXSA9IDA7IHRoaXNbMyBdID0gMFxuICAgICAgICB0aGlzWzQgXSA9IDA7IHRoaXNbNSBdID0gMTsgdGhpc1s2IF0gPSAwOyB0aGlzWzcgXSA9IDBcbiAgICAgICAgdGhpc1s4IF0gPSAwOyB0aGlzWzkgXSA9IDA7IHRoaXNbMTBdID0gMTsgdGhpc1sxMV0gPSAwXG4gICAgICAgIHRoaXNbMTJdID0gMDsgdGhpc1sxM10gPSAwOyB0aGlzWzE0XSA9IDA7IHRoaXNbMTVdID0gMVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB6ZXJvKCkge1xuXHRcdHRoaXNbIDBdID0gMDsgdGhpc1sgMV0gPSAwOyB0aGlzWyAyXSA9IDA7IHRoaXNbIDNdID0gMDtcblx0XHR0aGlzWyA0XSA9IDA7IHRoaXNbIDVdID0gMDsgdGhpc1sgNl0gPSAwOyB0aGlzWyA3XSA9IDA7XG5cdFx0dGhpc1sgOF0gPSAwOyB0aGlzWyA5XSA9IDA7IHRoaXNbMTBdID0gMDsgdGhpc1sxMV0gPSAwO1xuXHRcdHRoaXNbMTJdID0gMDsgdGhpc1sxM10gPSAwOyB0aGlzWzE0XSA9IDA7IHRoaXNbMTVdID0gMDtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG4gICAgcGVyc3BlY3RpdmUoZm92eSwgYXNwZWN0LCBuZWFyUGxhbmUsIGZhclBsYW5lKSB7XG5cdFx0bGV0IGZvdnkyID0gdGFuKGZvdnkgKiBQSSAvIDM2MC4wKSAqIG5lYXJQbGFuZTtcblx0XHRsZXQgZm92eTJhc3BlY3QgPSBmb3Z5MiAqIGFzcGVjdDtcblx0XHR0aGlzLmZydXN0dW0oLWZvdnkyYXNwZWN0LGZvdnkyYXNwZWN0LC1mb3Z5Mixmb3Z5MixuZWFyUGxhbmUsZmFyUGxhbmUpO1xuICAgICAgICByZXR1cm4gdGhpcztcblx0fVxuXG5cdGZydXN0dW0obGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyUGxhbmUsIGZhclBsYW5lKSB7XG5cdFx0bGV0IEEgPSByaWdodCAtIGxlZnQ7XG5cdFx0bGV0IEIgPSB0b3AtYm90dG9tO1xuXHRcdGxldCBDID0gZmFyUGxhbmUtbmVhclBsYW5lO1xuXHRcdFxuXHRcdHRoaXMuc2V0Um93KDAsIG5ldyBWZWMobmVhclBsYW5lKjIuMC9BLFx0MC4wLFx0MC4wLFx0MC4wKSk7XG5cdFx0dGhpcy5zZXRSb3coMSwgbmV3IFZlYygwLjAsXHRuZWFyUGxhbmUqMi4wL0IsXHQwLjAsXHQwLjApKTtcblx0XHR0aGlzLnNldFJvdygyLCBuZXcgVmVjKChyaWdodCtsZWZ0KS9BLFx0KHRvcCtib3R0b20pL0IsXHQtKGZhclBsYW5lK25lYXJQbGFuZSkvQyxcdC0xLjApKTtcblx0XHR0aGlzLnNldFJvdygzLCBuZXcgVmVjKDAuMCxcdDAuMCxcdC0oZmFyUGxhbmUqbmVhclBsYW5lKjIuMCkvQyxcdDAuMCkpO1xuXHRcdFxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0b3J0aG8obGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyUGxhbmUsIGZhclBsYW5lKSB7XG5cdFx0bGV0IG0gPSByaWdodC1sZWZ0O1xuXHRcdGxldCBsID0gdG9wLWJvdHRvbTtcblx0XHRsZXQgayA9IGZhclBsYW5lLW5lYXJQbGFuZTs7XG5cdFx0XG5cdFx0dGhpc1swXSA9IDIvbTsgdGhpc1sxXSA9IDA7ICAgdGhpc1syXSA9IDA7ICAgICB0aGlzWzNdID0gMDtcblx0XHR0aGlzWzRdID0gMDsgICB0aGlzWzVdID0gMi9sOyB0aGlzWzZdID0gMDsgICAgIHRoaXNbN10gPSAwO1xuXHRcdHRoaXNbOF0gPSAwOyAgIHRoaXNbOV0gPSAwOyAgIHRoaXNbMTBdID0gLTIvazsgdGhpc1sxMV09IDA7XG5cdFx0dGhpc1sxMl09LShsZWZ0K3JpZ2h0KS9tOyB0aGlzWzEzXSA9IC0odG9wK2JvdHRvbSkvbDsgdGhpc1sxNF0gPSAtKGZhclBsYW5lK25lYXJQbGFuZSkvazsgdGhpc1sxNV09MTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdFx0XG5cdGxvb2tBdChwX2V5ZSwgcF9jZW50ZXIsIHBfdXApIHtcbiAgICAgICAgdGhpcy5pZGVudGl0eSgpO1xuXG5cdFx0Y29uc3QgeSA9IG5ldyBWZWMocF91cCk7XG5cdFx0Y29uc3QgeiA9IFZlYzMuU3ViKHBfZXllLHBfY2VudGVyKTtcblx0XHR6Lm5vcm1hbGl6ZSgpO1xuXHRcdGNvbnN0IHggPSBWZWMzLkNyb3NzKHkseik7XG5cdFx0eC5ub3JtYWxpemUoKTtcblx0XHR5Lm5vcm1hbGl6ZSgpO1xuXG5cdFx0dGhpcy5tMDAgPSB4Lng7XG5cdFx0dGhpcy5tMTAgPSB4Lnk7XG5cdFx0dGhpcy5tMjAgPSB4Lno7XG5cdFx0dGhpcy5tMzAgPSAtVmVjMy5Eb3QoeCwgcF9leWUpO1xuXHRcdHRoaXMubTAxID0geS54O1xuXHRcdHRoaXMubTExID0geS55O1xuXHRcdHRoaXMubTIxID0geS56O1xuXHRcdHRoaXMubTMxID0gLVZlYzMuRG90KHksIHBfZXllKTtcblx0XHR0aGlzLm0wMiA9IHoueDtcblx0XHR0aGlzLm0xMiA9IHoueTtcblx0XHR0aGlzLm0yMiA9IHouejtcblx0XHR0aGlzLm0zMiA9IC1WZWMzLkRvdCh6LCBwX2V5ZSk7XG5cdFx0dGhpcy5tMDMgPSAwO1xuXHRcdHRoaXMubTEzID0gMDtcblx0XHR0aGlzLm0yMyA9IDA7XG5cdFx0dGhpcy5tMzMgPSAxO1xuXHRcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblxuXG5cbiAgICAvLy8vLyBTZXR0ZXJzIGFuZCBnZXR0ZXJzXG4gICAgZ2V0IG0wMCgpIHsgcmV0dXJuIHRoaXNbMF07IH1cblx0Z2V0IG0wMSgpIHsgcmV0dXJuIHRoaXNbMV07IH1cblx0Z2V0IG0wMigpIHsgcmV0dXJuIHRoaXNbMl07IH1cblx0Z2V0IG0wMygpIHsgcmV0dXJuIHRoaXNbM107IH1cblx0Z2V0IG0xMCgpIHsgcmV0dXJuIHRoaXNbNF07IH1cblx0Z2V0IG0xMSgpIHsgcmV0dXJuIHRoaXNbNV07IH1cblx0Z2V0IG0xMigpIHsgcmV0dXJuIHRoaXNbNl07IH1cblx0Z2V0IG0xMygpIHsgcmV0dXJuIHRoaXNbN107IH1cblx0Z2V0IG0yMCgpIHsgcmV0dXJuIHRoaXNbOF07IH1cblx0Z2V0IG0yMSgpIHsgcmV0dXJuIHRoaXNbOV07IH1cblx0Z2V0IG0yMigpIHsgcmV0dXJuIHRoaXNbMTBdOyB9XG5cdGdldCBtMjMoKSB7IHJldHVybiB0aGlzWzExXTsgfVxuXHRnZXQgbTMwKCkgeyByZXR1cm4gdGhpc1sxMl07IH1cblx0Z2V0IG0zMSgpIHsgcmV0dXJuIHRoaXNbMTNdOyB9XG5cdGdldCBtMzIoKSB7IHJldHVybiB0aGlzWzE0XTsgfVxuXHRnZXQgbTMzKCkgeyByZXR1cm4gdGhpc1sxNV07IH1cblx0XG5cdHNldCBtMDAodikgeyB0aGlzWzBdID0gdjsgfVxuXHRzZXQgbTAxKHYpIHsgdGhpc1sxXSA9IHY7IH1cblx0c2V0IG0wMih2KSB7IHRoaXNbMl0gPSB2OyB9XG5cdHNldCBtMDModikgeyB0aGlzWzNdID0gdjsgfVxuXHRzZXQgbTEwKHYpIHsgdGhpc1s0XSA9IHY7IH1cblx0c2V0IG0xMSh2KSB7IHRoaXNbNV0gPSB2OyB9XG5cdHNldCBtMTIodikgeyB0aGlzWzZdID0gdjsgfVxuXHRzZXQgbTEzKHYpIHsgdGhpc1s3XSA9IHY7IH1cblx0c2V0IG0yMCh2KSB7IHRoaXNbOF0gPSB2OyB9XG5cdHNldCBtMjEodikgeyB0aGlzWzldID0gdjsgfVxuXHRzZXQgbTIyKHYpIHsgdGhpc1sxMF0gPSB2OyB9XG5cdHNldCBtMjModikgeyB0aGlzWzExXSA9IHY7IH1cblx0c2V0IG0zMCh2KSB7IHRoaXNbMTJdID0gdjsgfVxuXHRzZXQgbTMxKHYpIHsgdGhpc1sxM10gPSB2OyB9XG5cdHNldCBtMzIodikgeyB0aGlzWzE0XSA9IHY7IH1cblx0c2V0IG0zMyh2KSB7IHRoaXNbMTVdID0gdjsgfVxuXG4gICAgcm93KGkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBWZWMoXG4gICAgICAgICAgICB0aGlzW2kgKiA0XSwgXG4gICAgICAgICAgICB0aGlzW2kgKiA0ICsgMV0sXG4gICAgICAgICAgICB0aGlzW2kgKiA0ICsgMl0sXG4gICAgICAgICAgICB0aGlzW2kgKiA0ICsgM10pO1xuICAgIH1cblxuICAgIHNldFJvdyhpLCBhLCB5ID0gbnVsbCwgeiA9IG51bGwsIHcgPSBudWxsKSB7XG4gICAgICAgIGlmIChhIGluc3RhbmNlb2YgTnVtZXJpY0FycmF5ICYmIGEubGVuZ3RoPj00KSB7XG4gICAgICAgICAgICB0aGlzW2kgKiA0XSAgICAgID0gYVswXTtcbiAgICAgICAgICAgIHRoaXNbaSAqIDQgKyAxXSAgPSBhWzFdO1xuICAgICAgICAgICAgdGhpc1tpICogNCArIDJdICA9IGFbMl07XG4gICAgICAgICAgICB0aGlzW2kgKiA0ICsgM10gID0gYVszXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlb2YoYSkgPT09IFwibnVtYmVyXCIgJiYgXG4gICAgICAgICAgICB0eXBlb2YoeSkgPT09IFwibnVtYmVyXCIgJiYgXG4gICAgICAgICAgICB0eXBlb2YoeikgPT09IFwibnVtYmVyXCIgJiZcbiAgICAgICAgICAgIHR5cGVvZih3KSA9PT0gXCJudW1iZXJcIlxuICAgICAgICApIHtcbiAgICAgICAgICAgIHRoaXNbaSAqIDRdICAgICAgPSBhO1xuICAgICAgICAgICAgdGhpc1tpICogNCArIDFdICA9IHk7XG4gICAgICAgICAgICB0aGlzW2kgKiA0ICsgMl0gID0gejtcbiAgICAgICAgICAgIHRoaXNbaSAqIDQgKyAzXSAgPSB3O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHBhcmFtZXRlciBzZXR0aW5nIG1hdHJpeCByb3dgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjb2woaSkge1xuICAgICAgICByZXR1cm4gbmV3IFZlYyhcbiAgICAgICAgICAgIHRoaXNbaV0sXG4gICAgICAgICAgICB0aGlzW2kgKyA0XSxcbiAgICAgICAgICAgIHRoaXNbaSArIDQgKiAyXSxcbiAgICAgICAgICAgIHRoaXNbaSArIDQgKiAzXVxuICAgICAgICApXG4gICAgfVxuXG4gICAgc2V0Q29sKGksIGEsIHkgPSBudWxsLCB6ID0gbnVsbCwgdyA9IG51bGwpIHtcbiAgICAgICAgaWYgKGEgaW5zdGFuY2VvZiBOdW1lcmljQXJyYXkgJiYgYS5sZW5ndGg+PTQpIHtcbiAgICAgICAgICAgIHRoaXNbaV0gICAgICAgICA9IGFbMF07XG4gICAgICAgICAgICB0aGlzW2kgKyA0XSAgICAgPSBhWzFdO1xuICAgICAgICAgICAgdGhpc1tpICsgNCAqIDJdID0gYVsyXTtcbiAgICAgICAgICAgIHRoaXNbaSArIDQgKiAzXSA9IGFbM107XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mKGEpID09PSBcIm51bWJlclwiICYmIFxuICAgICAgICAgICAgdHlwZW9mKHkpID09PSBcIm51bWJlclwiICYmIFxuICAgICAgICAgICAgdHlwZW9mKHopID09PSBcIm51bWJlclwiICYmXG4gICAgICAgICAgICB0eXBlb2YodykgPT09IFwibnVtYmVyXCJcbiAgICAgICAgKSB7XG4gICAgICAgICAgICB0aGlzW2ldICAgICAgICAgPSBhO1xuICAgICAgICAgICAgdGhpc1tpICsgNF0gICAgID0geTtcbiAgICAgICAgICAgIHRoaXNbaSArIDQgKiAyXSA9IHo7XG4gICAgICAgICAgICB0aGlzW2kgKyA0ICogM10gPSB3O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHBhcmFtZXRlciBzZXR0aW5nIG1hdHJpeCByb3dgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBtYXQzKCkge1xuXHRcdHJldHVybiBuZXcgTWF0Myh0aGlzWzBdLCB0aGlzWzFdLCB0aGlzWyAyXSxcblx0XHRcdFx0XHRcdHRoaXNbNF0sIHRoaXNbNV0sIHRoaXNbIDZdLFxuXHRcdFx0XHRcdFx0dGhpc1s4XSwgdGhpc1s5XSwgdGhpc1sxMF0pO1xuXHR9XG5cbiAgICBhc3NpZ24oYSkge1xuXHRcdGlmIChhLmxlbmd0aD09OSkge1xuXHRcdFx0dGhpc1swXSAgPSBhWzBdOyB0aGlzWzFdICA9IGFbMV07IHRoaXNbMl0gID0gYVsyXTsgdGhpc1szXSAgPSAwO1xuXHRcdFx0dGhpc1s0XSAgPSBhWzNdOyB0aGlzWzVdICA9IGFbNF07IHRoaXNbNl0gID0gYVs1XTsgdGhpc1s3XSAgPSAwO1xuXHRcdFx0dGhpc1s4XSAgPSBhWzZdOyB0aGlzWzldICA9IGFbN107IHRoaXNbMTBdID0gYVs4XTsgdGhpc1sxMV0gPSAwO1xuXHRcdFx0dGhpc1sxMl0gPSAwO1x0IHRoaXNbMTNdID0gMDtcdCAgdGhpc1sxNF0gPSAwO1x0ICAgdGhpc1sxNV0gPSAxO1xuXHRcdH1cblx0XHRlbHNlIGlmIChhLmxlbmd0aD09MTYpIHtcblx0XHRcdHRoaXNbMF0gID0gYVswXTsgIHRoaXNbMV0gID0gYVsxXTsgIHRoaXNbMl0gID0gYVsyXTsgIHRoaXNbM10gID0gYVszXTtcblx0XHRcdHRoaXNbNF0gID0gYVs0XTsgIHRoaXNbNV0gID0gYVs1XTsgIHRoaXNbNl0gID0gYVs2XTsgIHRoaXNbN10gID0gYVs3XTtcblx0XHRcdHRoaXNbOF0gID0gYVs4XTsgIHRoaXNbOV0gID0gYVs5XTsgIHRoaXNbMTBdID0gYVsxMF07IHRoaXNbMTFdID0gYVsxMV07XG5cdFx0XHR0aGlzWzEyXSA9IGFbMTJdOyB0aGlzWzEzXSA9IGFbMTNdO1x0dGhpc1sxNF0gPSBhWzE0XTsgdGhpc1sxNV0gPSBhWzE1XTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuICAgIGdldCBmb3J3YXJkVmVjdG9yKCkge1xuXHRcdHJldHVybiBNYXQ0LlRyYW5zZm9ybURpcmVjdGlvbih0aGlzLCBuZXcgVmVjKDAuMCwgMC4wLCAxLjApKTtcblx0fVxuXHRcblx0Z2V0IHJpZ2h0VmVjdG9yKCkge1xuXHRcdHJldHVybiBNYXQ0LlRyYW5zZm9ybURpcmVjdGlvbih0aGlzLCBuZXcgVmVjKDEuMCwgMC4wLCAwLjApKTtcblx0fVxuXHRcblx0Z2V0IHVwVmVjdG9yKCkge1xuXHRcdHJldHVybiBNYXQ0LlRyYW5zZm9ybURpcmVjdGlvbih0aGlzLCBuZXcgVmVjKDAuMCwgMS4wLCAwLjApKTtcblx0fVxuXHRcblx0Z2V0IGJhY2t3YXJkVmVjdG9yKCkge1xuXHRcdHJldHVybiBNYXQ0LlRyYW5zZm9ybURpcmVjdGlvbih0aGlzLCBuZXcgVmVjKDAuMCwgMC4wLCAtMS4wKSk7XG5cdH1cblx0XG5cdGdldCBsZWZ0VmVjdG9yKCkge1xuXHRcdHJldHVybiBNYXQ0LlRyYW5zZm9ybURpcmVjdGlvbih0aGlzLCBuZXcgVmVjKC0xLjAsIDAuMCwgMC4wKSk7XG5cdH1cblx0XG5cdGdldCBkb3duVmVjdG9yKCkge1xuXHRcdHJldHVybiBNYXQ0LlRyYW5zZm9ybURpcmVjdGlvbih0aGlzLCBuZXcgVmVjKDAuMCwgLTEuMCwgMC4wKSk7XG5cdH1cblxuXG4gICAgLy8vLy8vLyBRdWVyeSBmdW5jdGlvbnNcbiAgICBpc1plcm8oKSB7XG5cdFx0cmV0dXJuXHR0aGlzWyAwXT09MCAmJiB0aGlzWyAxXT09MCAmJiB0aGlzWyAyXT09MCAmJiB0aGlzWyAzXT09MCAmJlxuXHRcdFx0XHR0aGlzWyA0XT09MCAmJiB0aGlzWyA1XT09MCAmJiB0aGlzWyA2XT09MCAmJiB0aGlzWyA3XT09MCAmJlxuXHRcdFx0XHR0aGlzWyA4XT09MCAmJiB0aGlzWyA5XT09MCAmJiB0aGlzWzEwXT09MCAmJiB0aGlzWzExXT09MCAmJlxuXHRcdFx0XHR0aGlzWzEyXT09MCAmJiB0aGlzWzEzXT09MCAmJiB0aGlzWzE0XT09MCAmJiB0aGlzWzE1XT09MDtcblx0fVxuXHRcblx0aXNJZGVudGl0eSgpIHtcblx0XHRyZXR1cm5cdHRoaXNbIDBdPT0xICYmIHRoaXNbIDFdPT0wICYmIHRoaXNbIDJdPT0wICYmIHRoaXNbIDNdPT0wICYmXG5cdFx0XHRcdHRoaXNbIDRdPT0wICYmIHRoaXNbIDVdPT0xICYmIHRoaXNbIDZdPT0wICYmIHRoaXNbIDddPT0wICYmXG5cdFx0XHRcdHRoaXNbIDhdPT0wICYmIHRoaXNbIDldPT0wICYmIHRoaXNbMTBdPT0xICYmIHRoaXNbMTFdPT0wICYmXG5cdFx0XHRcdHRoaXNbMTJdPT0wICYmIHRoaXNbMTNdPT0wICYmIHRoaXNbMTRdPT0wICYmIHRoaXNbMTVdPT0xO1xuXHR9XG5cblxuICAgIC8vLy8vLy8gVHJhbnNmb3JtIGZ1bmN0aW9uc1xuXHR0cmFuc2xhdGUoeCwgeSwgeikge1xuXHRcdHRoaXMubXVsdChNYXQ0Lk1ha2VUcmFuc2xhdGlvbih4LCB5LCB6KSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRyb3RhdGUoYWxwaGEsIHgsIHksIHopIHtcblx0XHR0aGlzLm11bHQoTWF0NC5NYWtlUm90YXRpb24oYWxwaGEsIHgsIHksIHopKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXHRcblx0c2NhbGUoeCwgeSwgeikge1xuXHRcdHRoaXMubXVsdChNYXQ0Lk1ha2VTY2FsZSh4LCB5LCB6KSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXG5cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gIGBbICR7dGhpc1sgMF19LCAke3RoaXNbIDFdfSwgJHt0aGlzWyAyXX0sICR7dGhpc1sgM119XFxuYCArXG4gICAgICAgICAgICAgICAgYCAgJHt0aGlzWyA0XX0sICR7dGhpc1sgNV19LCAke3RoaXNbIDZdfSwgJHt0aGlzWyA3XX1cXG5gICtcbiAgICAgICAgICAgICAgICBgICAke3RoaXNbIDhdfSwgJHt0aGlzWyA5XX0sICR7dGhpc1sxMF19LCAke3RoaXNbMTFdfVxcbmAgK1xuICAgICAgICAgICAgICAgIGAgICR7dGhpc1sxMl19LCAke3RoaXNbMTNdfSwgJHt0aGlzWzE0XX0sICR7dGhpc1sxNV19IF1gO1xuICAgIH1cblxuXG4gICAgLy8vLy8vIFV0aWxpdGllc1xuICAgIHNldFNjYWxlKHgseSx6KSB7XG5cdFx0Y29uc3QgcnggPSBuZXcgVmVjKHRoaXNbMF0sIHRoaXNbNF0sIHRoaXNbOF0pLm5vcm1hbGl6ZSgpLnNjYWxlKHgpO1xuXHRcdGNvbnN0IHJ5ID0gbmV3IFZlYyh0aGlzWzFdLCB0aGlzWzVdLCB0aGlzWzldKS5ub3JtYWxpemUoKS5zY2FsZSh5KTtcblx0XHRjb25zdCByeiA9IG5ldyBWZWModGhpc1syXSwgdGhpc1s2XSwgdGhpc1sxMF0pLm5vcm1hbGl6ZSgpLnNjYWxlKHopO1xuXHRcdHRoaXNbMF0gPSByeC54OyB0aGlzWzRdID0gcngueTsgdGhpc1s4XSA9IHJ4Lno7XG5cdFx0dGhpc1sxXSA9IHJ5Lng7IHRoaXNbNV0gPSByeS55OyB0aGlzWzldID0gcnkuejtcblx0XHR0aGlzWzJdID0gcnoueDsgdGhpc1s2XSA9IHJ6Lnk7IHRoaXNbMTBdID0gcnouejtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdHNldFBvc2l0aW9uKHBvcyx5LHopIHtcblx0XHRpZiAodHlwZW9mKHBvcyk9PVwibnVtYmVyXCIpIHtcblx0XHRcdHRoaXNbMTJdID0gcG9zO1xuXHRcdFx0dGhpc1sxM10gPSB5O1xuXHRcdFx0dGhpc1sxNF0gPSB6O1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHRoaXNbMTJdID0gcG9zLng7XG5cdFx0XHR0aGlzWzEzXSA9IHBvcy55O1xuXHRcdFx0dGhpc1sxNF0gPSBwb3Muejtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuICAgIC8vLy8vLy8gT3BlcmF0aW9uc1xuICAgIG11bHQoYSkge1xuXHRcdGlmICh0eXBlb2YoYSk9PSdudW1iZXInKSB7XG5cdFx0XHR0aGlzWyAwXSAqPSBhOyB0aGlzWyAxXSAqPSBhOyB0aGlzWyAyXSAqPSBhOyB0aGlzWyAzXSAqPSBhO1xuXHRcdFx0dGhpc1sgNF0gKj0gYTsgdGhpc1sgNV0gKj0gYTsgdGhpc1sgNl0gKj0gYTsgdGhpc1sgN10gKj0gYTtcblx0XHRcdHRoaXNbIDhdICo9IGE7IHRoaXNbIDldICo9IGE7IHRoaXNbMTBdICo9IGE7IHRoaXNbMTFdICo9IGE7XG5cdFx0XHR0aGlzWzEyXSAqPSBhOyB0aGlzWzEzXSAqPSBhOyB0aGlzWzE0XSAqPSBhOyB0aGlzWzE1XSAqPSBhO1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG4gICAgICAgIGNvbnN0IHIwID0gdGhpcy5yb3coMCk7XG4gICAgICAgIGNvbnN0IHIxID0gdGhpcy5yb3coMSk7XG4gICAgICAgIGNvbnN0IHIyID0gdGhpcy5yb3coMik7XG4gICAgICAgIGNvbnN0IHIzID0gdGhpcy5yb3coMyk7XG4gICAgICAgIGNvbnN0IGMwID0gYS5jb2woMCk7XG4gICAgICAgIGNvbnN0IGMxID0gYS5jb2woMSk7XG4gICAgICAgIGNvbnN0IGMyID0gYS5jb2woMik7XG4gICAgICAgIGNvbnN0IGMzID0gYS5jb2woMyk7XG5cbiAgICAgICAgdGhpc1swIF0gPSBWZWMuRG90KHIwLCBjMCk7IHRoaXNbMSBdID0gVmVjLkRvdChyMCwgYzEpOyB0aGlzWzIgXSA9IFZlYy5Eb3QocjAsIGMyKTsgdGhpc1szIF0gPSBWZWMuRG90KHIwLCBjMyk7XG4gICAgICAgIHRoaXNbNCBdID0gVmVjLkRvdChyMSwgYzApOyB0aGlzWzUgXSA9IFZlYy5Eb3QocjEsIGMxKTsgdGhpc1s2IF0gPSBWZWMuRG90KHIxLCBjMik7IHRoaXNbNyBdID0gVmVjLkRvdChyMSwgYzMpO1xuICAgICAgICB0aGlzWzggXSA9IFZlYy5Eb3QocjIsIGMwKTsgdGhpc1s5IF0gPSBWZWMuRG90KHIyLCBjMSk7IHRoaXNbMTBdID0gVmVjLkRvdChyMiwgYzIpOyB0aGlzWzExXSA9IFZlYy5Eb3QocjIsIGMzKTtcbiAgICAgICAgdGhpc1sxMl0gPSBWZWMuRG90KHIzLCBjMCk7IHRoaXNbMTNdID0gVmVjLkRvdChyMywgYzEpOyB0aGlzWzE0XSA9IFZlYy5Eb3QocjMsIGMyKTsgdGhpc1sxNV0gPSBWZWMuRG90KHIzLCBjMyk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdG11bHRWZWN0b3IodmVjKSB7XG4gICAgICAgIGlmICh2ZWMubGVuZ3RoPDMpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgcGFyYW1ldGVyIG11bHRpcGx5aW5nIE1hdDQgYnkgdmVjdG9yXCIpO1xuICAgICAgICB9XG5cblx0XHRjb25zdCB4ID0gdmVjWzBdO1xuXHRcdGNvbnN0IHkgPSB2ZWNbMV07XG5cdFx0Y29uc3QgeiA9IHZlY1syXTtcblx0XHRjb25zdCB3ID0gdmVjLmxlbmd0aCA+MyA/IHZlY1szXSA6IDEuMDtcblx0XG5cdFx0cmV0dXJuIG5ldyBWZWMoIHRoaXNbMF0gKiB4ICsgdGhpc1s0XSAqIHkgKyB0aGlzWyA4XSAqIHogKyB0aGlzWzEyXSAqIHcsXG5cdFx0XHRcdFx0XHR0aGlzWzFdICogeCArIHRoaXNbNV0gKiB5ICsgdGhpc1sgOV0gKiB6ICsgdGhpc1sxM10gKiB3LFxuXHRcdFx0XHRcdFx0dGhpc1syXSAqIHggKyB0aGlzWzZdICogeSArIHRoaXNbMTBdICogeiArIHRoaXNbMTRdICogdyxcblx0XHRcdFx0XHRcdHRoaXNbM10gKiB4ICsgdGhpc1s3XSAqIHkgKyB0aGlzWzExXSAqIHogKyB0aGlzWzE1XSAqIHcpO1xuXHR9XG5cdFxuXHRpbnZlcnQoKSB7XG5cdFx0Y29uc3QgYTAwID0gdGhpc1swXSwgIGEwMSA9IHRoaXNbMV0sICBhMDIgPSB0aGlzWzJdLCAgYTAzID0gdGhpc1szXSxcblx0ICAgICAgICAgIGExMCA9IHRoaXNbNF0sICBhMTEgPSB0aGlzWzVdLCAgYTEyID0gdGhpc1s2XSwgIGExMyA9IHRoaXNbN10sXG5cdCAgICAgICAgICBhMjAgPSB0aGlzWzhdLCAgYTIxID0gdGhpc1s5XSwgIGEyMiA9IHRoaXNbMTBdLCBhMjMgPSB0aGlzWzExXSxcblx0ICAgICAgICAgIGEzMCA9IHRoaXNbMTJdLCBhMzEgPSB0aGlzWzEzXSwgYTMyID0gdGhpc1sxNF0sIGEzMyA9IHRoaXNbMTVdO1xuXG5cdCAgICBjb25zdCBiMDAgPSBhMDAgKiBhMTEgLSBhMDEgKiBhMTAsXG5cdCAgICAgICAgICBiMDEgPSBhMDAgKiBhMTIgLSBhMDIgKiBhMTAsXG5cdCAgICAgICAgICBiMDIgPSBhMDAgKiBhMTMgLSBhMDMgKiBhMTAsXG5cdCAgICAgICAgICBiMDMgPSBhMDEgKiBhMTIgLSBhMDIgKiBhMTEsXG5cdCAgICAgICAgICBiMDQgPSBhMDEgKiBhMTMgLSBhMDMgKiBhMTEsXG5cdCAgICAgICAgICBiMDUgPSBhMDIgKiBhMTMgLSBhMDMgKiBhMTIsXG5cdCAgICAgICAgICBiMDYgPSBhMjAgKiBhMzEgLSBhMjEgKiBhMzAsXG5cdCAgICAgICAgICBiMDcgPSBhMjAgKiBhMzIgLSBhMjIgKiBhMzAsXG5cdCAgICAgICAgICBiMDggPSBhMjAgKiBhMzMgLSBhMjMgKiBhMzAsXG5cdCAgICAgICAgICBiMDkgPSBhMjEgKiBhMzIgLSBhMjIgKiBhMzEsXG5cdCAgICAgICAgICBiMTAgPSBhMjEgKiBhMzMgLSBhMjMgKiBhMzEsXG5cdCAgICAgICAgICBiMTEgPSBhMjIgKiBhMzMgLSBhMjMgKiBhMzI7XG5cblx0ICAgIGxldCBkZXQgPSBiMDAgKiBiMTEgLSBiMDEgKiBiMTAgKyBiMDIgKiBiMDkgKyBiMDMgKiBiMDggLSBiMDQgKiBiMDcgKyBiMDUgKiBiMDY7XG5cblx0ICAgIGlmICghZGV0KSB7XG5cdFx0XHR0aGlzLnplcm8oKTtcblx0ICAgIH1cblx0XHRlbHNlIHtcblx0XHRcdGRldCA9IDEuMCAvIGRldDtcblxuXHRcdFx0dGhpc1swXSA9IChhMTEgKiBiMTEgLSBhMTIgKiBiMTAgKyBhMTMgKiBiMDkpICogZGV0O1xuXHRcdFx0dGhpc1sxXSA9IChhMDIgKiBiMTAgLSBhMDEgKiBiMTEgLSBhMDMgKiBiMDkpICogZGV0O1xuXHRcdFx0dGhpc1syXSA9IChhMzEgKiBiMDUgLSBhMzIgKiBiMDQgKyBhMzMgKiBiMDMpICogZGV0O1xuXHRcdFx0dGhpc1szXSA9IChhMjIgKiBiMDQgLSBhMjEgKiBiMDUgLSBhMjMgKiBiMDMpICogZGV0O1xuXHRcdFx0dGhpc1s0XSA9IChhMTIgKiBiMDggLSBhMTAgKiBiMTEgLSBhMTMgKiBiMDcpICogZGV0O1xuXHRcdFx0dGhpc1s1XSA9IChhMDAgKiBiMTEgLSBhMDIgKiBiMDggKyBhMDMgKiBiMDcpICogZGV0O1xuXHRcdFx0dGhpc1s2XSA9IChhMzIgKiBiMDIgLSBhMzAgKiBiMDUgLSBhMzMgKiBiMDEpICogZGV0O1xuXHRcdFx0dGhpc1s3XSA9IChhMjAgKiBiMDUgLSBhMjIgKiBiMDIgKyBhMjMgKiBiMDEpICogZGV0O1xuXHRcdFx0dGhpc1s4XSA9IChhMTAgKiBiMTAgLSBhMTEgKiBiMDggKyBhMTMgKiBiMDYpICogZGV0O1xuXHRcdFx0dGhpc1s5XSA9IChhMDEgKiBiMDggLSBhMDAgKiBiMTAgLSBhMDMgKiBiMDYpICogZGV0O1xuXHRcdFx0dGhpc1sxMF0gPSAoYTMwICogYjA0IC0gYTMxICogYjAyICsgYTMzICogYjAwKSAqIGRldDtcblx0XHRcdHRoaXNbMTFdID0gKGEyMSAqIGIwMiAtIGEyMCAqIGIwNCAtIGEyMyAqIGIwMCkgKiBkZXQ7XG5cdFx0XHR0aGlzWzEyXSA9IChhMTEgKiBiMDcgLSBhMTAgKiBiMDkgLSBhMTIgKiBiMDYpICogZGV0O1xuXHRcdFx0dGhpc1sxM10gPSAoYTAwICogYjA5IC0gYTAxICogYjA3ICsgYTAyICogYjA2KSAqIGRldDtcblx0XHRcdHRoaXNbMTRdID0gKGEzMSAqIGIwMSAtIGEzMCAqIGIwMyAtIGEzMiAqIGIwMCkgKiBkZXQ7XG5cdFx0XHR0aGlzWzE1XSA9IChhMjAgKiBiMDMgLSBhMjEgKiBiMDEgKyBhMjIgKiBiMDApICogZGV0O1xuXHRcdH1cblxuICAgICAgICByZXR1cm4gdGhpcztcblx0fVxuXHRcblx0dHJhc3Bvc2UoKSB7XG5cdFx0Y29uc3QgcjAgPSBuZXcgVmVjKHRoaXNbMF0sIHRoaXNbNF0sIHRoaXNbIDhdLCB0aGlzWzEyXSk7XG5cdFx0Y29uc3QgcjEgPSBuZXcgVmVjKHRoaXNbMV0sIHRoaXNbNV0sIHRoaXNbIDldLCB0aGlzWzEzXSk7XG5cdFx0Y29uc3QgcjIgPSBuZXcgVmVjKHRoaXNbMl0sIHRoaXNbNl0sIHRoaXNbMTBdLCB0aGlzWzE0XSk7XG5cdFx0Y29uc3QgcjMgPSBuZXcgVmVjKHRoaXNbM10sIHRoaXNbN10sIHRoaXNbMTFdLCB0aGlzWzE1XSk7XG5cdFxuXHRcdHRoaXMuc2V0Um93KDAsIHIwKTtcblx0XHR0aGlzLnNldFJvdygxLCByMSk7XG5cdFx0dGhpcy5zZXRSb3coMiwgcjIpO1xuXHRcdHRoaXMuc2V0Um93KDMsIHIzKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cblxuXG4gICAgLy8vLy8vLy8vIEZhY3RvcnkgbWV0aG9kc1xuICAgIHN0YXRpYyBNYWtlSWRlbnRpdHkoKSB7XG4gICAgICAgIGNvbnN0IG0gPSBuZXcgTWF0NCgpO1xuICAgICAgICByZXR1cm4gbS5pZGVudGl0eSgpO1xuICAgIH1cblxuXHRzdGF0aWMgTWFrZVplcm8oKSB7XG5cdFx0Y29uc3QgbSA9IG5ldyBNYXQ0KCk7XG5cdFx0cmV0dXJuIG0uemVybygpO1xuXHR9XG5cblx0c3RhdGljIE1ha2VXaXRoUXVhdGVybmlvbihxKSB7XG5cdFx0Y29uc3QgbSA9IE1hdDQuTWFrZUlkZW50aXR5KCk7XG4gICAgICAgIFxuICAgICAgICBtLnNldFJvdygwLCBuZXcgVmVjKCAxICAtIDIgKiBxWzFdICogcVsxXSAtIDIgKiBxWzJdICogcVsyXSwgMiAqIHFbMF0gKiBxWzFdIC0gMiAqIHFbMl0gKiBxWzNdLCAyICogcVswXSAqIHFbMl0gKyAyICogcVsxXSAqIHFbM10sIDApKTtcbiAgICAgICAgbS5zZXRSb3coMSwgbmV3IFZlYyggMiAqIHFbMF0gKiBxWzFdICsgMiAqIHFbMl0gKiBxWzNdLCAxICAtIDIuMCAqIHFbMF0gKiBxWzBdIC0gMiAqIHFbMl0gKiBxWzJdLCAyICogcVsxXSAqIHFbMl0gLSAyICogcVswXSAqIHFbM10sIDApKTtcbiAgICAgICAgbS5zZXRSb3coMiwgbmV3IFZlYyggMiAqIHFbMF0gKiBxWzJdIC0gMiAqIHFbMV0gKiBxWzNdLCAyICogcVsxXSAqIHFbMl0gKyAyICogcVswXSAqIHFbM10gLCAxIC0gMiAqIHFbMF0gKiBxWzBdIC0gMiAqIHFbMV0gKiBxWzFdLCAwKSk7Ly9cbiAgICAgICAgcmV0dXJuIG07XG5cdH1cblx0XG4gICAgc3RhdGljIE1ha2VUcmFuc2xhdGlvbih4LCB5LCB6KSB7XG5cdFx0aWYgKHggaW5zdGFuY2VvZiBOdW1lcmljQXJyYXkgJiYgeC5sZW5ndGggPj0gMykge1xuXHRcdFx0eSA9IHhbMV07XG5cdFx0XHR6ID0geFsyXTtcblx0XHRcdHggPSB4WzBdO1xuXHRcdH1cblx0XHRyZXR1cm4gbmV3IE1hdDQoXG5cdFx0XHQxLjAsIDAuMCwgMC4wLCAwLjAsXG5cdFx0XHQwLjAsIDEuMCwgMC4wLCAwLjAsXG5cdFx0XHQwLjAsIDAuMCwgMS4wLCAwLjAsXG5cdFx0XHQgIHgsICAgeSwgICB6LCAxLjBcblx0XHQpO1xuXHR9XG5cdFx0XG5cdHN0YXRpYyBNYWtlUm90YXRpb24oYWxwaGEsIHgsIHksIHopIHtcblx0XHRjb25zdCBheGlzID0gbmV3IFZlYyh4LHkseik7XG5cdFx0YXhpcy5ub3JtYWxpemUoKTtcblx0XHRcdFx0XG5cdFx0dmFyIGNvc0FscGhhID0gTWF0aC5jb3MoYWxwaGEpO1xuXHRcdHZhciBhY29zQWxwaGEgPSAxLjAgLSBjb3NBbHBoYTtcblx0XHR2YXIgc2luQWxwaGEgPSBNYXRoLnNpbihhbHBoYSk7XG5cdFx0XG5cdFx0cmV0dXJuIG5ldyBNYXQ0KFxuXHRcdFx0YXhpcy54ICogYXhpcy54ICogYWNvc0FscGhhICsgY29zQWxwaGEsIGF4aXMueCAqIGF4aXMueSAqIGFjb3NBbHBoYSArIGF4aXMueiAqIHNpbkFscGhhLCBheGlzLnggKiBheGlzLnogKiBhY29zQWxwaGEgLSBheGlzLnkgKiBzaW5BbHBoYSwgMCxcblx0XHRcdGF4aXMueSAqIGF4aXMueCAqIGFjb3NBbHBoYSAtIGF4aXMueiAqIHNpbkFscGhhLCBheGlzLnkgKiBheGlzLnkgKiBhY29zQWxwaGEgKyBjb3NBbHBoYSwgYXhpcy55ICogYXhpcy56ICogYWNvc0FscGhhICsgYXhpcy54ICogc2luQWxwaGEsIDAsXG5cdFx0XHRheGlzLnogKiBheGlzLnggKiBhY29zQWxwaGEgKyBheGlzLnkgKiBzaW5BbHBoYSwgYXhpcy56ICogYXhpcy55ICogYWNvc0FscGhhIC0gYXhpcy54ICogc2luQWxwaGEsIGF4aXMueiAqIGF4aXMueiAqIGFjb3NBbHBoYSArIGNvc0FscGhhLCAwLFxuXHRcdFx0MCwwLDAsMVxuXHRcdCk7XG5cdH1cblxuXHRzdGF0aWMgTWFrZVNjYWxlKHgsIHksIHopIHtcblx0XHRpZiAoeCBpbnN0YW5jZW9mIE51bWVyaWNBcnJheSAgJiYgeC5sZW5ndGggPj0gMykge1xuICAgICAgICAgICAgeSA9IHhbMV07XG5cdFx0XHR6ID0geFsyXTtcblx0XHRcdHggPSB4WzBdO1xuXHRcdH1cblx0XHRyZXR1cm4gbmV3IE1hdDQoXG5cdFx0XHR4LCAwLCAwLCAwLFxuXHRcdFx0MCwgeSwgMCwgMCxcblx0XHRcdDAsIDAsIHosIDAsXG5cdFx0XHQwLCAwLCAwLCAxXG5cdFx0KVxuXHR9XG4gICAgXG5cbiAgICBzdGF0aWMgTWFrZVBlcnNwZWN0aXZlKGZvdnksIGFzcGVjdCwgbmVhclBsYW5lLCBmYXJQbGFuZSkge1xuXHRcdHJldHVybiAobmV3IE1hdDQoKSkucGVyc3BlY3RpdmUoZm92eSwgYXNwZWN0LCBuZWFyUGxhbmUsIGZhclBsYW5lKTtcblx0fVxuXHRcblx0c3RhdGljIE1ha2VGcnVzdHVtKGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhclBsYW5lLCBmYXJQbGFuZSkge1xuXHRcdHJldHVybiAobmV3IE1hdDQoKSkuZnJ1c3R1bShsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIG5lYXJQbGFuZSwgZmFyUGxhbmUpO1xuXHR9XG5cdFxuXHRzdGF0aWMgTWFrZU9ydGhvKGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhclBsYW5lLCBmYXJQbGFuZSkge1xuXHRcdHJldHVybiAobmV3IE1hdDQoKSkub3J0aG8obGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyUGxhbmUsIGZhclBsYW5lKTtcblx0fVxuXG5cdHN0YXRpYyBNYWtlTG9va0F0KG9yaWdpbiwgdGFyZ2V0LCB1cCkge1xuXHRcdHJldHVybiAobmV3IE1hdDQoKSkuTG9va0F0KG9yaWdpbix0YXJnZXQsdXApO1xuXHR9XG5cblxuXG5cblxuICAgIC8vLy8vLy8gU3RhdGljIFV0aWxpdGllc1xuICAgIHN0YXRpYyBVbnByb2plY3QoeCwgeSwgZGVwdGgsIG12TWF0LCBwTWF0LCB2aWV3cG9ydCkge1xuXHRcdGxldCBtdnAgPSBuZXcgTWF0NChwTWF0KTtcblx0XHRtdnAubXVsdChtdk1hdCk7XG5cdFx0bXZwLmludmVydCgpO1xuXG5cdFx0Y29uc3QgdmluID0gbmV3IFZlYygoKHggLSB2aWV3cG9ydC55KSAvIHZpZXdwb3J0LndpZHRoKSAqIDIuMCAtIDEuMCxcblx0XHRcdFx0XHRcdFx0XHQoKHkgLSB2aWV3cG9ydC54KSAvIHZpZXdwb3J0LmhlaWdodCkgKiAyLjAgLSAxLjAsXG5cdFx0XHRcdFx0XHRcdFx0ZGVwdGggKiAyLjAgLSAxLjAsXG5cdFx0XHRcdFx0XHRcdFx0MS4wKTtcblx0XHRcblx0XHRjb25zdCByZXN1bHQgPSBuZXcgVmVjNChtdnAubXVsdFZlY3Rvcih2aW4pKTtcblx0XHRpZiAocmVzdWx0Lno9PTApIHtcblx0XHRcdHJlc3VsdC5zZXQoMCk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0cmVzdWx0LnNldChcdHJlc3VsdC54L3Jlc3VsdC53LFxuXHRcdFx0XHRcdFx0cmVzdWx0LnkvcmVzdWx0LncsXG5cdFx0XHRcdFx0XHRyZXN1bHQuei9yZXN1bHQudyxcblx0XHRcdFx0XHRcdHJlc3VsdC53L3Jlc3VsdC53KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cbiAgICBzdGF0aWMgR2V0U2NhbGUobSkge1xuXHRcdHJldHVybiBuZXcgVmVjMyhcbiAgICAgICAgICAgIG5ldyBWZWMobVsxXSwgbVs1XSwgbVs5XSkubWFnbml0dWRlKCksXG5cdFx0XHRuZXcgVmVjKG1bMF0sIG1bNF0sIG1bOF0pLm1hZ25pdHVkZSgpLFxuXHRcdFx0bmV3IFZlYyhtWzJdLCBtWzZdLCBtWzEwXSkubWFnbml0dWRlKClcblx0XHQpO1xuXHR9XG5cbiAgICBzdGF0aWMgR2V0Um90YXRpb24obSkge1xuXHRcdGNvbnN0IHNjYWxlID0gTWF0NC5HZXRTY2FsZSgpO1xuXHRcdHJldHVybiBuZXcgTWF0NChcblx0XHRcdFx0bVswXSAvIHNjYWxlLngsIG1bMV0gLyBzY2FsZS55LCBtWyAyXSAvIHNjYWxlLnosIDAsXG5cdFx0XHRcdG1bNF0gLyBzY2FsZS54LCBtWzVdIC8gc2NhbGUueSwgbVsgNl0gLyBzY2FsZS56LCAwLFxuXHRcdFx0XHRtWzhdIC8gc2NhbGUueCwgbVs5XSAvIHNjYWxlLnksIG1bMTBdIC8gc2NhbGUueiwgMCxcblx0XHRcdFx0MCxcdCAgIDAsXHQgIDAsIFx0MVxuXHRcdCk7XG5cdH1cblxuXHRzdGF0aWMgR2V0UG9zaXRpb24obSkge1xuXHRcdHJldHVybiBuZXcgVmVjKG1bMTJdLCBtWzEzXSwgbVsxNF0pO1xuXHR9XG5cbiAgICBzdGF0aWMgRXF1YWxzKG0sbikge1xuXHRcdHJldHVyblx0bVsgMF0gPT0gblsgMF0gJiYgbVsgMV0gPT0gblsgMV0gJiYgbVsgMl0gPT0gblsgMl0gJiYgbVsgM10gPT0gblsgM10gJiZcblx0XHRcdFx0bVsgNF0gPT0gblsgNF0gJiYgbVsgNV0gPT0gblsgNV0gJiYgbVsgNl0gPT0gblsgNl0gJiYgbVsgN10gPT0gblsgN10gJiZcblx0XHRcdFx0bVsgOF0gPT0gblsgOF0gJiYgbVsgOV0gPT0gblsgOV0gJiYgbVsxMF0gPT0gblsxMF0gJiYgbVsxMV0gPT0gblsxMV0gJiZcblx0XHRcdFx0bVsxMl0gPT0gblsxMl0gJiYgbVsxM10gPT0gblsxM10gJiYgbVsxNF0gPT0gblsxNF0gJiYgbVsxNV0gPT0gblsxNV07XG5cdH1cblxuICAgIHN0YXRpYyBUcmFuc2Zvcm1EaXJlY3Rpb24oTSwgLyogVmVjICovIGRpcikge1xuXHRcdGNvbnN0IGRpcmVjdGlvbiA9IG5ldyBWZWMoZGlyKTtcblx0XHRjb25zdCB0cnggPSBuZXcgTWF0NChNKTtcblx0XHR0cnguc2V0Um93KDMsIG5ldyBWZWMoMCwgMCwgMCwgMSkpO1xuXHRcdGRpcmVjdGlvbi5hc3NpZ24odHJ4Lm11bHRWZWN0b3IoZGlyZWN0aW9uKS54eXopO1xuXHRcdGRpcmVjdGlvbi5ub3JtYWxpemUoKTtcblx0XHRyZXR1cm4gZGlyZWN0aW9uO1xuXHR9XG5cbiAgICBzdGF0aWMgSXNOYW4oKSB7XG5cdFx0cmV0dXJuXHRpc05hTih0aGlzWyAwXSkgfHwgaXNOYU4odGhpc1sgMV0pIHx8IGlzTmFOKHRoaXNbIDJdKSB8fCBpc05hTih0aGlzWyAzXSkgfHxcblx0XHRcdFx0aXNOYU4odGhpc1sgNF0pIHx8IGlzTmFOKHRoaXNbIDVdKSB8fCBpc05hTih0aGlzWyA2XSkgfHwgaXNOYU4odGhpc1sgN10pIHx8XG5cdFx0XHRcdGlzTmFOKHRoaXNbIDhdKSB8fCBpc05hTih0aGlzWyA5XSkgfHwgaXNOYU4odGhpc1sxMF0pIHx8IGlzTmFOKHRoaXNbMTFdKSB8fFxuXHRcdFx0XHRpc05hTih0aGlzWzEyXSkgfHwgaXNOYU4odGhpc1sxM10pIHx8IGlzTmFOKHRoaXNbMTRdKSB8fCBpc05hTih0aGlzWzE1XSk7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIE1hdDQ6IE1hdDRcbn1cbiIsImltcG9ydCBWZWN0b3JVdGlscyBmcm9tIFwiLi9WZWN0b3IuanNcIjtcblxuY29uc3QgVmVjID0gVmVjdG9yVXRpbHMuVmVjO1xuXG5jbGFzcyBRdWF0IGV4dGVuZHMgVmVjIHtcbiAgICBjb25zdHJ1Y3RvcihhLGIsYyxkKSB7XG4gICAgICAgIHN1cGVyKDAsMCwwLDApO1xuXG4gICAgICAgIGlmIChhID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIFZlYy5aZXJvKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKGEubGVuZ3RoID09PSA0KSB7XG4gICAgICAgICAgICAgICAgVmVjLkFzc2lnbih0aGlzLCBhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGEubGVuZ3RoID09PSA5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0V2l0aE1hdHJpeDMoYSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChhLmxlbmd0aCA9PT0gMTYpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmluaXRXaXRoTWF0cml4NChhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgcGFyYW1ldGVyIGluaXRpYWxpemluZyBRdWF0ZXJuaW9uXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGEgIT09IHVuZGVmaW5lZCAmJiBiICE9PSB1bmRlZmluZWQgJiYgYyAhPT0gdW5kZWZpbmVkICYmIGQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5pbml0V2l0aFZhbHVlcyhhLCBiLCBjLCBkKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgcGFyYW1ldGVycyBpbml0aWFsaXppbmcgUXVhdGVybmlvblwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGluaXRXaXRoTWF0cml4MyhtKSB7XG4gICAgICAgIGNvbnN0IHcgPSBNYXRoLnNxcnQoMSArIG1bMF0gKyBtWzRdICsgbVs4XSkgLyAyO1xuICAgICAgICBjb25zdCB3NCA9IDQgKiB3O1xuICAgICAgICBcbiAgICAgICAgdGhpc1swXSA9IChtWzddIC0gbVs1XSkgLyB3O1xuICAgICAgICB0aGlzWzFdID0gKG1bMl0gLSBtWzZdKSAvIHc0O1xuICAgICAgICB0aGlzWzJdID0gKG1bM10gLSBtWzFdKSAvIHc0O1xuICAgICAgICB0aGlzWzNdID0gdztcbiAgICB9XG5cbiAgICBpbml0V2l0aE1hdHJpeDQobSkge1xuICAgICAgICBjb25zdCB3ID0gTWF0aC5zcXJ0KDEgKyBtWzBdICsgbVs1XSArIG1bMTBdKSAvIDI7XG4gICAgICAgIGNvbnN0IHc0ID0gNCAqIHc7XG4gICAgICAgIFxuICAgICAgICB0aGlzWzBdID0gKG1bOV0gLSBtWzZdKSAvIHc7XG4gICAgICAgIHRoaXNbMV0gPSAobVsyXSAtIG1bOF0pIC8gdzQ7XG4gICAgICAgIHRoaXNbMl0gPSAobVs0XSAtIG1bMV0pIC8gdzQ7XG4gICAgICAgIHRoaXNbM10gPSB3O1xuICAgIH1cblxuICAgIGluaXRXaXRoVmFsdWVzKGFscGhhLCB4LCB5LCB6KSB7XG4gICAgICAgIHRoaXNbMF0gPSB4ICogTWF0aC5zaW4oIGFscGhhIC8gMiApO1xuICAgICAgICB0aGlzWzFdID0geSAqIE1hdGguc2luKCBhbHBoYSAvIDIgKTtcbiAgICAgICAgdGhpc1syXSA9IHogKiBNYXRoLnNpbiggYWxwaGEgLyAyICk7XG4gICAgICAgIHRoaXNbM10gPSBNYXRoLmNvcyggYWxwaGEgLyAyICk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIFF1YXQ6IFF1YXRcbn1cblxuIiwiXG5pbXBvcnQge1xuICAgIEF4aXMsXG4gICAgUEksXG4gICAgREVHX1RPX1JBRCxcbiAgICBSQURfVE9fREVHLFxuICAgIFBJXzIsXG4gICAgUElfNCxcbiAgICBQSV84LFxuICAgIFRXT19QSSxcbiAgICBFUFNJTE9OLFxuICAgIE51bWVyaWNBcnJheSxcbiAgICBOdW1lcmljQXJyYXlIaWdoUCxcbiAgICBGTE9BVF9NQVhcbn0gZnJvbSBcIi4vY29uc3RhbnRzLmpzXCI7XG5cbmltcG9ydCB7XG4gICAgY2hlY2tQb3dlck9mVHdvLFxuICAgIGNoZWNrWmVybyxcbiAgICBlcXVhbHMsXG4gICAgZGVncmVlc1RvUmFkaWFucyxcbiAgICByYWRpYW5zVG9EZWdyZWVzLFxuICAgIHNpbixcbiAgICBjb3MsXG4gICAgdGFuLFxuICAgIGNvdGFuLFxuICAgIGF0YW4sXG4gICAgYXRhbjIsXG4gICAgcmFuZG9tLFxuICAgIHNlZWRlZFJhbmRvbSxcbiAgICBtYXgsXG4gICAgbWluLFxuICAgIGFicyxcbiAgICBzcXJ0LFxuICAgIGxlcnAsXG4gICAgc3F1YXJlXG59IGZyb20gXCIuL2Z1bmN0aW9ucy5qc1wiO1xuXG5pbXBvcnQgVmVjdG9yVXRpbHMgZnJvbSAnLi9WZWN0b3IuanMnO1xuXG5pbXBvcnQgTWF0cml4M1V0aWxzIGZyb20gXCIuL01hdHJpeDMuanNcIjtcblxuaW1wb3J0IE1hdHJpeDRVdGlscyBmcm9tICcuL01hdHJpeDQuanMnO1xuXG5pbXBvcnQgUXVhdGVybmlvbiBmcm9tIFwiLi9RdWF0ZXJuaW9uLmpzXCI7XG5cbmV4cG9ydCBjb25zdCBtYXRoID0ge1xuICAgIEF4aXMsXG4gICAgUEksXG4gICAgREVHX1RPX1JBRCxcbiAgICBSQURfVE9fREVHLFxuICAgIFBJXzIsXG4gICAgUElfNCxcbiAgICBQSV84LFxuICAgIFRXT19QSSxcbiAgICBFUFNJTE9OLFxuICAgIE51bWVyaWNBcnJheSxcbiAgICBOdW1lcmljQXJyYXlIaWdoUCxcbiAgICBGTE9BVF9NQVgsXG5cbiAgICBjaGVja1Bvd2VyT2ZUd28sXG4gICAgY2hlY2taZXJvLFxuICAgIGVxdWFscyxcbiAgICBkZWdyZWVzVG9SYWRpYW5zLFxuICAgIHJhZGlhbnNUb0RlZ3JlZXMsXG4gICAgc2luLFxuICAgIGNvcyxcbiAgICB0YW4sXG4gICAgY290YW4sXG4gICAgYXRhbixcbiAgICBhdGFuMixcbiAgICByYW5kb20sXG4gICAgc2VlZGVkUmFuZG9tLFxuICAgIG1heCxcbiAgICBtaW4sXG4gICAgYWJzLFxuICAgIHNxcnQsXG4gICAgbGVycCxcbiAgICBzcXVhcmVcbn07XG5cbmV4cG9ydCBjb25zdCBWZWMgPSBWZWN0b3JVdGlscy5WZWM7XG5leHBvcnQgY29uc3QgTWF0MyA9IE1hdHJpeDNVdGlscy5NYXQzO1xuZXhwb3J0IGNvbnN0IE1hdDQgPSBNYXRyaXg0VXRpbHMuTWF0NDtcbmV4cG9ydCBjb25zdCBRdWF0ID0gUXVhdGVybmlvbi5RdWF0O1xuXG4iXSwibmFtZXMiOlsiUEkiLCJ0YW4iLCJWZWMiLCJNYXQzIiwiTWF0cml4VXRpbHMiLCJNYXQ0IiwiUXVhdCJdLCJtYXBwaW5ncyI6IkFBQ08sTUFBTSxJQUFJLEdBQUc7QUFDcEIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNSLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDTCxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ0wsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUNMLElBQUksSUFBSSxFQUFFLENBQUMsSUFBSSxLQUFLO0FBQ3BCLFFBQVEsUUFBUSxJQUFJO0FBQ3BCLFFBQVEsS0FBSyxJQUFJLENBQUMsSUFBSTtBQUN0QixZQUFZLE9BQU8sTUFBTSxDQUFDO0FBQzFCLFFBQVEsS0FBSyxJQUFJLENBQUMsQ0FBQztBQUNuQixZQUFZLE9BQU8sR0FBRyxDQUFDO0FBQ3ZCLFFBQVEsS0FBSyxJQUFJLENBQUMsQ0FBQztBQUNuQixZQUFZLE9BQU8sR0FBRyxDQUFDO0FBQ3ZCLFFBQVEsS0FBSyxJQUFJLENBQUMsQ0FBQztBQUNuQixZQUFZLE9BQU8sR0FBRyxDQUFDO0FBQ3ZCLFFBQVEsS0FBSyxJQUFJLENBQUMsQ0FBQztBQUNuQixZQUFZLE9BQU8sR0FBRyxDQUFDO0FBQ3ZCLFFBQVE7QUFDUixZQUFZLE9BQU8sU0FBUztBQUM1QixTQUNBLEtBQUs7QUFDTCxDQUFDLENBQUM7QUFDRjtBQUNPLE1BQU1BLElBQUUsR0FBRyxpQkFBaUIsQ0FBQztBQUM3QixNQUFNLFVBQVUsR0FBRyxnQkFBZ0IsQ0FBQztBQUNwQyxNQUFNLFVBQVUsR0FBRyxpQkFBaUIsQ0FBQztBQUNyQyxNQUFNLElBQUksR0FBRyxrQkFBa0IsQ0FBQztBQUNoQyxNQUFNLElBQUksR0FBRyxpQkFBaUIsQ0FBQztBQUMvQixNQUFNLElBQUksR0FBRyxpQkFBaUIsQ0FBQztBQUMvQixNQUFNLE1BQU0sR0FBRyxpQkFBaUIsQ0FBQztBQUNqQyxNQUFNLE9BQU8sR0FBRyxTQUFTLENBQUM7QUFDakM7QUFDQTtBQUNPLE1BQU0sWUFBWSxHQUFHLFlBQVksQ0FBQztBQUNsQyxNQUFNLGlCQUFpQixHQUFHLFlBQVksQ0FBQztBQUN2QyxNQUFNLFNBQVMsR0FBRyxXQUFXOztBQzdCcEMsSUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ2hDO0FBQ08sTUFBTSxlQUFlLEdBQUcsQ0FBQyxDQUFDLEtBQUs7QUFDdEMsSUFBSSxJQUFJLE9BQU8sQ0FBQyxLQUFLLFFBQVEsRUFBRTtBQUMvQixRQUFRLE9BQU8sS0FBSyxDQUFDO0FBQ3JCLEtBQUs7QUFDTCxTQUFTO0FBQ1QsUUFBUSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3hDLEtBQUs7QUFDTCxFQUFDO0FBQ0Q7QUFDTyxNQUFNLFNBQVMsR0FBRyxDQUFDLENBQUMsS0FBSztBQUNoQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN6QyxFQUFDO0FBQ0Q7QUFDTyxNQUFNLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUs7QUFDL0IsSUFBSSxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQztBQUNyQyxFQUFDO0FBQ0Q7QUFDTyxNQUFNLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxLQUFLO0FBQ3ZDLElBQUksT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQztBQUNsRCxFQUFDO0FBQ0Q7QUFDTyxNQUFNLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxLQUFLO0FBQ3ZDLElBQUksT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQztBQUNsRCxFQUFDO0FBQ0Q7QUFDTyxNQUFNLEdBQUcsR0FBRyxDQUFDLEdBQUcsS0FBSztBQUM1QixJQUFJLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakQsRUFBQztBQUNEO0FBQ08sTUFBTSxHQUFHLEdBQUcsQ0FBQyxHQUFHLEtBQUs7QUFDNUIsSUFBSSxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pELEVBQUM7QUFDRDtBQUNPLE1BQU1DLEtBQUcsR0FBRyxDQUFDLEdBQUcsS0FBSztBQUM1QixJQUFJLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakQsRUFBQztBQUNEO0FBQ08sTUFBTSxLQUFLLEdBQUcsQ0FBQyxHQUFHLEtBQUs7QUFDOUIsSUFBSSxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBR0EsS0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsRCxFQUFDO0FBQ0Q7QUFDTyxNQUFNLElBQUksR0FBRyxDQUFDLEdBQUcsS0FBSztBQUM3QixJQUFJLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEQsRUFBQztBQUNEO0FBQ08sTUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLO0FBQy9CLElBQUksT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckQsRUFBQztBQUNEO0FBQ08sTUFBTSxNQUFNLEdBQUcsTUFBTTtBQUM1QixJQUFJLE9BQU8sSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ3pCLEVBQUM7QUFDRDtBQUNPLE1BQU0sWUFBWSxHQUFHLE1BQU07QUFDbEMsSUFBSSxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDbEIsSUFBSSxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDbEI7QUFDQSxJQUFJLGNBQWMsR0FBRyxDQUFDLGNBQWMsR0FBRyxJQUFJLEdBQUcsS0FBSyxJQUFJLE1BQU0sQ0FBQztBQUM5RCxJQUFJLE1BQU0sR0FBRyxHQUFHLGNBQWMsR0FBRyxNQUFNLENBQUM7QUFDeEM7QUFDQSxJQUFJLE9BQU8sR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDbkMsRUFBQztBQUNEO0FBQ08sTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLO0FBQzVCLElBQUksT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEMsRUFBQztBQUNEO0FBQ08sTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLO0FBQzVCLElBQUksT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEMsRUFBQztBQUNEO0FBQ08sTUFBTSxHQUFHLEdBQUcsQ0FBQyxHQUFHLEtBQUs7QUFDNUIsSUFBSSxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3RDLEVBQUM7QUFDRDtBQUNPLE1BQU0sSUFBSSxHQUFHLENBQUMsR0FBRyxLQUFLO0FBQzdCLElBQUksT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2QyxFQUFDO0FBQ0Q7QUFDTyxNQUFNLElBQUksR0FBRyxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxLQUFLO0FBQ3JDLElBQUksT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQ2xELEVBQUM7QUFDRDtBQUNPLE1BQU0sTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLO0FBQzdCLElBQUksT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM5Qjs7QUM1RkEsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUs7QUFDcEMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLE1BQU0sRUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLENBQUMsa0NBQWtDLENBQUMsQ0FBQyxDQUFDO0FBQ3BGLEVBQUM7QUFDRDtBQUNBLE1BQU1DLEtBQUcsU0FBUyxZQUFZLENBQUM7QUFDL0IsSUFBSSxXQUFXLEdBQUc7QUFDbEIsUUFBUSxRQUFRLFNBQVMsQ0FBQyxNQUFNO0FBQ2hDLFFBQVEsS0FBSyxDQUFDO0FBQ2QsWUFBWSxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsWUFBWSxZQUFZO0FBQ3BELGdCQUFnQixTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUM7QUFDekMsZ0JBQWdCLE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUTtBQUNqRCxjQUFjO0FBQ2QsZ0JBQWdCLEtBQUssQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN6RSxhQUFhO0FBQ2IsaUJBQWlCLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxZQUFZLFlBQVk7QUFDekQsZ0JBQWdCLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQztBQUN6QyxnQkFBZ0IsT0FBTyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRO0FBQ2pELGNBQWM7QUFDZCxnQkFBZ0IsS0FBSyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxRixhQUFhO0FBQ2IsaUJBQWlCLElBQUksT0FBTyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRO0FBQ3RELGdCQUFnQixPQUFPLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVE7QUFDakQsY0FBYztBQUNkLGdCQUFnQixLQUFLLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuRCxhQUFhO0FBQ2IsWUFBWSxNQUFNO0FBQ2xCLFFBQVEsS0FBSyxDQUFDO0FBQ2QsWUFBWSxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsWUFBWSxZQUFZO0FBQ3BELGdCQUFnQixTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUM7QUFDekMsZ0JBQWdCLE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxJQUFJLE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUTtBQUN0RixjQUFjO0FBQ2QsZ0JBQWdCLEtBQUssQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDO0FBQ3RGLGFBQWE7QUFDYixpQkFBaUIsSUFBSSxPQUFPLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVE7QUFDdEQsZ0JBQWdCLE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUTtBQUNqRCxnQkFBZ0IsT0FBTyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRO0FBQ2pELGNBQWM7QUFDZCxnQkFBZ0IsS0FBSyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hFLGFBQWE7QUFDYixZQUFZLE1BQU07QUFDbEIsUUFBUSxLQUFLLENBQUM7QUFDZCxZQUFZLEtBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDekUsWUFBWSxNQUFNO0FBQ2xCLFFBQVEsS0FBSyxDQUFDO0FBQ2QsWUFBWSxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsWUFBWSxZQUFZO0FBQ3BELGdCQUFnQixTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDOUQsWUFBWTtBQUNaLGdCQUFnQixLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEMsYUFBYTtBQUNiLFlBQVksTUFBTTtBQUNsQixRQUFRO0FBQ1IsWUFBWSxNQUFNLElBQUksS0FBSyxDQUFDLENBQUMscUNBQXFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JFLFNBQVM7QUFDVCxLQUFLO0FBQ0w7QUFDQSxJQUFJLFNBQVMsR0FBRztBQUNoQixRQUFRLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUNuQyxRQUFRLFFBQVEsSUFBSSxDQUFDLE1BQU07QUFDM0IsUUFBUSxLQUFLLENBQUM7QUFDZCxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2xDLFFBQVEsS0FBSyxDQUFDO0FBQ2QsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNsQyxRQUFRLEtBQUssQ0FBQztBQUNkLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbEMsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNsQyxZQUFZLE1BQU07QUFDbEIsUUFBUTtBQUNSLFlBQVksTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDckUsU0FBUztBQUNULFFBQVEsT0FBTyxJQUFJLENBQUM7QUFDcEIsS0FBSztBQUNMO0FBQ0EsSUFBSSxTQUFTLEdBQUc7QUFDaEIsUUFBUSxRQUFRLElBQUksQ0FBQyxNQUFNO0FBQzNCLFFBQVEsS0FBSyxDQUFDO0FBQ2QsWUFBWSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEUsUUFBUSxLQUFLLENBQUM7QUFDZCxZQUFZLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3hGLFFBQVEsS0FBSyxDQUFDO0FBQ2QsWUFBWSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVHLFFBQVE7QUFDUixZQUFZLE1BQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3JFLFNBQVM7QUFDVCxLQUFLO0FBQ0w7QUFDQSxJQUFJLE1BQU0sQ0FBQyxHQUFHLEVBQUU7QUFDaEIsUUFBUSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbkMsUUFBUSxRQUFRLElBQUksQ0FBQyxNQUFNO0FBQzNCLFFBQVEsS0FBSyxDQUFDO0FBQ2QsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdCLFFBQVEsS0FBSyxDQUFDO0FBQ2QsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdCLFFBQVEsS0FBSyxDQUFDO0FBQ2QsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdCLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM3QixZQUFZLE1BQU07QUFDbEIsUUFBUTtBQUNSLFlBQVksTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDckUsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNBLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEdBQUcsSUFBSSxFQUFFO0FBQ2xDLFFBQVEsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUMvQixZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDeEIsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3hCLFNBQVM7QUFDVCxhQUFhLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksRUFBRTtBQUNsRCxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDeEIsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3hCLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN4QixTQUFTO0FBQ1QsYUFBYSxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLEVBQUU7QUFDbEQsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3hCLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN4QixZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDeEIsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3hCLFNBQVM7QUFDVCxhQUFhO0FBQ2IsWUFBWSxNQUFNLElBQUksS0FBSyxDQUFDLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxrQkFBa0IsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkgsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNBLElBQUksS0FBSyxDQUFDLENBQUMsRUFBRTtBQUNiLFFBQVEsUUFBUSxJQUFJLENBQUMsTUFBTTtBQUMzQixRQUFRLEtBQUssQ0FBQztBQUNkLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbEMsUUFBUSxLQUFLLENBQUM7QUFDZCxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2xDLFFBQVEsS0FBSyxDQUFDO0FBQ2QsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNsQyxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2xDLFlBQVksTUFBTTtBQUNsQixRQUFRO0FBQ1IsWUFBWSxNQUFNLElBQUksS0FBSyxDQUFDLENBQUMscUJBQXFCLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNsRSxTQUFTO0FBQ1QsUUFBUSxPQUFPLElBQUksQ0FBQztBQUNwQixLQUFLO0FBQ0w7QUFDQSxJQUFJLElBQUksQ0FBQyxHQUFHO0FBQ1osUUFBUSxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QixLQUFLO0FBQ0w7QUFDQSxJQUFJLElBQUksQ0FBQyxHQUFHO0FBQ1osUUFBUSxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QixLQUFLO0FBQ0w7QUFDQSxJQUFJLElBQUksQ0FBQyxHQUFHO0FBQ1osUUFBUSxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QixLQUFLO0FBQ0w7QUFDQSxJQUFJLElBQUksQ0FBQyxHQUFHO0FBQ1osUUFBUSxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QixLQUFLO0FBQ0w7QUFDQSxJQUFJLElBQUksRUFBRSxHQUFHO0FBQ2IsUUFBUSxRQUFRLElBQUksQ0FBQyxNQUFNO0FBQzNCLFFBQVEsS0FBSyxDQUFDO0FBQ2QsWUFBWSxPQUFPLElBQUlBLEtBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNqQyxRQUFRLEtBQUssQ0FBQyxDQUFDO0FBQ2YsUUFBUSxLQUFLLENBQUM7QUFDZCxZQUFZLE9BQU8sSUFBSUEsS0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM3QyxRQUFRO0FBQ1IsWUFBWSxNQUFNLElBQUksS0FBSyxDQUFDLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNyRSxTQUFTO0FBQ1QsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLEVBQUUsR0FBRztBQUNiLFFBQVEsUUFBUSxJQUFJLENBQUMsTUFBTTtBQUMzQixRQUFRLEtBQUssQ0FBQyxDQUFDO0FBQ2YsUUFBUSxLQUFLLENBQUM7QUFDZCxZQUFZLE9BQU8sSUFBSUEsS0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM3QyxRQUFRLEtBQUssQ0FBQyxDQUFDO0FBQ2YsUUFBUTtBQUNSLFlBQVksTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDckUsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNBLElBQUksSUFBSSxFQUFFLEdBQUc7QUFDYixRQUFRLFFBQVEsSUFBSSxDQUFDLE1BQU07QUFDM0IsUUFBUSxLQUFLLENBQUMsQ0FBQztBQUNmLFFBQVEsS0FBSyxDQUFDO0FBQ2QsWUFBWSxPQUFPLElBQUlBLEtBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDN0MsUUFBUSxLQUFLLENBQUMsQ0FBQztBQUNmLFFBQVE7QUFDUixZQUFZLE1BQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3JFLFNBQVM7QUFDVCxLQUFLO0FBQ0w7QUFDQSxJQUFJLElBQUksR0FBRyxHQUFHO0FBQ2QsUUFBUSxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQy9CLFlBQVksTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDckUsU0FBUztBQUNULFFBQVEsT0FBTyxJQUFJQSxLQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsRCxLQUFLO0FBQ0w7QUFDQSxJQUFJLE9BQU8sZ0JBQWdCLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNuQyxRQUFRLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNoQyxLQUFLO0FBQ0w7QUFDQSxJQUFJLE9BQU8sR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDdEIsUUFBUSxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDaEMsUUFBUSxRQUFRLEVBQUUsQ0FBQyxNQUFNO0FBQ3pCLFFBQVEsS0FBSyxDQUFDO0FBQ2QsWUFBWSxPQUFPLElBQUksWUFBWSxDQUFDO0FBQ3BDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzNDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzNDLGFBQWEsQ0FBQyxDQUFDO0FBQ2YsUUFBUSxLQUFLLENBQUM7QUFDZCxZQUFZLE9BQU8sSUFBSSxZQUFZLENBQUM7QUFDcEMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDM0MsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDM0MsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDM0MsYUFBYSxDQUFDLENBQUM7QUFDZixRQUFRLEtBQUssQ0FBQztBQUNkLFlBQVksT0FBTyxJQUFJLFlBQVksQ0FBQztBQUNwQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMzQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMzQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMzQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMzQyxhQUFhLENBQUMsQ0FBQztBQUNmLFFBQVE7QUFDUixZQUFZLE1BQU0sSUFBSSxLQUFLLENB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QyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN4RCxRQUFRLEtBQUssQ0FBQztBQUNkLFlBQVksT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEUsUUFBUSxLQUFLLENBQUM7QUFDZCxZQUFZLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEYsUUFBUTtBQUNSLFlBQVksTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLHFCQUFxQixHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDbEUsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNBLElBQUksT0FBTyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUMzQixRQUFRLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNoQyxRQUFRLE9BQU9BLEtBQUcsQ0FBQyxTQUFTLENBQUNBLEtBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDN0MsS0FBSztBQUNMO0FBQ0EsSUFBSSxPQUFPLEdBQUcs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QUssQ0FBQztBQUNkLFlBQVksT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlDLFFBQVEsS0FBSyxDQUFDO0FBQ2QsWUFBWSxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdELFFBQVEsS0FBSyxDQUFDO0FBQ2QsWUFBWSxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1RSxRQUFRO0FBQ1IsWUFBWSxNQUFNLElBQUksS0FBSyxDQUFDLENBQUMscUJBQXFCLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNsRSxTQUFTO0FBQ1QsS0FBSztBQUNMLENBQUM7QUFDRDtBQUNBLGtCQUFlO0FBQ2YsSUFBSSxHQUFHLEVBQUVBLEtBQUc7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5ZkEsTUFBTUEsS0FBRyxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUM7QUFDNUI7QUFDQSxNQUFNQyxNQUFJLFNBQVMsWUFBWSxDQUFDO0FBQ2hDLElBQUksV0FBVyxHQUFHO0FBQ2xCLFFBQVEsSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUNwQyxZQUFZLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUM3QixTQUFTO0FBQ1QsYUFBYSxJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQ3RFLFlBQVksS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hDLFNBQVM7QUFDVCxhQUFhLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDekMsWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkMsU0FBUztBQUNULGFBQWE7QUFDYixZQUFZLE1BQU0sSUFBSSxLQUFLLENBQUMsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDLENBQUM7QUFDMUUsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNBLElBQUksUUFBUSxHQUFHO0FBQ2YsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDOUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDOUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDOUMsUUFBUSxPQUFPLElBQUksQ0FBQztBQUNwQixLQUFLO0FBQ0w7QUFDQSxJQUFJLElBQUksR0FBRztBQUNYLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzlDLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzlDLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzlDLFFBQVEsT0FBTyxJQUFJLENBQUM7QUFDcEIsS0FBSztBQUNMO0FBQ0EsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQ1gsUUFBUSxPQUFPLElBQUlELEtBQUc7QUFDdEIsWUFBWSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN2QixZQUFZLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMzQixZQUFZLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDN0IsS0FBSztBQUNMO0FBQ0EsSUFBSSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLEVBQUU7QUFDckMsUUFBUSxJQUFJLENBQUMsWUFBWSxZQUFZLElBQUksQ0FBQyxDQUFD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LENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzRCxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsRCxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsRCxTQUFTO0FBQ1QsYUFBYSxJQUFJLENBQUMsQ0FBQyxNQUFNLEtBQUssRUFBRSxFQUFFO0FBQ2xDLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNELEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xELEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ25ELFNBQVM7QUFDVCxhQUFhO0FBQ2IsWUFBWSxNQUFNLElBQUksS0FBSyxDQUFDLENBQUMsc0NBQXNDLENBQUMsQ0FBQyxDQUFDO0FBQ3RFLFNBQVM7QUFDVCxRQUFRLE9BQU8sSUFBSSxDQUFDO0FBQ3BCLEtBQUs7QUFDTDtBQUNBLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQ3BCLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxJQUFJQSxLQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkUsRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLElBQUlBLEtBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2RSxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsSUFBSUEsS0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2pELEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2pELEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2pELEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZCxFQUFFO0FBQ0Y7QUFDQSxJQUFJLFFBQVEsR0FBRztBQUNmLFFBQVEsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNCLFFBQVEsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNCLFFBQVEsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNCLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxQixRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUIsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFCLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNyQixRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDckIsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3JCLFFBQVEsT0FBTyxJQUFJLENBQUM7QUFDcEIsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFO0FBQ1osUUFBUSxJQUFJLE9BQU8sQ0FBQyxDQUFDLEtBQUssUUFBUSxFQUFFO0FBQ3BDLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3JELFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3JELFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3JELFNBQVM7QUFDVCxhQUFhLElBQUksQ0FBQyxZQUFZLFlBQVksSUFBSSxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUM5RCxZQUFZLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkMsWUFBWSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25DLFlBQVksTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuQyxZQUFZLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEMsWUFBWSxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hDLFlBQVksTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoQztBQUNBLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHQSxLQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBR0EsS0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUdBLEtBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3pGLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHQSxLQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBR0EsS0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUdBLEtBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3pGLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHQSxLQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBR0EsS0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUdBLEtBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3pGLFNBQVM7QUFDVCxhQUFhO0FBQ2IsWUFBWSxNQUFNLElBQUksS0FBSyxDQUFDLENBQUMsZ0NBQWdDLENBQUMsQ0FBQyxDQUFDO0FBQ2hFLFNBQVM7QUFDVCxRQUFRLE9BQU8sSUFBSSxDQUFDO0FB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LEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1SSxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUlBLEtBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlJLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSUEsS0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMs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QVEsTUFBTSxRQUFRLEdBQUc7QUFDekIsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ3RCLFlBQVksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUN0QixZQUFZLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDdEIsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ3RCLFNBQVMsQ0FBQztBQUNWO0FBQ0E7QUFDQSxRQUFRLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDcEMsWUFBWSxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLFlBQVksUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QyxZQUFZLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkM7QUFDQSxZQUFZLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkMsWUFBWSxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLFlBQVksUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QztBQUNBLFlBQVksUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QyxZQUFZLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkMsWUFBWSxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3hDO0FBQ0EsWUFBWSxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzdCLFNBQVM7QUFDVCxhQUFhLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDdEUsWUFBWSxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNDLFlBQVksUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzQyxZQUFZLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0M7QUFDQSxZQUFZLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0MsWUFBWSxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNDLFlBQVksUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzQztBQUNBLFlBQVksUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzQyxZQUFZLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0MsWUFBWSxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNDO0FBQ0EsWUFBWSxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzdCLFNBQVM7QUFDVDtBQUNBLGFBQWEsSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLEVBQUUsRUFBRTtBQUMxQyxZQUFZLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDeEMsWUFBWSxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ3pDLFlBQVksUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUN6QyxZQUFZLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDekM7QUFDQSxZQUFZLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDekMsWUFBWSxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ3pDLFlBQVksUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUN6QyxZQUFZLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDekM7QUFDQSxZQUFZLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDekMsWUFBWSxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ3pDLFlBQVksUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN6QyxZQUFZLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDekM7QUFDQSxZQUFZLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDekMsWUFBWSxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3pDLFlBQVksUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN6QyxZQUFZLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDekMsU0FBUztBQUNULGFBQWEsSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLEVBQUUsRUFBRTtBQUN2RSxZQUFZLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0MsWUFBWSxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQzVDLFlBQVksUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUM1QyxZQUFZLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDNUM7QUFDQSxZQUFZLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDNUMsWUFBWSxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQzVDLFlBQVksUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUM1QyxZQUFZLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDNUM7QUFDQSxZQUFZLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDNUMsWUFBWSxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQzVDLFlBQVksUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM1QyxZQUFZLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDNUM7QUFDQSxZQUFZLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDNUMsWUFBWSxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzVDLFlBQVksUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM1QyxZQUFZLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDNUMsU0FBUztBQUNULGFBQWEsSUFBSSxTQUFTLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtBQUN4QyxZQUFZLE1BQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDLENBQUM7QUFDN0UsU0FBUztBQUNUO0FBQ0EsUUFBUSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDeEIsS0FBSztBQUNMO0FBQ0E7QUFDQSxJQUFJLFFBQVEsR0FBRztBQUNmLFFBQVEsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUM7QUFDOUQsUUFBUSxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBQztBQUM5RCxRQUFRLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFDO0FBQzlELFFBQVEsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUM7QUFDOUQsUUFBUSxPQUFPLElBQUksQ0FBQztBQUNwQixLQUFLO0FBQ0w7QUFDQSxJQUFJLElBQUksR0FBRztBQUNYLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN6RCxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDekQsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3pELEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN6RCxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2QsRUFBRTtBQUNGO0FBQ0EsSUFBSSxXQUFXLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFO0FBQ25ELEVBQUUsSUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDLElBQUksR0FBRyxFQUFFLEdBQUcsS0FBSyxDQUFDLEdBQUcsU0FBUyxDQUFDO0FBQ2pELEVBQUUsSUFBSSxXQUFXLEdBQUcsS0FBSyxHQUFHLE1BQU0sQ0FBQztBQUNuQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDekUsUUFBUSxPQUFPLElBQUksQ0FBQztBQUNwQixFQUFFO0FBQ0Y7QUFDQSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRTtBQUN4RCxFQUFFLElBQUksQ0FBQyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDdkIsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDO0FBQ3JCLEVBQUUsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQztBQUM3QjtBQUNBLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSUgsS0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUMxRCxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUlBLEtBQUcsQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDMUQsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJQSxLQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDekYsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJQSxLQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdEU7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2QsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUU7QUFDdEQsRUFBRSxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO0FBQ3JCLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQztBQUNyQixFQUFFLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQzVCO0FBQ0EsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM3RCxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzdELEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM3RCxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkc7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2QsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUU7QUFDL0IsUUFBUSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDeEI7QUFDQSxFQUFFLE1BQU0sQ0FBQyxHQUFHLElBQUlBLEtBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMxQixFQUFFLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3JDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ2hCLEVBQUUsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUIsRUFBRSxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDaEIsRUFBRSxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDaEI7QUFDQSxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQixFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQixFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQixFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNqQyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQixFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQixFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQixFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNqQyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQixFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQixFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQixFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNqQyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ2YsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNmLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDZixFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ2Y7QUFDQSxFQUFFLE9BQU8sTUFBTSxDQUFDO0FBQ2hCLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxJQUFJLEdBQUcsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDakMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDOUIsQ0FBQyxJQUFJLEdBQUcsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDOUIsQ0FBQyxJQUFJLEdBQUcsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDOUIsQ0FBQyxJQUFJLEdBQUcsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDOUIsQ0FBQyxJQUFJLEdBQUcsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDOUIsQ0FBQyxJQUFJLEdBQUcsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDOUIsQ0FBQyxJQUFJLEdBQUcsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDOUIsQ0FBQyxJQUFJLEdBQUcsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDOUIsQ0FBQyxJQUFJLEdBQUcsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDOUIsQ0FBQyxJQUFJLEdBQUcsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7QUFDL0IsQ0FBQyxJQUFJLEdBQUcsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7QUFDL0IsQ0FBQyxJQUFJLEdBQUcsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7QUFDL0IsQ0FBQyxJQUFJLEdBQUcsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7QUFDL0IsQ0FBQyxJQUFJLEdBQUcsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7QUFDL0IsQ0FBQyxJQUFJLEdBQUcsR0FBRyxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7QUFDL0I7QUFDQSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUM1QixDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUM1QixDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUM1QixDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUM1QixDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUM1QixDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUM1QixDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUM1QixDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUM1QixDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUM1QixDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUM1QixDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUM3QixDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUM3QixDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUM3QixDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUM3QixDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUM3QixDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUM3QjtBQUNBLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRTtBQUNYLFFBQVEsT0FBTyxJQUFJQSxLQUFHO0FBQ3RCLFlBQVksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdkIsWUFBWSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDM0IsWUFBWSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDM0IsWUFBWSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdCLEtBQUs7QUFDTDtBQUNBLElBQUksTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLEVBQUU7QUFDL0MsUUFBUSxJQUFJLENBQUMsWUFBWSxZQUFZLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUU7QUFDdEQsWUFBWSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwQyxZQUFZLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwQyxZQUFZLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwQyxZQUFZLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwQyxTQUFTO0FBQ1QsYUFBYSxJQUFJLE9BQU8sQ0FBQyxDQUFDLEtBQUssUUFBUTtBQUN2QyxZQUFZLE9BQU8sQ0FBQyxDQUFDLEtBQUssUUFBUTtBQUNsQyxZQUFZLE9BQU8sQ0FBQyxDQUFDLEtBQUssUUFBUTtBQUNsQyxZQUFZLE9BQU8sQ0FBQyxDQUFDLEtBQUssUUFBUTtBQUNsQyxVQUFVO0FB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QyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUNoQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDbEMsRUFBRTtBQUNGO0FBQ0EsSUFBSSxNQUFNLENBQUMsQ0FBQyxFQUFFO0FBQ2QsRUFBRSxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFO0FBQ25CLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNuRSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbkUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ25FLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNoRSxHQUFHO0FBQ0gsT0FBTyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFO0FBQ3pCLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN6RSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDekUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENB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QUFDLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ2pFLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDNUQsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUM1RCxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDN0QsRUFBRTtBQUNGO0FBQ0E7QUFDQTtBQUNBLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ3BCLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQ0csTUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0MsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkLEVBQUU7QUFDRjtBQUNBLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUN4QixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUNBLE1BQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvQyxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2QsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDaEIsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDQSxNQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyQyxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2QsRUFBRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxRQUFRLEdBQUc7QUFDZixRQUFRLFFBQVEsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUN4RSxnQkFBZ0IsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUN4RSxnQkFBZ0IsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUN4RSxnQkFBZ0IsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3pFLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUNwQixFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUlILEtBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyRSxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUlBLEtBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyRSxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUlBLEtBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN0RSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNqRCxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNqRCxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNsRCxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2QsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDdEIsRUFBRSxJQUFJLE9BQU8sR0FBRyxDQUFDLEVBQUUsUUFBUSxFQUFFO0FBQzdCLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUNsQixHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDaEIsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2hCLEdBQUc7QUFDSCxPQUFPO0FBQ1AsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNwQixHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3BCLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDcEIsR0FBRztBQUNILEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZCxFQUFFO0FBQ0Y7QUFDQTtBQUNBLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRTtBQUNaLEVBQUUsSUFBSSxPQUFPLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRTtBQUMzQixHQUFHLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDOUQsR0FBRyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzlELEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM5RCxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDOUQsR0FBRyxPQUFPLElBQUksQ0FBQztBQUNmLEdBQUc7QUFDSDtBQUNBLFFBQVEsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvQixRQUFRLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDL0IsUUFBUSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9CLFFBQVEsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvQixRQUFRLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUIsUUFBUSxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVCLFFBQVEsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1QixRQUFRLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUI7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBR0EsS0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUdBLEtBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHQSxLQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBR0EsS0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDdkgsUUFBUSxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUdBLEtBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHQSxLQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBR0EsS0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUdBLEtBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZILFFBQVEsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHQSxLQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBR0EsS0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUdBLEtBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHQSxLQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUN2SCxRQUFRLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBR0EsS0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUdBLEtBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHQSxLQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBR0EsS0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDdkg7QUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2QsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFO0FBQ2pCLFFBQVEsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRTtBQUMxQixZQUFZLE1BQU0sSUFBSSxLQUFLLENBQUMsOENBQThDLENBQUMsQ0FBQztBQUM1RSxTQUFTO0FBQ1Q7QUFDQSxFQUFFLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuQixFQUFFLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuQixFQUFFLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuQixFQUFFLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDekM7QUFDQSxFQUFFLE9BQU8sSUFBSUEsS0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ3pFLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDN0QsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUM3RCxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUMvRCxFQUFFO0FBQ0Y7QUFDQSxDQUFDLE1BQU0sR0FBRztBQUNWLEVBQUUsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNyRSxXQUFXLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3hFLFdBQVcsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7QUFDekUsV0FBVyxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzFFO0FBQ0EsS0FBSyxNQUFNLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO0FBQ3RDLFdBQVcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDdEMsV0FBVyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztBQUN0QyxXQUFXLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO0FBQ3RDLFdBQVcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDdEMsV0FBVyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztBQUN0QyxXQUFXLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO0FBQ3RDLFdBQVcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDdEMsV0FBVyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztBQUN0QyxXQUFXLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO0FBQ3RDLFdBQVcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDdEMsV0FBVyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQ3ZDO0FBQ0EsS0FBSyxJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztBQUNyRjtBQUNBLEtBQUssSUFBSSxDQUFDLEdBQUcsRUFBRTtBQUNmLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ2YsTUFBTTtBQUNOLE9BQU87QUFDUCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQ25CO0FBQ0EsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUM7QUFDdkQsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUM7QUFDdkQsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUM7QUFDdkQsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUM7QUFDdkQsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUM7QUFDdkQsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUM7QUFDdkQsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUM7QUFDdkQsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUM7QUFDdkQsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUM7QUFDdkQsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUM7QUFDdkQsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUM7QUFDeEQsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUM7QUFDeEQsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUM7QUFDeEQsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUM7QUFDeEQsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUM7QUFDeEQsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUM7QUFDeEQsR0FBRztBQUNIO0FBQ0EsUUFBUSxPQUFPLElBQUksQ0FBQztBQUNwQixFQUFFO0FBQ0Y7QUFDQSxDQUFDLFFBQVEsR0FBRztBQUNaLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSUEsS0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzNELEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSUEsS0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzNELEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSUEsS0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzNELEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSUEsS0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzNEO0FBQ0EsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUNyQixFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3JCLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDckIsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUNyQixFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2QsRUFBRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLE9BQU8sWUFBWSxHQUFHO0FBQzFCLFFBQVEsTUFBTSxDQUFDLEdBQUcsSUFBSUcsTUFBSSxFQUFFLENBQUM7QUFDN0IsUUFBUSxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUM1QixLQUFLO0FBQ0w7QUFDQSxDQUFDLE9BQU8sUUFBUSxHQUFHO0FBQ25CLEVBQUUsTUFBTSxDQUFDLEdBQUcsSUFBSUEsTUFBSSxFQUFFLENBQUM7QUFDdkIsRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNsQixFQUFFO0FBQ0Y7QUFDQSxDQUFDLE9BQU8sa0JBQWtCLENBQUMsQ0FBQyxFQUFFO0FBQzlCLEVBQUUsTUFBTSxDQUFDLEdBQUdBLE1BQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztBQUNoQztBQUNBLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSUgsS0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9JLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSUEsS0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pKLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSUEsS0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9JLFFBQVEsT0FBTyxDQUFDLENBQUM7QUFDakIsRUFBRTtBQUNGO0FBQ0EsSUFBSSxPQUFPLGVBQWUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUNwQyxFQUFFLElBQUksQ0FBQyxZQUFZLFlBQVksSUFBSSxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtBQUNsRCxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDWixHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDWixHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDWixHQUFHO0FBQ0gsRUFBRSxPQUFPLElBQUlHLE1BQUk7QUFDakIsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHO0FBQ3JCLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRztBQUNyQixHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUc7QUFDckIsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHO0FBQ3JCLEdBQUcsQ0FBQztBQUNKLEVBQUU7QUFDRjtBQUNBLENBQUMsT0FBTyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ3JDLEVBQUUsTUFBTSxJQUFJLEdBQUcsSUFBSUgsS0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDOUIsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDbkI7QUFDQSxFQUFFLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDakMsRUFBRSxJQUFJLFNBQVMsR0FBRyxHQUFHLEdBQUcsUUFBUSxDQUFDO0FBQ2pDLEVBQUUsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNqQztBQUNBLEVBQUUsT0FBTyxJQUFJRyxNQUFJO0FBQ2pCLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLFNBQVMsR0FBRyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLFNBQVMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsU0FBUyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsUUFBUSxFQUFFLENBQUM7QUFDOUksR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsU0FBUyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxTQUFTLEdBQUcsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxRQUFRLEVBQUUsQ0FBQztBQUM5SSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLFNBQVMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsU0FBUyxHQUFHLFFBQVEsRUFBRSxDQUFDO0FBQzlJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNWLEdBQUcsQ0FBQztBQUNKLEVBQUU7QUFDRjtBQUNBLENBQUMsT0FBTyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDM0IsRUFBRSxJQUFJLENBQUMsWUFBWSxZQUFZLEtBQUssQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7QUFDbkQsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JCLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNaLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNaLEdBQUc7QUFDSCxFQUFFLE9BQU8sSUFBSUEsTUFBSTtBQUNqQixHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDYixHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDYixHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDYixHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDYixHQUFHO0FBQ0gsRUFBRTtBQUNGO0FBQ0E7QUFDQSxJQUFJLE9BQU8sZUFBZSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRTtBQUM5RCxFQUFFLE9BQU8sQ0FBQyxJQUFJQSxNQUFJLEVBQUUsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDckUsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxPQUFPLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRTtBQUNuRSxFQUFFLE9BQU8sQ0FBQyxJQUFJQSxNQUFJLEVBQUUsRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUM3RSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLE9BQU8sU0FBUyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFO0FBQ2pFLEVBQUUsT0FBTyxDQUFDLElBQUlBLE1BQUksRUFBRSxFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQzNFLEVBQUU7QUFDRjtBQUNBLENBQUMsT0FBTyxVQUFVLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUU7QUFDdkMsRUFBRSxPQUFPLENBQUMsSUFBSUEsTUFBSSxFQUFFLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDL0MsRUFBRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksT0FBTyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7QUFDekQsRUFBRSxJQUFJLEdBQUcsR0FBRyxJQUFJQSxNQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0IsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2xCLEVBQUUsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ2Y7QUFDQSxFQUFFLE1BQU0sR0FBRyxHQUFHLElBQUlILEtBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLElBQUksUUFBUSxDQUFDLEtBQUssSUFBSSxHQUFHLEdBQUcsR0FBRztBQUNyRSxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsSUFBSSxRQUFRLENBQUMsTUFBTSxJQUFJLEdBQUcsR0FBRyxHQUFHO0FBQ3hELFFBQVEsS0FBSyxHQUFHLEdBQUcsR0FBRyxHQUFHO0FBQ3pCLFFBQVEsR0FBRyxDQUFDLENBQUM7QUFDYjtBQUNBLEVBQUUsTUFBTSxNQUFNLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQy9DLEVBQUUsSUFBSSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUNuQixHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakIsR0FBRztBQUNILE9BQU87QUFDUCxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNoQyxNQUFNLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDdkIsTUFBTSxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3ZCLE1BQU0sTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDekIsR0FBRztBQUNIO0FBQ0EsRUFBRSxPQUFPLE1BQU0sQ0FBQztBQUNoQixFQUFFO0FBQ0Y7QUFDQSxJQUFJLE9BQU8sUUFBUSxDQUFDLENBQUMsRUFBRTtBQUN2QixFQUFFLE9BQU8sSUFBSSxJQUFJO0FBQ2pCLFlBQVksSUFBSUEsS0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFO0FBQ2pELEdBQUcsSUFBSUEsS0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFO0FBQ3hDLEdBQUcsSUFBSUEsS0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFO0FBQ3pDLEdBQUcsQ0FBQztBQUNKLEVBQUU7QUFDRjtBQUNBLElBQUksT0FBTyxXQUFXLENBQUMsQ0FBQyxFQUFFO0FBQzFCLEVBQUUsTUFBTSxLQUFLLEdBQUdHLE1BQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUNoQyxFQUFFLE9BQU8sSUFBSUEsTUFBSTtBQUNqQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDdEQsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ3RELElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUN0RCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7QUFDcEIsR0FBRyxDQUFDO0FBQ0osRUFBRTtBQUNGO0FBQ0EsQ0FBQyxPQUFPLFdBQVcsQ0FBQyxDQUFDLEVBQUU7QUFDdkIsRUFBRSxPQUFPLElBQUlILEtBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3RDLEVBQUU7QUFDRjtBQUNBLElBQUksT0FBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUN2QixFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDN0UsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN4RSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMs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QUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDcEMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNyQyxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3JDLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNwQixLQUFLO0FBQ0w7QUFDQSxJQUFJLGVBQWUsQ0FBQyxDQUFDLEVBQUU7QUFDdkIsUUFBUSxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN6RCxRQUFRLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDekI7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3BDLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDckMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNyQyxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDcEIsS0FBSztBQUNMO0FBQ0EsSUFBSSxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ25DLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUM1QyxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLEdBQUcsQ0FBQyxFQUFFLENBQUM7QUFDNUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxHQUFHLENBQUMsRUFBRSxDQUFDO0FBQzVDLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxHQUFHLENBQUMsRUFBRSxDQUFDO0FBQ3hDLFFBQVEsT0FBTyxJQUFJLENBQUM7QUFDcEIsS0FBSztBQUNMLENBQUM7QUFDRDtBQUNBLGlCQUFlO0FBQ2YsSUFBSSxJQUFJLEVBQUVJLE1BQUk7QUFDZDs7QUNsQlksTUFBQyxJQUFJLEdBQUc7QUFDcEIsSUFBSSxJQUFJO0FBQ1IsUUFBSU4sSUFBRTtBQUNOLElBQUksVUFBVTtBQUNkLElBQUksVUFBVTtBQUNkLElBQUksSUFBSTtBQUNSLElBQUksSUFBSTtBQUNSLElBQUksSUFBSTtBQUNSLElBQUksTUFBTTtBQUNWLElBQUksT0FBTztBQUNYLElBQUksWUFBWTtBQUNoQixJQUFJLGlCQUFpQjtBQUNyQixJQUFJLFNBQVM7QUFDYjtBQUNBLElBQUksZUFBZTtBQUNuQixJQUFJLFNBQVM7QUFDYixJQUFJLE1BQU07QUFDVixJQUFJLGdCQUFnQjtBQUNwQixJQUFJLGdCQUFnQjtBQUNwQixJQUFJLEdBQUc7QUFDUCxJQUFJLEdBQUc7QUFDUCxTQUFJQyxLQUFHO0FBQ1AsSUFBSSxLQUFLO0FBQ1QsSUFBSSxJQUFJO0FBQ1IsSUFBSSxLQUFLO0FBQ1QsSUFBSSxNQUFNO0FBQ1YsSUFBSSxZQUFZO0FBQ2hCLElBQUksR0FBRztBQUNQLElBQUksR0FBRztBQUNQLElBQUksR0FBRztBQUNQLElBQUksSUFBSTtBQUNSLElBQUksSUFBSTtBQUNSLElBQUksTUFBTTtBQUNWLEVBQUU7QUFDRjtBQUNZLE1BQUMsR0FBRyxHQUFHLFdBQVcsQ0FBQyxJQUFJO0FBQ3ZCLE1BQUMsSUFBSSxHQUFHLFlBQVksQ0FBQyxLQUFLO0FBQzFCLE1BQUMsSUFBSSxHQUFHLFlBQVksQ0FBQyxLQUFLO0FBQzFCLE1BQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQzs7OzsifQ==
