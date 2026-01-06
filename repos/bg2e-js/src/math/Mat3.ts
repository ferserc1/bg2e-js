import { NumericArray } from "./constants";
import Vec from "./Vec";
import { isZero, equals } from "./functions";

export default class Mat3 extends NumericArray {
    constructor();
    constructor(m: ArrayLike<number>);
    constructor(m0: number, m1: number, m2: number, m3: number, m4: number, m5: number, m6: number, m7: number, m8: number);
    constructor(...args: any[]) {
        if (args.length === 9) {
            super(args);
        }
        else if (args.length === 1 && args[0].length === 9) {
            super(args[0]);
        }
        else if (args.length === 0) {
            super([0,0,0,0,0,0,0,0,0]);
        }
        else {
            throw new Error(`Invalid parameter size in Mat3 constructor`);
        }
    }

    identity(): this {
        this[0] = 1; this[1] = 0; this[2] = 0;
        this[3] = 0; this[4] = 1; this[5] = 0;
        this[6] = 0; this[7] = 0; this[8] = 1;
        return this;
    }

    zero(): this {
        this[0] = 0; this[1] = 0; this[2] = 0;
        this[3] = 0; this[4] = 0; this[5] = 0;
        this[6] = 0; this[7] = 0; this[8] = 0;
        return this;
    }

    row(i: number): Vec {
        return new Vec(
            this[i * 3], 
            this[i * 3 + 1],
            this[i * 3 + 2]);
    }

    setRow(i: number, a: ArrayLike<number>): this;
    setRow(i: number, x: number, y: number, z: number): this;
    setRow(i: number, a: number | ArrayLike<number>, y?: number, z?: number): this {
        if (typeof a === 'object' && a.length >= 3) {
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

    col(i: number): Vec {
        return new Vec(
            this[i],
            this[i + 3],
            this[i + 3 * 2]
        )
    }

    setCol(i: number, a: ArrayLike<number>): this;
    setCol(i: number, x: number, y: number, z: number): this;
    setCol(i: number, a: number | ArrayLike<number>, y: number | null = null, z: number | null = null): this {
        if (typeof a === 'object' && a.length >= 3) {
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

    assign(m: ArrayLike<number>): this {
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

    setScale(x: number, y: number, z: number): this { 
		const rx = (new Vec(this[0], this[3], this[6])).normalize().scale(x);
		const ry = (new Vec(this[1], this[4], this[7])).normalize().scale(y);
		const rz = (new Vec(this[2], this[5], this[8])).normalize().scale(z);
		this[0] = rx.x; this[3] = rx.y; this[6] = rx.z;
		this[1] = ry.x; this[4] = ry.y; this[7] = ry.z;
		this[2] = rz.x; this[5] = rz.y; this[8] = rz.z;
		return this;
	}

    traspose(): this {
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

    mult(a: number): this;
    mult(a: Mat3): this;
    mult(a: number | Mat3): this {
        if (typeof(a) === "number") {
            this[0] *= a; this[1] *= a; this[2] *= a;
            this[3] *= a; this[4] *= a; this[5] *= a;
            this[6] *= a; this[7] *= a; this[8] *= a;
        }
        else if (a instanceof NumericArray && a.length === 9) {
            const r0 = this.row(0);
            const r1 = this.row(1);
            const r2 = this.row(2);
            const c0 = (a as Mat3).col(0);
            const c1 = (a as Mat3).col(1);
            const c2 = (a as Mat3).col(2);
            
            this[0] = Vec.Dot(r0,c0); this[1] = Vec.Dot(r0,c1); this[2] = Vec.Dot(r0,c2);
            this[3] = Vec.Dot(r1,c0); this[4] = Vec.Dot(r1,c1); this[5] = Vec.Dot(r1,c2);
            this[6] = Vec.Dot(r2,c0); this[7] = Vec.Dot(r2,c1); this[8] = Vec.Dot(r2,c2);
        }
        else {
            throw new Error(`Invalid parameter in Mat3.mult()`);
        }
        return this;
    }

    multVector(v: ArrayLike<number>): Vec {
        if (v.length === 2 || v.length === 3) {
            const x = v[0];
            const y = v[1];
            const z = v.length === 2 ? 1 : v[2];
        
            return new Vec(	this[0] * x + this[3] * y + this[6] * z,
                            this[1] * x + this[4] * y + this[7] * z,
                            this[2] * x + this[5] * y + this[8] * z);
        }
        else {
            throw new Error(`Invalid parameter in Mat3.multVector()`);
        }
    }

    toString(): string {
        return  `[ ${this[0]}, ${this[1]}, ${this[2]}\n` +
                `  ${this[3]}, ${this[4]}, ${this[5]}\n` +
                `  ${this[6]}, ${this[7]}, ${this[8]} ]`;
    }

    static MakeIdentity(): Mat3 {
        const m = new Mat3();
        return m.identity();
    }

    static MakeZero(): Mat3 {
        const m = new Mat3();
        return m.zero();
    }

    static MakeWithQuaternion(q: ArrayLike<number>): Mat3 {
        const m = Mat3.MakeIdentity();
        
        m.setRow(0, new Vec( 1  - 2 * q[1] * q[1] - 2 * q[2] * q[2], 2 * q[0] * q[1] - 2 * q[2] * q[3], 2 * q[0] * q[2] + 2 * q[1] * q[3]));
        m.setRow(1, new Vec( 2 * q[0] * q[1] + 2 * q[2] * q[3], 1  - 2.0 * q[0] * q[0] - 2 * q[2] * q[2], 2 * q[1] * q[2] - 2 * q[0] * q[3]));
        m.setRow(2, new Vec( 2 * q[0] * q[2] - 2 * q[1] * q[3], 2 * q[1] * q[2] + 2 * q[0] * q[3] , 1 - 2 * q[0] * q[0] - 2 * q[1] * q[1]));

        return m;
    }

    // https://en.wikipedia.org/wiki/Rotation_matrix#Rotation_matrix_from_axis_and_angle
    // Make a rotation matrix from an axis and an angle
    static MakeRotationWithDirection(direction: Vec, up?: Vec): Mat3 {
        const m = Mat3.MakeIdentity();
        const upVec = up || new Vec(0,1,0);
        const z = direction.normalize();
        // Since vectors are 3-dimensional, the cross product will always return a Vecz.
        const x = (Vec.Cross(upVec, z) as Vec).normalize() as Vec;
        const y = (Vec.Cross(z, x) as Vec).normalize() as Vec;

        m.setRow(0, x);
        m.setRow(1, y);
        m.setRow(2, z);

        return m;
    }

    static IsZero(m: ArrayLike<number>): boolean {
        return	isZero(m[0]) && isZero(m[1]) && isZero(m[2]) &&
                isZero(m[3]) && isZero(m[4]) && isZero(m[5]) &&
                isZero(m[6]) && isZero(m[7]) && isZero(m[8]);
    }
    
    static IsIdentity(m: ArrayLike<number>): boolean {
        return	equals(m[0], 1) && isZero(m[1]) && isZero(m[2]) &&
                isZero(m[3]) && equals(m[4], 1) && isZero(m[5]) &&
                isZero(m[6]) && isZero(m[7]) && equals(m[8], 1);
    }

    static GetScale(m: ArrayLike<number>): Vec {
        return new Vec(
            Vec.Magnitude(new Vec(m[0], m[3], m[6])),
            Vec.Magnitude(new Vec(m[1], m[4], m[7])),
            Vec.Magnitude(new Vec(m[2], m[5], m[8]))
        );
    }

    static Equals(a: ArrayLike<number>, b: ArrayLike<number>): boolean {
        return	equals(a[0], b[0]) && equals(a[1], b[1])  && equals(a[2], b[2]) &&
                equals(a[3], b[3]) && equals(a[4], b[4])  && equals(a[5], b[5]) &&
                equals(a[6], b[6]) && equals(a[7], b[7])  && equals(a[8], b[8]);
    }

    static IsNaN(m: ArrayLike<number>): boolean {
        return	isNaN(m[0]) || isNaN(m[1]) || isNaN(m[2]) &&
                isNaN(m[3]) || isNaN(m[4]) || isNaN(m[5]) &&
                isNaN(m[6]) || isNaN(m[7]) || isNaN(m[8]);
    }

    // This function multyplies two B x A matrices. It works opposite than the non-static mult() function:
	// A.mult(B) is the same as Mat4.Mult(B,A)
    static Mult(A: Mat3, B: Mat3): Mat3 {
        const result = new Mat3(B);
		return result.mult(A);
    }
};
