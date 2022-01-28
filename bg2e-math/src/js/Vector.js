import { NumericArray } from "./constants";

const checkEqualLength = (v1,v2) => {
    if (v1.length!=v2.length) throw new Error(`Invalid vector length in operation`);
}

class Vector extends NumericArray {
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
                super([ arguments[0][0], arguments[0][1], arguments[1], arguments[2]])
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
            return new Vector(this);
        case 3:
        case 4:
            return new Vector(this[0], this[1]);
        default:
            throw new Error(`Invalid vector size: ${ this.length }`);
        }
    }

    get xz() {
        switch (this.length) {
        case 3:
        case 4:
            return new Vector(this[0], this[2]);
        case 2:
        default:
            throw new Error(`Invalid vector size: ${ this.length }`);
        }
    }

    get yz() {
        switch (this.length) {
        case 3:
        case 4:
            return new Vector(this[1], this[2]);
        case 2:
        default:
            throw new Error(`Invalid vector size: ${ this.length }`);
        }
    }

    get xyz() {
        if (this.length !== 4) {
            throw new Error(`Invalid vector size: ${ this.length }`);
        }
        return new Vector(this[0], this[1], this[2]);
    }
}

export default {
    Vector: Vector,

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
                return new Vector(v);
            case 3:
            case 4:
                return new Vector(v[0], v[1]);
            default:
                throw new Error(`Invalid vector size: ${ v.length }`);
            }
        },

        xz(v) {
            switch (v.length) {
            case 3:
            case 4:
                return new Vector(v[0], v[2]);
            case 2:
            default:
                throw new Error(`Invalid vector size: ${ v.length }`);
            }
        },

        yz(v) {
            switch (v.length) {
            case 3:
            case 4:
                return new Vector(v[1], v[2]);
            case 2:
            default:
                throw new Error(`Invalid vector size: ${ v.length }`);
            }
        },

        xyz(v) {
            if (v.length !== 4) {
                throw new Error(`Invalid vector size: ${ v.length }`);
            }
            return new Vector(v[0],v[1],v[2]);
        }
    }    
}

