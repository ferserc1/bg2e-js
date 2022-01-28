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

class Vec$3 extends NumericArray {
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
            return new Vec$3(this);
        case 3:
        case 4:
            return new Vec$3(this[0], this[1]);
        default:
            throw new Error(`Invalid vector size: ${ this.length }`);
        }
    }

    get xz() {
        switch (this.length) {
        case 3:
        case 4:
            return new Vec$3(this[0], this[2]);
        case 2:
        default:
            throw new Error(`Invalid vector size: ${ this.length }`);
        }
    }

    get yz() {
        switch (this.length) {
        case 3:
        case 4:
            return new Vec$3(this[1], this[2]);
        case 2:
        default:
            throw new Error(`Invalid vector size: ${ this.length }`);
        }
    }

    get xyz() {
        if (this.length !== 4) {
            throw new Error(`Invalid vector size: ${ this.length }`);
        }
        return new Vec$3(this[0], this[1], this[2]);
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
        return Vec$3.Magnitude(Vec$3.Sub(v1,v2));
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
        const m = Vec$3.Magnitude(v);
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
    Vec: Vec$3,

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

const Vec$2 = VectorUtils.Vec;

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
        return new Vec$2(
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
        return new Vec$2(
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
		const rx = (new Vec$2(this[0], this[3], this[6])).normalize().scale(x);
		const ry = (new Vec$2(this[1], this[4], this[7])).normalize().scale(y);
		const rz = (new Vec$2(this[2], this[5], this[8])).normalize().scale(z);
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
            
            this[0] = Vec$2.Dot(r0,c0); this[1] = Vec$2.Dot(r0,c1); this[2] = Vec$2.Dot(r0,c2);
            this[3] = Vec$2.Dot(r1,c0); this[4] = Vec$2.Dot(r1,c1); this[5] = Vec$2.Dot(r1,c2);
            this[6] = Vec$2.Dot(r2,c0); this[7] = Vec$2.Dot(r2,c1); this[8] = Vec$2.Dot(r2,c2);
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
        
            return new Vec$2(	this[0] * x + this[3] * y + this[6] * z,
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
        return new Vec$2(
            Vec$2.Magnitude(new Vec$2(m[0], m[3], m[6])),
            Vec$2.Magnitude(new Vec$2(m[1], m[4], m[7])),
            Vec$2.Magnitude(new Vec$2(m[2], m[5], m[8]))
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

const Vec$1 = VectorUtils.Vec;
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
		
		this.setRow(0, new Vec$1(nearPlane*2.0/A,	0.0,	0.0,	0.0));
		this.setRow(1, new Vec$1(0.0,	nearPlane*2.0/B,	0.0,	0.0));
		this.setRow(2, new Vec$1((right+left)/A,	(top+bottom)/B,	-(farPlane+nearPlane)/C,	-1.0));
		this.setRow(3, new Vec$1(0.0,	0.0,	-(farPlane*nearPlane*2.0)/C,	0.0));
		
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

		const y = new Vec$1(p_up);
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
        return new Vec$1(
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
        return new Vec$1(
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
		return Mat4$1.TransformDirection(this, new Vec$1(0.0, 0.0, 1.0));
	}
	
	get rightVector() {
		return Mat4$1.TransformDirection(this, new Vec$1(1.0, 0.0, 0.0));
	}
	
	get upVector() {
		return Mat4$1.TransformDirection(this, new Vec$1(0.0, 1.0, 0.0));
	}
	
	get backwardVector() {
		return Mat4$1.TransformDirection(this, new Vec$1(0.0, 0.0, -1.0));
	}
	
	get leftVector() {
		return Mat4$1.TransformDirection(this, new Vec$1(-1.0, 0.0, 0.0));
	}
	
	get downVector() {
		return Mat4$1.TransformDirection(this, new Vec$1(0.0, -1.0, 0.0));
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
		const rx = new Vec$1(this[0], this[4], this[8]).normalize().scale(x);
		const ry = new Vec$1(this[1], this[5], this[9]).normalize().scale(y);
		const rz = new Vec$1(this[2], this[6], this[10]).normalize().scale(z);
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

        this[0 ] = Vec$1.Dot(r0, c0); this[1 ] = Vec$1.Dot(r0, c1); this[2 ] = Vec$1.Dot(r0, c2); this[3 ] = Vec$1.Dot(r0, c3);
        this[4 ] = Vec$1.Dot(r1, c0); this[5 ] = Vec$1.Dot(r1, c1); this[6 ] = Vec$1.Dot(r1, c2); this[7 ] = Vec$1.Dot(r1, c3);
        this[8 ] = Vec$1.Dot(r2, c0); this[9 ] = Vec$1.Dot(r2, c1); this[10] = Vec$1.Dot(r2, c2); this[11] = Vec$1.Dot(r2, c3);
        this[12] = Vec$1.Dot(r3, c0); this[13] = Vec$1.Dot(r3, c1); this[14] = Vec$1.Dot(r3, c2); this[15] = Vec$1.Dot(r3, c3);

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
	
		return new Vec$1( this[0] * x + this[4] * y + this[ 8] * z + this[12] * w,
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
		const r0 = new Vec$1(this[0], this[4], this[ 8], this[12]);
		const r1 = new Vec$1(this[1], this[5], this[ 9], this[13]);
		const r2 = new Vec$1(this[2], this[6], this[10], this[14]);
		const r3 = new Vec$1(this[3], this[7], this[11], this[15]);
	
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
		const axis = new Vec$1(x,y,z);
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

		const vin = new Vec$1(((x - viewport.y) / viewport.width) * 2.0 - 1.0,
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
            new Vec$1(m[1], m[5], m[9]).magnitude(),
			new Vec$1(m[0], m[4], m[8]).magnitude(),
			new Vec$1(m[2], m[6], m[10]).magnitude()
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
		return new Vec$1(m[12], m[13], m[14]);
	}

    static Equals(m,n) {
		return	m[ 0] == n[ 0] && m[ 1] == n[ 1] && m[ 2] == n[ 2] && m[ 3] == n[ 3] &&
				m[ 4] == n[ 4] && m[ 5] == n[ 5] && m[ 6] == n[ 6] && m[ 7] == n[ 7] &&
				m[ 8] == n[ 8] && m[ 9] == n[ 9] && m[10] == n[10] && m[11] == n[11] &&
				m[12] == n[12] && m[13] == n[13] && m[14] == n[14] && m[15] == n[15];
	}

    static TransformDirection(M, /* Vec */ dir) {
		const direction = new Vec$1(dir);
		const trx = new Mat4$1(M);
		trx.setRow(3, new Vec$1(0, 0, 0, 1));
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

export { Mat3, Mat4, Vec, math };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmcyZS1tYXRoLmpzIiwic291cmNlcyI6WyIuLi9zcmMvanMvY29uc3RhbnRzLmpzIiwiLi4vc3JjL2pzL2Z1bmN0aW9ucy5qcyIsIi4uL3NyYy9qcy9WZWN0b3IuanMiLCIuLi9zcmMvanMvTWF0cml4My5qcyIsIi4uL3NyYy9qcy9NYXRyaXg0LmpzIiwiLi4vc3JjL2pzL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIlxuZXhwb3J0IGNvbnN0IEF4aXMgPSB7XG5cdE5PTkU6IDAsXG5cdFg6IDEsXG5cdFk6IDIsXG5cdFo6IDMsXG4gICAgbmFtZTogKGF4aXMpID0+IHtcbiAgICAgICAgc3dpdGNoIChheGlzKSB7XG4gICAgICAgIGNhc2UgQXhpcy5OT05FOlxuICAgICAgICAgICAgcmV0dXJuIFwiTk9ORVwiO1xuICAgICAgICBjYXNlIEF4aXMuWDpcbiAgICAgICAgICAgIHJldHVybiBcIlhcIjtcbiAgICAgICAgY2FzZSBBeGlzLlk6XG4gICAgICAgICAgICByZXR1cm4gXCJZXCI7XG4gICAgICAgIGNhc2UgQXhpcy5aOlxuICAgICAgICAgICAgcmV0dXJuIFwiWlwiO1xuICAgICAgICBjYXNlIEF4aXMuVzpcbiAgICAgICAgICAgIHJldHVybiBcIldcIjtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBcIlVOS05PV05cIlxuICAgICAgICB9O1xuICAgIH1cbn07XG5cbmV4cG9ydCBjb25zdCBQSSA9IDMuMTQxNTkyNjUzNTg5NzkzO1xuZXhwb3J0IGNvbnN0IERFR19UT19SQUQgPSAwLjAxNzQ1MzI5MjUxOTk0O1xuZXhwb3J0IGNvbnN0IFJBRF9UT19ERUcgPSA1Ny4yOTU3Nzk1MTMwODIzMztcbmV4cG9ydCBjb25zdCBQSV8yID0gMS41NzA3OTYzMjY3OTQ4OTY2O1xuZXhwb3J0IGNvbnN0IFBJXzQgPSAwLjc4NTM5ODE2MzM5NzQ0ODtcbmV4cG9ydCBjb25zdCBQSV84ID0gMC4zOTI2OTkwODE2OTg3MjQ7XG5leHBvcnQgY29uc3QgVFdPX1BJID0gNi4yODMxODUzMDcxNzk1ODY7XG5leHBvcnQgY29uc3QgRVBTSUxPTiA9IDAuMDAwMDAwMTtcblxuLy8gRGVmYXVsdCBhcnJheTogMzIgYml0c1xuZXhwb3J0IGNvbnN0IE51bWVyaWNBcnJheSA9IEZsb2F0MzJBcnJheTtcbmV4cG9ydCBjb25zdCBOdW1lcmljQXJyYXlIaWdoUCA9IEZsb2F0NjRBcnJheTtcbmV4cG9ydCBjb25zdCBGTE9BVF9NQVggPSAzLjQwMjgyM2UzODtcbiIsIlxuaW1wb3J0IHtcbiAgICBFUFNJTE9OLFxuICAgIERFR19UT19SQUQsXG4gICAgUkFEX1RPX0RFR1xufSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbmxldCBzX2JnX21hdGhfc2VlZCA9IERhdGUubm93KCk7XG5cbmV4cG9ydCBjb25zdCBjaGVja1Bvd2VyT2ZUd28gPSAobikgPT4ge1xuICAgIGlmICh0eXBlb2YgbiAhPT0gJ251bWJlcicpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG4gJiYgKG4gJiAobiAtIDEpKSA9PT0gMDtcbiAgICB9ICBcbn1cblxuZXhwb3J0IGNvbnN0IGNoZWNrWmVybyA9ICh2KSA9PiB7XG4gICAgcmV0dXJuIHY+LUVQU0lMT04gJiYgdjxFUFNJTE9OID8gMDp2O1xufVxuXG5leHBvcnQgY29uc3QgZXF1YWxzID0gKGEsYikgPT4ge1xuICAgIHJldHVybiBNYXRoLmFicyhhIC0gYikgPCBFUFNJTE9OO1xufVxuXG5leHBvcnQgY29uc3QgZGVncmVlc1RvUmFkaWFucyA9IChkKSA9PiB7XG4gICAgcmV0dXJuIE1hdGguZnJvdW5kKGNoZWNrWmVybyhkICogREVHX1RPX1JBRCkpO1xufVxuXG5leHBvcnQgY29uc3QgcmFkaWFuc1RvRGVncmVlcyA9IChyKSA9PiB7XG4gICAgcmV0dXJuIE1hdGguZnJvdW5kKGNoZWNrWmVybyhyICogUkFEX1RPX0RFRykpO1xufVxuXG5leHBvcnQgY29uc3Qgc2luID0gKHZhbCkgPT4ge1xuICAgIHJldHVybiBNYXRoLmZyb3VuZChjaGVja1plcm8oTWF0aC5zaW4odmFsKSkpO1xufVxuXG5leHBvcnQgY29uc3QgY29zID0gKHZhbCkgPT4ge1xuICAgIHJldHVybiBNYXRoLmZyb3VuZChjaGVja1plcm8oTWF0aC5jb3ModmFsKSkpO1xufVxuXG5leHBvcnQgY29uc3QgdGFuID0gKHZhbCkgPT4ge1xuICAgIHJldHVybiBNYXRoLmZyb3VuZChjaGVja1plcm8oTWF0aC50YW4odmFsKSkpO1xufVxuXG5leHBvcnQgY29uc3QgY290YW4gPSAodmFsKSA9PiB7XG4gICAgcmV0dXJuIE1hdGguZnJvdW5kKGNoZWNrWmVybygxLjAgLyB0YW4odmFsKSkpO1xufVxuXG5leHBvcnQgY29uc3QgYXRhbiA9ICh2YWwpID0+IHtcbiAgICByZXR1cm4gTWF0aC5mcm91bmQoY2hlY2taZXJvKE1hdGguYXRhbih2YWwpKSk7XG59XG5cbmV4cG9ydCBjb25zdCBhdGFuMiA9IChpLCBqKSA9PiB7XG4gICAgcmV0dXJuIE1hdGguZnJvdW5kKGNoZWNrWmVybyhNYXRoLmF0YW4yZihpLCBqKSkpO1xufVxuXG5leHBvcnQgY29uc3QgcmFuZG9tID0gKCkgPT4ge1xuICAgIHJldHVybiBNYXRoLnJhbmRvbSgpO1xufVxuXG5leHBvcnQgY29uc3Qgc2VlZGVkUmFuZG9tID0gKCkgPT4ge1xuICAgIGNvbnN0IG1heCA9IDE7XG4gICAgY29uc3QgbWluID0gMDtcbiBcbiAgICBzX2JnX21hdGhfc2VlZCA9IChzX2JnX21hdGhfc2VlZCAqIDkzMDEgKyA0OTI5NykgJSAyMzMyODA7XG4gICAgY29uc3Qgcm5kID0gc19iZ19tYXRoX3NlZWQgLyAyMzMyODA7XG4gXG4gICAgcmV0dXJuIG1pbiArIHJuZCAqIChtYXggLSBtaW4pO1xufVxuXG5leHBvcnQgY29uc3QgbWF4ID0gKGEsYikgPT4ge1xuICAgIHJldHVybiBNYXRoLmZyb3VuZChNYXRoLm1heChhLGIpKTtcbn1cblxuZXhwb3J0IGNvbnN0IG1pbiA9IChhLGIpID0+IHtcbiAgICByZXR1cm4gTWF0aC5mcm91bmQoTWF0aC5taW4oYSxiKSk7XG59XG5cbmV4cG9ydCBjb25zdCBhYnMgPSAodmFsKSA9PiB7XG4gICAgcmV0dXJuIE1hdGguZnJvdW5kKE1hdGguYWJzKHZhbCkpO1xufVxuXG5leHBvcnQgY29uc3Qgc3FydCA9ICh2YWwpID0+IHtcbiAgICByZXR1cm4gTWF0aC5mcm91bmQoTWF0aC5zcXJ0KHZhbCkpO1xufVxuXG5leHBvcnQgY29uc3QgbGVycCA9IChmcm9tLCB0bywgdCkgPT4ge1xuICAgIHJldHVybiBNYXRoLmZyb3VuZCgoMS4wIC0gdCkgKiBmcm9tICsgdCAqIHRvKTtcbn1cblxuZXhwb3J0IGNvbnN0IHNxdWFyZSA9IChuKSA9PiB7XG4gICAgcmV0dXJuIE1hdGguZnJvdW5kKG4gKiBuKTtcbn1cbiIsImltcG9ydCB7IE51bWVyaWNBcnJheSB9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuXG5jb25zdCBjaGVja0VxdWFsTGVuZ3RoID0gKHYxLHYyKSA9PiB7XG4gICAgaWYgKHYxLmxlbmd0aCE9djIubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIGxlbmd0aCBpbiBvcGVyYXRpb25gKTtcbn1cblxuY2xhc3MgVmVjIGV4dGVuZHMgTnVtZXJpY0FycmF5IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHNbMF0gaW5zdGFuY2VvZiBOdW1lcmljQXJyYXkgJiYgXG4gICAgICAgICAgICAgICAgYXJndW1lbnRzWzBdLmxlbmd0aCA9PT0gMiAmJlxuICAgICAgICAgICAgICAgIHR5cGVvZihhcmd1bWVudHNbMV0pID09PSBcIm51bWJlclwiXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBzdXBlcihbIGFyZ3VtZW50c1swXVswXSwgYXJndW1lbnRzWzBdWzFdLCBhcmd1bWVudHNbMV1dKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGFyZ3VtZW50c1swXSBpbnN0YW5jZW9mIE51bWVyaWNBcnJheSAmJiBcbiAgICAgICAgICAgICAgICBhcmd1bWVudHNbMF0ubGVuZ3RoID09PSAzICYmXG4gICAgICAgICAgICAgICAgdHlwZW9mKGFyZ3VtZW50c1sxXSkgPT09IFwibnVtYmVyXCJcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHN1cGVyKFsgYXJndW1lbnRzWzBdWzBdLCBhcmd1bWVudHNbMF1bMV0sIGFyZ3VtZW50c1swXVsyXSwgYXJndW1lbnRzWzFdXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh0eXBlb2YoYXJndW1lbnRzWzBdKSA9PT0gXCJudW1iZXJcIiAmJlxuICAgICAgICAgICAgICAgIHR5cGVvZihhcmd1bWVudHNbMV0pID09PSBcIm51bWJlclwiXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBzdXBlcihbYXJndW1lbnRzWzBdLGFyZ3VtZW50c1sxXV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHNbMF0gaW5zdGFuY2VvZiBOdW1lcmljQXJyYXkgJiZcbiAgICAgICAgICAgICAgICBhcmd1bWVudHNbMF0ubGVuZ3RoID09PSAyICYmXG4gICAgICAgICAgICAgICAgdHlwZW9mKGFyZ3VtZW50c1sxXSkgPT09IFwibnVtYmVyXCIgJiYgdHlwZW9mKGFyZ3VtZW50c1syXSkgPT09IFwibnVtYmVyXCJcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHN1cGVyKFsgYXJndW1lbnRzWzBdWzBdLCBhcmd1bWVudHNbMF1bMV0sIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdXSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZihhcmd1bWVudHNbMF0pID09PSBcIm51bWJlclwiICYmXG4gICAgICAgICAgICAgICAgdHlwZW9mKGFyZ3VtZW50c1sxXSkgPT09IFwibnVtYmVyXCIgJiZcbiAgICAgICAgICAgICAgICB0eXBlb2YoYXJndW1lbnRzWzJdKSA9PT0gXCJudW1iZXJcIlxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoW2FyZ3VtZW50c1swXSxhcmd1bWVudHNbMV0sYXJndW1lbnRzWzJdXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgc3VwZXIoW2FyZ3VtZW50c1swXSxhcmd1bWVudHNbMV0sYXJndW1lbnRzWzJdLGFyZ3VtZW50c1szXV0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHNbMF0gaW5zdGFuY2VvZiBOdW1lcmljQXJyYXkgJiZcbiAgICAgICAgICAgICAgICBhcmd1bWVudHNbMF0ubGVuZ3RoPjEgJiYgYXJndW1lbnRzWzBdLmxlbmd0aDw1KVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHN1cGVyKGFyZ3VtZW50c1swXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBwYXJhbWV0ZXJzIGluIFZlYyBjb25zdHJ1Y3RvcmApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbm9ybWFsaXplKCkge1xuICAgICAgICBjb25zdCBtID0gdGhpcy5tYWduaXR1ZGUoKTtcbiAgICAgICAgc3dpdGNoICh0aGlzLmxlbmd0aCkge1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICB0aGlzWzNdID0gdGhpc1szXSAvIG07XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHRoaXNbMl0gPSB0aGlzWzJdIC8gbTtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgdGhpc1sxXSA9IHRoaXNbMV0gLyBtOyAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpc1swXSA9IHRoaXNbMF0gLyBtO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHRoaXMubGVuZ3RoIH1gKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBtYWduaXR1ZGUoKSB7XG4gICAgICAgIHN3aXRjaCAodGhpcy5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgcmV0dXJuIE1hdGguc3FydCh0aGlzWzBdICogdGhpc1swXSArIHRoaXNbMV0gKiB0aGlzWzFdKTtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgcmV0dXJuIE1hdGguc3FydCh0aGlzWzBdICogdGhpc1swXSArIHRoaXNbMV0gKiB0aGlzWzFdICsgdGhpc1syXSAqIHRoaXNbMl0pO1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KHRoaXNbMF0gKiB0aGlzWzBdICsgdGhpc1sxXSAqIHRoaXNbMV0gKyB0aGlzWzJdICogdGhpc1syXSArIHRoaXNbM10gKiB0aGlzWzNdKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdGhpcy5sZW5ndGggfWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXNzaWduKHNyYykge1xuICAgICAgICBjaGVja0VxdWFsTGVuZ3RoKHRoaXMsc3JjKTtcbiAgICAgICAgc3dpdGNoICh0aGlzLmxlbmd0aCkge1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICB0aGlzWzNdID0gc3JjWzNdO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICB0aGlzWzJdID0gc3JjWzJdO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICB0aGlzWzFdID0gc3JjWzFdO1xuICAgICAgICAgICAgdGhpc1swXSA9IHNyY1swXTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB0aGlzLmxlbmd0aCB9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXQoeCwgeSwgeiA9IG51bGwsIHcgPSBudWxsKSB7XG4gICAgICAgIGlmICh0aGlzLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgICAgdGhpc1swXSA9IHg7XG4gICAgICAgICAgICB0aGlzWzFdID0geTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLmxlbmd0aCA9PT0gMyAmJiB6ICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzWzBdID0geDtcbiAgICAgICAgICAgIHRoaXNbMV0gPSB5O1xuICAgICAgICAgICAgdGhpc1syXSA9IHo7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcy5sZW5ndGggPT09IDQgJiYgdyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpc1swXSA9IHg7XG4gICAgICAgICAgICB0aGlzWzFdID0geTtcbiAgICAgICAgICAgIHRoaXNbMl0gPSB6O1xuICAgICAgICAgICAgdGhpc1szXSA9IHc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHRoaXMubGVuZ3RoIH0uIFRyeWluZyB0byBzZXQgeD0ke3h9LCB5PSR7eX0sIHo9JHt6fSwgdz0ke3d9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzY2FsZShzKSB7XG4gICAgICAgIHN3aXRjaCAodGhpcy5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgdGhpc1szXSA9IHRoaXNbM10gKiBzO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICB0aGlzWzJdID0gdGhpc1syXSAqIHM7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHRoaXNbMV0gPSB0aGlzWzFdICogcztcbiAgICAgICAgICAgIHRoaXNbMF0gPSB0aGlzWzBdICogcztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB2Lmxlbmd0aCB9YCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZ2V0IHgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzBdO1xuICAgIH1cblxuICAgIGdldCB5KCkge1xuICAgICAgICByZXR1cm4gdGhpc1sxXTtcbiAgICB9XG5cbiAgICBnZXQgeigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMl07XG4gICAgfVxuXG4gICAgZ2V0IHcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzNdO1xuICAgIH1cblxuICAgIGdldCB4eSgpIHtcbiAgICAgICAgc3dpdGNoICh0aGlzLmxlbmd0aCkge1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICByZXR1cm4gbmV3IFZlYyh0aGlzKTtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICByZXR1cm4gbmV3IFZlYyh0aGlzWzBdLCB0aGlzWzFdKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdGhpcy5sZW5ndGggfWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0IHh6KCkge1xuICAgICAgICBzd2l0Y2ggKHRoaXMubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBWZWModGhpc1swXSwgdGhpc1syXSk7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdGhpcy5sZW5ndGggfWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0IHl6KCkge1xuICAgICAgICBzd2l0Y2ggKHRoaXMubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBWZWModGhpc1sxXSwgdGhpc1syXSk7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdGhpcy5sZW5ndGggfWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0IHh5eigpIHtcbiAgICAgICAgaWYgKHRoaXMubGVuZ3RoICE9PSA0KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHRoaXMubGVuZ3RoIH1gKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFZlYyh0aGlzWzBdLCB0aGlzWzFdLCB0aGlzWzJdKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgQ2hlY2tFcXVhbExlbmd0aCh2MSx2Mikge1xuICAgICAgICBjaGVja0VxdWFsTGVuZ3RoKHYxLHYyKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgTWF4KHYxLHYyKSB7XG4gICAgICAgIGNoZWNrRXF1YWxMZW5ndGgodjEsdjIpO1xuICAgICAgICBzd2l0Y2ggKHYxLmxlbmd0aCkge1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbXG4gICAgICAgICAgICAgICAgdjFbMF0+djJbMF0gPyB2MVswXSA6IHYyWzBdLFxuICAgICAgICAgICAgICAgIHYxWzFdPnYyWzFdID8gdjFbMV0gOiB2MlsxXVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFtcbiAgICAgICAgICAgICAgICB2MVswXT52MlswXSA/IHYxWzBdIDogdjJbMF0sXG4gICAgICAgICAgICAgICAgdjFbMV0+djJbMV0gPyB2MVsxXSA6IHYyWzFdLFxuICAgICAgICAgICAgICAgIHYxWzJdPnYyWzJdID8gdjFbMl0gOiB2MlsyXVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFtcbiAgICAgICAgICAgICAgICB2MVswXT52MlswXSA/IHYxWzBdIDogdjJbMF0sXG4gICAgICAgICAgICAgICAgdjFbMV0+djJbMV0gPyB2MVsxXSA6IHYyWzFdLFxuICAgICAgICAgICAgICAgIHYxWzJdPnYyWzJdID8gdjFbMl0gOiB2MlsyXSxcbiAgICAgICAgICAgICAgICB2MVszXT52MlszXSA/IHYxWzNdIDogdjJbM11cbiAgICAgICAgICAgIF0pO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB2MS5sZW5ndGggfWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIE1pbih2MSx2Mikge1xuICAgICAgICBjaGVja0VxdWFsTGVuZ3RoKHYxLHYyKTtcbiAgICAgICAgc3dpdGNoICh2MS5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoW1xuICAgICAgICAgICAgICAgIHYxWzBdPHYyWzBdID8gdjFbMF0gOiB2MlswXSxcbiAgICAgICAgICAgICAgICB2MVsxXTx2MlsxXSA/IHYxWzFdIDogdjJbMV1cbiAgICAgICAgICAgIF0pO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbXG4gICAgICAgICAgICAgICAgdjFbMF08djJbMF0gPyB2MVswXSA6IHYyWzBdLFxuICAgICAgICAgICAgICAgIHYxWzFdPHYyWzFdID8gdjFbMV0gOiB2MlsxXSxcbiAgICAgICAgICAgICAgICB2MVsyXTx2MlsyXSA/IHYxWzJdIDogdjJbMl1cbiAgICAgICAgICAgIF0pO1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbXG4gICAgICAgICAgICAgICAgdjFbMF08djJbMF0gPyB2MVswXSA6IHYyWzBdLFxuICAgICAgICAgICAgICAgIHYxWzFdPHYyWzFdID8gdjFbMV0gOiB2MlsxXSxcbiAgICAgICAgICAgICAgICB2MVsyXTx2MlsyXSA/IHYxWzJdIDogdjJbMl0sXG4gICAgICAgICAgICAgICAgdjFbM108djJbM10gPyB2MVszXSA6IHYyWzNdXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdjEubGVuZ3RoIH1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBBZGQodjEsdjIpIHtcbiAgICAgICAgY2hlY2tFcXVhbExlbmd0aCh2MSx2Mik7XG4gICAgICAgIHN3aXRjaCAodjEubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFtcbiAgICAgICAgICAgICAgICB2MVswXSArIHYyWzBdLFxuICAgICAgICAgICAgICAgIHYxWzFdICsgdjJbMV1cbiAgICAgICAgICAgIF0pO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbXG4gICAgICAgICAgICAgICAgdjFbMF0gKyB2MlswXSxcbiAgICAgICAgICAgICAgICB2MVsxXSArIHYyWzFdLFxuICAgICAgICAgICAgICAgIHYxWzJdICsgdjJbMl1cbiAgICAgICAgICAgIF0pO1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbXG4gICAgICAgICAgICAgICAgdjFbMF0gKyB2MlswXSxcbiAgICAgICAgICAgICAgICB2MVsxXSArIHYyWzFdLFxuICAgICAgICAgICAgICAgIHYxWzJdICsgdjJbMl0sXG4gICAgICAgICAgICAgICAgdjFbM10gKyB2MlszXVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYxLmxlbmd0aCB9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgU3ViKHYxLHYyKSB7XG4gICAgICAgIGNoZWNrRXF1YWxMZW5ndGgodjEsdjIpO1xuICAgICAgICBzd2l0Y2ggKHYxLmxlbmd0aCkge1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbXG4gICAgICAgICAgICAgICAgdjFbMF0gLSB2MlswXSxcbiAgICAgICAgICAgICAgICB2MVsxXSAtIHYyWzFdXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoW1xuICAgICAgICAgICAgICAgIHYxWzBdIC0gdjJbMF0sXG4gICAgICAgICAgICAgICAgdjFbMV0gLSB2MlsxXSxcbiAgICAgICAgICAgICAgICB2MVsyXSAtIHYyWzJdXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoW1xuICAgICAgICAgICAgICAgIHYxWzBdIC0gdjJbMF0sXG4gICAgICAgICAgICAgICAgdjFbMV0gLSB2MlsxXSxcbiAgICAgICAgICAgICAgICB2MVsyXSAtIHYyWzJdLFxuICAgICAgICAgICAgICAgIHYxWzNdIC0gdjJbM11cbiAgICAgICAgICAgIF0pO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB2MS5sZW5ndGggfWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIE1hZ25pdHVkZSh2KSB7XG4gICAgICAgIHN3aXRjaCAodi5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgcmV0dXJuIE1hdGguc3FydCh2WzBdICogdlswXSArIHZbMV0gKiB2WzFdKTtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgcmV0dXJuIE1hdGguc3FydCh2WzBdICogdlswXSArIHZbMV0gKiB2WzFdICsgdlsyXSAqIHZbMl0pO1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KHZbMF0gKiB2WzBdICsgdlsxXSAqIHZbMV0gKyB2WzJdICogdlsyXSArIHZbM10gKiB2WzNdKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdi5sZW5ndGggfWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIERpc3RhbmNlKHYxLHYyKSB7XG4gICAgICAgIGNoZWNrRXF1YWxMZW5ndGgodjEsdjIpO1xuICAgICAgICByZXR1cm4gVmVjLk1hZ25pdHVkZShWZWMuU3ViKHYxLHYyKSk7XG4gICAgfVxuXG4gICAgc3RhdGljIERvdCh2MSx2Mikge1xuICAgICAgICBjaGVja0VxdWFsTGVuZ3RoKHYxLHYyKTtcbiAgICAgICAgc3dpdGNoICh2MS5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgcmV0dXJuIHYxWzBdICogdjJbMF0gKyB2MVsxXSAqIHYyWzFdO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICByZXR1cm4gdjFbMF0gKiB2MlswXSArIHYxWzFdICogdjJbMV0gKyB2MVsyXSAqIHYyWzJdO1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICByZXR1cm4gdjFbMF0gKiB2MlswXSArIHYxWzFdICogdjJbMV0gKyB2MVsyXSAqIHYyWzJdICsgdjFbM10gKiB2MlszXTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdjEubGVuZ3RoIH1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBDcm9zcyh2MSx2Mikge1xuICAgICAgICBjaGVja0VxdWFsTGVuZ3RoKHYxLHYyKTtcbiAgICAgICAgc3dpdGNoICh2MS5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgcmV0dXJuIHYxWzBdICogdjJbMV0gLSB2MVsxXSAtIHYyWzBdO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbXG4gICAgICAgICAgICAgICAgdjFbMV0gKiB2MlsyXSAtIHYxWzJdICogdjJbMV0sXG4gICAgICAgICAgICAgICAgdjFbMl0gKiB2MlswXSAtIHYxWzBdICogdjJbMl0sXG4gICAgICAgICAgICAgICAgdjFbMF0gKiB2MlsxXSAtIHYxWzFdICogdjJbMF0sXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZSBmb3IgY3Jvc3MgcHJvZHVjdDogJHsgdjEubGVuZ3RoIH1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBOb3JtYWxpemVkKHYpIHtcbiAgICAgICAgY29uc3QgbSA9IFZlYy5NYWduaXR1ZGUodik7XG4gICAgICAgIHN3aXRjaCAodi5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoWyB2WzBdIC8gbSwgdlsxXSAvIG0gXSk7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFsgdlswXSAvIG0sIHZbMV0gLyBtLCB2WzJdIC8gbSBdKTtcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoWyB2WzBdIC8gbSwgdlsxXSAvIG0sIHZbMl0gLyBtLCB2WzNdIC8gbSBdKVxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB2Lmxlbmd0aCB9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgTXVsdCh2LHMpIHtcbiAgICAgICAgc3dpdGNoICh2Lmxlbmd0aCkge1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbIHZbMF0gKiBzLCB2WzFdICogcyBdKTtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoWyB2WzBdICogcywgdlsxXSAqIHMsIHZbMl0gKiBzIF0pO1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbIHZbMF0gKiBzLCB2WzFdICogcywgdlsyXSAqIHMsIHZbM10gKiBzIF0pO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB2Lmxlbmd0aCB9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgRGl2KHYscykge1xuICAgICAgICBzd2l0Y2ggKHYubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFsgdlswXSAvIHMsIHZbMV0gLyBzIF0pO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbIHZbMF0gLyBzLCB2WzFdIC8gcywgdlsyXSAvIHMgXSk7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFsgdlswXSAvIHMsIHZbMV0gLyBzLCB2WzJdIC8gcywgdlszXSAvIHMgXSk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYubGVuZ3RoIH1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBFcXVhbHModjEsdjIpIHtcbiAgICAgICAgaWYgKHYxLmxlbmd0aCAhPSB2Mi5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHN3aXRjaCAodjEubGVuZ3RoKSB7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHYxWzBdID09PSB2MlswXSAmJiB2MVsxXSA9PT0gdjJbMV07XG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHYxWzBdID09PSB2MlswXSAmJiB2MVsxXSA9PT0gdjJbMV0gJiYgdjFbMl0gPT09IHYyWzJdO1xuICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICAgIHJldHVybiB2MVswXSA9PT0gdjJbMF0gJiYgdjFbMV0gPT09IHYyWzFdICYmIHYxWzJdID09PSB2MlsyXSAmJiB2MVszXSA9PT0gdjJbM107XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdjEubGVuZ3RoIH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBBc3NpZ24oZHN0LHNyYykge1xuICAgICAgICBjaGVja0VxdWFsTGVuZ3RoKGRzdCxzcmMpO1xuICAgICAgICBzd2l0Y2ggKGRzdC5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgZHN0WzNdID0gc3JjWzNdO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICBkc3RbMl0gPSBzcmNbMl07XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIGRzdFsxXSA9IHNyY1sxXTtcbiAgICAgICAgICAgIGRzdFswXSA9IHNyY1swXTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyBkc3QubGVuZ3RoIH1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBTZXQodiwgeCwgeSwgeiA9IG51bGwsIHcgPSBudWxsKSB7XG4gICAgICAgIGlmICh2Lmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgICAgdlswXSA9IHg7XG4gICAgICAgICAgICB2WzFdID0geTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh2Lmxlbmd0aCA9PT0gMyAmJiB6ICE9PSBudWxsKSB7XG4gICAgICAgICAgICB2WzBdID0geDtcbiAgICAgICAgICAgIHZbMV0gPSB5O1xuICAgICAgICAgICAgdlsyXSA9IHo7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodi5sZW5ndGggPT09IDQgJiYgdyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdlswXSA9IHg7XG4gICAgICAgICAgICB2WzFdID0geTtcbiAgICAgICAgICAgIHZbMl0gPSB6O1xuICAgICAgICAgICAgdlszXSA9IHc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYubGVuZ3RoIH0uIFRyeWluZyB0byBzZXQgeD0ke3h9LCB5PSR7eX0sIHo9JHt6fSwgdz0ke3d9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgSXNOYU4odikge1xuICAgICAgICBzd2l0Y2ggKHYubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHJldHVybiBpc05hTih2WzBdKSB8fCBpc05hTih2WzFdKTtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgcmV0dXJuIGlzTmFOKHZbMF0pIHx8IGlzTmFOKHZbMV0pIHx8IGlzTmFOKHZbMl0pO1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICByZXR1cm4gaXNOYU4odlswXSkgfHwgaXNOYU4odlsxXSkgfHwgaXNOYU4odlsyXSkgfHwgaXNOYU4odlszXSk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYubGVuZ3RoIH1gKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIFZlYzogVmVjLFxuXG4vLyAgIHZlYzoge1xuLy8gICAgICAgXG4vL1xuLy8gICAgICAgeHkodikge1xuLy8gICAgICAgICAgIHN3aXRjaCAodi5sZW5ndGgpIHtcbi8vICAgICAgICAgICBjYXNlIDI6XG4vLyAgICAgICAgICAgICAgIHJldHVybiBuZXcgVmVjdG9yKHYpO1xuLy8gICAgICAgICAgIGNhc2UgMzpcbi8vICAgICAgICAgICBjYXNlIDQ6XG4vLyAgICAgICAgICAgICAgIHJldHVybiBuZXcgVmVjdG9yKHZbMF0sIHZbMV0pO1xuLy8gICAgICAgICAgIGRlZmF1bHQ6XG4vLyAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdi5sZW5ndGggfWApO1xuLy8gICAgICAgICAgIH1cbi8vICAgICAgIH0sXG4vL1xuLy8gICAgICAgeHoodikge1xuLy8gICAgICAgICAgIHN3aXRjaCAodi5sZW5ndGgpIHtcbi8vICAgICAgICAgICBjYXNlIDM6XG4vLyAgICAgICAgICAgY2FzZSA0OlxuLy8gICAgICAgICAgICAgICByZXR1cm4gbmV3IFZlY3Rvcih2WzBdLCB2WzJdKTtcbi8vICAgICAgICAgICBjYXNlIDI6XG4vLyAgICAgICAgICAgZGVmYXVsdDpcbi8vICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB2Lmxlbmd0aCB9YCk7XG4vLyAgICAgICAgICAgfVxuLy8gICAgICAgfSxcbi8vXG4vLyAgICAgICB5eih2KSB7XG4vLyAgICAgICAgICAgc3dpdGNoICh2Lmxlbmd0aCkge1xuLy8gICAgICAgICAgIGNhc2UgMzpcbi8vICAgICAgICAgICBjYXNlIDQ6XG4vLyAgICAgICAgICAgICAgIHJldHVybiBuZXcgVmVjdG9yKHZbMV0sIHZbMl0pO1xuLy8gICAgICAgICAgIGNhc2UgMjpcbi8vICAgICAgICAgICBkZWZhdWx0OlxuLy8gICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYubGVuZ3RoIH1gKTtcbi8vICAgICAgICAgICB9XG4vLyAgICAgICB9LFxuLy9cbi8vICAgICAgIHh5eih2KSB7XG4vLyAgICAgICAgICAgaWYgKHYubGVuZ3RoICE9PSA0KSB7XG4vLyAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdi5sZW5ndGggfWApO1xuLy8gICAgICAgICAgIH1cbi8vICAgICAgICAgICByZXR1cm4gbmV3IFZlY3Rvcih2WzBdLHZbMV0sdlsyXSk7XG4vLyAgICAgICB9XG4vLyAgIH0gICAgXG59XG5cbiIsImltcG9ydCB7IE51bWVyaWNBcnJheSB9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuaW1wb3J0IFZlY3RvclV0aWxzIGZyb20gXCIuL1ZlY3RvclwiO1xuXG5jb25zdCBWZWMgPSBWZWN0b3JVdGlscy5WZWM7XG5cbmNsYXNzIE1hdDMgZXh0ZW5kcyBOdW1lcmljQXJyYXkge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gOSkge1xuICAgICAgICAgICAgc3VwZXIoYXJndW1lbnRzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxICYmIGFyZ3VtZW50c1swXS5sZW5ndGggPT09IDkpIHtcbiAgICAgICAgICAgIHN1cGVyKGFyZ3VtZW50c1swXSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgc3VwZXIoWzAsMCwwLDAsMCwwLDAsMCwwXSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcGFyYW1ldGVyIHNpemUgaW4gTWF0MyBjb25zdHJ1Y3RvcmApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWRlbnRpdHkoKSB7XG4gICAgICAgIHRoaXNbMF0gPSAxOyB0aGlzWzFdID0gMDsgdGhpc1syXSA9IDA7XG4gICAgICAgIHRoaXNbM10gPSAwOyB0aGlzWzRdID0gMTsgdGhpc1s1XSA9IDA7XG4gICAgICAgIHRoaXNbNl0gPSAwOyB0aGlzWzddID0gMDsgdGhpc1s4XSA9IDE7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHplcm8oKSB7XG4gICAgICAgIHRoaXNbMF0gPSAwOyB0aGlzWzFdID0gMDsgdGhpc1syXSA9IDA7XG4gICAgICAgIHRoaXNbM10gPSAwOyB0aGlzWzRdID0gMDsgdGhpc1s1XSA9IDA7XG4gICAgICAgIHRoaXNbNl0gPSAwOyB0aGlzWzddID0gMDsgdGhpc1s4XSA9IDA7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHJvdyhpKSB7XG4gICAgICAgIHJldHVybiBuZXcgVmVjKFxuICAgICAgICAgICAgdGhpc1tpICogM10sIFxuICAgICAgICAgICAgdGhpc1tpICogMyArIDFdLFxuICAgICAgICAgICAgdGhpc1sgaSogMyArIDJdKTtcbiAgICB9XG5cbiAgICBzZXRSb3coaSwgYSwgeSA9IG51bGwsIHogPSBudWxsKSB7XG4gICAgICAgIGlmIChhIGluc3RhbmNlb2YgTnVtZXJpY0FycmF5ICYmIGEubGVuZ3RoPj0zKSB7XG4gICAgICAgICAgICB0aGlzW2kgKiAzXSAgICAgID0gYVswXTtcbiAgICAgICAgICAgIHRoaXNbaSAqIDMgKyAxXSAgPSBhWzFdO1xuICAgICAgICAgICAgdGhpc1tpICogMyArIDJdICA9IGFbMl07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mKGEpID09PSBcIm51bWJlclwiICYmIFxuICAgICAgICAgICAgdHlwZW9mKHkpID09PSBcIm51bWJlclwiICYmIFxuICAgICAgICAgICAgdHlwZW9mKHopID09PSBcIm51bWJlclwiXG4gICAgICAgICkge1xuICAgICAgICAgICAgdGhpc1tpICogM10gICAgICA9IGE7XG4gICAgICAgICAgICB0aGlzW2kgKiAzICsgMV0gID0geTtcbiAgICAgICAgICAgIHRoaXNbaSAqIDMgKyAyXSAgPSB6O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHBhcmFtZXRlciBzZXR0aW5nIG1hdHJpeCByb3dgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjb2woaSkge1xuICAgICAgICByZXR1cm4gbmV3IFZlYyhcbiAgICAgICAgICAgIHRoaXNbaV0sXG4gICAgICAgICAgICB0aGlzW2kgKyAzXSxcbiAgICAgICAgICAgIHRoaXNbaSArIDMgKiAyXVxuICAgICAgICApXG4gICAgfVxuXG4gICAgc2V0Q29sKGksIGEsIHkgPSBudWxsLCB6ID0gbnVsbCkge1xuICAgICAgICBpZiAoYSBpbnN0YW5jZW9mIE51bWVyaWNBcnJheSAmJiBhLmxlbmd0aD49Mykge1xuICAgICAgICAgICAgdGhpc1tpXSAgICAgICAgID0gYVswXTtcbiAgICAgICAgICAgIHRoaXNbaSArIDNdICAgICA9IGFbMV07XG4gICAgICAgICAgICB0aGlzW2kgKyAzICogMl0gPSBhWzJdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZihhKSA9PT0gXCJudW1iZXJcIiAmJiBcbiAgICAgICAgICAgIHR5cGVvZih5KSA9PT0gXCJudW1iZXJcIiAmJiBcbiAgICAgICAgICAgIHR5cGVvZih6KSA9PT0gXCJudW1iZXJcIlxuICAgICAgICApIHtcbiAgICAgICAgICAgIHRoaXNbaV0gICAgICAgICA9IGE7XG4gICAgICAgICAgICB0aGlzW2kgKyAzXSAgICAgPSB5O1xuICAgICAgICAgICAgdGhpc1tpICsgMyAqIDJdID0gejtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBwYXJhbWV0ZXIgc2V0dGluZyBtYXRyaXggcm93YCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgYXNzaWduKG0pIHtcbiAgICAgICAgaWYgKG0ubGVuZ3RoID09PSA5KSB7XG4gICAgICAgICAgICB0aGlzWzBdID0gbVswXTsgdGhpc1sxXSA9IG1bMV07IHRoaXNbMl0gPSBtWzJdO1xuXHRcdFx0dGhpc1szXSA9IG1bM107IHRoaXNbNF0gPSBtWzRdOyB0aGlzWzVdID0gbVs1XTtcblx0XHRcdHRoaXNbNl0gPSBtWzZdOyB0aGlzWzddID0gbVs3XTsgdGhpc1s4XSA9IG1bOF07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobS5sZW5ndGggPT09IDE2KSB7XG4gICAgICAgICAgICB0aGlzWzBdID0gbVswXTsgdGhpc1sxXSA9IG1bMV07IHRoaXNbMl0gPSBtWzJdO1xuXHRcdFx0dGhpc1szXSA9IG1bNF07IHRoaXNbNF0gPSBtWzVdOyB0aGlzWzVdID0gbVs2XTtcblx0XHRcdHRoaXNbNl0gPSBtWzhdOyB0aGlzWzddID0gbVs5XTsgdGhpc1s4XSA9IG1bMTBdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHBsYXJhbWV0ZXIgc2V0dGluZyBtYXRyaXggZGF0YWApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHNldFNjYWxlKHgseSx6KSB7IFxuXHRcdGNvbnN0IHJ4ID0gKG5ldyBWZWModGhpc1swXSwgdGhpc1szXSwgdGhpc1s2XSkpLm5vcm1hbGl6ZSgpLnNjYWxlKHgpO1xuXHRcdGNvbnN0IHJ5ID0gKG5ldyBWZWModGhpc1sxXSwgdGhpc1s0XSwgdGhpc1s3XSkpLm5vcm1hbGl6ZSgpLnNjYWxlKHkpO1xuXHRcdGNvbnN0IHJ6ID0gKG5ldyBWZWModGhpc1syXSwgdGhpc1s1XSwgdGhpc1s4XSkpLm5vcm1hbGl6ZSgpLnNjYWxlKHopO1xuXHRcdHRoaXNbMF0gPSByeC54OyB0aGlzWzNdID0gcngueTsgdGhpc1s2XSA9IHJ4Lno7XG5cdFx0dGhpc1sxXSA9IHJ5Lng7IHRoaXNbNF0gPSByeS55OyB0aGlzWzddID0gcnkuejtcblx0XHR0aGlzWzJdID0gcnoueDsgdGhpc1s1XSA9IHJ6Lnk7IHRoaXNbOF0gPSByei56O1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cbiAgICB0cmFzcG9zZSgpIHtcbiAgICAgICAgY29uc3QgbTMgPSB0aGlzWzNdOyAgLy8gMCwgMSwgMlxuICAgICAgICBjb25zdCBtNyA9IHRoaXNbN107ICAvLyAzLCA0LCA1XG4gICAgICAgIGNvbnN0IG02ID0gdGhpc1s2XTsgIC8vIDYsIDcsIDhcbiAgICAgICAgdGhpc1szXSA9IHRoaXNbMV07XG4gICAgICAgIHRoaXNbNl0gPSB0aGlzWzJdO1xuICAgICAgICB0aGlzWzddID0gdGhpc1s1XTtcbiAgICAgICAgdGhpc1sxXSA9IG0zO1xuICAgICAgICB0aGlzWzJdID0gbTY7XG4gICAgICAgIHRoaXNbNV0gPSBtNztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgbXVsdChhKSB7XG4gICAgICAgIGlmICh0eXBlb2YoYSkgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgIHRoaXNbMF0gKj0gYTsgdGhpc1sxXSAqPSBhOyB0aGlzWzJdICo9IGE7XG4gICAgICAgICAgICB0aGlzWzNdICo9IGE7IHRoaXNbNF0gKj0gYTsgdGhpc1s1XSAqPSBhO1xuICAgICAgICAgICAgdGhpc1s2XSAqPSBhOyB0aGlzWzddICo9IGE7IHRoaXNbOF0gKj0gYTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChhIGluc3RhbmNlb2YgTnVtZXJpY0FycmF5ICYmIGEubGVuZ3RoID09PSA5KSB7XG4gICAgICAgICAgICBjb25zdCByMCA9IHRoaXMucm93KDApO1xuICAgICAgICAgICAgY29uc3QgcjEgPSB0aGlzLnJvdygxKTtcbiAgICAgICAgICAgIGNvbnN0IHIyID0gdGhpcy5yb3coMik7XG4gICAgICAgICAgICBjb25zdCBjMCA9IGEuY29sKDApO1xuICAgICAgICAgICAgY29uc3QgYzEgPSBhLmNvbCgxKTtcbiAgICAgICAgICAgIGNvbnN0IGMyID0gYS5jb2woMik7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXNbMF0gPSBWZWMuRG90KHIwLGMwKTsgdGhpc1sxXSA9IFZlYy5Eb3QocjAsYzEpOyB0aGlzWzJdID0gVmVjLkRvdChyMCxjMik7XG4gICAgICAgICAgICB0aGlzWzNdID0gVmVjLkRvdChyMSxjMCk7IHRoaXNbNF0gPSBWZWMuRG90KHIxLGMxKTsgdGhpc1s1XSA9IFZlYy5Eb3QocjEsYzIpO1xuICAgICAgICAgICAgdGhpc1s2XSA9IFZlYy5Eb3QocjIsYzApOyB0aGlzWzddID0gVmVjLkRvdChyMixjMSk7IHRoaXNbOF0gPSBWZWMuRG90KHIyLGMyKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBwYXJhbWV0ZXIgaW4gTWF0My5tdWx0KClgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBtdWx0VmVjdG9yKHYpIHtcbiAgICAgICAgaWYgKHYubGVuZ3RoID09PSAyIHx8IHYubGVuZ3RoID09PSAzKSB7XG4gICAgICAgICAgICBjb25zdCB4ID0gdlswXTtcbiAgICAgICAgICAgIGNvbnN0IHkgPSB2WzFdO1xuICAgICAgICAgICAgY29uc3QgeiA9IHYubGVuZ3RoID09PSAyID8gMSA6IHZbMl07XG4gICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIG5ldyBWZWMoXHR0aGlzWzBdICogeCArIHRoaXNbM10gKiB5ICsgdGhpc1s2XSAqIHosXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpc1sxXSAqIHggKyB0aGlzWzRdICogeSArIHRoaXNbN10gKiB6LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNbMl0gKiB4ICsgdGhpc1s1XSAqIHkgKyB0aGlzWzhdICogeik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcGFyYW1ldGVyIGluIE1hdDMubXVsdFZlY3RvcigpYCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuICBgWyAke3RoaXNbMF19LCAke3RoaXNbMV19LCAke3RoaXNbMl19XFxuYCArXG4gICAgICAgICAgICAgICAgYCAgJHt0aGlzWzNdfSwgJHt0aGlzWzRdfSwgJHt0aGlzWzVdfVxcbmAgK1xuICAgICAgICAgICAgICAgIGAgICR7dGhpc1s2XX0sICR7dGhpc1s3XX0sICR7dGhpc1s4XX0gXWA7XG4gICAgfVxuXG4gICAgc3RhdGljIE1ha2VJZGVudGl0eSgpIHtcbiAgICAgICAgY29uc3QgbSA9IG5ldyBNYXQzKCk7XG4gICAgICAgIHJldHVybiBtLmlkZW50aXR5KCk7XG4gICAgfVxuXG4gICAgc3RhdGljIE1ha2VaZXJvKCkge1xuICAgICAgICBjb25zdCBtID0gbmV3IE1hdDMoKTtcbiAgICAgICAgcmV0dXJuIG0uemVybygpO1xuICAgIH1cblxuICAgIHN0YXRpYyBJc1plcm8obSkge1xuICAgICAgICByZXR1cm5cdHZbMF09PTAgJiYgdlsxXT09MC4wICYmIHZbMl09PTAuMCAmJlxuICAgICAgICAgICAgICAgIHZbM109PTAgJiYgdls0XT09MC4wICYmIHZbNV09PTAuMCAmJlxuICAgICAgICAgICAgICAgIHZbNl09PTAgJiYgdls3XT09MC4wICYmIHZbOF09PTAuMDtcbiAgICB9XG4gICAgXG4gICAgc3RhdGljIElzSWRlbnRpdHkobSkge1xuICAgICAgICByZXR1cm5cdHZbMF09PTEuMCAmJiB2WzFdPT0wLjAgJiYgdlsyXT09MC4wICYmXG4gICAgICAgICAgICAgICAgdlszXT09MC4wICYmIHZbNF09PTEuMCAmJiB2WzVdPT0wLjAgJiZcbiAgICAgICAgICAgICAgICB2WzZdPT0wLjAgJiYgdls3XT09MC4wICYmIHZbOF09PTEuMDtcbiAgICB9XG5cbiAgICBzdGF0aWMgR2V0U2NhbGUobSkge1xuICAgICAgICByZXR1cm4gbmV3IFZlYyhcbiAgICAgICAgICAgIFZlYy5NYWduaXR1ZGUobmV3IFZlYyhtWzBdLCBtWzNdLCBtWzZdKSksXG4gICAgICAgICAgICBWZWMuTWFnbml0dWRlKG5ldyBWZWMobVsxXSwgbVs0XSwgbVs3XSkpLFxuICAgICAgICAgICAgVmVjLk1hZ25pdHVkZShuZXcgVmVjKG1bMl0sIG1bNV0sIG1bOF0pKVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHN0YXRpYyBFcXVhbHMoYSxiKSB7XG4gICAgICAgIHJldHVyblx0YVswXSA9PSBiWzBdICYmIGFbMV0gPT0gYlsxXSAgJiYgYVsyXSA9PSBiWzJdICYmXG4gICAgICAgICAgICAgICAgYVszXSA9PSBiWzNdICYmIGFbNF0gPT0gYls0XSAgJiYgYVs1XSA9PSBiWzVdICYmXG4gICAgICAgICAgICAgICAgYVs2XSA9PSBiWzZdICYmIGFbN10gPT0gYls3XSAgJiYgYVs4XSA9PSBiWzhdO1xuICAgIH1cblxuICAgIHN0YXRpYyBJc05hTihtKSB7XG4gICAgICAgIHJldHVyblx0aXNOYU4obVswXSkgfHwgaXNOYU4obVsxXSkgfHwgaXNOYU4obVsyXSkgJiZcbiAgICAgICAgICAgICAgICBpc05hTihtWzNdKSB8fCBpc05hTihtWzRdKSB8fCBpc05hTihtWzVdKSAmJlxuICAgICAgICAgICAgICAgIGlzTmFOKG1bNl0pIHx8IGlzTmFOKG1bN10pIHx8IGlzTmFOKG1bOF0pO1xuICAgIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBNYXQzOiBNYXQzXG59XG4iLCJpbXBvcnQgeyBOdW1lcmljQXJyYXkgfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcbmltcG9ydCBWZWN0b3JVdGlscyBmcm9tIFwiLi9WZWN0b3JcIjtcbmltcG9ydCBNYXRyaXhVdGlscyBmcm9tIFwiLi9NYXRyaXgzXCI7XG5cbmNvbnN0IFZlYyA9IFZlY3RvclV0aWxzLlZlYztcbmNvbnN0IE1hdDMgPSBNYXRyaXhVdGlscy5NYXQzO1xuXG5jbGFzcyBNYXQ0IGV4dGVuZHMgTnVtZXJpY0FycmF5IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgaW5NYXRyaXggPSBbXG4gICAgICAgICAgICAwLCAwLCAwLCAwLFxuICAgICAgICAgICAgMCwgMCwgMCwgMCxcbiAgICAgICAgICAgIDAsIDAsIDAsIDAsXG4gICAgICAgICAgICAwLCAwLCAwLCAwXG4gICAgICAgIF07XG5cbiAgICAgICAgLy8gQ3JlYXRlIGZyb20gbWF0cml4M1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gOSkge1xuICAgICAgICAgICAgaW5NYXRyaXhbMF0gPSBhcmd1bWVudHNbMF07IFxuICAgICAgICAgICAgaW5NYXRyaXhbMV0gPSBhcmd1bWVudHNbMV07XG4gICAgICAgICAgICBpbk1hdHJpeFsyXSA9IGFyZ3VtZW50c1syXTtcblxuICAgICAgICAgICAgaW5NYXRyaXhbNF0gPSBhcmd1bWVudHNbM107IFxuICAgICAgICAgICAgaW5NYXRyaXhbNV0gPSBhcmd1bWVudHNbNF07XG4gICAgICAgICAgICBpbk1hdHJpeFs2XSA9IGFyZ3VtZW50c1s1XTtcblxuICAgICAgICAgICAgaW5NYXRyaXhbOF0gPSBhcmd1bWVudHNbNl07IFxuICAgICAgICAgICAgaW5NYXRyaXhbOV0gPSBhcmd1bWVudHNbN107XG4gICAgICAgICAgICBpbk1hdHJpeFsxMF0gPSBhcmd1bWVudHNbOF07XG5cbiAgICAgICAgICAgIGluTWF0cml4WzE1XSA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSAmJiBhcmd1bWVudHNbMF0ubGVuZ3RoID09PSA5KSB7XG4gICAgICAgICAgICBpbk1hdHJpeFswXSAgPSBhcmd1bWVudHNbMF1bMF07IFxuICAgICAgICAgICAgaW5NYXRyaXhbMV0gID0gYXJndW1lbnRzWzBdWzFdO1xuICAgICAgICAgICAgaW5NYXRyaXhbMl0gID0gYXJndW1lbnRzWzBdWzJdO1xuXG4gICAgICAgICAgICBpbk1hdHJpeFs0XSAgPSBhcmd1bWVudHNbMF1bM107IFxuICAgICAgICAgICAgaW5NYXRyaXhbNV0gID0gYXJndW1lbnRzWzBdWzRdO1xuICAgICAgICAgICAgaW5NYXRyaXhbNl0gID0gYXJndW1lbnRzWzBdWzVdO1xuXG4gICAgICAgICAgICBpbk1hdHJpeFs4XSAgPSBhcmd1bWVudHNbMF1bNl07IFxuICAgICAgICAgICAgaW5NYXRyaXhbOV0gID0gYXJndW1lbnRzWzBdWzddO1xuICAgICAgICAgICAgaW5NYXRyaXhbMTBdID0gYXJndW1lbnRzWzBdWzhdO1xuXG4gICAgICAgICAgICBpbk1hdHJpeFsxNV0gPSAxO1xuICAgICAgICB9XG4gICAgICAgIC8vIENyZWF0ZSBmcm9tIG1hdHJpeDRcbiAgICAgICAgZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMTYpIHtcbiAgICAgICAgICAgIGluTWF0cml4WzAgXSA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIGluTWF0cml4WzEgXSA9IGFyZ3VtZW50c1sxIF07XG4gICAgICAgICAgICBpbk1hdHJpeFsyIF0gPSBhcmd1bWVudHNbMiBdO1xuICAgICAgICAgICAgaW5NYXRyaXhbMyBdID0gYXJndW1lbnRzWzMgXTtcblxuICAgICAgICAgICAgaW5NYXRyaXhbNCBdID0gYXJndW1lbnRzWzQgXTtcbiAgICAgICAgICAgIGluTWF0cml4WzUgXSA9IGFyZ3VtZW50c1s1IF07XG4gICAgICAgICAgICBpbk1hdHJpeFs2IF0gPSBhcmd1bWVudHNbNiBdO1xuICAgICAgICAgICAgaW5NYXRyaXhbNyBdID0gYXJndW1lbnRzWzcgXTtcblxuICAgICAgICAgICAgaW5NYXRyaXhbOCBdID0gYXJndW1lbnRzWzggXTtcbiAgICAgICAgICAgIGluTWF0cml4WzkgXSA9IGFyZ3VtZW50c1s5IF07XG4gICAgICAgICAgICBpbk1hdHJpeFsxMF0gPSBhcmd1bWVudHNbMTBdO1xuICAgICAgICAgICAgaW5NYXRyaXhbMTFdID0gYXJndW1lbnRzWzExXTtcblxuICAgICAgICAgICAgaW5NYXRyaXhbMTJdID0gYXJndW1lbnRzWzEyXTtcbiAgICAgICAgICAgIGluTWF0cml4WzEzXSA9IGFyZ3VtZW50c1sxM107XG4gICAgICAgICAgICBpbk1hdHJpeFsxNF0gPSBhcmd1bWVudHNbMTRdO1xuICAgICAgICAgICAgaW5NYXRyaXhbMTVdID0gYXJndW1lbnRzWzE1XTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxICYmIGFyZ3VtZW50c1swXS5sZW5ndGggPT09IDE2KSB7XG4gICAgICAgICAgICBpbk1hdHJpeFswIF0gPSBhcmd1bWVudHNbMF1bMF07XG4gICAgICAgICAgICBpbk1hdHJpeFsxIF0gPSBhcmd1bWVudHNbMF1bMSBdO1xuICAgICAgICAgICAgaW5NYXRyaXhbMiBdID0gYXJndW1lbnRzWzBdWzIgXTtcbiAgICAgICAgICAgIGluTWF0cml4WzMgXSA9IGFyZ3VtZW50c1swXVszIF07XG5cbiAgICAgICAgICAgIGluTWF0cml4WzQgXSA9IGFyZ3VtZW50c1swXVs0IF07XG4gICAgICAgICAgICBpbk1hdHJpeFs1IF0gPSBhcmd1bWVudHNbMF1bNSBdO1xuICAgICAgICAgICAgaW5NYXRyaXhbNiBdID0gYXJndW1lbnRzWzBdWzYgXTtcbiAgICAgICAgICAgIGluTWF0cml4WzcgXSA9IGFyZ3VtZW50c1swXVs3IF07XG5cbiAgICAgICAgICAgIGluTWF0cml4WzggXSA9IGFyZ3VtZW50c1swXVs4IF07XG4gICAgICAgICAgICBpbk1hdHJpeFs5IF0gPSBhcmd1bWVudHNbMF1bOSBdO1xuICAgICAgICAgICAgaW5NYXRyaXhbMTBdID0gYXJndW1lbnRzWzBdWzEwXTtcbiAgICAgICAgICAgIGluTWF0cml4WzExXSA9IGFyZ3VtZW50c1swXVsxMV07XG5cbiAgICAgICAgICAgIGluTWF0cml4WzEyXSA9IGFyZ3VtZW50c1swXVsxMl07XG4gICAgICAgICAgICBpbk1hdHJpeFsxM10gPSBhcmd1bWVudHNbMF1bMTNdO1xuICAgICAgICAgICAgaW5NYXRyaXhbMTRdID0gYXJndW1lbnRzWzBdWzE0XTtcbiAgICAgICAgICAgIGluTWF0cml4WzE1XSA9IGFyZ3VtZW50c1swXVsxNV07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCAhPSAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcGFyYW1ldGVyIHNpemUgaW4gTWF0cml4MyBjb25zdHJ1Y3RvcmApO1xuICAgICAgICB9XG5cbiAgICAgICAgc3VwZXIoaW5NYXRyaXgpO1xuICAgIH1cblxuICAgIC8vLy8vLyBJbml0aWFsaXplcnNcbiAgICBpZGVudGl0eSgpIHtcbiAgICAgICAgdGhpc1swIF0gPSAxOyB0aGlzWzEgXSA9IDA7IHRoaXNbMiBdID0gMDsgdGhpc1szIF0gPSAwXG4gICAgICAgIHRoaXNbNCBdID0gMDsgdGhpc1s1IF0gPSAxOyB0aGlzWzYgXSA9IDA7IHRoaXNbNyBdID0gMFxuICAgICAgICB0aGlzWzggXSA9IDA7IHRoaXNbOSBdID0gMDsgdGhpc1sxMF0gPSAxOyB0aGlzWzExXSA9IDBcbiAgICAgICAgdGhpc1sxMl0gPSAwOyB0aGlzWzEzXSA9IDA7IHRoaXNbMTRdID0gMDsgdGhpc1sxNV0gPSAxXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHplcm8oKSB7XG5cdFx0dGhpc1sgMF0gPSAwOyB0aGlzWyAxXSA9IDA7IHRoaXNbIDJdID0gMDsgdGhpc1sgM10gPSAwO1xuXHRcdHRoaXNbIDRdID0gMDsgdGhpc1sgNV0gPSAwOyB0aGlzWyA2XSA9IDA7IHRoaXNbIDddID0gMDtcblx0XHR0aGlzWyA4XSA9IDA7IHRoaXNbIDldID0gMDsgdGhpc1sxMF0gPSAwOyB0aGlzWzExXSA9IDA7XG5cdFx0dGhpc1sxMl0gPSAwOyB0aGlzWzEzXSA9IDA7IHRoaXNbMTRdID0gMDsgdGhpc1sxNV0gPSAwO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cbiAgICBwZXJzcGVjdGl2ZShmb3Z5LCBhc3BlY3QsIG5lYXJQbGFuZSwgZmFyUGxhbmUpIHtcblx0XHRsZXQgZm92eTIgPSB0YW4oZm92eSAqIFBJIC8gMzYwLjApICogbmVhclBsYW5lO1xuXHRcdGxldCBmb3Z5MmFzcGVjdCA9IGZvdnkyICogYXNwZWN0O1xuXHRcdHRoaXMuZnJ1c3R1bSgtZm92eTJhc3BlY3QsZm92eTJhc3BlY3QsLWZvdnkyLGZvdnkyLG5lYXJQbGFuZSxmYXJQbGFuZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuXHR9XG5cblx0ZnJ1c3R1bShsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIG5lYXJQbGFuZSwgZmFyUGxhbmUpIHtcblx0XHRsZXQgQSA9IHJpZ2h0IC0gbGVmdDtcblx0XHRsZXQgQiA9IHRvcC1ib3R0b207XG5cdFx0bGV0IEMgPSBmYXJQbGFuZS1uZWFyUGxhbmU7XG5cdFx0XG5cdFx0dGhpcy5zZXRSb3coMCwgbmV3IFZlYyhuZWFyUGxhbmUqMi4wL0EsXHQwLjAsXHQwLjAsXHQwLjApKTtcblx0XHR0aGlzLnNldFJvdygxLCBuZXcgVmVjKDAuMCxcdG5lYXJQbGFuZSoyLjAvQixcdDAuMCxcdDAuMCkpO1xuXHRcdHRoaXMuc2V0Um93KDIsIG5ldyBWZWMoKHJpZ2h0K2xlZnQpL0EsXHQodG9wK2JvdHRvbSkvQixcdC0oZmFyUGxhbmUrbmVhclBsYW5lKS9DLFx0LTEuMCkpO1xuXHRcdHRoaXMuc2V0Um93KDMsIG5ldyBWZWMoMC4wLFx0MC4wLFx0LShmYXJQbGFuZSpuZWFyUGxhbmUqMi4wKS9DLFx0MC4wKSk7XG5cdFx0XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRvcnRobyhsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIG5lYXJQbGFuZSwgZmFyUGxhbmUpIHtcblx0XHRsZXQgbSA9IHJpZ2h0LWxlZnQ7XG5cdFx0bGV0IGwgPSB0b3AtYm90dG9tO1xuXHRcdGxldCBrID0gZmFyUGxhbmUtbmVhclBsYW5lOztcblx0XHRcblx0XHR0aGlzWzBdID0gMi9tOyB0aGlzWzFdID0gMDsgICB0aGlzWzJdID0gMDsgICAgIHRoaXNbM10gPSAwO1xuXHRcdHRoaXNbNF0gPSAwOyAgIHRoaXNbNV0gPSAyL2w7IHRoaXNbNl0gPSAwOyAgICAgdGhpc1s3XSA9IDA7XG5cdFx0dGhpc1s4XSA9IDA7ICAgdGhpc1s5XSA9IDA7ICAgdGhpc1sxMF0gPSAtMi9rOyB0aGlzWzExXT0gMDtcblx0XHR0aGlzWzEyXT0tKGxlZnQrcmlnaHQpL207IHRoaXNbMTNdID0gLSh0b3ArYm90dG9tKS9sOyB0aGlzWzE0XSA9IC0oZmFyUGxhbmUrbmVhclBsYW5lKS9rOyB0aGlzWzE1XT0xO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0XHRcblx0bG9va0F0KHBfZXllLCBwX2NlbnRlciwgcF91cCkge1xuICAgICAgICB0aGlzLmlkZW50aXR5KCk7XG5cblx0XHRjb25zdCB5ID0gbmV3IFZlYyhwX3VwKTtcblx0XHRjb25zdCB6ID0gVmVjMy5TdWIocF9leWUscF9jZW50ZXIpO1xuXHRcdHoubm9ybWFsaXplKCk7XG5cdFx0Y29uc3QgeCA9IFZlYzMuQ3Jvc3MoeSx6KTtcblx0XHR4Lm5vcm1hbGl6ZSgpO1xuXHRcdHkubm9ybWFsaXplKCk7XG5cblx0XHR0aGlzLm0wMCA9IHgueDtcblx0XHR0aGlzLm0xMCA9IHgueTtcblx0XHR0aGlzLm0yMCA9IHguejtcblx0XHR0aGlzLm0zMCA9IC1WZWMzLkRvdCh4LCBwX2V5ZSk7XG5cdFx0dGhpcy5tMDEgPSB5Lng7XG5cdFx0dGhpcy5tMTEgPSB5Lnk7XG5cdFx0dGhpcy5tMjEgPSB5Lno7XG5cdFx0dGhpcy5tMzEgPSAtVmVjMy5Eb3QoeSwgcF9leWUpO1xuXHRcdHRoaXMubTAyID0gei54O1xuXHRcdHRoaXMubTEyID0gei55O1xuXHRcdHRoaXMubTIyID0gei56O1xuXHRcdHRoaXMubTMyID0gLVZlYzMuRG90KHosIHBfZXllKTtcblx0XHR0aGlzLm0wMyA9IDA7XG5cdFx0dGhpcy5tMTMgPSAwO1xuXHRcdHRoaXMubTIzID0gMDtcblx0XHR0aGlzLm0zMyA9IDE7XG5cdFxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXG5cblxuICAgIC8vLy8vIFNldHRlcnMgYW5kIGdldHRlcnNcbiAgICBnZXQgbTAwKCkgeyByZXR1cm4gdGhpc1swXTsgfVxuXHRnZXQgbTAxKCkgeyByZXR1cm4gdGhpc1sxXTsgfVxuXHRnZXQgbTAyKCkgeyByZXR1cm4gdGhpc1syXTsgfVxuXHRnZXQgbTAzKCkgeyByZXR1cm4gdGhpc1szXTsgfVxuXHRnZXQgbTEwKCkgeyByZXR1cm4gdGhpc1s0XTsgfVxuXHRnZXQgbTExKCkgeyByZXR1cm4gdGhpc1s1XTsgfVxuXHRnZXQgbTEyKCkgeyByZXR1cm4gdGhpc1s2XTsgfVxuXHRnZXQgbTEzKCkgeyByZXR1cm4gdGhpc1s3XTsgfVxuXHRnZXQgbTIwKCkgeyByZXR1cm4gdGhpc1s4XTsgfVxuXHRnZXQgbTIxKCkgeyByZXR1cm4gdGhpc1s5XTsgfVxuXHRnZXQgbTIyKCkgeyByZXR1cm4gdGhpc1sxMF07IH1cblx0Z2V0IG0yMygpIHsgcmV0dXJuIHRoaXNbMTFdOyB9XG5cdGdldCBtMzAoKSB7IHJldHVybiB0aGlzWzEyXTsgfVxuXHRnZXQgbTMxKCkgeyByZXR1cm4gdGhpc1sxM107IH1cblx0Z2V0IG0zMigpIHsgcmV0dXJuIHRoaXNbMTRdOyB9XG5cdGdldCBtMzMoKSB7IHJldHVybiB0aGlzWzE1XTsgfVxuXHRcblx0c2V0IG0wMCh2KSB7IHRoaXNbMF0gPSB2OyB9XG5cdHNldCBtMDEodikgeyB0aGlzWzFdID0gdjsgfVxuXHRzZXQgbTAyKHYpIHsgdGhpc1syXSA9IHY7IH1cblx0c2V0IG0wMyh2KSB7IHRoaXNbM10gPSB2OyB9XG5cdHNldCBtMTAodikgeyB0aGlzWzRdID0gdjsgfVxuXHRzZXQgbTExKHYpIHsgdGhpc1s1XSA9IHY7IH1cblx0c2V0IG0xMih2KSB7IHRoaXNbNl0gPSB2OyB9XG5cdHNldCBtMTModikgeyB0aGlzWzddID0gdjsgfVxuXHRzZXQgbTIwKHYpIHsgdGhpc1s4XSA9IHY7IH1cblx0c2V0IG0yMSh2KSB7IHRoaXNbOV0gPSB2OyB9XG5cdHNldCBtMjIodikgeyB0aGlzWzEwXSA9IHY7IH1cblx0c2V0IG0yMyh2KSB7IHRoaXNbMTFdID0gdjsgfVxuXHRzZXQgbTMwKHYpIHsgdGhpc1sxMl0gPSB2OyB9XG5cdHNldCBtMzEodikgeyB0aGlzWzEzXSA9IHY7IH1cblx0c2V0IG0zMih2KSB7IHRoaXNbMTRdID0gdjsgfVxuXHRzZXQgbTMzKHYpIHsgdGhpc1sxNV0gPSB2OyB9XG5cbiAgICByb3coaSkge1xuICAgICAgICByZXR1cm4gbmV3IFZlYyhcbiAgICAgICAgICAgIHRoaXNbaSAqIDRdLCBcbiAgICAgICAgICAgIHRoaXNbaSAqIDQgKyAxXSxcbiAgICAgICAgICAgIHRoaXNbaSAqIDQgKyAyXSxcbiAgICAgICAgICAgIHRoaXNbaSAqIDQgKyAzXSk7XG4gICAgfVxuXG4gICAgc2V0Um93KGksIGEsIHkgPSBudWxsLCB6ID0gbnVsbCwgdyA9IG51bGwpIHtcbiAgICAgICAgaWYgKGEgaW5zdGFuY2VvZiBOdW1lcmljQXJyYXkgJiYgYS5sZW5ndGg+PTQpIHtcbiAgICAgICAgICAgIHRoaXNbaSAqIDRdICAgICAgPSBhWzBdO1xuICAgICAgICAgICAgdGhpc1tpICogNCArIDFdICA9IGFbMV07XG4gICAgICAgICAgICB0aGlzW2kgKiA0ICsgMl0gID0gYVsyXTtcbiAgICAgICAgICAgIHRoaXNbaSAqIDQgKyAzXSAgPSBhWzNdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZihhKSA9PT0gXCJudW1iZXJcIiAmJiBcbiAgICAgICAgICAgIHR5cGVvZih5KSA9PT0gXCJudW1iZXJcIiAmJiBcbiAgICAgICAgICAgIHR5cGVvZih6KSA9PT0gXCJudW1iZXJcIiAmJlxuICAgICAgICAgICAgdHlwZW9mKHcpID09PSBcIm51bWJlclwiXG4gICAgICAgICkge1xuICAgICAgICAgICAgdGhpc1tpICogNF0gICAgICA9IGE7XG4gICAgICAgICAgICB0aGlzW2kgKiA0ICsgMV0gID0geTtcbiAgICAgICAgICAgIHRoaXNbaSAqIDQgKyAyXSAgPSB6O1xuICAgICAgICAgICAgdGhpc1tpICogNCArIDNdICA9IHc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcGFyYW1ldGVyIHNldHRpbmcgbWF0cml4IHJvd2ApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvbChpKSB7XG4gICAgICAgIHJldHVybiBuZXcgVmVjKFxuICAgICAgICAgICAgdGhpc1tpXSxcbiAgICAgICAgICAgIHRoaXNbaSArIDRdLFxuICAgICAgICAgICAgdGhpc1tpICsgNCAqIDJdLFxuICAgICAgICAgICAgdGhpc1tpICsgNCAqIDNdXG4gICAgICAgIClcbiAgICB9XG5cbiAgICBzZXRDb2woaSwgYSwgeSA9IG51bGwsIHogPSBudWxsLCB3ID0gbnVsbCkge1xuICAgICAgICBpZiAoYSBpbnN0YW5jZW9mIE51bWVyaWNBcnJheSAmJiBhLmxlbmd0aD49NCkge1xuICAgICAgICAgICAgdGhpc1tpXSAgICAgICAgID0gYVswXTtcbiAgICAgICAgICAgIHRoaXNbaSArIDRdICAgICA9IGFbMV07XG4gICAgICAgICAgICB0aGlzW2kgKyA0ICogMl0gPSBhWzJdO1xuICAgICAgICAgICAgdGhpc1tpICsgNCAqIDNdID0gYVszXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlb2YoYSkgPT09IFwibnVtYmVyXCIgJiYgXG4gICAgICAgICAgICB0eXBlb2YoeSkgPT09IFwibnVtYmVyXCIgJiYgXG4gICAgICAgICAgICB0eXBlb2YoeikgPT09IFwibnVtYmVyXCIgJiZcbiAgICAgICAgICAgIHR5cGVvZih3KSA9PT0gXCJudW1iZXJcIlxuICAgICAgICApIHtcbiAgICAgICAgICAgIHRoaXNbaV0gICAgICAgICA9IGE7XG4gICAgICAgICAgICB0aGlzW2kgKyA0XSAgICAgPSB5O1xuICAgICAgICAgICAgdGhpc1tpICsgNCAqIDJdID0gejtcbiAgICAgICAgICAgIHRoaXNbaSArIDQgKiAzXSA9IHc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcGFyYW1ldGVyIHNldHRpbmcgbWF0cml4IHJvd2ApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIG1hdDMoKSB7XG5cdFx0cmV0dXJuIG5ldyBNYXQzKHRoaXNbMF0sIHRoaXNbMV0sIHRoaXNbIDJdLFxuXHRcdFx0XHRcdFx0dGhpc1s0XSwgdGhpc1s1XSwgdGhpc1sgNl0sXG5cdFx0XHRcdFx0XHR0aGlzWzhdLCB0aGlzWzldLCB0aGlzWzEwXSk7XG5cdH1cblxuICAgIGFzc2lnbihhKSB7XG5cdFx0aWYgKGEubGVuZ3RoPT05KSB7XG5cdFx0XHR0aGlzWzBdICA9IGFbMF07IHRoaXNbMV0gID0gYVsxXTsgdGhpc1syXSAgPSBhWzJdOyB0aGlzWzNdICA9IDA7XG5cdFx0XHR0aGlzWzRdICA9IGFbM107IHRoaXNbNV0gID0gYVs0XTsgdGhpc1s2XSAgPSBhWzVdOyB0aGlzWzddICA9IDA7XG5cdFx0XHR0aGlzWzhdICA9IGFbNl07IHRoaXNbOV0gID0gYVs3XTsgdGhpc1sxMF0gPSBhWzhdOyB0aGlzWzExXSA9IDA7XG5cdFx0XHR0aGlzWzEyXSA9IDA7XHQgdGhpc1sxM10gPSAwO1x0ICB0aGlzWzE0XSA9IDA7XHQgICB0aGlzWzE1XSA9IDE7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKGEubGVuZ3RoPT0xNikge1xuXHRcdFx0dGhpc1swXSAgPSBhWzBdOyAgdGhpc1sxXSAgPSBhWzFdOyAgdGhpc1syXSAgPSBhWzJdOyAgdGhpc1szXSAgPSBhWzNdO1xuXHRcdFx0dGhpc1s0XSAgPSBhWzRdOyAgdGhpc1s1XSAgPSBhWzVdOyAgdGhpc1s2XSAgPSBhWzZdOyAgdGhpc1s3XSAgPSBhWzddO1xuXHRcdFx0dGhpc1s4XSAgPSBhWzhdOyAgdGhpc1s5XSAgPSBhWzldOyAgdGhpc1sxMF0gPSBhWzEwXTsgdGhpc1sxMV0gPSBhWzExXTtcblx0XHRcdHRoaXNbMTJdID0gYVsxMl07IHRoaXNbMTNdID0gYVsxM107XHR0aGlzWzE0XSA9IGFbMTRdOyB0aGlzWzE1XSA9IGFbMTVdO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG4gICAgZ2V0IGZvcndhcmRWZWN0b3IoKSB7XG5cdFx0cmV0dXJuIE1hdDQuVHJhbnNmb3JtRGlyZWN0aW9uKHRoaXMsIG5ldyBWZWMoMC4wLCAwLjAsIDEuMCkpO1xuXHR9XG5cdFxuXHRnZXQgcmlnaHRWZWN0b3IoKSB7XG5cdFx0cmV0dXJuIE1hdDQuVHJhbnNmb3JtRGlyZWN0aW9uKHRoaXMsIG5ldyBWZWMoMS4wLCAwLjAsIDAuMCkpO1xuXHR9XG5cdFxuXHRnZXQgdXBWZWN0b3IoKSB7XG5cdFx0cmV0dXJuIE1hdDQuVHJhbnNmb3JtRGlyZWN0aW9uKHRoaXMsIG5ldyBWZWMoMC4wLCAxLjAsIDAuMCkpO1xuXHR9XG5cdFxuXHRnZXQgYmFja3dhcmRWZWN0b3IoKSB7XG5cdFx0cmV0dXJuIE1hdDQuVHJhbnNmb3JtRGlyZWN0aW9uKHRoaXMsIG5ldyBWZWMoMC4wLCAwLjAsIC0xLjApKTtcblx0fVxuXHRcblx0Z2V0IGxlZnRWZWN0b3IoKSB7XG5cdFx0cmV0dXJuIE1hdDQuVHJhbnNmb3JtRGlyZWN0aW9uKHRoaXMsIG5ldyBWZWMoLTEuMCwgMC4wLCAwLjApKTtcblx0fVxuXHRcblx0Z2V0IGRvd25WZWN0b3IoKSB7XG5cdFx0cmV0dXJuIE1hdDQuVHJhbnNmb3JtRGlyZWN0aW9uKHRoaXMsIG5ldyBWZWMoMC4wLCAtMS4wLCAwLjApKTtcblx0fVxuXG5cbiAgICAvLy8vLy8vIFF1ZXJ5IGZ1bmN0aW9uc1xuICAgIGlzWmVybygpIHtcblx0XHRyZXR1cm5cdHRoaXNbIDBdPT0wICYmIHRoaXNbIDFdPT0wICYmIHRoaXNbIDJdPT0wICYmIHRoaXNbIDNdPT0wICYmXG5cdFx0XHRcdHRoaXNbIDRdPT0wICYmIHRoaXNbIDVdPT0wICYmIHRoaXNbIDZdPT0wICYmIHRoaXNbIDddPT0wICYmXG5cdFx0XHRcdHRoaXNbIDhdPT0wICYmIHRoaXNbIDldPT0wICYmIHRoaXNbMTBdPT0wICYmIHRoaXNbMTFdPT0wICYmXG5cdFx0XHRcdHRoaXNbMTJdPT0wICYmIHRoaXNbMTNdPT0wICYmIHRoaXNbMTRdPT0wICYmIHRoaXNbMTVdPT0wO1xuXHR9XG5cdFxuXHRpc0lkZW50aXR5KCkge1xuXHRcdHJldHVyblx0dGhpc1sgMF09PTEgJiYgdGhpc1sgMV09PTAgJiYgdGhpc1sgMl09PTAgJiYgdGhpc1sgM109PTAgJiZcblx0XHRcdFx0dGhpc1sgNF09PTAgJiYgdGhpc1sgNV09PTEgJiYgdGhpc1sgNl09PTAgJiYgdGhpc1sgN109PTAgJiZcblx0XHRcdFx0dGhpc1sgOF09PTAgJiYgdGhpc1sgOV09PTAgJiYgdGhpc1sxMF09PTEgJiYgdGhpc1sxMV09PTAgJiZcblx0XHRcdFx0dGhpc1sxMl09PTAgJiYgdGhpc1sxM109PTAgJiYgdGhpc1sxNF09PTAgJiYgdGhpc1sxNV09PTE7XG5cdH1cblxuXG4gICAgLy8vLy8vLyBUcmFuc2Zvcm0gZnVuY3Rpb25zXG5cdHRyYW5zbGF0ZSh4LCB5LCB6KSB7XG5cdFx0dGhpcy5tdWx0KE1hdDQuTWFrZVRyYW5zbGF0aW9uKHgsIHksIHopKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdHJvdGF0ZShhbHBoYSwgeCwgeSwgeikge1xuXHRcdHRoaXMubXVsdChNYXQ0Lk1ha2VSb3RhdGlvbihhbHBoYSwgeCwgeSwgeikpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdFxuXHRzY2FsZSh4LCB5LCB6KSB7XG5cdFx0dGhpcy5tdWx0KE1hdDQuTWFrZVNjYWxlKHgsIHksIHopKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cblxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiAgYFsgJHt0aGlzWyAwXX0sICR7dGhpc1sgMV19LCAke3RoaXNbIDJdfSwgJHt0aGlzWyAzXX1cXG5gICtcbiAgICAgICAgICAgICAgICBgICAke3RoaXNbIDRdfSwgJHt0aGlzWyA1XX0sICR7dGhpc1sgNl19LCAke3RoaXNbIDddfVxcbmAgK1xuICAgICAgICAgICAgICAgIGAgICR7dGhpc1sgOF19LCAke3RoaXNbIDldfSwgJHt0aGlzWzEwXX0sICR7dGhpc1sxMV19XFxuYCArXG4gICAgICAgICAgICAgICAgYCAgJHt0aGlzWzEyXX0sICR7dGhpc1sxM119LCAke3RoaXNbMTRdfSwgJHt0aGlzWzE1XX0gXWA7XG4gICAgfVxuXG5cbiAgICAvLy8vLy8gVXRpbGl0aWVzXG4gICAgc2V0U2NhbGUoeCx5LHopIHtcblx0XHRjb25zdCByeCA9IG5ldyBWZWModGhpc1swXSwgdGhpc1s0XSwgdGhpc1s4XSkubm9ybWFsaXplKCkuc2NhbGUoeCk7XG5cdFx0Y29uc3QgcnkgPSBuZXcgVmVjKHRoaXNbMV0sIHRoaXNbNV0sIHRoaXNbOV0pLm5vcm1hbGl6ZSgpLnNjYWxlKHkpO1xuXHRcdGNvbnN0IHJ6ID0gbmV3IFZlYyh0aGlzWzJdLCB0aGlzWzZdLCB0aGlzWzEwXSkubm9ybWFsaXplKCkuc2NhbGUoeik7XG5cdFx0dGhpc1swXSA9IHJ4Lng7IHRoaXNbNF0gPSByeC55OyB0aGlzWzhdID0gcnguejtcblx0XHR0aGlzWzFdID0gcnkueDsgdGhpc1s1XSA9IHJ5Lnk7IHRoaXNbOV0gPSByeS56O1xuXHRcdHRoaXNbMl0gPSByei54OyB0aGlzWzZdID0gcnoueTsgdGhpc1sxMF0gPSByei56O1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0c2V0UG9zaXRpb24ocG9zLHkseikge1xuXHRcdGlmICh0eXBlb2YocG9zKT09XCJudW1iZXJcIikge1xuXHRcdFx0dGhpc1sxMl0gPSBwb3M7XG5cdFx0XHR0aGlzWzEzXSA9IHk7XG5cdFx0XHR0aGlzWzE0XSA9IHo7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0dGhpc1sxMl0gPSBwb3MueDtcblx0XHRcdHRoaXNbMTNdID0gcG9zLnk7XG5cdFx0XHR0aGlzWzE0XSA9IHBvcy56O1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG4gICAgLy8vLy8vLyBPcGVyYXRpb25zXG4gICAgbXVsdChhKSB7XG5cdFx0aWYgKHR5cGVvZihhKT09J251bWJlcicpIHtcblx0XHRcdHRoaXNbIDBdICo9IGE7IHRoaXNbIDFdICo9IGE7IHRoaXNbIDJdICo9IGE7IHRoaXNbIDNdICo9IGE7XG5cdFx0XHR0aGlzWyA0XSAqPSBhOyB0aGlzWyA1XSAqPSBhOyB0aGlzWyA2XSAqPSBhOyB0aGlzWyA3XSAqPSBhO1xuXHRcdFx0dGhpc1sgOF0gKj0gYTsgdGhpc1sgOV0gKj0gYTsgdGhpc1sxMF0gKj0gYTsgdGhpc1sxMV0gKj0gYTtcblx0XHRcdHRoaXNbMTJdICo9IGE7IHRoaXNbMTNdICo9IGE7IHRoaXNbMTRdICo9IGE7IHRoaXNbMTVdICo9IGE7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cbiAgICAgICAgY29uc3QgcjAgPSB0aGlzLnJvdygwKTtcbiAgICAgICAgY29uc3QgcjEgPSB0aGlzLnJvdygxKTtcbiAgICAgICAgY29uc3QgcjIgPSB0aGlzLnJvdygyKTtcbiAgICAgICAgY29uc3QgcjMgPSB0aGlzLnJvdygzKTtcbiAgICAgICAgY29uc3QgYzAgPSBhLmNvbCgwKTtcbiAgICAgICAgY29uc3QgYzEgPSBhLmNvbCgxKTtcbiAgICAgICAgY29uc3QgYzIgPSBhLmNvbCgyKTtcbiAgICAgICAgY29uc3QgYzMgPSBhLmNvbCgzKTtcblxuICAgICAgICB0aGlzWzAgXSA9IFZlYy5Eb3QocjAsIGMwKTsgdGhpc1sxIF0gPSBWZWMuRG90KHIwLCBjMSk7IHRoaXNbMiBdID0gVmVjLkRvdChyMCwgYzIpOyB0aGlzWzMgXSA9IFZlYy5Eb3QocjAsIGMzKTtcbiAgICAgICAgdGhpc1s0IF0gPSBWZWMuRG90KHIxLCBjMCk7IHRoaXNbNSBdID0gVmVjLkRvdChyMSwgYzEpOyB0aGlzWzYgXSA9IFZlYy5Eb3QocjEsIGMyKTsgdGhpc1s3IF0gPSBWZWMuRG90KHIxLCBjMyk7XG4gICAgICAgIHRoaXNbOCBdID0gVmVjLkRvdChyMiwgYzApOyB0aGlzWzkgXSA9IFZlYy5Eb3QocjIsIGMxKTsgdGhpc1sxMF0gPSBWZWMuRG90KHIyLCBjMik7IHRoaXNbMTFdID0gVmVjLkRvdChyMiwgYzMpO1xuICAgICAgICB0aGlzWzEyXSA9IFZlYy5Eb3QocjMsIGMwKTsgdGhpc1sxM10gPSBWZWMuRG90KHIzLCBjMSk7IHRoaXNbMTRdID0gVmVjLkRvdChyMywgYzIpOyB0aGlzWzE1XSA9IFZlYy5Eb3QocjMsIGMzKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0bXVsdFZlY3Rvcih2ZWMpIHtcbiAgICAgICAgaWYgKHZlYy5sZW5ndGg8Mykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBwYXJhbWV0ZXIgbXVsdGlwbHlpbmcgTWF0NCBieSB2ZWN0b3JcIik7XG4gICAgICAgIH1cblxuXHRcdGNvbnN0IHggPSB2ZWNbMF07XG5cdFx0Y29uc3QgeSA9IHZlY1sxXTtcblx0XHRjb25zdCB6ID0gdmVjWzJdO1xuXHRcdGNvbnN0IHcgPSB2ZWMubGVuZ3RoID4zID8gdmVjWzNdIDogMS4wO1xuXHRcblx0XHRyZXR1cm4gbmV3IFZlYyggdGhpc1swXSAqIHggKyB0aGlzWzRdICogeSArIHRoaXNbIDhdICogeiArIHRoaXNbMTJdICogdyxcblx0XHRcdFx0XHRcdHRoaXNbMV0gKiB4ICsgdGhpc1s1XSAqIHkgKyB0aGlzWyA5XSAqIHogKyB0aGlzWzEzXSAqIHcsXG5cdFx0XHRcdFx0XHR0aGlzWzJdICogeCArIHRoaXNbNl0gKiB5ICsgdGhpc1sxMF0gKiB6ICsgdGhpc1sxNF0gKiB3LFxuXHRcdFx0XHRcdFx0dGhpc1szXSAqIHggKyB0aGlzWzddICogeSArIHRoaXNbMTFdICogeiArIHRoaXNbMTVdICogdyk7XG5cdH1cblx0XG5cdGludmVydCgpIHtcblx0XHRjb25zdCBhMDAgPSB0aGlzWzBdLCAgYTAxID0gdGhpc1sxXSwgIGEwMiA9IHRoaXNbMl0sICBhMDMgPSB0aGlzWzNdLFxuXHQgICAgICAgICAgYTEwID0gdGhpc1s0XSwgIGExMSA9IHRoaXNbNV0sICBhMTIgPSB0aGlzWzZdLCAgYTEzID0gdGhpc1s3XSxcblx0ICAgICAgICAgIGEyMCA9IHRoaXNbOF0sICBhMjEgPSB0aGlzWzldLCAgYTIyID0gdGhpc1sxMF0sIGEyMyA9IHRoaXNbMTFdLFxuXHQgICAgICAgICAgYTMwID0gdGhpc1sxMl0sIGEzMSA9IHRoaXNbMTNdLCBhMzIgPSB0aGlzWzE0XSwgYTMzID0gdGhpc1sxNV07XG5cblx0ICAgIGNvbnN0IGIwMCA9IGEwMCAqIGExMSAtIGEwMSAqIGExMCxcblx0ICAgICAgICAgIGIwMSA9IGEwMCAqIGExMiAtIGEwMiAqIGExMCxcblx0ICAgICAgICAgIGIwMiA9IGEwMCAqIGExMyAtIGEwMyAqIGExMCxcblx0ICAgICAgICAgIGIwMyA9IGEwMSAqIGExMiAtIGEwMiAqIGExMSxcblx0ICAgICAgICAgIGIwNCA9IGEwMSAqIGExMyAtIGEwMyAqIGExMSxcblx0ICAgICAgICAgIGIwNSA9IGEwMiAqIGExMyAtIGEwMyAqIGExMixcblx0ICAgICAgICAgIGIwNiA9IGEyMCAqIGEzMSAtIGEyMSAqIGEzMCxcblx0ICAgICAgICAgIGIwNyA9IGEyMCAqIGEzMiAtIGEyMiAqIGEzMCxcblx0ICAgICAgICAgIGIwOCA9IGEyMCAqIGEzMyAtIGEyMyAqIGEzMCxcblx0ICAgICAgICAgIGIwOSA9IGEyMSAqIGEzMiAtIGEyMiAqIGEzMSxcblx0ICAgICAgICAgIGIxMCA9IGEyMSAqIGEzMyAtIGEyMyAqIGEzMSxcblx0ICAgICAgICAgIGIxMSA9IGEyMiAqIGEzMyAtIGEyMyAqIGEzMjtcblxuXHQgICAgbGV0IGRldCA9IGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcblxuXHQgICAgaWYgKCFkZXQpIHtcblx0XHRcdHRoaXMuemVybygpO1xuXHQgICAgfVxuXHRcdGVsc2Uge1xuXHRcdFx0ZGV0ID0gMS4wIC8gZGV0O1xuXG5cdFx0XHR0aGlzWzBdID0gKGExMSAqIGIxMSAtIGExMiAqIGIxMCArIGExMyAqIGIwOSkgKiBkZXQ7XG5cdFx0XHR0aGlzWzFdID0gKGEwMiAqIGIxMCAtIGEwMSAqIGIxMSAtIGEwMyAqIGIwOSkgKiBkZXQ7XG5cdFx0XHR0aGlzWzJdID0gKGEzMSAqIGIwNSAtIGEzMiAqIGIwNCArIGEzMyAqIGIwMykgKiBkZXQ7XG5cdFx0XHR0aGlzWzNdID0gKGEyMiAqIGIwNCAtIGEyMSAqIGIwNSAtIGEyMyAqIGIwMykgKiBkZXQ7XG5cdFx0XHR0aGlzWzRdID0gKGExMiAqIGIwOCAtIGExMCAqIGIxMSAtIGExMyAqIGIwNykgKiBkZXQ7XG5cdFx0XHR0aGlzWzVdID0gKGEwMCAqIGIxMSAtIGEwMiAqIGIwOCArIGEwMyAqIGIwNykgKiBkZXQ7XG5cdFx0XHR0aGlzWzZdID0gKGEzMiAqIGIwMiAtIGEzMCAqIGIwNSAtIGEzMyAqIGIwMSkgKiBkZXQ7XG5cdFx0XHR0aGlzWzddID0gKGEyMCAqIGIwNSAtIGEyMiAqIGIwMiArIGEyMyAqIGIwMSkgKiBkZXQ7XG5cdFx0XHR0aGlzWzhdID0gKGExMCAqIGIxMCAtIGExMSAqIGIwOCArIGExMyAqIGIwNikgKiBkZXQ7XG5cdFx0XHR0aGlzWzldID0gKGEwMSAqIGIwOCAtIGEwMCAqIGIxMCAtIGEwMyAqIGIwNikgKiBkZXQ7XG5cdFx0XHR0aGlzWzEwXSA9IChhMzAgKiBiMDQgLSBhMzEgKiBiMDIgKyBhMzMgKiBiMDApICogZGV0O1xuXHRcdFx0dGhpc1sxMV0gPSAoYTIxICogYjAyIC0gYTIwICogYjA0IC0gYTIzICogYjAwKSAqIGRldDtcblx0XHRcdHRoaXNbMTJdID0gKGExMSAqIGIwNyAtIGExMCAqIGIwOSAtIGExMiAqIGIwNikgKiBkZXQ7XG5cdFx0XHR0aGlzWzEzXSA9IChhMDAgKiBiMDkgLSBhMDEgKiBiMDcgKyBhMDIgKiBiMDYpICogZGV0O1xuXHRcdFx0dGhpc1sxNF0gPSAoYTMxICogYjAxIC0gYTMwICogYjAzIC0gYTMyICogYjAwKSAqIGRldDtcblx0XHRcdHRoaXNbMTVdID0gKGEyMCAqIGIwMyAtIGEyMSAqIGIwMSArIGEyMiAqIGIwMCkgKiBkZXQ7XG5cdFx0fVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuXHR9XG5cdFxuXHR0cmFzcG9zZSgpIHtcblx0XHRjb25zdCByMCA9IG5ldyBWZWModGhpc1swXSwgdGhpc1s0XSwgdGhpc1sgOF0sIHRoaXNbMTJdKTtcblx0XHRjb25zdCByMSA9IG5ldyBWZWModGhpc1sxXSwgdGhpc1s1XSwgdGhpc1sgOV0sIHRoaXNbMTNdKTtcblx0XHRjb25zdCByMiA9IG5ldyBWZWModGhpc1syXSwgdGhpc1s2XSwgdGhpc1sxMF0sIHRoaXNbMTRdKTtcblx0XHRjb25zdCByMyA9IG5ldyBWZWModGhpc1szXSwgdGhpc1s3XSwgdGhpc1sxMV0sIHRoaXNbMTVdKTtcblx0XG5cdFx0dGhpcy5zZXRSb3coMCwgcjApO1xuXHRcdHRoaXMuc2V0Um93KDEsIHIxKTtcblx0XHR0aGlzLnNldFJvdygyLCByMik7XG5cdFx0dGhpcy5zZXRSb3coMywgcjMpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblxuXG5cbiAgICAvLy8vLy8vLy8gRmFjdG9yeSBtZXRob2RzXG4gICAgc3RhdGljIE1ha2VJZGVudGl0eSgpIHtcbiAgICAgICAgY29uc3QgbSA9IG5ldyBNYXQ0KCk7XG4gICAgICAgIHJldHVybiBtLmlkZW50aXR5KCk7XG4gICAgfVxuXG4gICAgc3RhdGljIE1ha2VUcmFuc2xhdGlvbih4LCB5LCB6KSB7XG5cdFx0aWYgKHggaW5zdGFuY2VvZiBOdW1lcmljQXJyYXkgJiYgeC5sZW5ndGggPj0gMykge1xuXHRcdFx0eSA9IHhbMV07XG5cdFx0XHR6ID0geFsyXTtcblx0XHRcdHggPSB4WzBdO1xuXHRcdH1cblx0XHRyZXR1cm4gbmV3IE1hdDQoXG5cdFx0XHQxLjAsIDAuMCwgMC4wLCAwLjAsXG5cdFx0XHQwLjAsIDEuMCwgMC4wLCAwLjAsXG5cdFx0XHQwLjAsIDAuMCwgMS4wLCAwLjAsXG5cdFx0XHQgIHgsICAgeSwgICB6LCAxLjBcblx0XHQpO1xuXHR9XG5cdFx0XG5cdHN0YXRpYyBNYWtlUm90YXRpb24oYWxwaGEsIHgsIHksIHopIHtcblx0XHRjb25zdCBheGlzID0gbmV3IFZlYyh4LHkseik7XG5cdFx0YXhpcy5ub3JtYWxpemUoKTtcblx0XHRcdFx0XG5cdFx0dmFyIGNvc0FscGhhID0gTWF0aC5jb3MoYWxwaGEpO1xuXHRcdHZhciBhY29zQWxwaGEgPSAxLjAgLSBjb3NBbHBoYTtcblx0XHR2YXIgc2luQWxwaGEgPSBNYXRoLnNpbihhbHBoYSk7XG5cdFx0XG5cdFx0cmV0dXJuIG5ldyBNYXQ0KFxuXHRcdFx0YXhpcy54ICogYXhpcy54ICogYWNvc0FscGhhICsgY29zQWxwaGEsIGF4aXMueCAqIGF4aXMueSAqIGFjb3NBbHBoYSArIGF4aXMueiAqIHNpbkFscGhhLCBheGlzLnggKiBheGlzLnogKiBhY29zQWxwaGEgLSBheGlzLnkgKiBzaW5BbHBoYSwgMCxcblx0XHRcdGF4aXMueSAqIGF4aXMueCAqIGFjb3NBbHBoYSAtIGF4aXMueiAqIHNpbkFscGhhLCBheGlzLnkgKiBheGlzLnkgKiBhY29zQWxwaGEgKyBjb3NBbHBoYSwgYXhpcy55ICogYXhpcy56ICogYWNvc0FscGhhICsgYXhpcy54ICogc2luQWxwaGEsIDAsXG5cdFx0XHRheGlzLnogKiBheGlzLnggKiBhY29zQWxwaGEgKyBheGlzLnkgKiBzaW5BbHBoYSwgYXhpcy56ICogYXhpcy55ICogYWNvc0FscGhhIC0gYXhpcy54ICogc2luQWxwaGEsIGF4aXMueiAqIGF4aXMueiAqIGFjb3NBbHBoYSArIGNvc0FscGhhLCAwLFxuXHRcdFx0MCwwLDAsMVxuXHRcdCk7XG5cdH1cblxuXHRzdGF0aWMgTWFrZVNjYWxlKHgsIHksIHopIHtcblx0XHRpZiAoeCBpbnN0YW5jZW9mIE51bWVyaWNBcnJheSAgJiYgeC5sZW5ndGggPj0gMykge1xuICAgICAgICAgICAgeSA9IHhbMV07XG5cdFx0XHR6ID0geFsyXTtcblx0XHRcdHggPSB4WzBdO1xuXHRcdH1cblx0XHRyZXR1cm4gbmV3IE1hdDQoXG5cdFx0XHR4LCAwLCAwLCAwLFxuXHRcdFx0MCwgeSwgMCwgMCxcblx0XHRcdDAsIDAsIHosIDAsXG5cdFx0XHQwLCAwLCAwLCAxXG5cdFx0KVxuXHR9XG4gICAgXG5cbiAgICBzdGF0aWMgTWFrZVBlcnNwZWN0aXZlKGZvdnksIGFzcGVjdCwgbmVhclBsYW5lLCBmYXJQbGFuZSkge1xuXHRcdHJldHVybiAobmV3IE1hdDQoKSkucGVyc3BlY3RpdmUoZm92eSwgYXNwZWN0LCBuZWFyUGxhbmUsIGZhclBsYW5lKTtcblx0fVxuXHRcblx0c3RhdGljIE1ha2VGcnVzdHVtKGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhclBsYW5lLCBmYXJQbGFuZSkge1xuXHRcdHJldHVybiAobmV3IE1hdDQoKSkuZnJ1c3R1bShsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIG5lYXJQbGFuZSwgZmFyUGxhbmUpO1xuXHR9XG5cdFxuXHRzdGF0aWMgTWFrZU9ydGhvKGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhclBsYW5lLCBmYXJQbGFuZSkge1xuXHRcdHJldHVybiAobmV3IE1hdDQoKSkub3J0aG8obGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyUGxhbmUsIGZhclBsYW5lKTtcblx0fVxuXG5cdHN0YXRpYyBNYWtlTG9va0F0KG9yaWdpbiwgdGFyZ2V0LCB1cCkge1xuXHRcdHJldHVybiAobmV3IE1hdDQoKSkuTG9va0F0KG9yaWdpbix0YXJnZXQsdXApO1xuXHR9XG5cblxuXG5cblxuICAgIC8vLy8vLy8gU3RhdGljIFV0aWxpdGllc1xuICAgIHN0YXRpYyBVbnByb2plY3QoeCwgeSwgZGVwdGgsIG12TWF0LCBwTWF0LCB2aWV3cG9ydCkge1xuXHRcdGxldCBtdnAgPSBuZXcgTWF0NChwTWF0KTtcblx0XHRtdnAubXVsdChtdk1hdCk7XG5cdFx0bXZwLmludmVydCgpO1xuXG5cdFx0Y29uc3QgdmluID0gbmV3IFZlYygoKHggLSB2aWV3cG9ydC55KSAvIHZpZXdwb3J0LndpZHRoKSAqIDIuMCAtIDEuMCxcblx0XHRcdFx0XHRcdFx0XHQoKHkgLSB2aWV3cG9ydC54KSAvIHZpZXdwb3J0LmhlaWdodCkgKiAyLjAgLSAxLjAsXG5cdFx0XHRcdFx0XHRcdFx0ZGVwdGggKiAyLjAgLSAxLjAsXG5cdFx0XHRcdFx0XHRcdFx0MS4wKTtcblx0XHRcblx0XHRjb25zdCByZXN1bHQgPSBuZXcgVmVjNChtdnAubXVsdFZlY3Rvcih2aW4pKTtcblx0XHRpZiAocmVzdWx0Lno9PTApIHtcblx0XHRcdHJlc3VsdC5zZXQoMCk7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0cmVzdWx0LnNldChcdHJlc3VsdC54L3Jlc3VsdC53LFxuXHRcdFx0XHRcdFx0cmVzdWx0LnkvcmVzdWx0LncsXG5cdFx0XHRcdFx0XHRyZXN1bHQuei9yZXN1bHQudyxcblx0XHRcdFx0XHRcdHJlc3VsdC53L3Jlc3VsdC53KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cbiAgICBzdGF0aWMgR2V0U2NhbGUobSkge1xuXHRcdHJldHVybiBuZXcgVmVjMyhcbiAgICAgICAgICAgIG5ldyBWZWMobVsxXSwgbVs1XSwgbVs5XSkubWFnbml0dWRlKCksXG5cdFx0XHRuZXcgVmVjKG1bMF0sIG1bNF0sIG1bOF0pLm1hZ25pdHVkZSgpLFxuXHRcdFx0bmV3IFZlYyhtWzJdLCBtWzZdLCBtWzEwXSkubWFnbml0dWRlKClcblx0XHQpO1xuXHR9XG5cbiAgICBzdGF0aWMgR2V0Um90YXRpb24obSkge1xuXHRcdGNvbnN0IHNjYWxlID0gTWF0NC5HZXRTY2FsZSgpO1xuXHRcdHJldHVybiBuZXcgTWF0NChcblx0XHRcdFx0bVswXSAvIHNjYWxlLngsIG1bMV0gLyBzY2FsZS55LCBtWyAyXSAvIHNjYWxlLnosIDAsXG5cdFx0XHRcdG1bNF0gLyBzY2FsZS54LCBtWzVdIC8gc2NhbGUueSwgbVsgNl0gLyBzY2FsZS56LCAwLFxuXHRcdFx0XHRtWzhdIC8gc2NhbGUueCwgbVs5XSAvIHNjYWxlLnksIG1bMTBdIC8gc2NhbGUueiwgMCxcblx0XHRcdFx0MCxcdCAgIDAsXHQgIDAsIFx0MVxuXHRcdCk7XG5cdH1cblxuXHRzdGF0aWMgR2V0UG9zaXRpb24obSkge1xuXHRcdHJldHVybiBuZXcgVmVjKG1bMTJdLCBtWzEzXSwgbVsxNF0pO1xuXHR9XG5cbiAgICBzdGF0aWMgRXF1YWxzKG0sbikge1xuXHRcdHJldHVyblx0bVsgMF0gPT0gblsgMF0gJiYgbVsgMV0gPT0gblsgMV0gJiYgbVsgMl0gPT0gblsgMl0gJiYgbVsgM10gPT0gblsgM10gJiZcblx0XHRcdFx0bVsgNF0gPT0gblsgNF0gJiYgbVsgNV0gPT0gblsgNV0gJiYgbVsgNl0gPT0gblsgNl0gJiYgbVsgN10gPT0gblsgN10gJiZcblx0XHRcdFx0bVsgOF0gPT0gblsgOF0gJiYgbVsgOV0gPT0gblsgOV0gJiYgbVsxMF0gPT0gblsxMF0gJiYgbVsxMV0gPT0gblsxMV0gJiZcblx0XHRcdFx0bVsxMl0gPT0gblsxMl0gJiYgbVsxM10gPT0gblsxM10gJiYgbVsxNF0gPT0gblsxNF0gJiYgbVsxNV0gPT0gblsxNV07XG5cdH1cblxuICAgIHN0YXRpYyBUcmFuc2Zvcm1EaXJlY3Rpb24oTSwgLyogVmVjICovIGRpcikge1xuXHRcdGNvbnN0IGRpcmVjdGlvbiA9IG5ldyBWZWMoZGlyKTtcblx0XHRjb25zdCB0cnggPSBuZXcgTWF0NChNKTtcblx0XHR0cnguc2V0Um93KDMsIG5ldyBWZWMoMCwgMCwgMCwgMSkpO1xuXHRcdGRpcmVjdGlvbi5hc3NpZ24odHJ4Lm11bHRWZWN0b3IoZGlyZWN0aW9uKS54eXopO1xuXHRcdGRpcmVjdGlvbi5ub3JtYWxpemUoKTtcblx0XHRyZXR1cm4gZGlyZWN0aW9uO1xuXHR9XG5cbiAgICBzdGF0aWMgSXNOYW4oKSB7XG5cdFx0cmV0dXJuXHRpc05hTih0aGlzWyAwXSkgfHwgaXNOYU4odGhpc1sgMV0pIHx8IGlzTmFOKHRoaXNbIDJdKSB8fCBpc05hTih0aGlzWyAzXSkgfHxcblx0XHRcdFx0aXNOYU4odGhpc1sgNF0pIHx8IGlzTmFOKHRoaXNbIDVdKSB8fCBpc05hTih0aGlzWyA2XSkgfHwgaXNOYU4odGhpc1sgN10pIHx8XG5cdFx0XHRcdGlzTmFOKHRoaXNbIDhdKSB8fCBpc05hTih0aGlzWyA5XSkgfHwgaXNOYU4odGhpc1sxMF0pIHx8IGlzTmFOKHRoaXNbMTFdKSB8fFxuXHRcdFx0XHRpc05hTih0aGlzWzEyXSkgfHwgaXNOYU4odGhpc1sxM10pIHx8IGlzTmFOKHRoaXNbMTRdKSB8fCBpc05hTih0aGlzWzE1XSk7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIE1hdDQ6IE1hdDRcbn1cbiIsIlxuaW1wb3J0IHtcbiAgICBBeGlzLFxuICAgIFBJLFxuICAgIERFR19UT19SQUQsXG4gICAgUkFEX1RPX0RFRyxcbiAgICBQSV8yLFxuICAgIFBJXzQsXG4gICAgUElfOCxcbiAgICBUV09fUEksXG4gICAgRVBTSUxPTixcbiAgICBOdW1lcmljQXJyYXksXG4gICAgTnVtZXJpY0FycmF5SGlnaFAsXG4gICAgRkxPQVRfTUFYXG59IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuXG5pbXBvcnQge1xuICAgIGNoZWNrUG93ZXJPZlR3byxcbiAgICBjaGVja1plcm8sXG4gICAgZXF1YWxzLFxuICAgIGRlZ3JlZXNUb1JhZGlhbnMsXG4gICAgcmFkaWFuc1RvRGVncmVlcyxcbiAgICBzaW4sXG4gICAgY29zLFxuICAgIHRhbixcbiAgICBjb3RhbixcbiAgICBhdGFuLFxuICAgIGF0YW4yLFxuICAgIHJhbmRvbSxcbiAgICBzZWVkZWRSYW5kb20sXG4gICAgbWF4LFxuICAgIG1pbixcbiAgICBhYnMsXG4gICAgc3FydCxcbiAgICBsZXJwLFxuICAgIHNxdWFyZVxufSBmcm9tIFwiLi9mdW5jdGlvbnNcIjtcblxuaW1wb3J0IFZlY3RvclV0aWxzIGZyb20gJy4vVmVjdG9yJztcblxuaW1wb3J0IE1hdHJpeDNVdGlscyBmcm9tIFwiLi9NYXRyaXgzXCI7XG5cbmltcG9ydCBNYXRyaXg0VXRpbHMgZnJvbSAnLi9NYXRyaXg0JztcblxuZXhwb3J0IGNvbnN0IG1hdGggPSB7XG4gICAgQXhpcyxcbiAgICBQSSxcbiAgICBERUdfVE9fUkFELFxuICAgIFJBRF9UT19ERUcsXG4gICAgUElfMixcbiAgICBQSV80LFxuICAgIFBJXzgsXG4gICAgVFdPX1BJLFxuICAgIEVQU0lMT04sXG4gICAgTnVtZXJpY0FycmF5LFxuICAgIE51bWVyaWNBcnJheUhpZ2hQLFxuICAgIEZMT0FUX01BWCxcblxuICAgIGNoZWNrUG93ZXJPZlR3byxcbiAgICBjaGVja1plcm8sXG4gICAgZXF1YWxzLFxuICAgIGRlZ3JlZXNUb1JhZGlhbnMsXG4gICAgcmFkaWFuc1RvRGVncmVlcyxcbiAgICBzaW4sXG4gICAgY29zLFxuICAgIHRhbixcbiAgICBjb3RhbixcbiAgICBhdGFuLFxuICAgIGF0YW4yLFxuICAgIHJhbmRvbSxcbiAgICBzZWVkZWRSYW5kb20sXG4gICAgbWF4LFxuICAgIG1pbixcbiAgICBhYnMsXG4gICAgc3FydCxcbiAgICBsZXJwLFxuICAgIHNxdWFyZVxufTtcblxuZXhwb3J0IGNvbnN0IFZlYyA9IFZlY3RvclV0aWxzLlZlYztcbmV4cG9ydCBjb25zdCBNYXQzID0gTWF0cml4M1V0aWxzLk1hdDM7XG5leHBvcnQgY29uc3QgTWF0NCA9IE1hdHJpeDRVdGlscy5NYXQ0O1xuXG4iXSwibmFtZXMiOlsiUEkiLCJ0YW4iLCJWZWMiLCJNYXQzIiwiTWF0cml4VXRpbHMiLCJNYXQ0Il0sIm1hcHBpbmdzIjoiQUFDTyxNQUFNLElBQUksR0FBRztBQUNwQixDQUFDLElBQUksRUFBRSxDQUFDO0FBQ1IsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUNMLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDTCxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ0wsSUFBSSxJQUFJLEVBQUUsQ0FBQyxJQUFJLEtBQUs7QUFDcEIsUUFBUSxRQUFRLElBQUk7QUFDcEIsUUFBUSxLQUFLLElBQUksQ0FBQyxJQUFJO0FBQ3RCLFlBQVksT0FBTyxNQUFNLENBQUM7QUFDMUIsUUFBUSxLQUFLLElBQUksQ0FBQyxDQUFDO0FBQ25CLFlBQVksT0FBTyxHQUFHLENBQUM7QUFDdkIsUUFBUSxLQUFLLElBQUksQ0FBQyxDQUFDO0FBQ25CLFlBQVksT0FBTyxHQUFHLENBQUM7QUFDdkIsUUFBUSxLQUFLLElBQUksQ0FBQyxDQUFDO0FBQ25CLFlBQVksT0FBTyxHQUFHLENBQUM7QUFDdkIsUUFBUSxLQUFLLElBQUksQ0FBQyxDQUFDO0FBQ25CLFlBQVksT0FBTyxHQUFHLENBQUM7QUFDdkIsUUFBUTtBQUNSLFlBQVksT0FBTyxTQUFTO0FBQzVCLFNBQ0EsS0FBSztBQUNMLENBQUMsQ0FBQztBQUNGO0FBQ08sTUFBTUEsSUFBRSxHQUFHLGlCQUFpQixDQUFDO0FBQzdCLE1BQU0sVUFBVSxHQUFHLGdCQUFnQixDQUFDO0FBQ3BDLE1BQU0sVUFBVSxHQUFHLGlCQUFpQixDQUFDO0FBQ3JDLE1BQU0sSUFBSSxHQUFHLGtCQUFrQixDQUFDO0FBQ2hDLE1BQU0sSUFBSSxHQUFHLGlCQUFpQixDQUFDO0FBQy9CLE1BQU0sSUFBSSxHQUFHLGlCQUFpQixDQUFDO0FBQy9CLE1BQU0sTUFBTSxHQUFHLGlCQUFpQixDQUFDO0FBQ2pDLE1BQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQztBQUNqQztBQUNBO0FBQ08sTUFBTSxZQUFZLEdBQUcsWUFBWSxDQUFDO0FBQ2xDLE1BQU0saUJBQWlCLEdBQUcsWUFBWSxDQUFDO0FBQ3ZDLE1BQU0sU0FBUyxHQUFHLFdBQVc7O0FDN0JwQyxJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDaEM7QUFDTyxNQUFNLGVBQWUsR0FBRyxDQUFDLENBQUMsS0FBSztBQUN0QyxJQUFJLElBQUksT0FBTyxDQUFDLEtBQUssUUFBUSxFQUFFO0FBQy9CLFFBQVEsT0FBTyxLQUFLLENBQUM7QUFDckIsS0FBSztBQUNMLFNBQVM7QUFDVCxRQUFRLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDeEMsS0FBSztBQUNMLEVBQUM7QUFDRDtBQUNPLE1BQU0sU0FBUyxHQUFHLENBQUMsQ0FBQyxLQUFLO0FBQ2hDLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3pDLEVBQUM7QUFDRDtBQUNPLE1BQU0sTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSztBQUMvQixJQUFJLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDO0FBQ3JDLEVBQUM7QUFDRDtBQUNPLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLEtBQUs7QUFDdkMsSUFBSSxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDO0FBQ2xELEVBQUM7QUFDRDtBQUNPLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLEtBQUs7QUFDdkMsSUFBSSxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDO0FBQ2xELEVBQUM7QUFDRDtBQUNPLE1BQU0sR0FBRyxHQUFHLENBQUMsR0FBRyxLQUFLO0FBQzVCLElBQUksT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqRCxFQUFDO0FBQ0Q7QUFDTyxNQUFNLEdBQUcsR0FBRyxDQUFDLEdBQUcsS0FBSztBQUM1QixJQUFJLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakQsRUFBQztBQUNEO0FBQ08sTUFBTUMsS0FBRyxHQUFHLENBQUMsR0FBRyxLQUFLO0FBQzVCLElBQUksT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqRCxFQUFDO0FBQ0Q7QUFDTyxNQUFNLEtBQUssR0FBRyxDQUFDLEdBQUcsS0FBSztBQUM5QixJQUFJLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFHQSxLQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xELEVBQUM7QUFDRDtBQUNPLE1BQU0sSUFBSSxHQUFHLENBQUMsR0FBRyxLQUFLO0FBQzdCLElBQUksT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsRCxFQUFDO0FBQ0Q7QUFDTyxNQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUs7QUFDL0IsSUFBSSxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyRCxFQUFDO0FBQ0Q7QUFDTyxNQUFNLE1BQU0sR0FBRyxNQUFNO0FBQzVCLElBQUksT0FBTyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDekIsRUFBQztBQUNEO0FBQ08sTUFBTSxZQUFZLEdBQUcsTUFBTTtBQUNsQyxJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNsQixJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNsQjtBQUNBLElBQUksY0FBYyxHQUFHLENBQUMsY0FBYyxHQUFHLElBQUksR0FBRyxLQUFLLElBQUksTUFBTSxDQUFDO0FBQzlELElBQUksTUFBTSxHQUFHLEdBQUcsY0FBYyxHQUFHLE1BQU0sQ0FBQztBQUN4QztBQUNBLElBQUksT0FBTyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNuQyxFQUFDO0FBQ0Q7QUFDTyxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUs7QUFDNUIsSUFBSSxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN0QyxFQUFDO0FBQ0Q7QUFDTyxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUs7QUFDNUIsSUFBSSxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN0QyxFQUFDO0FBQ0Q7QUFDTyxNQUFNLEdBQUcsR0FBRyxDQUFDLEdB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QUFRLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM5QyxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM5QyxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM5QyxRQUFRLE9BQU8sSUFBSSxDQUFDO0FBQ3BCLEtBQUs7QUFDTDtBQUNBLElBQUksSUFBSSxHQUFHO0FBQ1gsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDOUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDOUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDOUMsUUFBUSxPQUFPLElBQUksQ0FBQztBQUNwQixLQUFLO0FBQ0w7QUFDQSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEVBQUU7QUFDWCxRQUFRLE9BQU8sSUFBSUQsS0FBRztBQUN0QixZQUFZLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZCLFlBQVksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzNCLFlBQVksSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM3QixLQUFLO0FBQ0w7QUFDQSxJQUFJLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxHQUFHLElBQUksRUFBRTtBQUNyQyxRQUFRLElBQUksQ0FBQyxZQUFZLFlBQVksSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRTtBQUN0RCxZQUFZLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BDLFlBQVksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BDLFlBQVksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BDLFNBQVM7QUFDVCxhQUFhLElBQUksT0FBTyxDQUFDLENBQUMsS0FBSyxRQUFRO0FBQ3ZDLFlBQVksT0FBTyxDQUFDLENBQUMsS0FBSyxRQUFRO0FBQ2xDLFlBQVksT0FBTyxDQUFDLENBQUMsS0FBSyxRQUFRO0FBQ2xDLFVBQVU7QUFDVixZQUFZLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2pDLFlBQVksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2pDLFlBQVksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2pDLFNBQVM7QUFDVCxhQUFhO0FB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QyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0QsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEQsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDbkQsU0FBUztBQUNULGFBQWE7QUFDYixZQUFZLE1BQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDLENBQUM7QUFDdEUsU0FBUztBQUNULFFBQVEsT0FBTyxJQUFJLENBQUM7QUFDcEIsS0FBSztBQUNMO0FBQ0EsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDcEIsRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLElBQUlBLEtBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2RSxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsSUFBSUEsS0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZFLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxJQUFJQSxLQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDakQsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDakQsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDakQsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkLEVBQUU7QUFDRjtBQUNBLElBQUksUUFBUSxHQUFHO0FBQ2YsUUFBUSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0IsUUFBUSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0IsUUFBUSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0IsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFCLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxQixRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUIsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3JCLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNyQixRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDckIsUUFBUSxPQUFPLElBQUksQ0FBQztBQUNwQixLQUFLO0FBQ0w7QUFDQSxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUU7QUFDWixRQUFRLElBQUksT0FBTyxDQUFDLENBQUMsS0FBSyxRQUFRLEVBQUU7QUFDcEMsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDckQsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDckQsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDckQsU0FBUztBQUNULGFBQWEsSUFBSSxDQUFDLFlBQVksWUFBWSxJQUFJLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQzlELFlBQVksTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuQyxZQUFZLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkMsWUFBWSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25DLFlBQVksTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoQyxZQUFZLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEMsWUFBWSxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hDO0FBQ0EsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUdBLEtBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHQSxLQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBR0EsS0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDekYsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUdBLEtBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHQSxLQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBR0EsS0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDekYsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUdBLEtBQUcsQ0FBQyxH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QUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEQsWUFBWUEsS0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJQSxLQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwRCxZQUFZQSxLQUFHLENBQUMsU0FBUyxDQUFDLElBQUlBLEtBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BELFNBQVMsQ0FBQztBQUNWLEtBQUs7QUFDTDtBQUNBLElBQUksT0FBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUN2QixRQUFRLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVELGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDN0QsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlELEtBQUs7QUFDTDtBQUNBLElBQUksT0FBTyxLQUFLLENBQUMsQ0FBQyxFQUFFO0FBQ3BCLFFBQVEsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDeEQsZ0JBQWdCLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN6RCxnQkFBZ0IsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUQsS0FBSztBQUNMLENBQ0E7QUFDQSxtQkFBZTtBQUNmLElBQUksSUFBSSxFQUFFQyxNQUFJO0FBQ2Q7O0FDeE5BLE1BQU1ELEtBQUcsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDO0FBQzVCLE1BQU1DLE1BQUksR0FBR0MsWUFBVyxDQUFDLElBQUksQ0FBQztBQUM5QjtBQUNBLE1BQU1DLE1BQUksU0FBUyxZQUFZLENBQUM7QUFDaEMsSUFBSSxXQUFXLEdBQUc7QUFDbEIsUUFBUSxNQUFNLFFBQVEsR0FBRztBQUN6QixZQUFZLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDdEIsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ3RCLFlBQVksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUN0QixZQUFZLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDdEIsU0FBUyxDQUFDO0FBQ1Y7QUFDQTtBQUNBLFFBQVEsSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUNwQyxZQUFZLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkMsWUFBWSxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLFlBQVksUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QztBQUNBLFlBQVksUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QyxZQUFZLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkMsWUFBWSxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDO0FBQ0EsWUFBWSxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLFlBQVksUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QyxZQUFZLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDeEM7QUFDQSxZQUFZLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDN0IsU0FBUztBQUNULGFBQWEsSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUN0RSxZQUFZLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0MsWUFBWSxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNDLFlBQVksUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzQztBQUNBLFlBQVksUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzQyxZQUFZLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0MsWUFBWSxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNDO0FBQ0EsWUFBWSxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNDLFlBQVksUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzQyxZQUFZLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0M7QUFDQSxZQUFZLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDN0IsU0FBUztBQUNUO0FBQ0EsYUFBYSxJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssRUFBRSxFQUFFO0FBQzFDLFlBQVksUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN4QyxZQUFZLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDekMsWUFBWSxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ3pDLFlBQVksUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUN6QztBQUNBLFlBQVksUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUN6QyxZQUFZLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDekMsWUFBWSxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ3pDLFlBQVksUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUN6QztBQUNBLFlBQVksUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUN6QyxZQUFZLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDekMsWUFBWSxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3pDLFlBQVksUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN6QztBQUNBLFlBQVksUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN6QyxZQUFZLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDekMsWUFBWSxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3pDLFlBQVksUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN6QyxTQUFTO0FBQ1QsYUFBYSxJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssRUFBRSxFQUFFO0FBQ3ZFLFlBQVksUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzQyxZQUFZLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDNUMsWUFBWSxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQzVDLFlBQVksUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUM1QztBQUNBLFlBQVksUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUM1QyxZQUFZLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDNUMsWUFBWSxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQzVDLFlBQVksUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUM1QztBQUNBLFlBQVksUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUM1QyxZQUFZLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDNUMsWUFBWSxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzVDLFlBQVksUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM1QztBQUNBLFlBQVksUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM1QyxZQUFZLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDNUMsWUFBWSxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzVDLFlBQVksUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM1QyxTQUFTO0FBQ1QsYUFBYSxJQUFJLFNBQVMsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO0FBQ3hDLFlBQVksTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLDZDQUE2QyxDQUFDLENBQUMsQ0FBQztBQUM3RSxTQUFTO0FBQ1Q7QUFDQSxRQUFRLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN4QixLQUFLO0FBQ0w7QUFDQTtBQUNBLElBQUksUUFBUSxHQUFHO0FBQ2YsUUFBUSxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBQztBQUM5RCxRQUFRLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFDO0FBQzlELFFBQVEsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUM7QUFDOUQsUUFBUSxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBQztBQUM5RCxRQUFRLE9BQU8sSUFBSSxDQUFDO0FBQ3BCLEtBQUs7QUFDTDtBQUNBLElBQUksSUFBSSxHQUFHO0FBQ1gsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3pELEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN6RCxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDekQsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3pELEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZCxFQUFFO0FBQ0Y7QUFDQSxJQUFJLFdBQVcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUU7QUFDbkQsRUFBRSxJQUFJLEtBQUssR0FBRyxHQUFHLENBQUMsSUFBSSxHQUFHLEVBQUUsR0FBRyxLQUFLLENBQUMsR0FBRyxTQUFTLENBQUM7QUFDakQsRUFBRSxJQUFJLFdBQVcsR0FBRyxLQUFLLEdBQUcsTUFBTSxDQUFDO0FBQ25DLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN6RSxRQUFRLE9BQU8sSUFBSSxDQUFDO0FBQ3BCLEVBQUU7QUFDRjtBQUNBLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFO0FBQ3hELEVBQUUsSUFBSSxDQUFDLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQztBQUN2QixFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUM7QUFDckIsRUFBRSxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDO0FBQzdCO0FBQ0EsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJSCxLQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzFELEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSUEsS0FBRyxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUMxRCxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUlBLEtBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN6RixFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUlBLEtBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN0RTtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZCxFQUFFO0FBQ0Y7QUFDQSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRTtBQUN0RCxFQUFFLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7QUFDckIsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDO0FBQ3JCLEVBQUUsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FDNUI7QUFDQSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzdELEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDN0QsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzdELEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2RztBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZCxFQUFFO0FBQ0Y7QUFDQSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRTtBQUMvQixRQUFRLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUN4QjtBQUNBLEVBQUUsTUFBTSxDQUFDLEdBQUcsSUFBSUEsS0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzFCLEVBQUUsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDckMsRUFBRSxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDaEIsRUFBRSxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1QixFQUFFLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUNoQixFQUFFLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUNoQjtBQUNBLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pCLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pCLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pCLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ2pDLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pCLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pCLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pCLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ2pDLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pCLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pCLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pCLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ2pDLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDZixFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ2YsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNmLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDZjtBQUNBLEVBQUUsT0FBTyxNQUFNLENBQUM7QUFDaEIsRUFBRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLElBQUksR0FBRyxHQUFHLEVBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUNqQyxDQUFDLElBQUksR0FBRyxHQUFHLEVBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUM5QixDQUFDLElBQUksR0FBRyxHQUFHLEVBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUM5QixDQUFDLElBQUksR0FBRyxHQUFHLEVBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUM5QixDQUFDLElBQUksR0FBRyxHQUFHLEVBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUM5QixDQUFDLElBQUksR0FBRyxHQUFHLEVBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUM5QixDQUFDLElBQUksR0FBRyxHQUFHLEVBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUM5QixDQUFDLElBQUksR0FBRyxHQUFHLEVBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUM5QixDQUFDLElBQUksR0FBRyxHQUFHLEVBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUM5QixDQUFDLElBQUksR0FBRyxHQUFHLEVBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUM5QixDQUFDLElBQUksR0FBRyxHQUFHLEVBQUUsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTtBQUMvQixDQUFDLElBQUksR0FBRyxHQUFHLEVBQUUsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTtBQUMvQixDQUFDLElBQUksR0FBRyxHQUFHLEVBQUUsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTtBQUMvQixDQUFDLElBQUksR0FBRyxHQUFHLEVBQUUsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTtBQUMvQixDQUFDLElBQUksR0FBRyxHQUFHLEVBQUUsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTtBQUMvQixDQUFDLElBQUksR0FBRyxHQUFHLEVBQUUsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTtBQUMvQjtBQUNBLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQzVCLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQzVCLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQzVCLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQzVCLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQzVCLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQzVCLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQzVCLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQzVCLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQzVCLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQzVCLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQzdCLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQzdCLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQzdCLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQzdCLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQzdCLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQzdCO0FBQ0EsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQ1gsUUFBUSxPQUFPLElBQUlBLEtBQUc7QUFDdEIsWUFBWSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN2QixZQUFZLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMzQixZQUFZLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMzQixZQUFZLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDN0IsS0FBSztBQUNMO0FBQ0EsSUFBSSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxHQUFHLElBQUksRUFBRTtBQUMvQyxRQUFRLElBQUksQ0FBQyxZQUFZLFlBQVksSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRTtBQUN0RCxZQUFZLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BDLFlBQVksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BDLFlBQVksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BDLFlBQVksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BDLFNBQVM7QUFDVCxhQUFhLElBQUksT0FBTyxDQUFDLENBQUMsS0FBSyxRQUFRO0FBQ3ZDLFlBQVksT0FBTyxDQUFDLENBQUMsS0FBSyxRQUFRO0FBQ2xDLFlBQVksT0FBTyxDQUFDLENBQUMsS0FBSyxRQUFRO0FBQ2xDLFlBQVksT0FBTyxDQUFDLENBQUMsS0FBSyxRQUFRO0FBQ2xDLFVBQVU7QUFDVixZQUFZLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2pDLFlBQVksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2pDLFlBQVksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2pDLFlBQVksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2pDLFNBQVM7QUFDVCxhQUFhO0FBQ2IsWUFBWSxNQUFNLElBQUksS0FBSyxDQUFDLENBQUMsb0NBQW9DLENBQUMsQ0FBQyxDQUFDO0FBQ3BFLFNBQVM7QUFDVCxRQUFRLE9BQU8sSUFBSSxDQUFDO0FBQ3BCLEtBQUs7QUFDTDtBQUNBLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRTtBQUNYLFFBQVEsT0FBTyxJQUFJQSxLQUFHO0FBQ3RCLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNuQixZQUFZLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZCLFlBQVksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzNCLFlBQVksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzNCLFNBQVM7QUFDVCxLQUFLO0FBQ0w7QUFDQSxJQUFJLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEdBQUcsSUFBSSxFQUFFO0FBQy9DLFFBQVEsSUFBSSxDQUFDLFlBQVksWUFBWSxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFO0FBQ3RELFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuQyxZQUFZLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25DLFlBQVksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25DLFlBQVksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25DLFNBQVM7QUFDVCxhQUFhLElBQUksT0FBTyxDQUFDLENBQUMsS0FBSyxRQUFRO0FBQ3ZDLFlBQVksT0FBTyxDQUFDLENBQUMsS0FBSyxRQUFRO0FBQ2xDLFlBQVksT0FBTyxDQUFDLENBQUMsS0FBSyxRQUFRO0FBQ2xDLFlBQVksT0FBTyxDQUFDLENBQUMsS0FBSyxRQUFRO0FBQ2xDLFVBQVU7QUFDVixZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDaEMsWUFBWSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNoQyxZQUFZLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNoQyxZQUFZLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNoQyxTQUFTO0FBQ1QsYUFBYTtBQUNiLFlBQVksTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLG9DQUFvQyxDQUFDLENBQUMsQ0FBQztBQUNwRSxTQUFTO0FBQ1QsUUFBUSxPQUFPLElBQUksQ0FBQztBQUNwQixLQUFLO0FBQ0w7QUFDQSxJQUFJLElBQUksR0FBRztBQUNYLEVBQUUsT0FBTyxJQUFJQyxNQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQzVDLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQ2hDLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNsQyxFQUFFO0FBQ0Y7QUFDQSxJQUFJLE1BQU0sQ0FBQyxDQUFDLEVBQUU7QUFDZCxFQUFFLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUU7QUFDbkIsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ25FLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNuRSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbkUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2hFLEdBQUc7QUFDSCxPQUFPLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUU7QUFDekIsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3pFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN6RSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDMUUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzFFLEdBQUc7QUFDSCxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2QsRUFBRTtBQUNGO0FBQ0EsSUFBSSxJQUFJLGFBQWEsR0FBRztBQUN4QixFQUFFLE9BQU9FLE1BQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsSUFBSUgsS0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUMvRCxFQUFFO0FBQ0Y7QUFDQSxDQUFDLElBQUksV0FBVyxHQUFHO0FBQ25CLEVBQUUsT0FBT0csTUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksRUFBRSxJQUFJSCxLQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQy9ELEVBQUU7QUFDRjtBQUNBLENBQUMsSUFBSSxRQUFRLEdBQUc7QUFDaEIsRUFBRSxPQUFPRyxNQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxFQUFFLElBQUlILEtBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDL0QsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxJQUFJLGNBQWMsR0FBRztBQUN0QixFQUFFLE9BQU9HLE1BQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsSUFBSUgsS0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2hFLEVBQUU7QUFDRjtBQUNBLENBQUMsSUFBSSxVQUFVLEdBQUc7QUFDbEIsRUFBRSxPQUFPRyxNQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxFQUFFLElBQUlILEtBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNoRSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLElBQUksVUFBVSxHQUFHO0FBQ2xCLEVBQUUsT0FBT0csTUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksRUFBRSxJQUFJSCxLQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDaEUsRUFBRTtBQUNGO0FBQ0E7QUFDQTtBQUNBLElBQUksTUFBTSxHQUFHO0FBQ2IsRUFBRSxPQUFPLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ2pFLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDNUQsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUM1RCxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDN0QsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxVQUFVLEdBQUc7QUFDZCxFQUFFLE9BQU8sSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDakUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUM1RCxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQzVELElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM3RCxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0EsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDcEIsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDRyxNQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzQyxFQUFFLE9BQU8sSUFBSSxDQUFDO0FBQ2QsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ3hCLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQ0EsTUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9DLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZCxFQUFFO0FBQ0Y7QUFDQSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUNoQixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUNBLE1BQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JDLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZCxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLFFBQVEsR0FBRztBQUNmLFFBQVEsUUFBUSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ3hFLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ3hFLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ3hFLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDekUsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQ3BCLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSUgsS0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JFLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSUEsS0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JFLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSUEsS0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3RFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2pELEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2pELEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2xELEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZCxFQUFFO0FBQ0Y7QUFDQSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUN0QixFQUFFLElBQUksT0FBTyxHQUFHLENBQUMsRUFBRSxRQUFRLEVBQUU7QUFDN0IsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ2xCLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNoQixHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDaEIsR0FBRztBQUNILE9BQU87QUFDUCxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3BCLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDcEIsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNwQixHQUFHO0FBQ0gsRUFBRSxPQUFPLElBQUksQ0FBQztBQUNkLEVBQUU7QUFDRjtBQUNBO0FBQ0EsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFO0FBQ1osRUFBRSxJQUFJLE9BQU8sQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFO0FBQzNCLEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM5RCxHQUFHLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDOUQsR0FBRyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzlELEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM5RCxHQUFHLE9BQU8sSUFBSSxDQUFDO0FBQ2YsR0FBRztBQUNIO0FBQ0EsUUFBUSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9CLFFBQVEsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvQixRQUFRLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDL0IsUUFBUSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9CLFFBQVEsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1QixRQUFRLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUIsUUFBUSxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVCLFFBQVEsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1QjtBQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHQSxLQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBR0EsS0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUdBLEtBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHQSxLQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUN2SCxRQUFRLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBR0EsS0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUdBLEtBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHQSxLQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBR0EsS0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDdkgsUUFBUSxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUdBLEtBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHQSxLQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBR0EsS0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUdBLEtBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZILFFBQVEsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHQSxLQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBR0EsS0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUdBLEtBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHQSxLQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUN2SDtBQUNBLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZCxFQUFFO0FBQ0Y7QUFDQSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUU7QUFDakIsUUFBUSxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFO0FBQzFCLFlBQVksTUFBTSxJQUFJLEtBQUssQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDO0FBQzVFLFNBQVM7QUFDVDtBQUNBLEVBQUUsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25CLEVBQUUsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25CLEVBQUUsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25CLEVBQUUsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUN6QztBQUNBLEVBQUUsT0FBTyxJQUFJQSxLQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDekUsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQztBQUM3RCxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDO0FBQzdELE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQy9ELEVBQUU7QUFDRjtBQUNBLENBQUMsTUFBTSxHQUFHO0FBQ1YsRUFBRSxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3JFLFdBQVcsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDeEUsV0FBVyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztBQUN6RSxXQUFXLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDMUU7QUFDQSxLQUFLLE1BQU0sR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDdEMsV0FBVyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztBQUN0QyxXQUFXLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO0FBQ3RDLFdBQVcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDdEMsV0FBVyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztBQUN0QyxXQUFXLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO0FBQ3RDLFdBQVcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDdEMsV0FBVyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztBQUN0QyxXQUFXLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO0FBQ3RDLFdBQVcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7QUFDdEMsV0FBVyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztBQUN0QyxXQUFXLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFDdkM7QUFDQSxLQUFLLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQ3JGO0FBQ0EsS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFO0FBQ2YsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDZixNQUFNO0FBQ04sT0FBTztBQUNQLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFDbkI7QUFDQSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQztBQUN2RCxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQztBQUN2RCxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQztBQUN2RCxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQztBQUN2RCxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQztBQUN2RCxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQztBQUN2RCxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQztBQUN2RCxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQztBQUN2RCxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQztBQUN2RCxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQztBQUN2RCxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQztBQUN4RCxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQztBQUN4RCxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQztBQUN4RCxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQztBQUN4RCxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQztBQUN4RCxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQztBQUN4RCxHQUFHO0FBQ0g7QUFDQSxRQUFRLE9BQU8sSUFBSSxDQUFDO0FBQ3BCLEVBQUU7QUFDRjtBQUNBLENBQUMsUUFBUSxHQUFHO0FBQ1osRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJQSxLQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDM0QsRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJQSxLQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDM0QsRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJQSxLQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDM0QsRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJQSxLQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDM0Q7QUFDQSxFQUFFLElBQUks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
