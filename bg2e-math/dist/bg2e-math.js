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

class Vector$1 extends NumericArray {
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
            throw new Error(`Invalid parameters in Vector factory method`);
        }
    }

    normalize(v) {
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
        return v;
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
}

var VectorUtils = {
    Vector: Vector$1,

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
                return new Vector$1(v);
            case 3:
            case 4:
                return new Vector$1(v[0], v[1]);
            default:
                throw new Error(`Invalid vector size: ${ v.length }`);
            }
        },

        xz(v) {
            switch (v.length) {
            case 3:
            case 4:
                return new Vector$1(v[0], v[2]);
            case 2:
            default:
                throw new Error(`Invalid vector size: ${ v.length }`);
            }
        },

        yz(v) {
            switch (v.length) {
            case 3:
            case 4:
                return new Vector$1(v[1], v[2]);
            case 2:
            default:
                throw new Error(`Invalid vector size: ${ v.length }`);
            }
        },

        xyz(v) {
            if (v.length !== 4) {
                throw new Error(`Invalid vector size: ${ v.length }`);
            }
            return new Vector$1(v[0],v[1],v[2]);
        }
    }    
};

class Matrix3$1 extends NumericArray {
    constructor() {
        super([0,0,0,0,0,0,0,0,0]);
    }

    identity() {
        this[0] = 1; this[1] = 0; this[2] = 0;
        this[3] = 0; this[4] = 1; this[5] = 0;
        this[6] = 0; this[7] = 0; this[8] = 1;
        return this;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmcyZS1tYXRoLmpzIiwic291cmNlcyI6WyIuLi9zcmMvanMvY29uc3RhbnRzLmpzIiwiLi4vc3JjL2pzL2Z1bmN0aW9ucy5qcyIsIi4uL3NyYy9qcy9WZWN0b3IuanMiLCIuLi9zcmMvanMvTWF0cml4My5qcyIsIi4uL3NyYy9qcy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcbmV4cG9ydCBjb25zdCBBeGlzID0ge1xuXHROT05FOiAwLFxuXHRYOiAxLFxuXHRZOiAyLFxuXHRaOiAzLFxuICAgIG5hbWU6IChheGlzKSA9PiB7XG4gICAgICAgIHN3aXRjaCAoYXhpcykge1xuICAgICAgICBjYXNlIEF4aXMuTk9ORTpcbiAgICAgICAgICAgIHJldHVybiBcIk5PTkVcIjtcbiAgICAgICAgY2FzZSBBeGlzLlg6XG4gICAgICAgICAgICByZXR1cm4gXCJYXCI7XG4gICAgICAgIGNhc2UgQXhpcy5ZOlxuICAgICAgICAgICAgcmV0dXJuIFwiWVwiO1xuICAgICAgICBjYXNlIEF4aXMuWjpcbiAgICAgICAgICAgIHJldHVybiBcIlpcIjtcbiAgICAgICAgY2FzZSBBeGlzLlc6XG4gICAgICAgICAgICByZXR1cm4gXCJXXCI7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gXCJVTktOT1dOXCJcbiAgICAgICAgfTtcbiAgICB9XG59O1xuXG5leHBvcnQgY29uc3QgUEkgPSAzLjE0MTU5MjY1MzU4OTc5MztcbmV4cG9ydCBjb25zdCBERUdfVE9fUkFEID0gMC4wMTc0NTMyOTI1MTk5NDtcbmV4cG9ydCBjb25zdCBSQURfVE9fREVHID0gNTcuMjk1Nzc5NTEzMDgyMzM7XG5leHBvcnQgY29uc3QgUElfMiA9IDEuNTcwNzk2MzI2Nzk0ODk2NjtcbmV4cG9ydCBjb25zdCBQSV80ID0gMC43ODUzOTgxNjMzOTc0NDg7XG5leHBvcnQgY29uc3QgUElfOCA9IDAuMzkyNjk5MDgxNjk4NzI0O1xuZXhwb3J0IGNvbnN0IFRXT19QSSA9IDYuMjgzMTg1MzA3MTc5NTg2O1xuZXhwb3J0IGNvbnN0IEVQU0lMT04gPSAwLjAwMDAwMDE7XG5cbi8vIERlZmF1bHQgYXJyYXk6IDMyIGJpdHNcbmV4cG9ydCBjb25zdCBOdW1lcmljQXJyYXkgPSBGbG9hdDMyQXJyYXk7XG5leHBvcnQgY29uc3QgTnVtZXJpY0FycmF5SGlnaFAgPSBGbG9hdDY0QXJyYXk7XG5leHBvcnQgY29uc3QgRkxPQVRfTUFYID0gMy40MDI4MjNlMzg7XG4iLCJcbmltcG9ydCB7XG4gICAgRVBTSUxPTixcbiAgICBERUdfVE9fUkFELFxuICAgIFJBRF9UT19ERUdcbn0gZnJvbSAnLi9jb25zdGFudHMnO1xuXG5sZXQgc19iZ19tYXRoX3NlZWQgPSBEYXRlLm5vdygpO1xuXG5leHBvcnQgY29uc3QgY2hlY2tQb3dlck9mVHdvID0gKG4pID0+IHtcbiAgICBpZiAodHlwZW9mIG4gIT09ICdudW1iZXInKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBuICYmIChuICYgKG4gLSAxKSkgPT09IDA7XG4gICAgfSAgXG59XG5cbmV4cG9ydCBjb25zdCBjaGVja1plcm8gPSAodikgPT4ge1xuICAgIHJldHVybiB2Pi1FUFNJTE9OICYmIHY8RVBTSUxPTiA/IDA6djtcbn1cblxuZXhwb3J0IGNvbnN0IGVxdWFscyA9IChhLGIpID0+IHtcbiAgICByZXR1cm4gTWF0aC5hYnMoYSAtIGIpIDwgRVBTSUxPTjtcbn1cblxuZXhwb3J0IGNvbnN0IGRlZ3JlZXNUb1JhZGlhbnMgPSAoZCkgPT4ge1xuICAgIHJldHVybiBNYXRoLmZyb3VuZChjaGVja1plcm8oZCAqIERFR19UT19SQUQpKTtcbn1cblxuZXhwb3J0IGNvbnN0IHJhZGlhbnNUb0RlZ3JlZXMgPSAocikgPT4ge1xuICAgIHJldHVybiBNYXRoLmZyb3VuZChjaGVja1plcm8ociAqIFJBRF9UT19ERUcpKTtcbn1cblxuZXhwb3J0IGNvbnN0IHNpbiA9ICh2YWwpID0+IHtcbiAgICByZXR1cm4gTWF0aC5mcm91bmQoY2hlY2taZXJvKE1hdGguc2luKHZhbCkpKTtcbn1cblxuZXhwb3J0IGNvbnN0IGNvcyA9ICh2YWwpID0+IHtcbiAgICByZXR1cm4gTWF0aC5mcm91bmQoY2hlY2taZXJvKE1hdGguY29zKHZhbCkpKTtcbn1cblxuZXhwb3J0IGNvbnN0IHRhbiA9ICh2YWwpID0+IHtcbiAgICByZXR1cm4gTWF0aC5mcm91bmQoY2hlY2taZXJvKE1hdGgudGFuKHZhbCkpKTtcbn1cblxuZXhwb3J0IGNvbnN0IGNvdGFuID0gKHZhbCkgPT4ge1xuICAgIHJldHVybiBNYXRoLmZyb3VuZChjaGVja1plcm8oMS4wIC8gdGFuKHZhbCkpKTtcbn1cblxuZXhwb3J0IGNvbnN0IGF0YW4gPSAodmFsKSA9PiB7XG4gICAgcmV0dXJuIE1hdGguZnJvdW5kKGNoZWNrWmVybyhNYXRoLmF0YW4odmFsKSkpO1xufVxuXG5leHBvcnQgY29uc3QgYXRhbjIgPSAoaSwgaikgPT4ge1xuICAgIHJldHVybiBNYXRoLmZyb3VuZChjaGVja1plcm8oTWF0aC5hdGFuMmYoaSwgaikpKTtcbn1cblxuZXhwb3J0IGNvbnN0IHJhbmRvbSA9ICgpID0+IHtcbiAgICByZXR1cm4gTWF0aC5yYW5kb20oKTtcbn1cblxuZXhwb3J0IGNvbnN0IHNlZWRlZFJhbmRvbSA9ICgpID0+IHtcbiAgICBjb25zdCBtYXggPSAxO1xuICAgIGNvbnN0IG1pbiA9IDA7XG4gXG4gICAgc19iZ19tYXRoX3NlZWQgPSAoc19iZ19tYXRoX3NlZWQgKiA5MzAxICsgNDkyOTcpICUgMjMzMjgwO1xuICAgIGNvbnN0IHJuZCA9IHNfYmdfbWF0aF9zZWVkIC8gMjMzMjgwO1xuIFxuICAgIHJldHVybiBtaW4gKyBybmQgKiAobWF4IC0gbWluKTtcbn1cblxuZXhwb3J0IGNvbnN0IG1heCA9IChhLGIpID0+IHtcbiAgICByZXR1cm4gTWF0aC5mcm91bmQoTWF0aC5tYXgoYSxiKSk7XG59XG5cbmV4cG9ydCBjb25zdCBtaW4gPSAoYSxiKSA9PiB7XG4gICAgcmV0dXJuIE1hdGguZnJvdW5kKE1hdGgubWluKGEsYikpO1xufVxuXG5leHBvcnQgY29uc3QgYWJzID0gKHZhbCkgPT4ge1xuICAgIHJldHVybiBNYXRoLmZyb3VuZChNYXRoLmFicyh2YWwpKTtcbn1cblxuZXhwb3J0IGNvbnN0IHNxcnQgPSAodmFsKSA9PiB7XG4gICAgcmV0dXJuIE1hdGguZnJvdW5kKE1hdGguc3FydCh2YWwpKTtcbn1cblxuZXhwb3J0IGNvbnN0IGxlcnAgPSAoZnJvbSwgdG8sIHQpID0+IHtcbiAgICByZXR1cm4gTWF0aC5mcm91bmQoKDEuMCAtIHQpICogZnJvbSArIHQgKiB0byk7XG59XG5cbmV4cG9ydCBjb25zdCBzcXVhcmUgPSAobikgPT4ge1xuICAgIHJldHVybiBNYXRoLmZyb3VuZChuICogbik7XG59XG4iLCJpbXBvcnQgeyBOdW1lcmljQXJyYXkgfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcblxuY29uc3QgY2hlY2tFcXVhbExlbmd0aCA9ICh2MSx2MikgPT4ge1xuICAgIGlmICh2MS5sZW5ndGghPXYyLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBsZW5ndGggaW4gb3BlcmF0aW9uYCk7XG59XG5cbmNsYXNzIFZlY3RvciBleHRlbmRzIE51bWVyaWNBcnJheSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICBpZiAoYXJndW1lbnRzWzBdIGluc3RhbmNlb2YgTnVtZXJpY0FycmF5ICYmIFxuICAgICAgICAgICAgICAgIGFyZ3VtZW50c1swXS5sZW5ndGggPT09IDIgJiZcbiAgICAgICAgICAgICAgICB0eXBlb2YoYXJndW1lbnRzWzFdKSA9PT0gXCJudW1iZXJcIlxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoWyBhcmd1bWVudHNbMF1bMF0sIGFyZ3VtZW50c1swXVsxXSwgYXJndW1lbnRzWzFdXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChhcmd1bWVudHNbMF0gaW5zdGFuY2VvZiBOdW1lcmljQXJyYXkgJiYgXG4gICAgICAgICAgICAgICAgYXJndW1lbnRzWzBdLmxlbmd0aCA9PT0gMyAmJlxuICAgICAgICAgICAgICAgIHR5cGVvZihhcmd1bWVudHNbMV0pID09PSBcIm51bWJlclwiXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBzdXBlcihbIGFyZ3VtZW50c1swXVswXSwgYXJndW1lbnRzWzBdWzFdLCBhcmd1bWVudHNbMF1bMl0sIGFyZ3VtZW50c1sxXV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mKGFyZ3VtZW50c1swXSkgPT09IFwibnVtYmVyXCIgJiZcbiAgICAgICAgICAgICAgICB0eXBlb2YoYXJndW1lbnRzWzFdKSA9PT0gXCJudW1iZXJcIlxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgc3VwZXIoW2FyZ3VtZW50c1swXSxhcmd1bWVudHNbMV1dKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICBpZiAoYXJndW1lbnRzWzBdIGluc3RhbmNlb2YgTnVtZXJpY0FycmF5ICYmXG4gICAgICAgICAgICAgICAgYXJndW1lbnRzWzBdLmxlbmd0aCA9PT0gMiAmJlxuICAgICAgICAgICAgICAgIHR5cGVvZihhcmd1bWVudHNbMV0pID09PSBcIm51bWJlclwiICYmIHR5cGVvZihhcmd1bWVudHNbMl0pID09PSBcIm51bWJlclwiXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBzdXBlcihbIGFyZ3VtZW50c1swXVswXSwgYXJndW1lbnRzWzBdWzFdLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXV0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh0eXBlb2YoYXJndW1lbnRzWzBdKSA9PT0gXCJudW1iZXJcIiAmJlxuICAgICAgICAgICAgICAgIHR5cGVvZihhcmd1bWVudHNbMV0pID09PSBcIm51bWJlclwiICYmXG4gICAgICAgICAgICAgICAgdHlwZW9mKGFyZ3VtZW50c1syXSkgPT09IFwibnVtYmVyXCJcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHN1cGVyKFthcmd1bWVudHNbMF0sYXJndW1lbnRzWzFdLGFyZ3VtZW50c1syXV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHN1cGVyKFthcmd1bWVudHNbMF0sYXJndW1lbnRzWzFdLGFyZ3VtZW50c1syXSxhcmd1bWVudHNbM11dKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICBpZiAoYXJndW1lbnRzWzBdIGluc3RhbmNlb2YgTnVtZXJpY0FycmF5ICYmXG4gICAgICAgICAgICAgICAgYXJndW1lbnRzWzBdLmxlbmd0aD4xICYmIGFyZ3VtZW50c1swXS5sZW5ndGg8NSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBzdXBlciguLi5hcmd1bWVudHNbMF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcGFyYW1ldGVycyBpbiBWZWN0b3IgZmFjdG9yeSBtZXRob2RgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG5vcm1hbGl6ZSh2KSB7XG4gICAgICAgIGNvbnN0IG0gPSB0aGlzLm1hZ25pdHVkZSgpO1xuICAgICAgICBzd2l0Y2ggKHRoaXMubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHRoaXNbM10gPSB0aGlzWzNdIC8gbTtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgdGhpc1syXSA9IHRoaXNbMl0gLyBtO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICB0aGlzWzFdID0gdGhpc1sxXSAvIG07ICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzWzBdID0gdGhpc1swXSAvIG07XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdGhpcy5sZW5ndGggfWApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2O1xuICAgIH1cblxuICAgIG1hZ25pdHVkZSgpIHtcbiAgICAgICAgc3dpdGNoICh0aGlzLmxlbmd0aCkge1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KHRoaXNbMF0gKiB0aGlzWzBdICsgdGhpc1sxXSAqIHRoaXNbMV0pO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KHRoaXNbMF0gKiB0aGlzWzBdICsgdGhpc1sxXSAqIHRoaXNbMV0gKyB0aGlzWzJdICogdGhpc1syXSk7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnNxcnQodGhpc1swXSAqIHRoaXNbMF0gKyB0aGlzWzFdICogdGhpc1sxXSArIHRoaXNbMl0gKiB0aGlzWzJdICsgdGhpc1szXSAqIHRoaXNbM10pO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB0aGlzLmxlbmd0aCB9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3NpZ24oc3JjKSB7XG4gICAgICAgIGNoZWNrRXF1YWxMZW5ndGgodGhpcyxzcmMpO1xuICAgICAgICBzd2l0Y2ggKHRoaXMubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHRoaXNbM10gPSBzcmNbM107XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHRoaXNbMl0gPSBzcmNbMl07XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHRoaXNbMV0gPSBzcmNbMV07XG4gICAgICAgICAgICB0aGlzWzBdID0gc3JjWzBdO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHRoaXMubGVuZ3RoIH1gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldCh4LCB5LCB6ID0gbnVsbCwgdyA9IG51bGwpIHtcbiAgICAgICAgaWYgKHRoaXMubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICB0aGlzWzBdID0geDtcbiAgICAgICAgICAgIHRoaXNbMV0gPSB5O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMubGVuZ3RoID09PSAzICYmIHogIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXNbMF0gPSB4O1xuICAgICAgICAgICAgdGhpc1sxXSA9IHk7XG4gICAgICAgICAgICB0aGlzWzJdID0gejtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLmxlbmd0aCA9PT0gNCAmJiB3ICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzWzBdID0geDtcbiAgICAgICAgICAgIHRoaXNbMV0gPSB5O1xuICAgICAgICAgICAgdGhpc1syXSA9IHo7XG4gICAgICAgICAgICB0aGlzWzNdID0gdztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdGhpcy5sZW5ndGggfS4gVHJ5aW5nIHRvIHNldCB4PSR7eH0sIHk9JHt5fSwgej0ke3p9LCB3PSR7d31gKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIFZlY3RvcjogVmVjdG9yLFxuXG4gICAgdmVjOiB7XG4gICAgICAgIGNoZWNrRXF1YWxMZW5ndGgodjEsdjIpIHtcbiAgICAgICAgICAgIGNoZWNrRXF1YWxMZW5ndGgodjEsdjIpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG1heFZlY3Rvcih2MSx2Mikge1xuICAgICAgICAgICAgdGhpcy5jaGVja0VxdWFsTGVuZ3RoKHYxLHYyKTtcbiAgICAgICAgICAgIHN3aXRjaCAodjEubGVuZ3RoKSB7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoW1xuICAgICAgICAgICAgICAgICAgICB2MVswXT52MlswXSA/IHYxWzBdIDogdjJbMF0sXG4gICAgICAgICAgICAgICAgICAgIHYxWzFdPnYyWzFdID8gdjFbMV0gOiB2MlsxXVxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFtcbiAgICAgICAgICAgICAgICAgICAgdjFbMF0+djJbMF0gPyB2MVswXSA6IHYyWzBdLFxuICAgICAgICAgICAgICAgICAgICB2MVsxXT52MlsxXSA/IHYxWzFdIDogdjJbMV0sXG4gICAgICAgICAgICAgICAgICAgIHYxWzJdPnYyWzJdID8gdjFbMl0gOiB2MlsyXVxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFtcbiAgICAgICAgICAgICAgICAgICAgdjFbMF0+djJbMF0gPyB2MVswXSA6IHYyWzBdLFxuICAgICAgICAgICAgICAgICAgICB2MVsxXT52MlsxXSA/IHYxWzFdIDogdjJbMV0sXG4gICAgICAgICAgICAgICAgICAgIHYxWzJdPnYyWzJdID8gdjFbMl0gOiB2MlsyXSxcbiAgICAgICAgICAgICAgICAgICAgdjFbM10+djJbM10gPyB2MVszXSA6IHYyWzNdXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdjEubGVuZ3RoIH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBtaW5WZWN0b3IodjEsdjIpIHtcbiAgICAgICAgICAgIHRoaXMuY2hlY2tFcXVhbExlbmd0aCh2MSx2Mik7XG4gICAgICAgICAgICBzd2l0Y2ggKHYxLmxlbmd0aCkge1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFtcbiAgICAgICAgICAgICAgICAgICAgdjFbMF08djJbMF0gPyB2MVswXSA6IHYyWzBdLFxuICAgICAgICAgICAgICAgICAgICB2MVsxXTx2MlsxXSA/IHYxWzFdIDogdjJbMV1cbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbXG4gICAgICAgICAgICAgICAgICAgIHYxWzBdPHYyWzBdID8gdjFbMF0gOiB2MlswXSxcbiAgICAgICAgICAgICAgICAgICAgdjFbMV08djJbMV0gPyB2MVsxXSA6IHYyWzFdLFxuICAgICAgICAgICAgICAgICAgICB2MVsyXTx2MlsyXSA/IHYxWzJdIDogdjJbMl1cbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbXG4gICAgICAgICAgICAgICAgICAgIHYxWzBdPHYyWzBdID8gdjFbMF0gOiB2MlswXSxcbiAgICAgICAgICAgICAgICAgICAgdjFbMV08djJbMV0gPyB2MVsxXSA6IHYyWzFdLFxuICAgICAgICAgICAgICAgICAgICB2MVsyXTx2MlsyXSA/IHYxWzJdIDogdjJbMl0sXG4gICAgICAgICAgICAgICAgICAgIHYxWzNdPHYyWzNdID8gdjFbM10gOiB2MlszXVxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYxLmxlbmd0aCB9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWRkKHYxLHYyKSB7XG4gICAgICAgICAgICB0aGlzLmNoZWNrRXF1YWxMZW5ndGgodjEsdjIpO1xuICAgICAgICAgICAgc3dpdGNoICh2MS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbXG4gICAgICAgICAgICAgICAgICAgIHYxWzBdICsgdjJbMF0sXG4gICAgICAgICAgICAgICAgICAgIHYxWzFdICsgdjJbMV1cbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbXG4gICAgICAgICAgICAgICAgICAgIHYxWzBdICsgdjJbMF0sXG4gICAgICAgICAgICAgICAgICAgIHYxWzFdICsgdjJbMV0sXG4gICAgICAgICAgICAgICAgICAgIHYxWzJdICsgdjJbMl1cbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbXG4gICAgICAgICAgICAgICAgICAgIHYxWzBdICsgdjJbMF0sXG4gICAgICAgICAgICAgICAgICAgIHYxWzFdICsgdjJbMV0sXG4gICAgICAgICAgICAgICAgICAgIHYxWzJdICsgdjJbMl0sXG4gICAgICAgICAgICAgICAgICAgIHYxWzNdICsgdjJbM11cbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB2MS5sZW5ndGggfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHN1Yih2MSx2Mikge1xuICAgICAgICAgICAgdGhpcy5jaGVja0VxdWFsTGVuZ3RoKHYxLHYyKTtcbiAgICAgICAgICAgIHN3aXRjaCAodjEubGVuZ3RoKSB7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoW1xuICAgICAgICAgICAgICAgICAgICB2MVswXSAtIHYyWzBdLFxuICAgICAgICAgICAgICAgICAgICB2MVsxXSAtIHYyWzFdXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoW1xuICAgICAgICAgICAgICAgICAgICB2MVswXSAtIHYyWzBdLFxuICAgICAgICAgICAgICAgICAgICB2MVsxXSAtIHYyWzFdLFxuICAgICAgICAgICAgICAgICAgICB2MVsyXSAtIHYyWzJdXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoW1xuICAgICAgICAgICAgICAgICAgICB2MVswXSAtIHYyWzBdLFxuICAgICAgICAgICAgICAgICAgICB2MVsxXSAtIHYyWzFdLFxuICAgICAgICAgICAgICAgICAgICB2MVsyXSAtIHYyWzJdLFxuICAgICAgICAgICAgICAgICAgICB2MVszXSAtIHYyWzNdXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdjEubGVuZ3RoIH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBtYWduaXR1ZGUodikge1xuICAgICAgICAgICAgc3dpdGNoICh2Lmxlbmd0aCkge1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLnNxcnQodlswXSAqIHZbMF0gKyB2WzFdICogdlsxXSk7XG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGguc3FydCh2WzBdICogdlswXSArIHZbMV0gKiB2WzFdICsgdlsyXSAqIHZbMl0pO1xuICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLnNxcnQodlswXSAqIHZbMF0gKyB2WzFdICogdlsxXSArIHZbMl0gKiB2WzJdICsgdlszXSAqIHZbM10pO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYubGVuZ3RoIH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBkaXN0YW5jZSh2MSx2Mikge1xuICAgICAgICAgICAgdGhpcy5jaGVja0VxdWFsTGVuZ3RoKHYxLHYyKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1hZ25pdHVkZSh0aGlzLnN1Yih2MSx2MikpO1xuICAgICAgICB9LFxuICAgIFxuICAgICAgICBkb3QodjEsdjIpIHtcbiAgICAgICAgICAgIHRoaXMuY2hlY2tFcXVhbExlbmd0aCh2MSx2Mik7XG4gICAgICAgICAgICBzd2l0Y2ggKHYxLmxlbmd0aCkge1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIHJldHVybiB2MVswXSAqIHYyWzBdICsgdjFbMV0gKiB2MlsxXTtcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdjFbMF0gKiB2MlswXSArIHYxWzFdICogdjJbMV0gKyB2MVsyXSAqIHYyWzJdO1xuICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICAgIHJldHVybiB2MVswXSAqIHYyWzBdICsgdjFbMV0gKiB2MlsxXSArIHYxWzJdICogdjJbMl0gKyB2MVszXSAqIHYyWzNdO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYxLmxlbmd0aCB9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgXG4gICAgICAgIGNyb3NzKHYxLHYyKSB7XG4gICAgICAgICAgICB0aGlzLmNoZWNrRXF1YWxMZW5ndGgodjEsdjIpO1xuICAgICAgICAgICAgc3dpdGNoICh2MS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdjFbMF0gKiB2MlsxXSAtIHYxWzFdIC0gdjJbMF07XG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoW1xuICAgICAgICAgICAgICAgICAgICB2MVsxXSAqIHYyWzJdIC0gdjFbMl0gKiB2MlsxXSxcbiAgICAgICAgICAgICAgICAgICAgdjFbMl0gKiB2MlswXSAtIHYxWzBdICogdjJbMl0sXG4gICAgICAgICAgICAgICAgICAgIHYxWzBdICogdjJbMV0gLSB2MVsxXSAqIHYyWzBdLFxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemUgZm9yIGNyb3NzIHByb2R1Y3Q6ICR7IHYxLmxlbmd0aCB9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Tm9ybWFsaXplZCh2KSB7XG4gICAgICAgICAgICBjb25zdCBtID0gdGhpcy5tYWduaXR1ZGUodik7XG4gICAgICAgICAgICBzd2l0Y2ggKHYubGVuZ3RoKSB7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoWyB2WzBdIC8gbSwgdlsxXSAvIG0gXSk7XG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoWyB2WzBdIC8gbSwgdlsxXSAvIG0sIHZbMl0gLyBtIF0pO1xuICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFsgdlswXSAvIG0sIHZbMV0gLyBtLCB2WzJdIC8gbSwgdlszXSAvIG0gXSlcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB2Lmxlbmd0aCB9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgbXVsdCh2LHMpIHtcbiAgICAgICAgICAgIHN3aXRjaCAodi5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbIHZbMF0gKiBzLCB2WzFdICogcyBdKTtcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbIHZbMF0gKiBzLCB2WzFdICogcywgdlsyXSAqIHMgXSk7XG4gICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoWyB2WzBdICogcywgdlsxXSAqIHMsIHZbMl0gKiBzLCB2WzNdICogcyBdKTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB2Lmxlbmd0aCB9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGl2KHYscykge1xuICAgICAgICAgICAgc3dpdGNoICh2Lmxlbmd0aCkge1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFsgdlswXSAvIHMsIHZbMV0gLyBzIF0pO1xuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFsgdlswXSAvIHMsIHZbMV0gLyBzLCB2WzJdIC8gcyBdKTtcbiAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbIHZbMF0gLyBzLCB2WzFdIC8gcywgdlsyXSAvIHMsIHZbM10gLyBzIF0pO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYubGVuZ3RoIH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBlcXVhbHModjEsdjIpIHtcbiAgICAgICAgICAgIGlmICh2MS5sZW5ndGggIT0gdjIubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoICh2MS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2MVswXSA9PT0gdjJbMF0gJiYgdjFbMV0gPT09IHYyWzFdO1xuICAgICAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHYxWzBdID09PSB2MlswXSAmJiB2MVsxXSA9PT0gdjJbMV0gJiYgdjFbMl0gPT09IHYyWzJdO1xuICAgICAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHYxWzBdID09PSB2MlswXSAmJiB2MVsxXSA9PT0gdjJbMV0gJiYgdjFbMl0gPT09IHYyWzJdICYmIHYxWzNdID09PSB2MlszXTtcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYxLmxlbmd0aCB9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGFzc2lnbihkc3Qsc3JjKSB7XG4gICAgICAgICAgICB0aGlzLmNoZWNrRXF1YWxMZW5ndGgoZHN0LHNyYyk7XG4gICAgICAgICAgICBzd2l0Y2ggKGRzdC5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICBkc3RbM10gPSBzcmNbM107XG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgZHN0WzJdID0gc3JjWzJdO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIGRzdFsxXSA9IHNyY1sxXTtcbiAgICAgICAgICAgICAgICBkc3RbMF0gPSBzcmNbMF07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgZHN0Lmxlbmd0aCB9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0KHYsIHgsIHksIHogPSBudWxsLCB3ID0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKHYubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICAgICAgdlswXSA9IHg7XG4gICAgICAgICAgICAgICAgdlsxXSA9IHk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh2Lmxlbmd0aCA9PT0gMyAmJiB6ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdlswXSA9IHg7XG4gICAgICAgICAgICAgICAgdlsxXSA9IHk7XG4gICAgICAgICAgICAgICAgdlsyXSA9IHo7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh2Lmxlbmd0aCA9PT0gNCAmJiB3ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdlswXSA9IHg7XG4gICAgICAgICAgICAgICAgdlsxXSA9IHk7XG4gICAgICAgICAgICAgICAgdlsyXSA9IHo7XG4gICAgICAgICAgICAgICAgdlszXSA9IHc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYubGVuZ3RoIH0uIFRyeWluZyB0byBzZXQgeD0ke3h9LCB5PSR7eX0sIHo9JHt6fSwgdz0ke3d9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNOYU4odikge1xuICAgICAgICAgICAgc3dpdGNoICh2Lmxlbmd0aCkge1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIHJldHVybiBpc05hTih2WzBdKSB8fCBpc05hTih2WzFdKTtcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICByZXR1cm4gaXNOYU4odlswXSkgfHwgaXNOYU4odlsxXSkgfHwgaXNOYU4odlsyXSk7XG4gICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlzTmFOKHZbMF0pIHx8IGlzTmFOKHZbMV0pIHx8IGlzTmFOKHZbMl0pIHx8IGlzTmFOKHZbM10pO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYubGVuZ3RoIH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB4eSh2KSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHYubGVuZ3RoKSB7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBWZWN0b3Iodik7XG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBWZWN0b3IodlswXSwgdlsxXSk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdi5sZW5ndGggfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHh6KHYpIHtcbiAgICAgICAgICAgIHN3aXRjaCAodi5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFZlY3Rvcih2WzBdLCB2WzJdKTtcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB2Lmxlbmd0aCB9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgeXoodikge1xuICAgICAgICAgICAgc3dpdGNoICh2Lmxlbmd0aCkge1xuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVmVjdG9yKHZbMV0sIHZbMl0pO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYubGVuZ3RoIH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB4eXoodikge1xuICAgICAgICAgICAgaWYgKHYubGVuZ3RoICE9PSA0KSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB2Lmxlbmd0aCB9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbmV3IFZlY3Rvcih2WzBdLHZbMV0sdlsyXSk7XG4gICAgICAgIH1cbiAgICB9ICAgIFxufVxuXG4iLCJpbXBvcnQgeyBOdW1lcmljQXJyYXkgfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcblxuY2xhc3MgTWF0cml4MyBleHRlbmRzIE51bWVyaWNBcnJheSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKFswLDAsMCwwLDAsMCwwLDAsMF0pO1xuICAgIH1cblxuICAgIGlkZW50aXR5KCkge1xuICAgICAgICB0aGlzWzBdID0gMTsgdGhpc1sxXSA9IDA7IHRoaXNbMl0gPSAwO1xuICAgICAgICB0aGlzWzNdID0gMDsgdGhpc1s0XSA9IDE7IHRoaXNbNV0gPSAwO1xuICAgICAgICB0aGlzWzZdID0gMDsgdGhpc1s3XSA9IDA7IHRoaXNbOF0gPSAxO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuICBgWyAke3RoaXNbMF19LCAke3RoaXNbMV19LCAke3RoaXNbMl19XFxuYCArXG4gICAgICAgICAgICAgICAgYCAgJHt0aGlzWzNdfSwgJHt0aGlzWzRdfSwgJHt0aGlzWzVdfVxcbmAgK1xuICAgICAgICAgICAgICAgIGAgICR7dGhpc1s2XX0sICR7dGhpc1s3XX0sICR7dGhpc1s4XX0gXWA7XG4gICAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIE1hdHJpeDM6IE1hdHJpeDMsXG5cbiAgICBtYXQzOiB7XG4gICAgICAgIGlkZW50aXR5KCkge1xuICAgICAgICAgICAgY29uc3QgbSA9IG5ldyBNYXRyaXgzKCk7XG4gICAgICAgICAgICByZXR1cm4gbS5pZGVudGl0eSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiXG5pbXBvcnQge1xuICAgIEF4aXMsXG4gICAgUEksXG4gICAgREVHX1RPX1JBRCxcbiAgICBSQURfVE9fREVHLFxuICAgIFBJXzIsXG4gICAgUElfNCxcbiAgICBQSV84LFxuICAgIFRXT19QSSxcbiAgICBFUFNJTE9OLFxuICAgIE51bWVyaWNBcnJheSxcbiAgICBOdW1lcmljQXJyYXlIaWdoUCxcbiAgICBGTE9BVF9NQVhcbn0gZnJvbSBcIi4vY29uc3RhbnRzXCI7XG5cbmltcG9ydCB7XG4gICAgY2hlY2tQb3dlck9mVHdvLFxuICAgIGNoZWNrWmVybyxcbiAgICBlcXVhbHMsXG4gICAgZGVncmVlc1RvUmFkaWFucyxcbiAgICByYWRpYW5zVG9EZWdyZWVzLFxuICAgIHNpbixcbiAgICBjb3MsXG4gICAgdGFuLFxuICAgIGNvdGFuLFxuICAgIGF0YW4sXG4gICAgYXRhbjIsXG4gICAgcmFuZG9tLFxuICAgIHNlZWRlZFJhbmRvbSxcbiAgICBtYXgsXG4gICAgbWluLFxuICAgIGFicyxcbiAgICBzcXJ0LFxuICAgIGxlcnAsXG4gICAgc3F1YXJlXG59IGZyb20gXCIuL2Z1bmN0aW9uc1wiO1xuXG5pbXBvcnQgVmVjdG9yVXRpbHMgZnJvbSAnLi9WZWN0b3InO1xuXG5pbXBvcnQgTWF0cml4M1V0aWxzIGZyb20gXCIuL01hdHJpeDNcIjtcblxuZXhwb3J0IGNvbnN0IG1hdGggPSB7XG4gICAgQXhpcyxcbiAgICBQSSxcbiAgICBERUdfVE9fUkFELFxuICAgIFJBRF9UT19ERUcsXG4gICAgUElfMixcbiAgICBQSV80LFxuICAgIFBJXzgsXG4gICAgVFdPX1BJLFxuICAgIEVQU0lMT04sXG4gICAgTnVtZXJpY0FycmF5LFxuICAgIE51bWVyaWNBcnJheUhpZ2hQLFxuICAgIEZMT0FUX01BWCxcblxuICAgIGNoZWNrUG93ZXJPZlR3byxcbiAgICBjaGVja1plcm8sXG4gICAgZXF1YWxzLFxuICAgIGRlZ3JlZXNUb1JhZGlhbnMsXG4gICAgcmFkaWFuc1RvRGVncmVlcyxcbiAgICBzaW4sXG4gICAgY29zLFxuICAgIHRhbixcbiAgICBjb3RhbixcbiAgICBhdGFuLFxuICAgIGF0YW4yLFxuICAgIHJhbmRvbSxcbiAgICBzZWVkZWRSYW5kb20sXG4gICAgbWF4LFxuICAgIG1pbixcbiAgICBhYnMsXG4gICAgc3FydCxcbiAgICBsZXJwLFxuICAgIHNxdWFyZVxufTtcblxuZXhwb3J0IGNvbnN0IFZlY3RvciA9IFZlY3RvclV0aWxzLlZlY3RvcjtcbmV4cG9ydCBjb25zdCB2ZWMgPSBWZWN0b3JVdGlscy52ZWM7XG5leHBvcnQgY29uc3QgTWF0cml4MyA9IE1hdHJpeDNVdGlscy5NYXRyaXgzO1xuZXhwb3J0IGNvbnN0IG1hdDMgPSBNYXRyaXgzVXRpbHMubWF0MztcbiJdLCJuYW1lcyI6WyJWZWN0b3IiLCJNYXRyaXgzIl0sIm1hcHBpbmdzIjoiQUFDTyxNQUFNLElBQUksR0FBRztBQUNwQixDQUFDLElBQUksRUFBRSxDQUFDO0FBQ1IsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUNMLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDTCxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ0wsSUFBSSxJQUFJLEVBQUUsQ0FBQyxJQUFJLEtBQUs7QUFDcEIsUUFBUSxRQUFRLElBQUk7QUFDcEIsUUFBUSxLQUFLLElBQUksQ0FBQyxJQUFJO0FBQ3RCLFlBQVksT0FBTyxNQUFNLENBQUM7QUFDMUIsUUFBUSxLQUFLLElBQUksQ0FBQyxDQUFDO0FBQ25CLFlBQVksT0FBTyxHQUFHLENBQUM7QUFDdkIsUUFBUSxLQUFLLElBQUksQ0FBQyxDQUFDO0FBQ25CLFlBQVksT0FBTyxHQUFHLENBQUM7QUFDdkIsUUFBUSxLQUFLLElBQUksQ0FBQyxDQUFDO0FBQ25CLFlBQVksT0FBTyxHQUFHLENBQUM7QUFDdkIsUUFBUSxLQUFLLElBQUksQ0FBQyxDQUFDO0FBQ25CLFlBQVksT0FBTyxHQUFHLENBQUM7QUFDdkIsUUFBUTtBQUNSLFlBQVksT0FBTyxTQUFTO0FBQzVCLFNBQ0EsS0FBSztBQUNMLENBQUMsQ0FBQztBQUNGO0FBQ08sTUFBTSxFQUFFLEdBQUcsaUJBQWlCLENBQUM7QUFDN0IsTUFBTSxVQUFVLEdBQUcsZ0JBQWdCLENBQUM7QUFDcEMsTUFBTSxVQUFVLEdBQUcsaUJBQWlCLENBQUM7QUFDckMsTUFBTSxJQUFJLEdBQUcsa0JBQWtCLENBQUM7QUFDaEMsTUFBTSxJ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
