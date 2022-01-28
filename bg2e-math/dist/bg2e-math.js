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

const PI = 3.141592653589793;
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

const tan = (val) => {
    return Math.fround(checkZero(Math.tan(val)));
};

const cotan = (val) => {
    return Math.fround(checkZero(1.0 / tan(val)));
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

class Vector$2 extends NumericArray {
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
                super(...arguments[0]);
            }
            break;
        default:
            throw new Error(`Invalid parameters in Vector constructor`);
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
            return new Vector$2(this);
        case 3:
        case 4:
            return new Vector$2(this[0], this[1]);
        default:
            throw new Error(`Invalid vector size: ${ this.length }`);
        }
    }

    get xz() {
        switch (this.length) {
        case 3:
        case 4:
            return new Vector$2(this[0], this[2]);
        case 2:
        default:
            throw new Error(`Invalid vector size: ${ this.length }`);
        }
    }

    get yz() {
        switch (this.length) {
        case 3:
        case 4:
            return new Vector$2(this[1], this[2]);
        case 2:
        default:
            throw new Error(`Invalid vector size: ${ this.length }`);
        }
    }

    get xyz() {
        if (this.length !== 4) {
            throw new Error(`Invalid vector size: ${ this.length }`);
        }
        return new Vector$2(this[0], this[1], this[2]);
    }
}

var VectorUtils = {
    Vector: Vector$2,

    vec: {
        checkEqualLength(v1,v2) {
            checkEqualLength(v1,v2);
        },

        maxVector(v1,v2) {
            this.checkEqualLength(v1,v2);
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
        },

        minVector(v1,v2) {
            this.checkEqualLength(v1,v2);
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
        },

        add(v1,v2) {
            this.checkEqualLength(v1,v2);
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
        },

        sub(v1,v2) {
            this.checkEqualLength(v1,v2);
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
        },

        magnitude(v) {
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
        },

        distance(v1,v2) {
            this.checkEqualLength(v1,v2);
            return this.magnitude(this.sub(v1,v2));
        },
    
        dot(v1,v2) {
            this.checkEqualLength(v1,v2);
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
        },
    
        cross(v1,v2) {
            this.checkEqualLength(v1,v2);
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
        },

        getNormalized(v) {
            const m = this.magnitude(v);
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
        },

        mult(v,s) {
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
        },

        div(v,s) {
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
        },

        equals(v1,v2) {
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
        },

        assign(dst,src) {
            this.checkEqualLength(dst,src);
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
        },

        set(v, x, y, z = null, w = null) {
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
        },

        isNaN(v) {
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
        },

        xy(v) {
            switch (v.length) {
            case 2:
                return new Vector$2(v);
            case 3:
            case 4:
                return new Vector$2(v[0], v[1]);
            default:
                throw new Error(`Invalid vector size: ${ v.length }`);
            }
        },

        xz(v) {
            switch (v.length) {
            case 3:
            case 4:
                return new Vector$2(v[0], v[2]);
            case 2:
            default:
                throw new Error(`Invalid vector size: ${ v.length }`);
            }
        },

        yz(v) {
            switch (v.length) {
            case 3:
            case 4:
                return new Vector$2(v[1], v[2]);
            case 2:
            default:
                throw new Error(`Invalid vector size: ${ v.length }`);
            }
        },

        xyz(v) {
            if (v.length !== 4) {
                throw new Error(`Invalid vector size: ${ v.length }`);
            }
            return new Vector$2(v[0],v[1],v[2]);
        }
    }    
};

const Vector$1 = VectorUtils.Vector;
const vec$1 = VectorUtils.vec;

class Matrix3$1 extends NumericArray {
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
            throw new Error(`Invalid parameter size in Matrix3 constructor`);
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
        return new Vector$1(
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
        return new Vector$1(
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
		const rx = (new Vector$1(this[0], this[3], this[6])).normalize().scale(x);
		const ry = (new Vector$1(this[1], this[4], this[7])).normalize().scale(y);
		const rz = (new Vector$1(this[2], this[5], this[8])).normalize().scale(z);
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
            
            this[0] = vec$1.dot(r0,c0); this[1] = vec$1.dot(r0,c1); this[2] = vec$1.dot(r0,c2);
            this[3] = vec$1.dot(r1,c0); this[4] = vec$1.dot(r1,c1); this[5] = vec$1.dot(r1,c2);
            this[6] = vec$1.dot(r2,c0); this[7] = vec$1.dot(r2,c1); this[8] = vec$1.dot(r2,c2);
        }
        else {
            throw new Error(`Invalid parameter in Matrix3.mult()`);
        }
        return this;
    }

    multVector(v) {
        if (v.length === 2 || v.length === 3) {
            const x = v[0];
            const y = v[1];
            const z = v.length === 2 ? 1 : v[2];
        
            return new Vector$1(	this[0] * x + this[3] * y + this[6] * z,
                                this[1] * x + this[4] * y + this[7] * z,
                                this[2] * x + this[5] * y + this[8] * z);
        }
        else {
            throw new Error(`Invalid parameter in Matrix3.multVector()`);
        }
    }

    toString() {
        return  `[ ${this[0]}, ${this[1]}, ${this[2]}\n` +
                `  ${this[3]}, ${this[4]}, ${this[5]}\n` +
                `  ${this[6]}, ${this[7]}, ${this[8]} ]`;
    }
}
var Matrix3Utils = {
    Matrix3: Matrix3$1,

    mat3: {
        identity() {
            const m = new Matrix3$1();
            return m.identity();
        },

        zero() {
            const m = new Matrix3$1();
            return m.zero();
        },

        isZero(m) {
            return	v[0]==0 && v[1]==0.0 && v[2]==0.0 &&
                    v[3]==0 && v[4]==0.0 && v[5]==0.0 &&
                    v[6]==0 && v[7]==0.0 && v[8]==0.0;
        },
        
        isIdentity(m) {
            return	v[0]==1.0 && v[1]==0.0 && v[2]==0.0 &&
                    v[3]==0.0 && v[4]==1.0 && v[5]==0.0 &&
                    v[6]==0.0 && v[7]==0.0 && v[8]==1.0;
        },

        getScale(m) {
            return new Vector$1(
                vec$1.magnitude(new Vector$1(m[0], m[3], m[6])),
                vec$1.magnitude(new Vector$1(m[1], m[4], m[7])),
                vec$1.magnitude(new Vector$1(m[2], m[5], m[8]))
            );
        },

        equals(a,b) {
            return	a[0] == b[0] && a[1] == b[1]  && a[2] == b[2] &&
				    a[3] == b[3] && a[4] == b[4]  && a[5] == b[5] &&
				    a[6] == b[6] && a[7] == b[7]  && a[8] == b[8];
        },

        isNaN(m) {
            return	isNaN(m[0]) || isNaN(m[1]) || isNaN(m[2]) &&
				    isNaN(m[3]) || isNaN(m[4]) || isNaN(m[5]) &&
				    isNaN(m[6]) || isNaN(m[7]) || isNaN(m[8]);
        }
    }
};

const math = {
    Axis,
    PI,
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
    tan,
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

const Vector = VectorUtils.Vector;
const vec = VectorUtils.vec;
const Matrix3 = Matrix3Utils.Matrix3;
const mat3 = Matrix3Utils.mat3;

export { Matrix3, Vector, mat3, math, vec };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmcyZS1tYXRoLmpzIiwic291cmNlcyI6WyIuLi9zcmMvanMvY29uc3RhbnRzLmpzIiwiLi4vc3JjL2pzL2Z1bmN0aW9ucy5qcyIsIi4uL3NyYy9qcy9WZWN0b3IuanMiLCIuLi9zcmMvanMvTWF0cml4My5qcyIsIi4uL3NyYy9qcy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcbmV4cG9ydCBjb25zdCBBeGlzID0ge1xuXHROT05FOiAwLFxuXHRYOiAxLFxuXHRZOiAyLFxuXHRaOiAzLFxuICAgIG5hbWU6IChheGlzKSA9PiB7XG4gICAgICAgIHN3aXRjaCAoYXhpcykge1xuICAgICAgICBjYXNlIEF4aXMuTk9ORTpcbiAgICAgICAgICAgIHJldHVybiBcIk5PTkVcIjtcbiAgICAgICAgY2FzZSBBeGlzLlg6XG4gICAgICAgICAgICByZXR1cm4gXCJYXCI7XG4gICAgICAgIGNhc2UgQXhpcy5ZOlxuICAgICAgICAgICAgcmV0dXJuIFwiWVwiO1xuICAgICAgICBjYXNlIEF4aXMuWjpcbiAgICAgICAgICAgIHJldHVybiBcIlpcIjtcbiAgICAgICAgY2FzZSBBeGlzLlc6XG4gICAgICAgICAgICByZXR1cm4gXCJXXCI7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gXCJVTktOT1dOXCJcbiAgICAgICAgfTtcbiAgICB9XG59O1xuXG5leHBvcnQgY29uc3QgUEkgPSAzLjE0MTU5MjY1MzU4OTc5MztcbmV4cG9ydCBjb25zdCBERUdfVE9fUkFEID0gMC4wMTc0NTMyOTI1MTk5NDtcbmV4cG9ydCBjb25zdCBSQURfVE9fREVHID0gNTcuMjk1Nzc5NTEzMDgyMzM7XG5leHBvcnQgY29uc3QgUElfMiA9IDEuNTcwNzk2MzI2Nzk0ODk2NjtcbmV4cG9ydCBjb25zdCBQSV80ID0gMC43ODUzOTgxNjMzOTc0NDg7XG5leHBvcnQgY29uc3QgUElfOCA9IDAuMzkyNjk5MDgxNjk4NzI0O1xuZXhwb3J0IGNvbnN0IFRXT19QSSA9IDYuMjgzMTg1MzA3MTc5NTg2O1xuZXhwb3J0IGNvbnN0IEVQU0lMT04gPSAwLjAwMDAwMDE7XG5cbi8vIERlZmF1bHQgYXJyYXk6IDMyIGJpdHNcbmV4cG9ydCBjb25zdCBOdW1lcmljQXJyYXkgPSBGbG9hdDMyQXJyYXk7XG5leHBvcnQgY29uc3QgTnVtZXJpY0FycmF5SGlnaFAgPSBGbG9hdDY0QXJyYXk7XG5leHBvcnQgY29uc3QgRkxPQVRfTUFYID0gMy40MDI4MjNlMzg7XG4iLCJcbmltcG9ydCB7XG4gICAgRVBTSUxPTixcbiAgICBERUdfVE9fUkFELFxuICAgIFJBRF9UT19ERUdcbn0gZnJvbSAnLi9jb25zdGFudHMnO1xuXG5sZXQgc19iZ19tYXRoX3NlZWQgPSBEYXRlLm5vdygpO1xuXG5leHBvcnQgY29uc3QgY2hlY2tQb3dlck9mVHdvID0gKG4pID0+IHtcbiAgICBpZiAodHlwZW9mIG4gIT09ICdudW1iZXInKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBuICYmIChuICYgKG4gLSAxKSkgPT09IDA7XG4gICAgfSAgXG59XG5cbmV4cG9ydCBjb25zdCBjaGVja1plcm8gPSAodikgPT4ge1xuICAgIHJldHVybiB2Pi1FUFNJTE9OICYmIHY8RVBTSUxPTiA/IDA6djtcbn1cblxuZXhwb3J0IGNvbnN0IGVxdWFscyA9IChhLGIpID0+IHtcbiAgICByZXR1cm4gTWF0aC5hYnMoYSAtIGIpIDwgRVBTSUxPTjtcbn1cblxuZXhwb3J0IGNvbnN0IGRlZ3JlZXNUb1JhZGlhbnMgPSAoZCkgPT4ge1xuICAgIHJldHVybiBNYXRoLmZyb3VuZChjaGVja1plcm8oZCAqIERFR19UT19SQUQpKTtcbn1cblxuZXhwb3J0IGNvbnN0IHJhZGlhbnNUb0RlZ3JlZXMgPSAocikgPT4ge1xuICAgIHJldHVybiBNYXRoLmZyb3VuZChjaGVja1plcm8ociAqIFJBRF9UT19ERUcpKTtcbn1cblxuZXhwb3J0IGNvbnN0IHNpbiA9ICh2YWwpID0+IHtcbiAgICByZXR1cm4gTWF0aC5mcm91bmQoY2hlY2taZXJvKE1hdGguc2luKHZhbCkpKTtcbn1cblxuZXhwb3J0IGNvbnN0IGNvcyA9ICh2YWwpID0+IHtcbiAgICByZXR1cm4gTWF0aC5mcm91bmQoY2hlY2taZXJvKE1hdGguY29zKHZhbCkpKTtcbn1cblxuZXhwb3J0IGNvbnN0IHRhbiA9ICh2YWwpID0+IHtcbiAgICByZXR1cm4gTWF0aC5mcm91bmQoY2hlY2taZXJvKE1hdGgudGFuKHZhbCkpKTtcbn1cblxuZXhwb3J0IGNvbnN0IGNvdGFuID0gKHZhbCkgPT4ge1xuICAgIHJldHVybiBNYXRoLmZyb3VuZChjaGVja1plcm8oMS4wIC8gdGFuKHZhbCkpKTtcbn1cblxuZXhwb3J0IGNvbnN0IGF0YW4gPSAodmFsKSA9PiB7XG4gICAgcmV0dXJuIE1hdGguZnJvdW5kKGNoZWNrWmVybyhNYXRoLmF0YW4odmFsKSkpO1xufVxuXG5leHBvcnQgY29uc3QgYXRhbjIgPSAoaSwgaikgPT4ge1xuICAgIHJldHVybiBNYXRoLmZyb3VuZChjaGVja1plcm8oTWF0aC5hdGFuMmYoaSwgaikpKTtcbn1cblxuZXhwb3J0IGNvbnN0IHJhbmRvbSA9ICgpID0+IHtcbiAgICByZXR1cm4gTWF0aC5yYW5kb20oKTtcbn1cblxuZXhwb3J0IGNvbnN0IHNlZWRlZFJhbmRvbSA9ICgpID0+IHtcbiAgICBjb25zdCBtYXggPSAxO1xuICAgIGNvbnN0IG1pbiA9IDA7XG4gXG4gICAgc19iZ19tYXRoX3NlZWQgPSAoc19iZ19tYXRoX3NlZWQgKiA5MzAxICsgNDkyOTcpICUgMjMzMjgwO1xuICAgIGNvbnN0IHJuZCA9IHNfYmdfbWF0aF9zZWVkIC8gMjMzMjgwO1xuIFxuICAgIHJldHVybiBtaW4gKyBybmQgKiAobWF4IC0gbWluKTtcbn1cblxuZXhwb3J0IGNvbnN0IG1heCA9IChhLGIpID0+IHtcbiAgICByZXR1cm4gTWF0aC5mcm91bmQoTWF0aC5tYXgoYSxiKSk7XG59XG5cbmV4cG9ydCBjb25zdCBtaW4gPSAoYSxiKSA9PiB7XG4gICAgcmV0dXJuIE1hdGguZnJvdW5kKE1hdGgubWluKGEsYikpO1xufVxuXG5leHBvcnQgY29uc3QgYWJzID0gKHZhbCkgPT4ge1xuICAgIHJldHVybiBNYXRoLmZyb3VuZChNYXRoLmFicyh2YWwpKTtcbn1cblxuZXhwb3J0IGNvbnN0IHNxcnQgPSAodmFsKSA9PiB7XG4gICAgcmV0dXJuIE1hdGguZnJvdW5kKE1hdGguc3FydCh2YWwpKTtcbn1cblxuZXhwb3J0IGNvbnN0IGxlcnAgPSAoZnJvbSwgdG8sIHQpID0+IHtcbiAgICByZXR1cm4gTWF0aC5mcm91bmQoKDEuMCAtIHQpICogZnJvbSArIHQgKiB0byk7XG59XG5cbmV4cG9ydCBjb25zdCBzcXVhcmUgPSAobikgPT4ge1xuICAgIHJldHVybiBNYXRoLmZyb3VuZChuICogbik7XG59XG4iLCJpbXBvcnQgeyBOdW1lcmljQXJyYXkgfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcblxuY29uc3QgY2hlY2tFcXVhbExlbmd0aCA9ICh2MSx2MikgPT4ge1xuICAgIGlmICh2MS5sZW5ndGghPXYyLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBsZW5ndGggaW4gb3BlcmF0aW9uYCk7XG59XG5cbmNsYXNzIFZlY3RvciBleHRlbmRzIE51bWVyaWNBcnJheSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICBpZiAoYXJndW1lbnRzWzBdIGluc3RhbmNlb2YgTnVtZXJpY0FycmF5ICYmIFxuICAgICAgICAgICAgICAgIGFyZ3VtZW50c1swXS5sZW5ndGggPT09IDIgJiZcbiAgICAgICAgICAgICAgICB0eXBlb2YoYXJndW1lbnRzWzFdKSA9PT0gXCJudW1iZXJcIlxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoWyBhcmd1bWVudHNbMF1bMF0sIGFyZ3VtZW50c1swXVsxXSwgYXJndW1lbnRzWzFdXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChhcmd1bWVudHNbMF0gaW5zdGFuY2VvZiBOdW1lcmljQXJyYXkgJiYgXG4gICAgICAgICAgICAgICAgYXJndW1lbnRzWzBdLmxlbmd0aCA9PT0gMyAmJlxuICAgICAgICAgICAgICAgIHR5cGVvZihhcmd1bWVudHNbMV0pID09PSBcIm51bWJlclwiXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBzdXBlcihbIGFyZ3VtZW50c1swXVswXSwgYXJndW1lbnRzWzBdWzFdLCBhcmd1bWVudHNbMF1bMl0sIGFyZ3VtZW50c1sxXV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mKGFyZ3VtZW50c1swXSkgPT09IFwibnVtYmVyXCIgJiZcbiAgICAgICAgICAgICAgICB0eXBlb2YoYXJndW1lbnRzWzFdKSA9PT0gXCJudW1iZXJcIlxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoW2FyZ3VtZW50c1swXSxhcmd1bWVudHNbMV1dKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICBpZiAoYXJndW1lbnRzWzBdIGluc3RhbmNlb2YgTnVtZXJpY0FycmF5ICYmXG4gICAgICAgICAgICAgICAgYXJndW1lbnRzWzBdLmxlbmd0aCA9PT0gMiAmJlxuICAgICAgICAgICAgICAgIHR5cGVvZihhcmd1bWVudHNbMV0pID09PSBcIm51bWJlclwiICYmIHR5cGVvZihhcmd1bWVudHNbMl0pID09PSBcIm51bWJlclwiXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBzdXBlcihbIGFyZ3VtZW50c1swXVswXSwgYXJndW1lbnRzWzBdWzFdLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXV0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh0eXBlb2YoYXJndW1lbnRzWzBdKSA9PT0gXCJudW1iZXJcIiAmJlxuICAgICAgICAgICAgICAgIHR5cGVvZihhcmd1bWVudHNbMV0pID09PSBcIm51bWJlclwiICYmXG4gICAgICAgICAgICAgICAgdHlwZW9mKGFyZ3VtZW50c1syXSkgPT09IFwibnVtYmVyXCJcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHN1cGVyKFthcmd1bWVudHNbMF0sYXJndW1lbnRzWzFdLGFyZ3VtZW50c1syXV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHN1cGVyKFthcmd1bWVudHNbMF0sYXJndW1lbnRzWzFdLGFyZ3VtZW50c1syXSxhcmd1bWVudHNbM11dKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICBpZiAoYXJndW1lbnRzWzBdIGluc3RhbmNlb2YgTnVtZXJpY0FycmF5ICYmXG4gICAgICAgICAgICAgICAgYXJndW1lbnRzWzBdLmxlbmd0aD4xICYmIGFyZ3VtZW50c1swXS5sZW5ndGg8NSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBzdXBlciguLi5hcmd1bWVudHNbMF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcGFyYW1ldGVycyBpbiBWZWN0b3IgY29uc3RydWN0b3JgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG5vcm1hbGl6ZSgpIHtcbiAgICAgICAgY29uc3QgbSA9IHRoaXMubWFnbml0dWRlKCk7XG4gICAgICAgIHN3aXRjaCAodGhpcy5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgdGhpc1szXSA9IHRoaXNbM10gLyBtO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICB0aGlzWzJdID0gdGhpc1syXSAvIG07XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHRoaXNbMV0gPSB0aGlzWzFdIC8gbTsgICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXNbMF0gPSB0aGlzWzBdIC8gbTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB0aGlzLmxlbmd0aCB9YCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgbWFnbml0dWRlKCkge1xuICAgICAgICBzd2l0Y2ggKHRoaXMubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnNxcnQodGhpc1swXSAqIHRoaXNbMF0gKyB0aGlzWzFdICogdGhpc1sxXSk7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnNxcnQodGhpc1swXSAqIHRoaXNbMF0gKyB0aGlzWzFdICogdGhpc1sxXSArIHRoaXNbMl0gKiB0aGlzWzJdKTtcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgcmV0dXJuIE1hdGguc3FydCh0aGlzWzBdICogdGhpc1swXSArIHRoaXNbMV0gKiB0aGlzWzFdICsgdGhpc1syXSAqIHRoaXNbMl0gKyB0aGlzWzNdICogdGhpc1szXSk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHRoaXMubGVuZ3RoIH1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzc2lnbihzcmMpIHtcbiAgICAgICAgY2hlY2tFcXVhbExlbmd0aCh0aGlzLHNyYyk7XG4gICAgICAgIHN3aXRjaCAodGhpcy5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgdGhpc1szXSA9IHNyY1szXTtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgdGhpc1syXSA9IHNyY1syXTtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgdGhpc1sxXSA9IHNyY1sxXTtcbiAgICAgICAgICAgIHRoaXNbMF0gPSBzcmNbMF07XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdGhpcy5sZW5ndGggfWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0KHgsIHksIHogPSBudWxsLCB3ID0gbnVsbCkge1xuICAgICAgICBpZiAodGhpcy5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgIHRoaXNbMF0gPSB4O1xuICAgICAgICAgICAgdGhpc1sxXSA9IHk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcy5sZW5ndGggPT09IDMgJiYgeiAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpc1swXSA9IHg7XG4gICAgICAgICAgICB0aGlzWzFdID0geTtcbiAgICAgICAgICAgIHRoaXNbMl0gPSB6O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMubGVuZ3RoID09PSA0ICYmIHcgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXNbMF0gPSB4O1xuICAgICAgICAgICAgdGhpc1sxXSA9IHk7XG4gICAgICAgICAgICB0aGlzWzJdID0gejtcbiAgICAgICAgICAgIHRoaXNbM10gPSB3O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB0aGlzLmxlbmd0aCB9LiBUcnlpbmcgdG8gc2V0IHg9JHt4fSwgeT0ke3l9LCB6PSR7en0sIHc9JHt3fWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2NhbGUocykge1xuICAgICAgICBzd2l0Y2ggKHRoaXMubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHRoaXNbM10gPSB0aGlzWzNdICogcztcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgdGhpc1syXSA9IHRoaXNbMl0gKiBzO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICB0aGlzWzFdID0gdGhpc1sxXSAqIHM7XG4gICAgICAgICAgICB0aGlzWzBdID0gdGhpc1swXSAqIHM7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdi5sZW5ndGggfWApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGdldCB4KCkge1xuICAgICAgICByZXR1cm4gdGhpc1swXTtcbiAgICB9XG5cbiAgICBnZXQgeSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMV07XG4gICAgfVxuXG4gICAgZ2V0IHooKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzJdO1xuICAgIH1cblxuICAgIGdldCB3KCkge1xuICAgICAgICByZXR1cm4gdGhpc1szXTtcbiAgICB9XG5cbiAgICBnZXQgeHkoKSB7XG4gICAgICAgIHN3aXRjaCAodGhpcy5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBWZWN0b3IodGhpcyk7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBWZWN0b3IodGhpc1swXSwgdGhpc1sxXSk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHRoaXMubGVuZ3RoIH1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCB4eigpIHtcbiAgICAgICAgc3dpdGNoICh0aGlzLmxlbmd0aCkge1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHJldHVybiBuZXcgVmVjdG9yKHRoaXNbMF0sIHRoaXNbMl0pO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHRoaXMubGVuZ3RoIH1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCB5eigpIHtcbiAgICAgICAgc3dpdGNoICh0aGlzLmxlbmd0aCkge1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHJldHVybiBuZXcgVmVjdG9yKHRoaXNbMV0sIHRoaXNbMl0pO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHRoaXMubGVuZ3RoIH1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCB4eXooKSB7XG4gICAgICAgIGlmICh0aGlzLmxlbmd0aCAhPT0gNCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB0aGlzLmxlbmd0aCB9YCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBWZWN0b3IodGhpc1swXSwgdGhpc1sxXSwgdGhpc1syXSk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgVmVjdG9yOiBWZWN0b3IsXG5cbiAgICB2ZWM6IHtcbiAgICAgICAgY2hlY2tFcXVhbExlbmd0aCh2MSx2Mikge1xuICAgICAgICAgICAgY2hlY2tFcXVhbExlbmd0aCh2MSx2Mik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbWF4VmVjdG9yKHYxLHYyKSB7XG4gICAgICAgICAgICB0aGlzLmNoZWNrRXF1YWxMZW5ndGgodjEsdjIpO1xuICAgICAgICAgICAgc3dpdGNoICh2MS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbXG4gICAgICAgICAgICAgICAgICAgIHYxWzBdPnYyWzBdID8gdjFbMF0gOiB2MlswXSxcbiAgICAgICAgICAgICAgICAgICAgdjFbMV0+djJbMV0gPyB2MVsxXSA6IHYyWzFdXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoW1xuICAgICAgICAgICAgICAgICAgICB2MVswXT52MlswXSA/IHYxWzBdIDogdjJbMF0sXG4gICAgICAgICAgICAgICAgICAgIHYxWzFdPnYyWzFdID8gdjFbMV0gOiB2MlsxXSxcbiAgICAgICAgICAgICAgICAgICAgdjFbMl0+djJbMl0gPyB2MVsyXSA6IHYyWzJdXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoW1xuICAgICAgICAgICAgICAgICAgICB2MVswXT52MlswXSA/IHYxWzBdIDogdjJbMF0sXG4gICAgICAgICAgICAgICAgICAgIHYxWzFdPnYyWzFdID8gdjFbMV0gOiB2MlsxXSxcbiAgICAgICAgICAgICAgICAgICAgdjFbMl0+djJbMl0gPyB2MVsyXSA6IHYyWzJdLFxuICAgICAgICAgICAgICAgICAgICB2MVszXT52MlszXSA/IHYxWzNdIDogdjJbM11cbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB2MS5sZW5ndGggfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG1pblZlY3Rvcih2MSx2Mikge1xuICAgICAgICAgICAgdGhpcy5jaGVja0VxdWFsTGVuZ3RoKHYxLHYyKTtcbiAgICAgICAgICAgIHN3aXRjaCAodjEubGVuZ3RoKSB7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoW1xuICAgICAgICAgICAgICAgICAgICB2MVswXTx2MlswXSA/IHYxWzBdIDogdjJbMF0sXG4gICAgICAgICAgICAgICAgICAgIHYxWzFdPHYyWzFdID8gdjFbMV0gOiB2MlsxXVxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFtcbiAgICAgICAgICAgICAgICAgICAgdjFbMF08djJbMF0gPyB2MVswXSA6IHYyWzBdLFxuICAgICAgICAgICAgICAgICAgICB2MVsxXTx2MlsxXSA/IHYxWzFdIDogdjJbMV0sXG4gICAgICAgICAgICAgICAgICAgIHYxWzJdPHYyWzJdID8gdjFbMl0gOiB2MlsyXVxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFtcbiAgICAgICAgICAgICAgICAgICAgdjFbMF08djJbMF0gPyB2MVswXSA6IHYyWzBdLFxuICAgICAgICAgICAgICAgICAgICB2MVsxXTx2MlsxXSA/IHYxWzFdIDogdjJbMV0sXG4gICAgICAgICAgICAgICAgICAgIHYxWzJdPHYyWzJdID8gdjFbMl0gOiB2MlsyXSxcbiAgICAgICAgICAgICAgICAgICAgdjFbM108djJbM10gPyB2MVszXSA6IHYyWzNdXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdjEubGVuZ3RoIH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBhZGQodjEsdjIpIHtcbiAgICAgICAgICAgIHRoaXMuY2hlY2tFcXVhbExlbmd0aCh2MSx2Mik7XG4gICAgICAgICAgICBzd2l0Y2ggKHYxLmxlbmd0aCkge1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFtcbiAgICAgICAgICAgICAgICAgICAgdjFbMF0gKyB2MlswXSxcbiAgICAgICAgICAgICAgICAgICAgdjFbMV0gKyB2MlsxXVxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFtcbiAgICAgICAgICAgICAgICAgICAgdjFbMF0gKyB2MlswXSxcbiAgICAgICAgICAgICAgICAgICAgdjFbMV0gKyB2MlsxXSxcbiAgICAgICAgICAgICAgICAgICAgdjFbMl0gKyB2MlsyXVxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFtcbiAgICAgICAgICAgICAgICAgICAgdjFbMF0gKyB2MlswXSxcbiAgICAgICAgICAgICAgICAgICAgdjFbMV0gKyB2MlsxXSxcbiAgICAgICAgICAgICAgICAgICAgdjFbMl0gKyB2MlsyXSxcbiAgICAgICAgICAgICAgICAgICAgdjFbM10gKyB2MlszXVxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYxLmxlbmd0aCB9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3ViKHYxLHYyKSB7XG4gICAgICAgICAgICB0aGlzLmNoZWNrRXF1YWxMZW5ndGgodjEsdjIpO1xuICAgICAgICAgICAgc3dpdGNoICh2MS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbXG4gICAgICAgICAgICAgICAgICAgIHYxWzBdIC0gdjJbMF0sXG4gICAgICAgICAgICAgICAgICAgIHYxWzFdIC0gdjJbMV1cbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbXG4gICAgICAgICAgICAgICAgICAgIHYxWzBdIC0gdjJbMF0sXG4gICAgICAgICAgICAgICAgICAgIHYxWzFdIC0gdjJbMV0sXG4gICAgICAgICAgICAgICAgICAgIHYxWzJdIC0gdjJbMl1cbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbXG4gICAgICAgICAgICAgICAgICAgIHYxWzBdIC0gdjJbMF0sXG4gICAgICAgICAgICAgICAgICAgIHYxWzFdIC0gdjJbMV0sXG4gICAgICAgICAgICAgICAgICAgIHYxWzJdIC0gdjJbMl0sXG4gICAgICAgICAgICAgICAgICAgIHYxWzNdIC0gdjJbM11cbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB2MS5sZW5ndGggfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG1hZ25pdHVkZSh2KSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHYubGVuZ3RoKSB7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGguc3FydCh2WzBdICogdlswXSArIHZbMV0gKiB2WzFdKTtcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KHZbMF0gKiB2WzBdICsgdlsxXSAqIHZbMV0gKyB2WzJdICogdlsyXSk7XG4gICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGguc3FydCh2WzBdICogdlswXSArIHZbMV0gKiB2WzFdICsgdlsyXSAqIHZbMl0gKyB2WzNdICogdlszXSk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdi5sZW5ndGggfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGRpc3RhbmNlKHYxLHYyKSB7XG4gICAgICAgICAgICB0aGlzLmNoZWNrRXF1YWxMZW5ndGgodjEsdjIpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubWFnbml0dWRlKHRoaXMuc3ViKHYxLHYyKSk7XG4gICAgICAgIH0sXG4gICAgXG4gICAgICAgIGRvdCh2MSx2Mikge1xuICAgICAgICAgICAgdGhpcy5jaGVja0VxdWFsTGVuZ3RoKHYxLHYyKTtcbiAgICAgICAgICAgIHN3aXRjaCAodjEubGVuZ3RoKSB7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHYxWzBdICogdjJbMF0gKyB2MVsxXSAqIHYyWzFdO1xuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgIHJldHVybiB2MVswXSAqIHYyWzBdICsgdjFbMV0gKiB2MlsxXSArIHYxWzJdICogdjJbMl07XG4gICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHYxWzBdICogdjJbMF0gKyB2MVsxXSAqIHYyWzFdICsgdjFbMl0gKiB2MlsyXSArIHYxWzNdICogdjJbM107XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdjEubGVuZ3RoIH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICBcbiAgICAgICAgY3Jvc3ModjEsdjIpIHtcbiAgICAgICAgICAgIHRoaXMuY2hlY2tFcXVhbExlbmd0aCh2MSx2Mik7XG4gICAgICAgICAgICBzd2l0Y2ggKHYxLmxlbmd0aCkge1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIHJldHVybiB2MVswXSAqIHYyWzFdIC0gdjFbMV0gLSB2MlswXTtcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbXG4gICAgICAgICAgICAgICAgICAgIHYxWzFdICogdjJbMl0gLSB2MVsyXSAqIHYyWzFdLFxuICAgICAgICAgICAgICAgICAgICB2MVsyXSAqIHYyWzBdIC0gdjFbMF0gKiB2MlsyXSxcbiAgICAgICAgICAgICAgICAgICAgdjFbMF0gKiB2MlsxXSAtIHYxWzFdICogdjJbMF0sXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZSBmb3IgY3Jvc3MgcHJvZHVjdDogJHsgdjEubGVuZ3RoIH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBnZXROb3JtYWxpemVkKHYpIHtcbiAgICAgICAgICAgIGNvbnN0IG0gPSB0aGlzLm1hZ25pdHVkZSh2KTtcbiAgICAgICAgICAgIHN3aXRjaCAodi5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbIHZbMF0gLyBtLCB2WzFdIC8gbSBdKTtcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbIHZbMF0gLyBtLCB2WzFdIC8gbSwgdlsyXSAvIG0gXSk7XG4gICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoWyB2WzBdIC8gbSwgdlsxXSAvIG0sIHZbMl0gLyBtLCB2WzNdIC8gbSBdKVxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYubGVuZ3RoIH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBtdWx0KHYscykge1xuICAgICAgICAgICAgc3dpdGNoICh2Lmxlbmd0aCkge1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFsgdlswXSAqIHMsIHZbMV0gKiBzIF0pO1xuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFsgdlswXSAqIHMsIHZbMV0gKiBzLCB2WzJdICogcyBdKTtcbiAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbIHZbMF0gKiBzLCB2WzFdICogcywgdlsyXSAqIHMsIHZbM10gKiBzIF0pO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYubGVuZ3RoIH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBkaXYodixzKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHYubGVuZ3RoKSB7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoWyB2WzBdIC8gcywgdlsxXSAvIHMgXSk7XG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoWyB2WzBdIC8gcywgdlsxXSAvIHMsIHZbMl0gLyBzIF0pO1xuICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFsgdlswXSAvIHMsIHZbMV0gLyBzLCB2WzJdIC8gcywgdlszXSAvIHMgXSk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdi5sZW5ndGggfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGVxdWFscyh2MSx2Mikge1xuICAgICAgICAgICAgaWYgKHYxLmxlbmd0aCAhPSB2Mi5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHYxLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHYxWzBdID09PSB2MlswXSAmJiB2MVsxXSA9PT0gdjJbMV07XG4gICAgICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdjFbMF0gPT09IHYyWzBdICYmIHYxWzFdID09PSB2MlsxXSAmJiB2MVsyXSA9PT0gdjJbMl07XG4gICAgICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdjFbMF0gPT09IHYyWzBdICYmIHYxWzFdID09PSB2MlsxXSAmJiB2MVsyXSA9PT0gdjJbMl0gJiYgdjFbM10gPT09IHYyWzNdO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdjEubGVuZ3RoIH1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgYXNzaWduKGRzdCxzcmMpIHtcbiAgICAgICAgICAgIHRoaXMuY2hlY2tFcXVhbExlbmd0aChkc3Qsc3JjKTtcbiAgICAgICAgICAgIHN3aXRjaCAoZHN0Lmxlbmd0aCkge1xuICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICAgIGRzdFszXSA9IHNyY1szXTtcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICBkc3RbMl0gPSBzcmNbMl07XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgZHN0WzFdID0gc3JjWzFdO1xuICAgICAgICAgICAgICAgIGRzdFswXSA9IHNyY1swXTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyBkc3QubGVuZ3RoIH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzZXQodiwgeCwgeSwgeiA9IG51bGwsIHcgPSBudWxsKSB7XG4gICAgICAgICAgICBpZiAodi5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgICAgICB2WzBdID0geDtcbiAgICAgICAgICAgICAgICB2WzFdID0geTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHYubGVuZ3RoID09PSAzICYmIHogIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB2WzBdID0geDtcbiAgICAgICAgICAgICAgICB2WzFdID0geTtcbiAgICAgICAgICAgICAgICB2WzJdID0gejtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHYubGVuZ3RoID09PSA0ICYmIHcgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB2WzBdID0geDtcbiAgICAgICAgICAgICAgICB2WzFdID0geTtcbiAgICAgICAgICAgICAgICB2WzJdID0gejtcbiAgICAgICAgICAgICAgICB2WzNdID0gdztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdi5sZW5ndGggfS4gVHJ5aW5nIHRvIHNldCB4PSR7eH0sIHk9JHt5fSwgej0ke3p9LCB3PSR7d31gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBpc05hTih2KSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHYubGVuZ3RoKSB7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlzTmFOKHZbMF0pIHx8IGlzTmFOKHZbMV0pO1xuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgIHJldHVybiBpc05hTih2WzBdKSB8fCBpc05hTih2WzFdKSB8fCBpc05hTih2WzJdKTtcbiAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICByZXR1cm4gaXNOYU4odlswXSkgfHwgaXNOYU4odlsxXSkgfHwgaXNOYU4odlsyXSkgfHwgaXNOYU4odlszXSk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdi5sZW5ndGggfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHh5KHYpIHtcbiAgICAgICAgICAgIHN3aXRjaCAodi5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFZlY3Rvcih2KTtcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFZlY3Rvcih2WzBdLCB2WzFdKTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB2Lmxlbmd0aCB9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgeHoodikge1xuICAgICAgICAgICAgc3dpdGNoICh2Lmxlbmd0aCkge1xuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVmVjdG9yKHZbMF0sIHZbMl0pO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYubGVuZ3RoIH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB5eih2KSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHYubGVuZ3RoKSB7XG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBWZWN0b3IodlsxXSwgdlsyXSk7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdi5sZW5ndGggfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHh5eih2KSB7XG4gICAgICAgICAgICBpZiAodi5sZW5ndGggIT09IDQpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYubGVuZ3RoIH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBuZXcgVmVjdG9yKHZbMF0sdlsxXSx2WzJdKTtcbiAgICAgICAgfVxuICAgIH0gICAgXG59XG5cbiIsImltcG9ydCB7IE51bWVyaWNBcnJheSB9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuaW1wb3J0IFZlY3RvclV0aWxzIGZyb20gXCIuL1ZlY3RvclwiO1xuXG5jb25zdCBWZWN0b3IgPSBWZWN0b3JVdGlscy5WZWN0b3I7XG5jb25zdCB2ZWMgPSBWZWN0b3JVdGlscy52ZWM7XG5cbmNsYXNzIE1hdHJpeDMgZXh0ZW5kcyBOdW1lcmljQXJyYXkge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gOSkge1xuICAgICAgICAgICAgc3VwZXIoYXJndW1lbnRzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxICYmIGFyZ3VtZW50c1swXS5sZW5ndGggPT09IDkpIHtcbiAgICAgICAgICAgIHN1cGVyKGFyZ3VtZW50c1swXSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgc3VwZXIoWzAsMCwwLDAsMCwwLDAsMCwwXSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcGFyYW1ldGVyIHNpemUgaW4gTWF0cml4MyBjb25zdHJ1Y3RvcmApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWRlbnRpdHkoKSB7XG4gICAgICAgIHRoaXNbMF0gPSAxOyB0aGlzWzFdID0gMDsgdGhpc1syXSA9IDA7XG4gICAgICAgIHRoaXNbM10gPSAwOyB0aGlzWzRdID0gMTsgdGhpc1s1XSA9IDA7XG4gICAgICAgIHRoaXNbNl0gPSAwOyB0aGlzWzddID0gMDsgdGhpc1s4XSA9IDE7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHplcm8oKSB7XG4gICAgICAgIHRoaXNbMF0gPSAwOyB0aGlzWzFdID0gMDsgdGhpc1syXSA9IDA7XG4gICAgICAgIHRoaXNbM10gPSAwOyB0aGlzWzRdID0gMDsgdGhpc1s1XSA9IDA7XG4gICAgICAgIHRoaXNbNl0gPSAwOyB0aGlzWzddID0gMDsgdGhpc1s4XSA9IDA7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHJvdyhpKSB7XG4gICAgICAgIHJldHVybiBuZXcgVmVjdG9yKFxuICAgICAgICAgICAgdGhpc1tpICogM10sIFxuICAgICAgICAgICAgdGhpc1tpICogMyArIDFdLFxuICAgICAgICAgICAgdGhpc1sgaSogMyArIDJdKTtcbiAgICB9XG5cbiAgICBzZXRSb3coaSwgYSwgeSA9IG51bGwsIHogPSBudWxsKSB7XG4gICAgICAgIGlmIChhIGluc3RhbmNlb2YgTnVtZXJpY0FycmF5ICYmIGEubGVuZ3RoPj0zKSB7XG4gICAgICAgICAgICB0aGlzW2kgKiAzXSAgICAgID0gYVswXTtcbiAgICAgICAgICAgIHRoaXNbaSAqIDMgKyAxXSAgPSBhWzFdO1xuICAgICAgICAgICAgdGhpc1tpICogMyArIDJdICA9IGFbMl07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mKGEpID09PSBcIm51bWJlclwiICYmIFxuICAgICAgICAgICAgdHlwZW9mKHkpID09PSBcIm51bWJlclwiICYmIFxuICAgICAgICAgICAgdHlwZW9mKHopID09PSBcIm51bWJlclwiXG4gICAgICAgICkge1xuICAgICAgICAgICAgdGhpc1tpICogM10gICAgICA9IGE7XG4gICAgICAgICAgICB0aGlzW2kgKiAzICsgMV0gID0geTtcbiAgICAgICAgICAgIHRoaXNbaSAqIDMgKyAyXSAgPSB6O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHBhcmFtZXRlciBzZXR0aW5nIG1hdHJpeCByb3dgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjb2woaSkge1xuICAgICAgICByZXR1cm4gbmV3IFZlY3RvcihcbiAgICAgICAgICAgIHRoaXNbaV0sXG4gICAgICAgICAgICB0aGlzW2kgKyAzXSxcbiAgICAgICAgICAgIHRoaXNbaSArIDMgKiAyXVxuICAgICAgICApXG4gICAgfVxuXG4gICAgc2V0Q29sKGksIGEsIHkgPSBudWxsLCB6ID0gbnVsbCkge1xuICAgICAgICBpZiAoYSBpbnN0YW5jZW9mIE51bWVyaWNBcnJheSAmJiBhLmxlbmd0aD49Mykge1xuICAgICAgICAgICAgdGhpc1tpXSAgICAgICAgID0gYVswXTtcbiAgICAgICAgICAgIHRoaXNbaSArIDNdICAgICA9IGFbMV07XG4gICAgICAgICAgICB0aGlzW2kgKyAzICogMl0gPSBhWzJdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZihhKSA9PT0gXCJudW1iZXJcIiAmJiBcbiAgICAgICAgICAgIHR5cGVvZih5KSA9PT0gXCJudW1iZXJcIiAmJiBcbiAgICAgICAgICAgIHR5cGVvZih6KSA9PT0gXCJudW1iZXJcIlxuICAgICAgICApIHtcbiAgICAgICAgICAgIHRoaXNbaV0gICAgICAgICA9IGE7XG4gICAgICAgICAgICB0aGlzW2kgKyAzXSAgICAgPSB5O1xuICAgICAgICAgICAgdGhpc1tpICsgMyAqIDJdID0gejtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBwYXJhbWV0ZXIgc2V0dGluZyBtYXRyaXggcm93YCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgYXNzaWduKG0pIHtcbiAgICAgICAgaWYgKG0ubGVuZ3RoID09PSA5KSB7XG4gICAgICAgICAgICB0aGlzWzBdID0gbVswXTsgdGhpc1sxXSA9IG1bMV07IHRoaXNbMl0gPSBtWzJdO1xuXHRcdFx0dGhpc1szXSA9IG1bM107IHRoaXNbNF0gPSBtWzRdOyB0aGlzWzVdID0gbVs1XTtcblx0XHRcdHRoaXNbNl0gPSBtWzZdOyB0aGlzWzddID0gbVs3XTsgdGhpc1s4XSA9IG1bOF07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobS5sZW5ndGggPT09IDE2KSB7XG4gICAgICAgICAgICB0aGlzWzBdID0gbVswXTsgdGhpc1sxXSA9IG1bMV07IHRoaXNbMl0gPSBtWzJdO1xuXHRcdFx0dGhpc1szXSA9IG1bNF07IHRoaXNbNF0gPSBtWzVdOyB0aGlzWzVdID0gbVs2XTtcblx0XHRcdHRoaXNbNl0gPSBtWzhdOyB0aGlzWzddID0gbVs5XTsgdGhpc1s4XSA9IG1bMTBdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHBsYXJhbWV0ZXIgc2V0dGluZyBtYXRyaXggZGF0YWApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHNldFNjYWxlKHgseSx6KSB7IFxuXHRcdGNvbnN0IHJ4ID0gKG5ldyBWZWN0b3IodGhpc1swXSwgdGhpc1szXSwgdGhpc1s2XSkpLm5vcm1hbGl6ZSgpLnNjYWxlKHgpO1xuXHRcdGNvbnN0IHJ5ID0gKG5ldyBWZWN0b3IodGhpc1sxXSwgdGhpc1s0XSwgdGhpc1s3XSkpLm5vcm1hbGl6ZSgpLnNjYWxlKHkpO1xuXHRcdGNvbnN0IHJ6ID0gKG5ldyBWZWN0b3IodGhpc1syXSwgdGhpc1s1XSwgdGhpc1s4XSkpLm5vcm1hbGl6ZSgpLnNjYWxlKHopO1xuXHRcdHRoaXNbMF0gPSByeC54OyB0aGlzWzNdID0gcngueTsgdGhpc1s2XSA9IHJ4Lno7XG5cdFx0dGhpc1sxXSA9IHJ5Lng7IHRoaXNbNF0gPSByeS55OyB0aGlzWzddID0gcnkuejtcblx0XHR0aGlzWzJdID0gcnoueDsgdGhpc1s1XSA9IHJ6Lnk7IHRoaXNbOF0gPSByei56O1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cbiAgICB0cmFzcG9zZSgpIHtcbiAgICAgICAgY29uc3QgbTMgPSB0aGlzWzNdOyAgLy8gMCwgMSwgMlxuICAgICAgICBjb25zdCBtNyA9IHRoaXNbN107ICAvLyAzLCA0LCA1XG4gICAgICAgIGNvbnN0IG02ID0gdGhpc1s2XTsgIC8vIDYsIDcsIDhcbiAgICAgICAgdGhpc1szXSA9IHRoaXNbMV07XG4gICAgICAgIHRoaXNbNl0gPSB0aGlzWzJdO1xuICAgICAgICB0aGlzWzddID0gdGhpc1s1XTtcbiAgICAgICAgdGhpc1sxXSA9IG0zO1xuICAgICAgICB0aGlzWzJdID0gbTY7XG4gICAgICAgIHRoaXNbNV0gPSBtNztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgbXVsdChhKSB7XG4gICAgICAgIGlmICh0eXBlb2YoYSkgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgIHRoaXNbMF0gKj0gYTsgdGhpc1sxXSAqPSBhOyB0aGlzWzJdICo9IGE7XG4gICAgICAgICAgICB0aGlzWzNdICo9IGE7IHRoaXNbNF0gKj0gYTsgdGhpc1s1XSAqPSBhO1xuICAgICAgICAgICAgdGhpc1s2XSAqPSBhOyB0aGlzWzddICo9IGE7IHRoaXNbOF0gKj0gYTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChhIGluc3RhbmNlb2YgTnVtZXJpY0FycmF5ICYmIGEubGVuZ3RoID09PSA5KSB7XG4gICAgICAgICAgICBjb25zdCByMCA9IHRoaXMucm93KDApO1xuICAgICAgICAgICAgY29uc3QgcjEgPSB0aGlzLnJvdygxKTtcbiAgICAgICAgICAgIGNvbnN0IHIyID0gdGhpcy5yb3coMik7XG4gICAgICAgICAgICBjb25zdCBjMCA9IGEuY29sKDApO1xuICAgICAgICAgICAgY29uc3QgYzEgPSBhLmNvbCgxKTtcbiAgICAgICAgICAgIGNvbnN0IGMyID0gYS5jb2woMik7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXNbMF0gPSB2ZWMuZG90KHIwLGMwKTsgdGhpc1sxXSA9IHZlYy5kb3QocjAsYzEpOyB0aGlzWzJdID0gdmVjLmRvdChyMCxjMik7XG4gICAgICAgICAgICB0aGlzWzNdID0gdmVjLmRvdChyMSxjMCk7IHRoaXNbNF0gPSB2ZWMuZG90KHIxLGMxKTsgdGhpc1s1XSA9IHZlYy5kb3QocjEsYzIpO1xuICAgICAgICAgICAgdGhpc1s2XSA9IHZlYy5kb3QocjIsYzApOyB0aGlzWzddID0gdmVjLmRvdChyMixjMSk7IHRoaXNbOF0gPSB2ZWMuZG90KHIyLGMyKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBwYXJhbWV0ZXIgaW4gTWF0cml4My5tdWx0KClgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBtdWx0VmVjdG9yKHYpIHtcbiAgICAgICAgaWYgKHYubGVuZ3RoID09PSAyIHx8IHYubGVuZ3RoID09PSAzKSB7XG4gICAgICAgICAgICBjb25zdCB4ID0gdlswXTtcbiAgICAgICAgICAgIGNvbnN0IHkgPSB2WzFdO1xuICAgICAgICAgICAgY29uc3QgeiA9IHYubGVuZ3RoID09PSAyID8gMSA6IHZbMl07XG4gICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIG5ldyBWZWN0b3IoXHR0aGlzWzBdICogeCArIHRoaXNbM10gKiB5ICsgdGhpc1s2XSAqIHosXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNbMV0gKiB4ICsgdGhpc1s0XSAqIHkgKyB0aGlzWzddICogeixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpc1syXSAqIHggKyB0aGlzWzVdICogeSArIHRoaXNbOF0gKiB6KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBwYXJhbWV0ZXIgaW4gTWF0cml4My5tdWx0VmVjdG9yKClgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gIGBbICR7dGhpc1swXX0sICR7dGhpc1sxXX0sICR7dGhpc1syXX1cXG5gICtcbiAgICAgICAgICAgICAgICBgICAke3RoaXNbM119LCAke3RoaXNbNF19LCAke3RoaXNbNV19XFxuYCArXG4gICAgICAgICAgICAgICAgYCAgJHt0aGlzWzZdfSwgJHt0aGlzWzddfSwgJHt0aGlzWzhdfSBdYDtcbiAgICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgTWF0cml4MzogTWF0cml4MyxcblxuICAgIG1hdDM6IHtcbiAgICAgICAgaWRlbnRpdHkoKSB7XG4gICAgICAgICAgICBjb25zdCBtID0gbmV3IE1hdHJpeDMoKTtcbiAgICAgICAgICAgIHJldHVybiBtLmlkZW50aXR5KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgemVybygpIHtcbiAgICAgICAgICAgIGNvbnN0IG0gPSBuZXcgTWF0cml4MygpO1xuICAgICAgICAgICAgcmV0dXJuIG0uemVybygpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGlzWmVybyhtKSB7XG4gICAgICAgICAgICByZXR1cm5cdHZbMF09PTAgJiYgdlsxXT09MC4wICYmIHZbMl09PTAuMCAmJlxuICAgICAgICAgICAgICAgICAgICB2WzNdPT0wICYmIHZbNF09PTAuMCAmJiB2WzVdPT0wLjAgJiZcbiAgICAgICAgICAgICAgICAgICAgdls2XT09MCAmJiB2WzddPT0wLjAgJiYgdls4XT09MC4wO1xuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgaXNJZGVudGl0eShtKSB7XG4gICAgICAgICAgICByZXR1cm5cdHZbMF09PTEuMCAmJiB2WzFdPT0wLjAgJiYgdlsyXT09MC4wICYmXG4gICAgICAgICAgICAgICAgICAgIHZbM109PTAuMCAmJiB2WzRdPT0xLjAgJiYgdls1XT09MC4wICYmXG4gICAgICAgICAgICAgICAgICAgIHZbNl09PTAuMCAmJiB2WzddPT0wLjAgJiYgdls4XT09MS4wO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFNjYWxlKG0pIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgVmVjdG9yKFxuICAgICAgICAgICAgICAgIHZlYy5tYWduaXR1ZGUobmV3IFZlY3RvcihtWzBdLCBtWzNdLCBtWzZdKSksXG4gICAgICAgICAgICAgICAgdmVjLm1hZ25pdHVkZShuZXcgVmVjdG9yKG1bMV0sIG1bNF0sIG1bN10pKSxcbiAgICAgICAgICAgICAgICB2ZWMubWFnbml0dWRlKG5ldyBWZWN0b3IobVsyXSwgbVs1XSwgbVs4XSkpXG4gICAgICAgICAgICApO1xuICAgICAgICB9LFxuXG4gICAgICAgIGVxdWFscyhhLGIpIHtcbiAgICAgICAgICAgIHJldHVyblx0YVswXSA9PSBiWzBdICYmIGFbMV0gPT0gYlsxXSAgJiYgYVsyXSA9PSBiWzJdICYmXG5cdFx0XHRcdCAgICBhWzNdID09IGJbM10gJiYgYVs0XSA9PSBiWzRdICAmJiBhWzVdID09IGJbNV0gJiZcblx0XHRcdFx0ICAgIGFbNl0gPT0gYls2XSAmJiBhWzddID09IGJbN10gICYmIGFbOF0gPT0gYls4XTtcbiAgICAgICAgfSxcblxuICAgICAgICBpc05hTihtKSB7XG4gICAgICAgICAgICByZXR1cm5cdGlzTmFOKG1bMF0pIHx8IGlzTmFOKG1bMV0pIHx8IGlzTmFOKG1bMl0pICYmXG5cdFx0XHRcdCAgICBpc05hTihtWzNdKSB8fCBpc05hTihtWzRdKSB8fCBpc05hTihtWzVdKSAmJlxuXHRcdFx0XHQgICAgaXNOYU4obVs2XSkgfHwgaXNOYU4obVs3XSkgfHwgaXNOYU4obVs4XSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJcbmltcG9ydCB7XG4gICAgQXhpcyxcbiAgICBQSSxcbiAgICBERUdfVE9fUkFELFxuICAgIFJBRF9UT19ERUcsXG4gICAgUElfMixcbiAgICBQSV80LFxuICAgIFBJXzgsXG4gICAgVFdPX1BJLFxuICAgIEVQU0lMT04sXG4gICAgTnVtZXJpY0FycmF5LFxuICAgIE51bWVyaWNBcnJheUhpZ2hQLFxuICAgIEZMT0FUX01BWFxufSBmcm9tIFwiLi9jb25zdGFudHNcIjtcblxuaW1wb3J0IHtcbiAgICBjaGVja1Bvd2VyT2ZUd28sXG4gICAgY2hlY2taZXJvLFxuICAgIGVxdWFscyxcbiAgICBkZWdyZWVzVG9SYWRpYW5zLFxuICAgIHJhZGlhbnNUb0RlZ3JlZXMsXG4gICAgc2luLFxuICAgIGNvcyxcbiAgICB0YW4sXG4gICAgY290YW4sXG4gICAgYXRhbixcbiAgICBhdGFuMixcbiAgICByYW5kb20sXG4gICAgc2VlZGVkUmFuZG9tLFxuICAgIG1heCxcbiAgICBtaW4sXG4gICAgYWJzLFxuICAgIHNxcnQsXG4gICAgbGVycCxcbiAgICBzcXVhcmVcbn0gZnJvbSBcIi4vZnVuY3Rpb25zXCI7XG5cbmltcG9ydCBWZWN0b3JVdGlscyBmcm9tICcuL1ZlY3Rvcic7XG5cbmltcG9ydCBNYXRyaXgzVXRpbHMgZnJvbSBcIi4vTWF0cml4M1wiO1xuXG5leHBvcnQgY29uc3QgbWF0aCA9IHtcbiAgICBBeGlzLFxuICAgIFBJLFxuICAgIERFR19UT19SQUQsXG4gICAgUkFEX1RPX0RFRyxcbiAgICBQSV8yLFxuICAgIFBJXzQsXG4gICAgUElfOCxcbiAgICBUV09fUEksXG4gICAgRVBTSUxPTixcbiAgICBOdW1lcmljQXJyYXksXG4gICAgTnVtZXJpY0FycmF5SGlnaFAsXG4gICAgRkxPQVRfTUFYLFxuXG4gICAgY2hlY2tQb3dlck9mVHdvLFxuICAgIGNoZWNrWmVybyxcbiAgICBlcXVhbHMsXG4gICAgZGVncmVlc1RvUmFkaWFucyxcbiAgICByYWRpYW5zVG9EZWdyZWVzLFxuICAgIHNpbixcbiAgICBjb3MsXG4gICAgdGFuLFxuICAgIGNvdGFuLFxuICAgIGF0YW4sXG4gICAgYXRhbjIsXG4gICAgcmFuZG9tLFxuICAgIHNlZWRlZFJhbmRvbSxcbiAgICBtYXgsXG4gICAgbWluLFxuICAgIGFicyxcbiAgICBzcXJ0LFxuICAgIGxlcnAsXG4gICAgc3F1YXJlXG59O1xuXG5leHBvcnQgY29uc3QgVmVjdG9yID0gVmVjdG9yVXRpbHMuVmVjdG9yO1xuZXhwb3J0IGNvbnN0IHZlYyA9IFZlY3RvclV0aWxzLnZlYztcbmV4cG9ydCBjb25zdCBNYXRyaXgzID0gTWF0cml4M1V0aWxzLk1hdHJpeDM7XG5leHBvcnQgY29uc3QgbWF0MyA9IE1hdHJpeDNVdGlscy5tYXQzO1xuIl0sIm5hbWVzIjpbIlZlY3RvciIsInZlYyIsIk1hdHJpeDMiXSwibWFwcGluZ3MiOiJBQUNPLE1BQU0sSUFBSSxHQUFHO0FBQ3BCLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDUixDQUFDLENBQUMsRUFBRSxD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Q0FBQyxjQUFjLEdBQUcsSUFBSSxHQUFHLEtBQUssSUFBSSxNQUFNLENBQUM7QUFDOUQsSUFBSSxNQUFNLEdBQUcsR0FBRyxjQUFjLEdBQUcsTUFBTSxDQUFDO0FBQ3hDO0FBQ0EsSUFBSSxPQUFPLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ25DLEVBQUM7QUFDRDtBQUNPLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSztBQUM1QixJQUFJLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3RDLEVBQUM7QUFDRDtBQUNPLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSztBQUM1QixJQUFJLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3RDLEVBQUM7QUFDRDtBQUNPLE1BQU0sR0FBRyxHQUFHLENBQUMsR0FBRyxLQUFLO0FBQzVCLElBQUksT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN0QyxFQUFDO0FBQ0Q7QUFDTyxNQUFNLElBQUksR0FBRyxDQUFDLEdBQUcsS0FBSztBQUM3QixJQUFJLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsRUFBQztBQUNEO0FBQ08sTUFBTSxJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUMsS0FBSztBQUNyQyxJQUFJLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztBQUNsRCxFQUFDO0FBQ0Q7QUFDTyxNQUFNLE1B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LENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVHLFFBQVE7QUFDUixZQUFZLE1BQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3JFLFNBQVM7QUFDVCxLQUFLO0FBQ0w7QUFDQSxJQUFJLE1BQU0sQ0FBQyxHQUFHLEVBQUU7QUFDaEIsUUFBUSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbkMsUUFBUSxRQUFRLElBQUksQ0FBQyxNQUFNO0FBQzNCLFFBQVEsS0FBSyxDQUFDO0FBQ2QsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdCLFFBQVEsS0FBSyxDQUFDO0FBQ2QsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdCLFFBQVEsS0FBSyxDQUFDO0FBQ2QsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdCLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM3QixZQUFZLE1BQU07QUFDbEIsUUFBUTtBQUNSLFlBQVksTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDckUsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNBLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEdBQUcsSUFBSSxFQUFFO0FBQ2xDLFFBQVEsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUMvQixZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDeEIsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3hCLFNBQVM7QUFDVCxhQUFhLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksRUFBRTtBQUNsRCxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDeEIsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3hCLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN4QixTQUFTO0FBQ1QsYUFBYSxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLEVBQUU7QUFDbEQsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3hCLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN4QixZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDeEIsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3hCLFNBQVM7QUFDVCxhQUFhO0FBQ2IsWUFBWSxNQUFNLElBQUksS0FBSyxDQUFDLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxrQkFBa0IsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkgsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNBLElBQUksS0FBSyxDQUFDLENBQUMsRUFBRTtBQUNiLFFBQVEsUUFBUSxJQUFJLENBQUMsTUFBTTtBQUMzQixRQUFRLEtBQUssQ0FBQztBQUNkLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbEMsUUFBUSxLQUFLLENBQUM7QUFDZCxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2xDLFFBQVEsS0FBSyxDQUFDO0FBQ2QsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNsQyxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2xDLFlBQVksTUFBTTtBQUNsQixRQUFRO0FBQ1IsWUFBWSxNQUFNLElBQUksS0FBSyxDQUFDLENBQUMscUJBQXFCLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNsRSxTQUFTO0FBQ1QsUUFBUSxPQUFPLElBQUksQ0FBQztBQUNwQixLQUFLO0FBQ0w7QUFDQSxJQUFJLElBQUksQ0FBQyxHQUFHO0FBQ1osUUFBUSxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QixLQUFLO0FBQ0w7QUFDQSxJQUFJLElBQUksQ0FBQyxHQUFHO0FBQ1osUUFBUSxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QixLQUFLO0FBQ0w7QUFDQSxJQUFJLElBQUksQ0FBQyxHQUFHO0FBQ1osUUFBUSxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QixLQUFLO0FBQ0w7QUFDQSxJQUFJLElBQUksQ0FBQyxHQUFHO0FBQ1osUUFBUSxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QixLQUFLO0FBQ0w7QUFDQSxJQUFJLElBQUksRUFBRSxHQUFHO0FBQ2IsUUFBUSxRQUFRLElBQUks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QUM7QUFDdkMsU0FBUztBQUNULGFBQWE7QUFDYixZQUFZLE1BQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDLENBQUM7QUFDN0UsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNBLElBQUksUUFBUSxHQUFHO0FBQ2YsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDOUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDOUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDOUMsUUFBUSxPQUFPLElBQUksQ0FBQztBQUNwQixLQUFLO0FBQ0w7QUFDQSxJQUFJLElBQUksR0FBRztBQUNYLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzlDLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzlDLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENB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QUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsRCxTQUFTO0FBQ1QsYUFBYSxJQUFJLENBQUMsQ0FBQyxNQUFNLEtBQUssRUFBRSxFQUFFO0FBQ2xDLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNELEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xELEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ25ELFNBQVM7QUFDVCxhQUFhO0FBQ2IsWUFBWSxNQUFNLElBQUksS0FBSyxDQUFDLENBQUMsc0NBQXNDLENBQUMsQ0FBQyxDQUFDO0FBQ3RFLFNBQVM7QUFDVCxRQUFRLE9BQU8sSUFBSSxDQUFDO0FBQ3BCLEtBQUs7QUFDTDtBQUNBLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQ3BCLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxJQUFJQSxRQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUUsRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLElBQUlBLFFBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxRSxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsSUFBSUEsUUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2pELEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2pELEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2pELEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDZCxFQUFFO0FBQ0Y7QUFDQSxJQUFJLFFBQVEsR0FBRztBQUNmLFFBQVEsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNCLFFBQVEsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNCLFFBQVEsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNCLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxQixRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUIsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFCLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNyQixRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDckIsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3JCLFFBQVEsT0FBTyxJQUFJLENBQUM7QUFDcEIsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFO0FBQ1osUUFBUSxJQUFJLE9BQU8sQ0FBQyxDQUFDLEtBQUssUUFBUSxFQUFFO0FBQ3BDLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3JELFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3JELFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3JELFNBQVM7QUFDVCxhQUFhLElBQUksQ0FBQyxZQUFZLFlBQVksSUFBSSxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUM5RCxZQUFZLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkMsWUFBWSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25DLFlBQVksTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuQyxZQUFZLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEMsWUFBWSxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hDLFlBQVksTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoQztBQUNBLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHQyxLQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBR0EsS0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUdBLEtBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3pGLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHQSxLQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBR0EsS0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUdBLEtBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3pGLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHQSxLQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBR0EsS0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUdBLEtBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3pGLFNBQVM7QUFDVCxhQUFhO0FBQ2IsWUFBWSxNQUFNLElBQUksS0FBSyxDQUFDLENBQUMsbUNBQW1DLENBQUMsQ0FBQyxDQUFDO0FBQ25FLFNBQVM7QUFDVCxRQUFRLE9BQU8sSUFBSSxDQUFDO0FBQ3BCLEtBQUs7QUFDTDtBQUNBLElBQUksVUFBVSxDQUFDLENBQUMsRUFBRTtBQUNsQixRQUFRLElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDOUMsWUFBWSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0IsWUFBWSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0IsWUFBWSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hEO0FBQ0EsWUFBWSxPQUFPLElBQUlELFFBQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7QUFDdEUsZ0NBQWdDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztBQUN2RSxnQ0FBZ0MsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN6RSxTQUFTO0FBQ1QsYUFBYTtBQUNiLFlBQVksTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLHlDQUF5QyxDQUFDLENBQUMsQ0FBQztBQUN6RSxTQUFTO0FBQ1QsS0FBSztBQUNMO0FBQ0EsSUFBSSxRQUFRLEdBQUc7QUFDZixRQUFRLFFBQVEsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDeEQsZ0JBQWdCLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ3hELGdCQUFnQixDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3pELEtBQUs7QUFDTCxDQUNBO0FBQ0EsbUJBQWU7QUFDZixJQUFJLE9BQU8sRUFBRUUsU0FBTztBQUNwQjtBQUNBLElBQUksSUFBSSxFQUFFO0FBQ1YsUUFBUSxRQUFRLEdBQUc7QUFDbkIsWUFBWSxNQUFNLENBQUMsR0FBRyxJQUFJQSxTQUFPLEVBQUUsQ0FBQztBQUNwQyxZQUFZLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ2hDLFNBQVM7QUFDVDtBQUNBLFFBQVEsSUFBSSxHQUFHO0FBQ2YsWUFBWSxNQUFNLENBQUMsR0FBRyxJQUFJQSxTQUFPLEVBQUUsQ0FBQztBQUNwQyxZQUFZLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQzVCLFNBQVM7QUFDVDtBQUNBLFFBQVEsTUFBTSxDQUFDLENBQUMsRUFBRTtBQUNsQixZQUFZLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHO0FBQ3BELG9CQUFvQixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUc7QUFDckQsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDO0FBQ3RELFNBQVM7QUFDVDtBQUNBLFFBQVEsVUFBVSxDQUFDLENBQUMsRUFBRTtBQUN0QixZQUFZLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHO0FBQ3RELG9CQUFvQixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUc7QUFDdkQsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDO0FBQ3hELFNBQVM7QUFDVDtBQUNBLFFBQVEsUUFBUSxDQUFDLENBQUMsRUFBRTtBQUNwQixZQUFZLE9BQU8sSUFBSUYsUUFBTTtBQUM3QixnQkFBZ0JDLEtBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSUQsUUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0QsZ0JBQWdCQyxLQUFHLENBQUMsU0FBUyxDQUFDLElBQUlELFFBQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNELGdCQUFnQkMsS0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJRCxRQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzRCxhQUFhLENBQUM7QUFDZCxTQUFTO0FBQ1Q7QUFDQSxRQUFRLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQ3BCLFlBQVksT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckQsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN0RCxTQUFTO0FBQ1Q7QUFDQSxRQUFRLEtBQUssQ0FBQyxDQUFDLEVBQUU7QUFDakIsWUFBWSxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1RCxRQUFRLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqRCxRQUFRLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xELFNBQVM7QUFDVCxLQUFLO0FBQ0w7O0FDckxZLE1BQUMsSUFBSSxHQUFHO0FBQ3BCLElBQUksSUFBSTtBQUNSLElBQUksRUFBRTtBQUNOLElBQUksVUFBVTtBQUNkLElBQUksVUFBVTtBQUNkLElBQUksSUFBSTtBQUNSLElBQUksSUFBSTtBQUNSLElBQUksSUFBSTtBQUNSLElBQUksTUFBTTtBQUNWLElBQUksT0FBTztBQUNYLElBQUksWUFBWTtBQUNoQixJQUFJLGlCQUFpQjtBQUNyQixJQUFJLFNBQVM7QUFDYjtBQUNBLElBQUksZUFBZTtBQUNuQixJQUFJLFNBQVM7QUFDYixJQUFJLE1BQU07QUFDVixJQUFJLGdCQUFnQjtBQUNwQixJQUFJLGdCQUFnQjtBQUNwQixJQUFJLEdBQUc7QUFDUCxJQUFJLEdBQUc7QUFDUCxJQUFJLEdBQUc7QUFDUCxJQUFJLEtBQUs7QUFDVCxJQUFJLElBQUk7QUFDUixJQUFJLEtBQUs7QUFDVCxJQUFJLE1BQU07QUFDVixJQUFJLFlBQVk7QUFDaEIsSUFBSSxHQUFHO0FBQ1AsSUFBSSxHQUFHO0FBQ1AsSUFBSSxHQUFHO0FBQ1AsSUFBSSxJQUFJO0FBQ1IsSUFBSSxJQUFJO0FBQ1IsSUFBSSxNQUFNO0FBQ1YsRUFBRTtBQUNGO0FBQ1ksTUFBQyxNQUFNLEdBQUcsV0FBVyxDQUFDLE9BQU87QUFDN0IsTUFBQyxHQUFHLEdBQUcsV0FBVyxDQUFDLElBQUk7QUFDdkIsTUFBQyxPQUFPLEdBQUcsWUFBWSxDQUFDLFFBQVE7QUFDaEMsTUFBQyxJQUFJLEdBQUcsWUFBWSxDQUFDOzs7OyJ9
