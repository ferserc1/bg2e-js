import { NumericArray } from "./constants";
import { isZero, equals, lerp, clamp } from "./functions";

const checkEqualLength = (v1: ArrayLike<number>, v2: ArrayLike<number>): void => {
    if (v1.length!=v2.length) throw new Error(`Invalid vector length in operation`);
}

export default class Vec extends NumericArray {
    constructor();
    constructor(v: ArrayLike<number>);
    constructor(v: ArrayLike<number>, z: number);
    constructor(v: ArrayLike<number>, z: number, w: number);
    constructor(x: number, y: number);
    constructor(x: number, y: number, z: number);
    constructor(x: number, y: number, z: number, w: number);
    constructor(...args: any[]) {
        switch (args.length) {
        case 0:
            super([0, 0]);
            break;
        case 1:
            if (args[0].length>1 && args[0].length<5)
            {
                super(args[0]);
            }
            break;
        case 2:
            if (args[0].length === 2 && typeof(args[1]) === "number"
            ) {
                super([ args[0][0], args[0][1], args[1]]);
            }
            else if (args[0].length === 3 &&
                typeof(args[1]) === "number"
            ) {
                super([ args[0][0], args[0][1], args[0][2], args[1]]);
            }
            else if (typeof(args[0]) === "number" &&
                typeof(args[1]) === "number"
            ) {
                super([args[0],args[1]]);
            }
            break;
        case 3:
            if (args[0].length === 2 &&
                typeof(args[1]) === "number" && typeof(args[2]) === "number"
            ) {
                super([ args[0][0], args[0][1], args[1], args[2]])
            }
            else if (typeof(args[0]) === "number" &&
                typeof(args[1]) === "number" &&
                typeof(args[2]) === "number"
            ) {
                super([args[0],args[1],args[2]]);
            }
            break;
        case 4:
            super([args[0],args[1],args[2],args[3]]);
            break;
        default:
            throw new Error(`Invalid parameters in Vec constructor`);
        }
    }

    normalize(): this {
        const m = Vec.Magnitude(this);
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

    assign(src: ArrayLike<number>): void {
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

    
    setValue(x: number, y: number, z?: number | null, w?: number | null): void {
        if (this.length === 2) {
            this[0] = x;
            this[1] = y;
        }
        else if (this.length === 3 && z !== null && z !== undefined) {
            this[0] = x;
            this[1] = y;
            this[2] = z;
        }
        else if (this.length === 4 && z !== null && z !== undefined && w !== null && w !== undefined) {
            this[0] = x;
            this[1] = y;
            this[2] = z;
            this[3] = w;
        }
        else {
            throw new Error(`Invalid vector size: ${ this.length }. Trying to set x=${x}, y=${y}, z=${z}, w=${w}`);
        }
    }

    set(array: ArrayLike<number>, offset?: number): this {
        throw new Error("Vec.set() is not available. Use Vec.setValue() to set individual components or Vec.assign() to copy from another vector.");
    }

    scale(s: number): this {
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
            throw new Error(`Invalid vector size: ${ this.length }`);
        }
        return this;
    }

    get x(): number {
        return this[0];
    }

    get y(): number {
        return this[1];
    }

    get z(): number {
        return this[2];
    }

    get w(): number {
        return this[3];
    }

    set x(v: number) {
        this[0] = v;
    }

    set y(v: number) {
        this[1] = v;
    }

    set z(v: number) {
        this[2] = v;
    }

    set w(v: number) {
        this[3] = v;
    }

    get r(): number {
        return this[0];
    }

    get g(): number {
        return this[1];
    }

    get b(): number {
        return this[2];
    }

    get a(): number {
        return this[3];
    }

    set r(v: number) {
        this[0] = v;
    }

    set g(v: number) {
        this[1] = v;
    }

    set b(v: number) {
        this[2] = v;
    }

    set a(v: number) {
        this[3] = v;
    }

    get width(): number {
        switch (this.length) {
        case 2:
            return this[0];
        case 4:
            return this[2];
        default:
            throw new Error("Vec.width function used on non size or viewport vectors (two or four elements)");
        }
    }

    get height(): number {
        switch (this.length) {
            case 2:
                return this[1];
            case 4:
                return this[3];
            default:
                throw new Error("Vec.width function used on non size or viewport vectors (two or four elements)");
            }
    }

    set width(w: number) {
        this[0] = w;
    }

    set height(h: number) {
        this[1] = h;
    }
    
    get xy(): Vec {
        switch (this.length) {
        case 2:
            return new Vec(this);
        case 3:
        case 4:
            return new Vec(this[0], this[1]);
        default:
            throw new Error(`Invalid vector size: ${ this.length }`);
        }
    }

    get xz(): Vec {
        switch (this.length) {
        case 3:
        case 4:
            return new Vec(this[0], this[2]);
        case 2:
        default:
            throw new Error(`Invalid vector size: ${ this.length }`);
        }
    }

    get yz(): Vec {
        switch (this.length) {
        case 3:
        case 4:
            return new Vec(this[1], this[2]);
        case 2:
        default:
            throw new Error(`Invalid vector size: ${ this.length }`);
        }
    }

    set xy(v: ArrayLike<number>) {
        this[0] = v[0];
        this[1] = v[1];
    }

    set xz(v: ArrayLike<number>) {
        if (this.length<3) {
            throw new Error('Invalid vector size');
        }
        this[0] = v[0];
        this[2] = v[1];
    }

    set yz(v: ArrayLike<number>) {
        if (this.length<3) {
            throw new Error('Invalid vector size');
        }
        this[1] = v[0];
        this[2] = v[1];
    }

    get xyz(): Vec {
        if (this.length < 3) {
            throw new Error(`Invalid vector size: ${ this.length }`);
        }
        return new Vec(this[0], this[1], this[2]);
    }

    set xyz(v: readonly number[]) {
        if (v.length<3 || this.length<3) {
            throw new Error(`Invalid vector size to set: l;${ this.length }, r:${v.length}`);
        }
        this[0] = v[0];
        this[1] = v[1];
        this[2] = v[2];
    }

    // Copy operator
    get xyzw(): Vec {
        if (this.length < 4) {
            throw new Error(`Invalid vector size: ${ this.length }, 4 required`);
        }
        return new Vec(this[0], this[1], this[2], this[3]);
    }

    // Assign operator
    set xyzw(v: ArrayLike<number>) {
        if (this.length < 4 || v.length<4) {
            throw new Error(`Invalid vector size to set: l;${ this.length }, r:${v.length}`);
        }
        this[0] = v[0];
        this[1] = v[1];
        this[2] = v[2];
        this[3] = v[3];
    }

    get rgb(): Vec {
        if (this.length < 3) {
            throw new Error(`Invalid vector size: ${this.length}, but at least 3 required`);
        }
        return new Vec(this[0],this[1],this[2]);
    }

    set rgb(v: ArrayLike<number>) {
        if (v.length<3 || this.length<3) {
            throw new Error(`Invalid vector size to set: l;${ this.length }, r:${v.length}`);
        }
        this[0] = v[0];
        this[1] = v[1];
        this[2] = v[2];
    }

    get rg(): Vec {
        if (this.length<3 || this.length<3) {
            throw new Error(`Invalid vector size to set: l;${ this.length }, r:${this.length}`);
        }
        return new Vec(this[0], this[1]);
    }

    get gb(): Vec {
        if (this.length<3 || this.length<3) {
            throw new Error(`Invalid vector size to set: l;${ this.length }, r:${this.length}`);
        }
        return new Vec(this[1], this[2]);
    }

    get rb(): Vec {
        if (this.length<3 || this.length<3) {
            throw new Error(`Invalid vector size to set: l;${ this.length }, r:${this.length}`);
        }
        return new Vec(this[0], this[2]);
    }

    get hexColor(): string {
        const r = Math.round(this.r * 255);
        const g = Math.round(this.g * 255);
        const b = Math.round(this.b * 255);
        const hex = (color: number): string => color.toString(16).toUpperCase();
        return `#${ hex(r) }${ hex(g) }${ hex(b) }`;
    }

    get cssColor(): string | undefined {
        return `rgb(${ Math.round(this.r * 255) } ${ Math.round(this.g * 255) } ${ Math.round(this.b * 255) }${ this.length>=4 ? `, ${ this.a }` : ''})`;
    }

    get aspectRatio(): number {
        return this.width / this.height;
    }

    toString(): string {
        switch (this.length) {
        case 2:
            return `[${this[0]}, ${this[1]}]`;
        case 3:
            return `[${this[0]}, ${this[1]}, ${this[2]}]`;
        case 4:
            return `[${this[0]}, ${this[1]}, ${this[2]}, ${this[3]}]`;
        }
        return "[]";
    }

    static CheckEqualLength(v1: ArrayLike<number>, v2: ArrayLike<number>): void {
        checkEqualLength(v1,v2);
    }

    static Max(v1: ArrayLike<number>, v2: ArrayLike<number>): Vec {
        checkEqualLength(v1,v2);
        switch (v1.length) {
        case 2:
            return new Vec([
                v1[0]>v2[0] ? v1[0] : v2[0],
                v1[1]>v2[1] ? v1[1] : v2[1]
            ]);
        case 3:
            return new Vec([
                v1[0]>v2[0] ? v1[0] : v2[0],
                v1[1]>v2[1] ? v1[1] : v2[1],
                v1[2]>v2[2] ? v1[2] : v2[2]
            ]);
        case 4:
            return new Vec([
                v1[0]>v2[0] ? v1[0] : v2[0],
                v1[1]>v2[1] ? v1[1] : v2[1],
                v1[2]>v2[2] ? v1[2] : v2[2],
                v1[3]>v2[3] ? v1[3] : v2[3]
            ]);
        default:
            throw new Error(`Invalid vector size: ${ v1.length }`);
        }
    }

    static Min(v1: ArrayLike<number>, v2: ArrayLike<number>): Vec {
        checkEqualLength(v1,v2);
        switch (v1.length) {
        case 2:
            return new Vec([
                v1[0]<v2[0] ? v1[0] : v2[0],
                v1[1]<v2[1] ? v1[1] : v2[1]
            ]);
        case 3:
            return new Vec([
                v1[0]<v2[0] ? v1[0] : v2[0],
                v1[1]<v2[1] ? v1[1] : v2[1],
                v1[2]<v2[2] ? v1[2] : v2[2]
            ]);
        case 4:
            return new Vec([
                v1[0]<v2[0] ? v1[0] : v2[0],
                v1[1]<v2[1] ? v1[1] : v2[1],
                v1[2]<v2[2] ? v1[2] : v2[2],
                v1[3]<v2[3] ? v1[3] : v2[3]
            ]);
        default:
            throw new Error(`Invalid vector size: ${ v1.length }`);
        }
    }

    static Add(v1: ArrayLike<number>, v2: ArrayLike<number>): Vec {
        checkEqualLength(v1,v2);
        switch (v1.length) {
        case 2:
            return new Vec([
                v1[0] + v2[0],
                v1[1] + v2[1]
            ]);
        case 3:
            return new Vec([
                v1[0] + v2[0],
                v1[1] + v2[1],
                v1[2] + v2[2]
            ]);
        case 4:
            return new Vec([
                v1[0] + v2[0],
                v1[1] + v2[1],
                v1[2] + v2[2],
                v1[3] + v2[3]
            ]);
        default:
            throw new Error(`Invalid vector size: ${ v1.length }`);
        }
    }

    static Sub(v1: ArrayLike<number>, v2: ArrayLike<number>): Vec {
        checkEqualLength(v1,v2);
        switch (v1.length) {
        case 2:
            return new Vec([
                v1[0] - v2[0],
                v1[1] - v2[1]
            ]);
        case 3:
            return new Vec([
                v1[0] - v2[0],
                v1[1] - v2[1],
                v1[2] - v2[2]
            ]);
        case 4:
            return new Vec([
                v1[0] - v2[0],
                v1[1] - v2[1],
                v1[2] - v2[2],
                v1[3] - v2[3]
            ]);
        default:
            throw new Error(`Invalid vector size: ${ v1.length }`);
        }
    }

    static Magnitude(v: ArrayLike<number>): number {
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

    static Distance(v1: ArrayLike<number>, v2: ArrayLike<number>): number {
        checkEqualLength(v1,v2);
        return Vec.Magnitude(Vec.Sub(v1,v2));
    }

    static Dot(v1: ArrayLike<number>, v2: ArrayLike<number>): number {
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

    static Cross(v1: ArrayLike<number>, v2: ArrayLike<number>): Vec | number {
        checkEqualLength(v1, v2);
        switch (v1.length) {
        case 2:
            return v1[0] * v2[1] - v1[1] * v2[0];
        case 3:
            return new Vec([
                v1[1] * v2[2] - v1[2] * v2[1],
                v1[2] * v2[0] - v1[0] * v2[2],
                v1[0] * v2[1] - v1[1] * v2[0],
            ]);
        default:
            throw new Error(`Invalid vector size for cross product: ${v1.length}`);
        }
    }

    static Normalized(v: ArrayLike<number>): Vec {
        const m = Vec.Magnitude(v);
        switch (v.length) {
        case 2:
            return new Vec([ v[0] / m, v[1] / m ]);
        case 3:
            return new Vec([ v[0] / m, v[1] / m, v[2] / m ]);
        case 4:
            return new Vec([ v[0] / m, v[1] / m, v[2] / m, v[3] / m ])
        default:
            throw new Error(`Invalid vector size: ${ v.length }`);
        }
    }

    static Mult(v: ArrayLike<number>, s: number): Vec {
        switch (v.length) {
        case 2:
            return new Vec([ v[0] * s, v[1] * s ]);
        case 3:
            return new Vec([ v[0] * s, v[1] * s, v[2] * s ]);
        case 4:
            return new Vec([ v[0] * s, v[1] * s, v[2] * s, v[3] * s ]);
        default:
            throw new Error(`Invalid vector size: ${ v.length }`);
        }
    }

    static Div(v: ArrayLike<number>, s: number): Vec {
        switch (v.length) {
        case 2:
            return new Vec([ v[0] / s, v[1] / s ]);
        case 3:
            return new Vec([ v[0] / s, v[1] / s, v[2] / s ]);
        case 4:
            return new Vec([ v[0] / s, v[1] / s, v[2] / s, v[3] / s ]);
        default:
            throw new Error(`Invalid vector size: ${ v.length }`);
        }
    }

    static Equals(v1: ArrayLike<number>, v2: ArrayLike<number>): boolean {
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

    static IsZero(v: ArrayLike<number>): boolean {
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

    static IsNaN(v: ArrayLike<number>): boolean {
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

    static Lerp(u: ArrayLike<number>, v: ArrayLike<number>, d: number): Vec {
        if (u.length != v.length) {
            throw new Error(`Different vector sizes calculating linear interpolation`);
        }
        switch (u.length) {
        case 2:
            return new Vec(
                lerp(u[0], v[0], d),
                lerp(u[1], v[1], d)
            );
        case 3:
            return new Vec(
                lerp(u[0], v[0], d),
                lerp(u[1], v[1], d),
                lerp(u[2], v[2], d)
            );
        case 4:
            return new Vec(
                lerp(u[0], v[0], d),
                lerp(u[1], v[1], d),
                lerp(u[2], v[2], d),
                lerp(u[3], v[3], d)
            );
        default:
            throw new Error(`Invalid vector size: ${ u.length }`);
        }
    }

    static Clamp(v: ArrayLike<number>, min: ArrayLike<number>, max: ArrayLike<number>): Vec {
        switch (v.length) {
        case 2:
            return new Vec(
                clamp(v[0], min[0], max[0]),
                clamp(v[1], min[1], max[1])
            );
        case 3:
            return new Vec(
                clamp(v[0], min[0], max[0]),
                clamp(v[1], min[1], max[1]),
                clamp(v[2], min[2], max[2])
            );
        case 4:
            return new Vec(
                clamp(v[0], min[0], max[0]),
                clamp(v[1], min[1], max[1]),
                clamp(v[2], min[2], max[2]),
                clamp(v[3], min[3], max[3])
            );
        default:
            throw new Error(`Invalid vector size: ${ v.length }`);
        }
    }

    /////// Constructors
    static Vec2(): Vec {
        return new Vec(0,0);
    }

    static Vec3(): Vec {
        return new Vec(0,0,0);
    }

    static Vec4(): Vec {
        return new Vec(0,0,0,0);
    }
}
