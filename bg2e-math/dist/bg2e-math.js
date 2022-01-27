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

function Vector$1() {
    switch (arguments.length) {
    case 2:
        if (arguments[0] instanceof NumericArray && 
            arguments[0].length === 2 &&
            typeof(arguments[1]) === "number"
        ) {
            return new NumericArray([ arguments[0][0], arguments[0][1], arguments[1]]);
        }
        if (arguments[0] instanceof NumericArray && 
            arguments[0].length === 3 &&
            typeof(arguments[1]) === "number"
        ) {
            return new NumericArray([ arguments[0][0], arguments[0][1], arguments[0][2], arguments[1]]);
        }
        else if (typeof(arguments[0]) === "number" &&
            typeof(arguments[1]) === "number"
        ) {
            return new NumericArray([arguments[0],arguments[1]]);
        }
        break;
    case 3:
        if (arguments[0] instanceof NumericArray &&
            arguments[0].length === 2 &&
            typeof(arguments[1]) === "number" && typeof(arguments[2]) === "number"
        ) {
            return new NumericArray([ arguments[0][0], arguments[0][1], arguments[1], arguments[2]])
        }
        else if (typeof(arguments[0]) === "number" &&
            typeof(arguments[1]) === "number" &&
            typeof(arguments[2]) === "number"
        ) {
            return new NumericArray([arguments[0],arguments[1],arguments[2]]);
        }
        break;
    case 4:
        return new NumericArray([arguments[0],arguments[1],arguments[2],arguments[3]]);
    case 1:
        if (arguments[0] instanceof NumericArray &&
            arguments[0].length>1 && arguments[0].length<5)
        {
            return Vector$1(...arguments[0]);
        }
        break;
    }
    throw new Error(`Invalid parameters in Vector factory method`);
}

var VectorUtils = {
    Vector: Vector$1,

    vec: {
        checkEqualLength(v1,v2) {
            if (v1.length!=v2.length) throw new Error(`Invalid vector length in operation`);
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

        normalize(v) {
            const m = this.magnitude(v);
            switch (v.length) {
            case 4:
                v[3] = v[3] / m;
            case 3:
                v[2] = v[2] / m;
            case 2:
                v[1] = v[1] / m;            
                v[0] = v[0] / m;
                break;
            default:
                throw new Error(`Invalid vector size: ${ v.length }`);
            }
            return v;
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
                return Vector$1(v);
            case 3:
            case 4:
                return Vector$1(v[0], v[1]);
            default:
                throw new Error(`Invalid vector size: ${ v.length }`);
            }
        },

        xz(v) {
            switch (v.length) {
            case 3:
            case 4:
                return Vector$1(v[0], v[2]);
            case 2:
            default:
                throw new Error(`Invalid vector size: ${ v.length }`);
            }
        },

        yz(v) {
            switch (v.length) {
            case 3:
            case 4:
                return Vector$1(v[1], v[2]);
            case 2:
            default:
                throw new Error(`Invalid vector size: ${ v.length }`);
            }
        },

        xyz(v) {
            if (v.length !== 4) {
                throw new Error(`Invalid vector size: ${ v.length }`);
            }
            return Vector$1(v[0],v[1],v[2]);
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

export { Vector, math, vec };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmcyZS1tYXRoLmpzIiwic291cmNlcyI6WyIuLi9zcmMvanMvY29uc3RhbnRzLmpzIiwiLi4vc3JjL2pzL2Z1bmN0aW9ucy5qcyIsIi4uL3NyYy9qcy9WZWN0b3IuanMiLCIuLi9zcmMvanMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiXG5leHBvcnQgY29uc3QgQXhpcyA9IHtcblx0Tk9ORTogMCxcblx0WDogMSxcblx0WTogMixcblx0WjogMyxcbiAgICBuYW1lOiAoYXhpcykgPT4ge1xuICAgICAgICBzd2l0Y2ggKGF4aXMpIHtcbiAgICAgICAgY2FzZSBBeGlzLk5PTkU6XG4gICAgICAgICAgICByZXR1cm4gXCJOT05FXCI7XG4gICAgICAgIGNhc2UgQXhpcy5YOlxuICAgICAgICAgICAgcmV0dXJuIFwiWFwiO1xuICAgICAgICBjYXNlIEF4aXMuWTpcbiAgICAgICAgICAgIHJldHVybiBcIllcIjtcbiAgICAgICAgY2FzZSBBeGlzLlo6XG4gICAgICAgICAgICByZXR1cm4gXCJaXCI7XG4gICAgICAgIGNhc2UgQXhpcy5XOlxuICAgICAgICAgICAgcmV0dXJuIFwiV1wiO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIFwiVU5LTk9XTlwiXG4gICAgICAgIH07XG4gICAgfVxufTtcblxuZXhwb3J0IGNvbnN0IFBJID0gMy4xNDE1OTI2NTM1ODk3OTM7XG5leHBvcnQgY29uc3QgREVHX1RPX1JBRCA9IDAuMDE3NDUzMjkyNTE5OTQ7XG5leHBvcnQgY29uc3QgUkFEX1RPX0RFRyA9IDU3LjI5NTc3OTUxMzA4MjMzO1xuZXhwb3J0IGNvbnN0IFBJXzIgPSAxLjU3MDc5NjMyNjc5NDg5NjY7XG5leHBvcnQgY29uc3QgUElfNCA9IDAuNzg1Mzk4MTYzMzk3NDQ4O1xuZXhwb3J0IGNvbnN0IFBJXzggPSAwLjM5MjY5OTA4MTY5ODcyNDtcbmV4cG9ydCBjb25zdCBUV09fUEkgPSA2LjI4MzE4NTMwNzE3OTU4NjtcbmV4cG9ydCBjb25zdCBFUFNJTE9OID0gMC4wMDAwMDAxO1xuXG4vLyBEZWZhdWx0IGFycmF5OiAzMiBiaXRzXG5leHBvcnQgY29uc3QgTnVtZXJpY0FycmF5ID0gRmxvYXQzMkFycmF5O1xuZXhwb3J0IGNvbnN0IE51bWVyaWNBcnJheUhpZ2hQID0gRmxvYXQ2NEFycmF5O1xuZXhwb3J0IGNvbnN0IEZMT0FUX01BWCA9IDMuNDAyODIzZTM4O1xuIiwiXG5pbXBvcnQge1xuICAgIEVQU0lMT04sXG4gICAgREVHX1RPX1JBRCxcbiAgICBSQURfVE9fREVHXG59IGZyb20gJy4vY29uc3RhbnRzJztcblxubGV0IHNfYmdfbWF0aF9zZWVkID0gRGF0ZS5ub3coKTtcblxuZXhwb3J0IGNvbnN0IGNoZWNrUG93ZXJPZlR3byA9IChuKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBuICE9PSAnbnVtYmVyJykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gbiAmJiAobiAmIChuIC0gMSkpID09PSAwO1xuICAgIH0gIFxufVxuXG5leHBvcnQgY29uc3QgY2hlY2taZXJvID0gKHYpID0+IHtcbiAgICByZXR1cm4gdj4tRVBTSUxPTiAmJiB2PEVQU0lMT04gPyAwOnY7XG59XG5cbmV4cG9ydCBjb25zdCBlcXVhbHMgPSAoYSxiKSA9PiB7XG4gICAgcmV0dXJuIE1hdGguYWJzKGEgLSBiKSA8IEVQU0lMT047XG59XG5cbmV4cG9ydCBjb25zdCBkZWdyZWVzVG9SYWRpYW5zID0gKGQpID0+IHtcbiAgICByZXR1cm4gTWF0aC5mcm91bmQoY2hlY2taZXJvKGQgKiBERUdfVE9fUkFEKSk7XG59XG5cbmV4cG9ydCBjb25zdCByYWRpYW5zVG9EZWdyZWVzID0gKHIpID0+IHtcbiAgICByZXR1cm4gTWF0aC5mcm91bmQoY2hlY2taZXJvKHIgKiBSQURfVE9fREVHKSk7XG59XG5cbmV4cG9ydCBjb25zdCBzaW4gPSAodmFsKSA9PiB7XG4gICAgcmV0dXJuIE1hdGguZnJvdW5kKGNoZWNrWmVybyhNYXRoLnNpbih2YWwpKSk7XG59XG5cbmV4cG9ydCBjb25zdCBjb3MgPSAodmFsKSA9PiB7XG4gICAgcmV0dXJuIE1hdGguZnJvdW5kKGNoZWNrWmVybyhNYXRoLmNvcyh2YWwpKSk7XG59XG5cbmV4cG9ydCBjb25zdCB0YW4gPSAodmFsKSA9PiB7XG4gICAgcmV0dXJuIE1hdGguZnJvdW5kKGNoZWNrWmVybyhNYXRoLnRhbih2YWwpKSk7XG59XG5cbmV4cG9ydCBjb25zdCBjb3RhbiA9ICh2YWwpID0+IHtcbiAgICByZXR1cm4gTWF0aC5mcm91bmQoY2hlY2taZXJvKDEuMCAvIHRhbih2YWwpKSk7XG59XG5cbmV4cG9ydCBjb25zdCBhdGFuID0gKHZhbCkgPT4ge1xuICAgIHJldHVybiBNYXRoLmZyb3VuZChjaGVja1plcm8oTWF0aC5hdGFuKHZhbCkpKTtcbn1cblxuZXhwb3J0IGNvbnN0IGF0YW4yID0gKGksIGopID0+IHtcbiAgICByZXR1cm4gTWF0aC5mcm91bmQoY2hlY2taZXJvKE1hdGguYXRhbjJmKGksIGopKSk7XG59XG5cbmV4cG9ydCBjb25zdCByYW5kb20gPSAoKSA9PiB7XG4gICAgcmV0dXJuIE1hdGgucmFuZG9tKCk7XG59XG5cbmV4cG9ydCBjb25zdCBzZWVkZWRSYW5kb20gPSAoKSA9PiB7XG4gICAgY29uc3QgbWF4ID0gMTtcbiAgICBjb25zdCBtaW4gPSAwO1xuIFxuICAgIHNfYmdfbWF0aF9zZWVkID0gKHNfYmdfbWF0aF9zZWVkICogOTMwMSArIDQ5Mjk3KSAlIDIzMzI4MDtcbiAgICBjb25zdCBybmQgPSBzX2JnX21hdGhfc2VlZCAvIDIzMzI4MDtcbiBcbiAgICByZXR1cm4gbWluICsgcm5kICogKG1heCAtIG1pbik7XG59XG5cbmV4cG9ydCBjb25zdCBtYXggPSAoYSxiKSA9PiB7XG4gICAgcmV0dXJuIE1hdGguZnJvdW5kKE1hdGgubWF4KGEsYikpO1xufVxuXG5leHBvcnQgY29uc3QgbWluID0gKGEsYikgPT4ge1xuICAgIHJldHVybiBNYXRoLmZyb3VuZChNYXRoLm1pbihhLGIpKTtcbn1cblxuZXhwb3J0IGNvbnN0IGFicyA9ICh2YWwpID0+IHtcbiAgICByZXR1cm4gTWF0aC5mcm91bmQoTWF0aC5hYnModmFsKSk7XG59XG5cbmV4cG9ydCBjb25zdCBzcXJ0ID0gKHZhbCkgPT4ge1xuICAgIHJldHVybiBNYXRoLmZyb3VuZChNYXRoLnNxcnQodmFsKSk7XG59XG5cbmV4cG9ydCBjb25zdCBsZXJwID0gKGZyb20sIHRvLCB0KSA9PiB7XG4gICAgcmV0dXJuIE1hdGguZnJvdW5kKCgxLjAgLSB0KSAqIGZyb20gKyB0ICogdG8pO1xufVxuXG5leHBvcnQgY29uc3Qgc3F1YXJlID0gKG4pID0+IHtcbiAgICByZXR1cm4gTWF0aC5mcm91bmQobiAqIG4pO1xufVxuIiwiaW1wb3J0IHsgTnVtZXJpY0FycmF5IH0gZnJvbSBcIi4vY29uc3RhbnRzXCI7XG5cbmZ1bmN0aW9uIFZlY3RvcigpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICBjYXNlIDI6XG4gICAgICAgIGlmIChhcmd1bWVudHNbMF0gaW5zdGFuY2VvZiBOdW1lcmljQXJyYXkgJiYgXG4gICAgICAgICAgICBhcmd1bWVudHNbMF0ubGVuZ3RoID09PSAyICYmXG4gICAgICAgICAgICB0eXBlb2YoYXJndW1lbnRzWzFdKSA9PT0gXCJudW1iZXJcIlxuICAgICAgICApIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFsgYXJndW1lbnRzWzBdWzBdLCBhcmd1bWVudHNbMF1bMV0sIGFyZ3VtZW50c1sxXV0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhcmd1bWVudHNbMF0gaW5zdGFuY2VvZiBOdW1lcmljQXJyYXkgJiYgXG4gICAgICAgICAgICBhcmd1bWVudHNbMF0ubGVuZ3RoID09PSAzICYmXG4gICAgICAgICAgICB0eXBlb2YoYXJndW1lbnRzWzFdKSA9PT0gXCJudW1iZXJcIlxuICAgICAgICApIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFsgYXJndW1lbnRzWzBdWzBdLCBhcmd1bWVudHNbMF1bMV0sIGFyZ3VtZW50c1swXVsyXSwgYXJndW1lbnRzWzFdXSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mKGFyZ3VtZW50c1swXSkgPT09IFwibnVtYmVyXCIgJiZcbiAgICAgICAgICAgIHR5cGVvZihhcmd1bWVudHNbMV0pID09PSBcIm51bWJlclwiXG4gICAgICAgICkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoW2FyZ3VtZW50c1swXSxhcmd1bWVudHNbMV1dKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICBjYXNlIDM6XG4gICAgICAgIGlmIChhcmd1bWVudHNbMF0gaW5zdGFuY2VvZiBOdW1lcmljQXJyYXkgJiZcbiAgICAgICAgICAgIGFyZ3VtZW50c1swXS5sZW5ndGggPT09IDIgJiZcbiAgICAgICAgICAgIHR5cGVvZihhcmd1bWVudHNbMV0pID09PSBcIm51bWJlclwiICYmIHR5cGVvZihhcmd1bWVudHNbMl0pID09PSBcIm51bWJlclwiXG4gICAgICAgICkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoWyBhcmd1bWVudHNbMF1bMF0sIGFyZ3VtZW50c1swXVsxXSwgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl1dKVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZihhcmd1bWVudHNbMF0pID09PSBcIm51bWJlclwiICYmXG4gICAgICAgICAgICB0eXBlb2YoYXJndW1lbnRzWzFdKSA9PT0gXCJudW1iZXJcIiAmJlxuICAgICAgICAgICAgdHlwZW9mKGFyZ3VtZW50c1syXSkgPT09IFwibnVtYmVyXCJcbiAgICAgICAgKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbYXJndW1lbnRzWzBdLGFyZ3VtZW50c1sxXSxhcmd1bWVudHNbMl1dKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICBjYXNlIDQ6XG4gICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFthcmd1bWVudHNbMF0sYXJndW1lbnRzWzFdLGFyZ3VtZW50c1syXSxhcmd1bWVudHNbM11dKTtcbiAgICBjYXNlIDE6XG4gICAgICAgIGlmIChhcmd1bWVudHNbMF0gaW5zdGFuY2VvZiBOdW1lcmljQXJyYXkgJiZcbiAgICAgICAgICAgIGFyZ3VtZW50c1swXS5sZW5ndGg+MSAmJiBhcmd1bWVudHNbMF0ubGVuZ3RoPDUpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiBWZWN0b3IoLi4uYXJndW1lbnRzWzBdKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHBhcmFtZXRlcnMgaW4gVmVjdG9yIGZhY3RvcnkgbWV0aG9kYCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBWZWN0b3I6IFZlY3RvcixcblxuICAgIHZlYzoge1xuICAgICAgICBjaGVja0VxdWFsTGVuZ3RoKHYxLHYyKSB7XG4gICAgICAgICAgICBpZiAodjEubGVuZ3RoIT12Mi5sZW5ndGgpIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3IgbGVuZ3RoIGluIG9wZXJhdGlvbmApO1xuICAgICAgICB9LFxuXG4gICAgICAgIG1heFZlY3Rvcih2MSx2Mikge1xuICAgICAgICAgICAgdGhpcy5jaGVja0VxdWFsTGVuZ3RoKHYxLHYyKTtcbiAgICAgICAgICAgIHN3aXRjaCAodjEubGVuZ3RoKSB7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoW1xuICAgICAgICAgICAgICAgICAgICB2MVswXT52MlswXSA/IHYxWzBdIDogdjJbMF0sXG4gICAgICAgICAgICAgICAgICAgIHYxWzFdPnYyWzFdID8gdjFbMV0gOiB2MlsxXVxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFtcbiAgICAgICAgICAgICAgICAgICAgdjFbMF0+djJbMF0gPyB2MVswXSA6IHYyWzBdLFxuICAgICAgICAgICAgICAgICAgICB2MVsxXT52MlsxXSA/IHYxWzFdIDogdjJbMV0sXG4gICAgICAgICAgICAgICAgICAgIHYxWzJdPnYyWzJdID8gdjFbMl0gOiB2MlsyXVxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFtcbiAgICAgICAgICAgICAgICAgICAgdjFbMF0+djJbMF0gPyB2MVswXSA6IHYyWzBdLFxuICAgICAgICAgICAgICAgICAgICB2MVsxXT52MlsxXSA/IHYxWzFdIDogdjJbMV0sXG4gICAgICAgICAgICAgICAgICAgIHYxWzJdPnYyWzJdID8gdjFbMl0gOiB2MlsyXSxcbiAgICAgICAgICAgICAgICAgICAgdjFbM10+djJbM10gPyB2MVszXSA6IHYyWzNdXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdjEubGVuZ3RoIH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBtaW5WZWN0b3IodjEsdjIpIHtcbiAgICAgICAgICAgIHRoaXMuY2hlY2tFcXVhbExlbmd0aCh2MSx2Mik7XG4gICAgICAgICAgICBzd2l0Y2ggKHYxLmxlbmd0aCkge1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFtcbiAgICAgICAgICAgICAgICAgICAgdjFbMF08djJbMF0gPyB2MVswXSA6IHYyWzBdLFxuICAgICAgICAgICAgICAgICAgICB2MVsxXTx2MlsxXSA/IHYxWzFdIDogdjJbMV1cbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbXG4gICAgICAgICAgICAgICAgICAgIHYxWzBdPHYyWzBdID8gdjFbMF0gOiB2MlswXSxcbiAgICAgICAgICAgICAgICAgICAgdjFbMV08djJbMV0gPyB2MVsxXSA6IHYyWzFdLFxuICAgICAgICAgICAgICAgICAgICB2MVsyXTx2MlsyXSA/IHYxWzJdIDogdjJbMl1cbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbXG4gICAgICAgICAgICAgICAgICAgIHYxWzBdPHYyWzBdID8gdjFbMF0gOiB2MlswXSxcbiAgICAgICAgICAgICAgICAgICAgdjFbMV08djJbMV0gPyB2MVsxXSA6IHYyWzFdLFxuICAgICAgICAgICAgICAgICAgICB2MVsyXTx2MlsyXSA/IHYxWzJdIDogdjJbMl0sXG4gICAgICAgICAgICAgICAgICAgIHYxWzNdPHYyWzNdID8gdjFbM10gOiB2MlszXVxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYxLmxlbmd0aCB9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWRkKHYxLHYyKSB7XG4gICAgICAgICAgICB0aGlzLmNoZWNrRXF1YWxMZW5ndGgodjEsdjIpO1xuICAgICAgICAgICAgc3dpdGNoICh2MS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbXG4gICAgICAgICAgICAgICAgICAgIHYxWzBdICsgdjJbMF0sXG4gICAgICAgICAgICAgICAgICAgIHYxWzFdICsgdjJbMV1cbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbXG4gICAgICAgICAgICAgICAgICAgIHYxWzBdICsgdjJbMF0sXG4gICAgICAgICAgICAgICAgICAgIHYxWzFdICsgdjJbMV0sXG4gICAgICAgICAgICAgICAgICAgIHYxWzJdICsgdjJbMl1cbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbXG4gICAgICAgICAgICAgICAgICAgIHYxWzBdICsgdjJbMF0sXG4gICAgICAgICAgICAgICAgICAgIHYxWzFdICsgdjJbMV0sXG4gICAgICAgICAgICAgICAgICAgIHYxWzJdICsgdjJbMl0sXG4gICAgICAgICAgICAgICAgICAgIHYxWzNdICsgdjJbM11cbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB2MS5sZW5ndGggfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHN1Yih2MSx2Mikge1xuICAgICAgICAgICAgdGhpcy5jaGVja0VxdWFsTGVuZ3RoKHYxLHYyKTtcbiAgICAgICAgICAgIHN3aXRjaCAodjEubGVuZ3RoKSB7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoW1xuICAgICAgICAgICAgICAgICAgICB2MVswXSAtIHYyWzBdLFxuICAgICAgICAgICAgICAgICAgICB2MVsxXSAtIHYyWzFdXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoW1xuICAgICAgICAgICAgICAgICAgICB2MVswXSAtIHYyWzBdLFxuICAgICAgICAgICAgICAgICAgICB2MVsxXSAtIHYyWzFdLFxuICAgICAgICAgICAgICAgICAgICB2MVsyXSAtIHYyWzJdXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoW1xuICAgICAgICAgICAgICAgICAgICB2MVswXSAtIHYyWzBdLFxuICAgICAgICAgICAgICAgICAgICB2MVsxXSAtIHYyWzFdLFxuICAgICAgICAgICAgICAgICAgICB2MVsyXSAtIHYyWzJdLFxuICAgICAgICAgICAgICAgICAgICB2MVszXSAtIHYyWzNdXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdjEubGVuZ3RoIH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBtYWduaXR1ZGUodikge1xuICAgICAgICAgICAgc3dpdGNoICh2Lmxlbmd0aCkge1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLnNxcnQodlswXSAqIHZbMF0gKyB2WzFdICogdlsxXSk7XG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdGguc3FydCh2WzBdICogdlswXSArIHZbMV0gKiB2WzFdICsgdlsyXSAqIHZbMl0pO1xuICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLnNxcnQodlswXSAqIHZbMF0gKyB2WzFdICogdlsxXSArIHZbMl0gKiB2WzJdICsgdlszXSAqIHZbM10pO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYubGVuZ3RoIH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBkaXN0YW5jZSh2MSx2Mikge1xuICAgICAgICAgICAgdGhpcy5jaGVja0VxdWFsTGVuZ3RoKHYxLHYyKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1hZ25pdHVkZSh0aGlzLnN1Yih2MSx2MikpO1xuICAgICAgICB9LFxuICAgIFxuICAgICAgICBkb3QodjEsdjIpIHtcbiAgICAgICAgICAgIHRoaXMuY2hlY2tFcXVhbExlbmd0aCh2MSx2Mik7XG4gICAgICAgICAgICBzd2l0Y2ggKHYxLmxlbmd0aCkge1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIHJldHVybiB2MVswXSAqIHYyWzBdICsgdjFbMV0gKiB2MlsxXTtcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdjFbMF0gKiB2MlswXSArIHYxWzFdICogdjJbMV0gKyB2MVsyXSAqIHYyWzJdO1xuICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICAgIHJldHVybiB2MVswXSAqIHYyWzBdICsgdjFbMV0gKiB2MlsxXSArIHYxWzJdICogdjJbMl0gKyB2MVszXSAqIHYyWzNdO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYxLmxlbmd0aCB9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgXG4gICAgICAgIGNyb3NzKHYxLHYyKSB7XG4gICAgICAgICAgICB0aGlzLmNoZWNrRXF1YWxMZW5ndGgodjEsdjIpO1xuICAgICAgICAgICAgc3dpdGNoICh2MS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdjFbMF0gKiB2MlsxXSAtIHYxWzFdIC0gdjJbMF07XG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoW1xuICAgICAgICAgICAgICAgICAgICB2MVsxXSAqIHYyWzJdIC0gdjFbMl0gKiB2MlsxXSxcbiAgICAgICAgICAgICAgICAgICAgdjFbMl0gKiB2MlswXSAtIHYxWzBdICogdjJbMl0sXG4gICAgICAgICAgICAgICAgICAgIHYxWzBdICogdjJbMV0gLSB2MVsxXSAqIHYyWzBdLFxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemUgZm9yIGNyb3NzIHByb2R1Y3Q6ICR7IHYxLmxlbmd0aCB9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgbm9ybWFsaXplKHYpIHtcbiAgICAgICAgICAgIGNvbnN0IG0gPSB0aGlzLm1hZ25pdHVkZSh2KTtcbiAgICAgICAgICAgIHN3aXRjaCAodi5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICB2WzNdID0gdlszXSAvIG07XG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgdlsyXSA9IHZbMl0gLyBtO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIHZbMV0gPSB2WzFdIC8gbTsgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB2WzBdID0gdlswXSAvIG07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdi5sZW5ndGggfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHY7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Tm9ybWFsaXplZCh2KSB7XG4gICAgICAgICAgICBjb25zdCBtID0gdGhpcy5tYWduaXR1ZGUodik7XG4gICAgICAgICAgICBzd2l0Y2ggKHYubGVuZ3RoKSB7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoWyB2WzBdIC8gbSwgdlsxXSAvIG0gXSk7XG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoWyB2WzBdIC8gbSwgdlsxXSAvIG0sIHZbMl0gLyBtIF0pO1xuICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFsgdlswXSAvIG0sIHZbMV0gLyBtLCB2WzJdIC8gbSwgdlszXSAvIG0gXSlcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB2Lmxlbmd0aCB9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgbXVsdCh2LHMpIHtcbiAgICAgICAgICAgIHN3aXRjaCAodi5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbIHZbMF0gKiBzLCB2WzFdICogcyBdKTtcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbIHZbMF0gKiBzLCB2WzFdICogcywgdlsyXSAqIHMgXSk7XG4gICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBOdW1lcmljQXJyYXkoWyB2WzBdICogcywgdlsxXSAqIHMsIHZbMl0gKiBzLCB2WzNdICogcyBdKTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB2Lmxlbmd0aCB9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGl2KHYscykge1xuICAgICAgICAgICAgc3dpdGNoICh2Lmxlbmd0aCkge1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFsgdlswXSAvIHMsIHZbMV0gLyBzIF0pO1xuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgTnVtZXJpY0FycmF5KFsgdlswXSAvIHMsIHZbMV0gLyBzLCB2WzJdIC8gcyBdKTtcbiAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IE51bWVyaWNBcnJheShbIHZbMF0gLyBzLCB2WzFdIC8gcywgdlsyXSAvIHMsIHZbM10gLyBzIF0pO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYubGVuZ3RoIH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBlcXVhbHModjEsdjIpIHtcbiAgICAgICAgICAgIGlmICh2MS5sZW5ndGggIT0gdjIubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoICh2MS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2MVswXSA9PT0gdjJbMF0gJiYgdjFbMV0gPT09IHYyWzFdO1xuICAgICAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHYxWzBdID09PSB2MlswXSAmJiB2MVsxXSA9PT0gdjJbMV0gJiYgdjFbMl0gPT09IHYyWzJdO1xuICAgICAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHYxWzBdID09PSB2MlswXSAmJiB2MVsxXSA9PT0gdjJbMV0gJiYgdjFbMl0gPT09IHYyWzJdICYmIHYxWzNdID09PSB2MlszXTtcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYxLmxlbmd0aCB9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGFzc2lnbihkc3Qsc3JjKSB7XG4gICAgICAgICAgICB0aGlzLmNoZWNrRXF1YWxMZW5ndGgoZHN0LHNyYyk7XG4gICAgICAgICAgICBzd2l0Y2ggKGRzdC5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICBkc3RbM10gPSBzcmNbM107XG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgZHN0WzJdID0gc3JjWzJdO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIGRzdFsxXSA9IHNyY1sxXTtcbiAgICAgICAgICAgICAgICBkc3RbMF0gPSBzcmNbMF07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgZHN0Lmxlbmd0aCB9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0KHYsIHgsIHksIHogPSBudWxsLCB3ID0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKHYubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICAgICAgdlswXSA9IHg7XG4gICAgICAgICAgICAgICAgdlsxXSA9IHk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh2Lmxlbmd0aCA9PT0gMyAmJiB6ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdlswXSA9IHg7XG4gICAgICAgICAgICAgICAgdlsxXSA9IHk7XG4gICAgICAgICAgICAgICAgdlsyXSA9IHo7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh2Lmxlbmd0aCA9PT0gNCAmJiB3ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdlswXSA9IHg7XG4gICAgICAgICAgICAgICAgdlsxXSA9IHk7XG4gICAgICAgICAgICAgICAgdlsyXSA9IHo7XG4gICAgICAgICAgICAgICAgdlszXSA9IHc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYubGVuZ3RoIH0uIFRyeWluZyB0byBzZXQgeD0ke3h9LCB5PSR7eX0sIHo9JHt6fSwgdz0ke3d9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNOYU4odikge1xuICAgICAgICAgICAgc3dpdGNoICh2Lmxlbmd0aCkge1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIHJldHVybiBpc05hTih2WzBdKSB8fCBpc05hTih2WzFdKTtcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICByZXR1cm4gaXNOYU4odlswXSkgfHwgaXNOYU4odlsxXSkgfHwgaXNOYU4odlsyXSk7XG4gICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlzTmFOKHZbMF0pIHx8IGlzTmFOKHZbMV0pIHx8IGlzTmFOKHZbMl0pIHx8IGlzTmFOKHZbM10pO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYubGVuZ3RoIH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB4eSh2KSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHYubGVuZ3RoKSB7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFZlY3Rvcih2KTtcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICByZXR1cm4gVmVjdG9yKHZbMF0sIHZbMV0pO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYubGVuZ3RoIH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB4eih2KSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHYubGVuZ3RoKSB7XG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFZlY3Rvcih2WzBdLCB2WzJdKTtcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHZlY3RvciBzaXplOiAkeyB2Lmxlbmd0aCB9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgeXoodikge1xuICAgICAgICAgICAgc3dpdGNoICh2Lmxlbmd0aCkge1xuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICAgIHJldHVybiBWZWN0b3IodlsxXSwgdlsyXSk7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2ZWN0b3Igc2l6ZTogJHsgdi5sZW5ndGggfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHh5eih2KSB7XG4gICAgICAgICAgICBpZiAodi5sZW5ndGggIT09IDQpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdmVjdG9yIHNpemU6ICR7IHYubGVuZ3RoIH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBWZWN0b3IodlswXSx2WzFdLHZbMl0pO1xuICAgICAgICB9XG4gICAgfSAgICBcbn1cblxuIiwiXG5pbXBvcnQge1xuICAgIEF4aXMsXG4gICAgUEksXG4gICAgREVHX1RPX1JBRCxcbiAgICBSQURfVE9fREVHLFxuICAgIFBJXzIsXG4gICAgUElfNCxcbiAgICBQSV84LFxuICAgIFRXT19QSSxcbiAgICBFUFNJTE9OLFxuICAgIE51bWVyaWNBcnJheSxcbiAgICBOdW1lcmljQXJyYXlIaWdoUCxcbiAgICBGTE9BVF9NQVhcbn0gZnJvbSBcIi4vY29uc3RhbnRzXCI7XG5cbmltcG9ydCB7XG4gICAgY2hlY2tQb3dlck9mVHdvLFxuICAgIGNoZWNrWmVybyxcbiAgICBlcXVhbHMsXG4gICAgZGVncmVlc1RvUmFkaWFucyxcbiAgICByYWRpYW5zVG9EZWdyZWVzLFxuICAgIHNpbixcbiAgICBjb3MsXG4gICAgdGFuLFxuICAgIGNvdGFuLFxuICAgIGF0YW4sXG4gICAgYXRhbjIsXG4gICAgcmFuZG9tLFxuICAgIHNlZWRlZFJhbmRvbSxcbiAgICBtYXgsXG4gICAgbWluLFxuICAgIGFicyxcbiAgICBzcXJ0LFxuICAgIGxlcnAsXG4gICAgc3F1YXJlXG59IGZyb20gXCIuL2Z1bmN0aW9uc1wiO1xuXG5pbXBvcnQgVmVjdG9yVXRpbHMgZnJvbSAnLi9WZWN0b3InO1xuXG5leHBvcnQgY29uc3QgbWF0aCA9IHtcbiAgICBBeGlzLFxuICAgIFBJLFxuICAgIERFR19UT19SQUQsXG4gICAgUkFEX1RPX0RFRyxcbiAgICBQSV8yLFxuICAgIFBJXzQsXG4gICAgUElfOCxcbiAgICBUV09fUEksXG4gICAgRVBTSUxPTixcbiAgICBOdW1lcmljQXJyYXksXG4gICAgTnVtZXJpY0FycmF5SGlnaFAsXG4gICAgRkxPQVRfTUFYLFxuXG4gICAgY2hlY2tQb3dlck9mVHdvLFxuICAgIGNoZWNrWmVybyxcbiAgICBlcXVhbHMsXG4gICAgZGVncmVlc1RvUmFkaWFucyxcbiAgICByYWRpYW5zVG9EZWdyZWVzLFxuICAgIHNpbixcbiAgICBjb3MsXG4gICAgdGFuLFxuICAgIGNvdGFuLFxuICAgIGF0YW4sXG4gICAgYXRhbjIsXG4gICAgcmFuZG9tLFxuICAgIHNlZWRlZFJhbmRvbSxcbiAgICBtYXgsXG4gICAgbWluLFxuICAgIGFicyxcbiAgICBzcXJ0LFxuICAgIGxlcnAsXG4gICAgc3F1YXJlXG59O1xuXG5leHBvcnQgY29uc3QgVmVjdG9yID0gVmVjdG9yVXRpbHMuVmVjdG9yO1xuZXhwb3J0IGNvbnN0IHZlYyA9IFZlY3RvclV0aWxzLnZlYztcbiJdLCJuYW1lcyI6WyJWZWN0b3IiXSwibWFwcGluZ3MiOiJBQUNPLE1BQU0sSUFBSSxHQUFHO0FBQ3BCLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDUixDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ0wsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUNMLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDTCxJQUFJLElBQUksRUFBRSxDQUFDLElBQUksS0FBSztBQUNwQixRQUFRLFFBQVEsSUFBSTtBQUNwQixRQUFRLEtBQUssSUFBSSxDQUFDLElBQUk7QUFDdEIsWUFBWSxPQUFPLE1BQU0sQ0FBQztBQUMxQixRQUFRLEtBQUssSUFBSSxDQUFDLENBQUM7QUFDbkIsWUFBWSxPQUFPLEdBQUcsQ0FBQztBQUN2QixRQUFRLEtBQUssSUFBSSxDQUFDLENBQUM7QUFDbkIsWUFBWSxPQUFPLEdBQUcsQ0FBQztBQUN2QixRQUFRLEtBQUssSUFBSSxDQUFDLENBQUM7QUFDbkIsWUFBWSxPQUFPLEdBQUcsQ0FBQztBQUN2QixRQUFRLEtBQUssSUFBSSxDQUFDLENBQUM7QUFDbkIsWUFBWSxPQUFPLEdBQUcsQ0FBQztBQUN2QixRQUFRO0FBQ1IsWUFBWSxPQUFPLFNBQVM7QUFDNUIsU0FDQSxLQUFLO0FBQ0wsQ0FBQyxDQUFDO0FBQ0Y7QUFDTyxNQUFNLEVBQUUsR0FBRyxp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QUFHLENBQUMsR0FBRyxLQUFLO0FBQzVCLElBQUksT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN0QyxFQUFDO0FBQ0Q7QUFDTyxNQUFNLElBQUksR0FBRyxDQUFDLEdBQUcsS0FBSztBQUM3QixJQUFJLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsRUFBQztBQUNEO0FBQ08sTUFBTSxJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUMsS0FBSztBQUNyQyxJQUFJLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztBQUNsRCxFQUFDO0FBQ0Q7QUFDTyxNQUFNLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBSztBQUM3QixJQUFJLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDOUI7O0FDNUZBLFNBQVNBLFFBQU0sR0FBRztBQUNsQixJQUFJLFFBQVEsU0FBUyxDQUFDLE1BQU07QUFDNUIsSUFBSSxLQUFLLENBQUM7QUFDVixRQUFRLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxZQUFZLFlBQVk7QUFDaEQsWUFBWSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUM7QUFDckMsWUFBWSxPQUFPLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVE7QUFDN0MsVUFBVTtBQUNWLFlBQVksT0FBTyxJQUFJLFlBQVksQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2RixTQUFT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QUUsQ0FBQyxNQUFNO0FBQzdCLFlBQVksS0FBSyxDQUFDO0FBQ2xCLGdCQUFnQixPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyRCxZQUFZLEtBQUssQ0FBQztBQUNsQixnQkFBZ0IsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyRSxZQUFZLEtBQUssQ0FBQztBQUNsQixnQkFBZ0IsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JGLFlBQVk7QUFDWixnQkFBZ0IsTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLHFCQUFxQixHQUFHLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDdkUsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBLFFBQVEsS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDckIsWUFBWSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3pDLFlBQVksUUFBUSxFQUFFLENBQUMsTUFBTTtBQUM3QixZQUFZLEtBQUssQ0FBQztBQUNsQixnQkFBZ0IsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxD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
