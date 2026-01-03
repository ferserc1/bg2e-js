import { NumericArray, PI, checkArray } from "./constants";
import Vec from "./Vec";
import Mat3 from "./Mat3";
import { equals, isZero } from "./functions";

export default class Mat4 extends NumericArray {
    constructor();
    constructor(m: ArrayLike<number>);
    constructor(m0: number, m1: number, m2: number, m3: number, m4: number, m5: number, m6: number, m7: number, m8: number, m9: number, m10: number, m11: number, m12: number, m13: number, m14: number, m15: number);
    constructor(...args: any[]) {
        const inMatrix = [
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0
        ];

        // Create from matrix3
        if (args.length === 9) {
            inMatrix[0] = args[0]; 
            inMatrix[1] = args[1];
            inMatrix[2] = args[2];

            inMatrix[4] = args[3]; 
            inMatrix[5] = args[4];
            inMatrix[6] = args[5];

            inMatrix[8] = args[6]; 
            inMatrix[9] = args[7];
            inMatrix[10] = args[8];

            inMatrix[15] = 1;
        }
        else if (args.length === 1 && args[0].length === 9) {
            inMatrix[0]  = args[0][0]; 
            inMatrix[1]  = args[0][1];
            inMatrix[2]  = args[0][2];

            inMatrix[4]  = args[0][3]; 
            inMatrix[5]  = args[0][4];
            inMatrix[6]  = args[0][5];

            inMatrix[8]  = args[0][6]; 
            inMatrix[9]  = args[0][7];
            inMatrix[10] = args[0][8];

            inMatrix[15] = 1;
        }
        // Create from matrix4
        else if (args.length === 16) {
            inMatrix[0 ] = args[0];
            inMatrix[1 ] = args[1 ];
            inMatrix[2 ] = args[2 ];
            inMatrix[3 ] = args[3 ];

            inMatrix[4 ] = args[4 ];
            inMatrix[5 ] = args[5 ];
            inMatrix[6 ] = args[6 ];
            inMatrix[7 ] = args[7 ];

            inMatrix[8 ] = args[8 ];
            inMatrix[9 ] = args[9 ];
            inMatrix[10] = args[10];
            inMatrix[11] = args[11];

            inMatrix[12] = args[12];
            inMatrix[13] = args[13];
            inMatrix[14] = args[14];
            inMatrix[15] = args[15];
        }
        else if (args.length === 1 && args[0].length === 16) {
            inMatrix[0 ] = args[0][0];
            inMatrix[1 ] = args[0][1 ];
            inMatrix[2 ] = args[0][2 ];
            inMatrix[3 ] = args[0][3 ];

            inMatrix[4 ] = args[0][4 ];
            inMatrix[5 ] = args[0][5 ];
            inMatrix[6 ] = args[0][6 ];
            inMatrix[7 ] = args[0][7 ];

            inMatrix[8 ] = args[0][8 ];
            inMatrix[9 ] = args[0][9 ];
            inMatrix[10] = args[0][10];
            inMatrix[11] = args[0][11];

            inMatrix[12] = args[0][12];
            inMatrix[13] = args[0][13];
            inMatrix[14] = args[0][14];
            inMatrix[15] = args[0][15];
        }
        else if (args.length != 0) {
            throw new Error(`Invalid parameter size in Matrix3 constructor`);
        }

        super(inMatrix);
    }

    ////// Initializers
    identity(): this {
        this[0 ] = 1; this[1 ] = 0; this[2 ] = 0; this[3 ] = 0
        this[4 ] = 0; this[5 ] = 1; this[6 ] = 0; this[7 ] = 0
        this[8 ] = 0; this[9 ] = 0; this[10] = 1; this[11] = 0
        this[12] = 0; this[13] = 0; this[14] = 0; this[15] = 1
        return this;
    }

    zero(): this {
		this[ 0] = 0; this[ 1] = 0; this[ 2] = 0; this[ 3] = 0;
		this[ 4] = 0; this[ 5] = 0; this[ 6] = 0; this[ 7] = 0;
		this[ 8] = 0; this[ 9] = 0; this[10] = 0; this[11] = 0;
		this[12] = 0; this[13] = 0; this[14] = 0; this[15] = 0;
		return this;
	}

    perspective(fovy: number, aspect: number, nearPlane: number, farPlane: number): this {
		let fovy2 = Math.tan(fovy * PI / 360.0) * nearPlane;
		let fovy2aspect = fovy2 * aspect;
		this.frustum(-fovy2aspect,fovy2aspect,-fovy2,fovy2,nearPlane,farPlane);
        return this;
	}

	frustum(left: number, right: number, bottom: number, top: number, nearPlane: number, farPlane: number): this {
		let A = right - left;
		let B = top-bottom;
		let C = farPlane-nearPlane;
		
		this.setRow(0, new Vec(nearPlane*2.0/A,	0.0,	0.0,	0.0));
		this.setRow(1, new Vec(0.0,	nearPlane*2.0/B,	0.0,	0.0));
		this.setRow(2, new Vec((right+left)/A,	(top+bottom)/B,	-(farPlane+nearPlane)/C,	-1.0));
		this.setRow(3, new Vec(0.0,	0.0,	-(farPlane*nearPlane*2.0)/C,	0.0));
		
		return this;
	}

	ortho(left: number, right: number, bottom: number, top: number, nearPlane: number, farPlane: number): this {
		let m = right-left;
		let l = top-bottom;
		let k = farPlane-nearPlane;;
		
		this[0] = 2/m; this[1] = 0;   this[2] = 0;     this[3] = 0;
		this[4] = 0;   this[5] = 2/l; this[6] = 0;     this[7] = 0;
		this[8] = 0;   this[9] = 0;   this[10] = -2/k; this[11]= 0;
		this[12]=-(left+right)/m; this[13] = -(top+bottom)/l; this[14] = -(farPlane+nearPlane)/k; this[15]=1;

		return this;
	}
		
	lookAt(p_eye: Vec, p_center: Vec, p_up: Vec): this {
        this.identity();

		const y = new Vec(p_up);
		const z = Vec.Sub(p_eye,p_center);
		z.normalize();
		const x = Vec.Cross(y,z) as Vec;
		x.normalize();
		y.normalize();

		this.m00 = x.x;
		this.m10 = x.y;
		this.m20 = x.z;
		this.m30 = -Vec.Dot(x, p_eye);
		this.m01 = y.x;
		this.m11 = y.y;
		this.m21 = y.z;
		this.m31 = -Vec.Dot(y, p_eye);
		this.m02 = z.x;
		this.m12 = z.y;
		this.m22 = z.z;
		this.m32 = -Vec.Dot(z, p_eye);
		this.m03 = 0;
		this.m13 = 0;
		this.m23 = 0;
		this.m33 = 1;
	
		return this;
	}




    ///// Setters and getters
    get m00(): number { return this[0]; }
    get m01(): number { return this[1]; }
    get m02(): number { return this[2]; }
    get m03(): number { return this[3]; }
    get m10(): number { return this[4]; }
    get m11(): number { return this[5]; }
    get m12(): number { return this[6]; }
    get m13(): number { return this[7]; }
    get m20(): number { return this[8]; }
    get m21(): number { return this[9]; }
    get m22(): number { return this[10]; }
    get m23(): number { return this[11]; }
    get m30(): number { return this[12]; }
    get m31(): number { return this[13]; }
    get m32(): number { return this[14]; }
    get m33(): number { return this[15]; }
    
    set m00(v: number) { this[0] = v; }
    set m01(v: number) { this[1] = v; }
    set m02(v: number) { this[2] = v; }
    set m03(v: number) { this[3] = v; }
    set m10(v: number) { this[4] = v; }
    set m11(v: number) { this[5] = v; }
    set m12(v: number) { this[6] = v; }
    set m13(v: number) { this[7] = v; }
    set m20(v: number) { this[8] = v; }
    set m21(v: number) { this[9] = v; }
    set m22(v: number) { this[10] = v; }
    set m23(v: number) { this[11] = v; }
    set m30(v: number) { this[12] = v; }
    set m31(v: number) { this[13] = v; }
    set m32(v: number) { this[14] = v; }
    set m33(v: number) { this[15] = v; }

    get mat3(): Mat3 {
		return new Mat3(this[0], this[1], this[ 2],
						this[4], this[5], this[ 6],
						this[8], this[9], this[10]);
	}

	get forwardVector(): Vec {
		return Mat4.TransformDirection(this, new Vec(0.0, 0.0, 1.0));
	}
	
	get rightVector(): Vec {
		return Mat4.TransformDirection(this, new Vec(1.0, 0.0, 0.0));
	}
	
	get upVector(): Vec {
		return Mat4.TransformDirection(this, new Vec(0.0, 1.0, 0.0));
	}
	
	get backwardVector(): Vec {
		return Mat4.TransformDirection(this, new Vec(0.0, 0.0, -1.0));
	}
	
	get leftVector(): Vec {
		return Mat4.TransformDirection(this, new Vec(-1.0, 0.0, 0.0));
	}
	
	get downVector(): Vec {
		return Mat4.TransformDirection(this, new Vec(0.0, -1.0, 0.0));
	}

    row(i: number): Vec {
        return new Vec(
            this[i * 4], 
            this[i * 4 + 1],
            this[i * 4 + 2],
            this[i * 4 + 3]);
    }

    setRow(i: number, a: ArrayLike<number>): this;
    setRow(i: number, x: number, y: number, z: number, w: number): this;
    setRow(i: number, a: number | ArrayLike<number>, y: number | null = null, z: number | null = null, w: number | null = null): this {
        if (typeof a === 'object' && a.length >= 4) {
            this[i * 4]      = a[0];
            this[i * 4 + 1]  = a[1];
            this[i * 4 + 2]  = a[2];
            this[i * 4 + 3]  = a[3];
        }
		else if (typeof a === 'object' && a.length == 3) {
			this[i * 4]      = a[0];
            this[i * 4 + 1]  = a[1];
            this[i * 4 + 2]  = a[2];
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

    col(i: number): Vec {
        return new Vec(
            this[i],
            this[i + 4],
            this[i + 4 * 2],
            this[i + 4 * 3]
        )
    }

    setCol(i: number, a: ArrayLike<number>): this;
    setCol(i: number, x: number, y: number, z: number, w: number): this;
    setCol(i: number, a: number | ArrayLike<number>, y: number | null = null, z: number | null = null, w: number | null = null): this {
        if (typeof a === 'object' && a.length >= 4) {
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

    assign(a: ArrayLike<number>): this {
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

	translate(x: number | ArrayLike<number>, y?: number, z?: number): this {
		if (checkArray(x, 3)) {
			y = (x as ArrayLike<number>)[1];
			z = (x as ArrayLike<number>)[2];
			x = (x as ArrayLike<number>)[0];
		}
		this.mult(Mat4.MakeTranslation(x, y, z));
		return this;
	}

	rotate(alpha: number, x: number | ArrayLike<number>, y?: number, z?: number): this {
		if (checkArray(x, 3)) {
			y = (x as ArrayLike<number>)[1];
			z = (x as ArrayLike<number>)[2];
			x = (x as ArrayLike<number>)[0];
		}
		this.mult(Mat4.MakeRotation(alpha, x as number, y ?? 0, z ?? 0));
		return this;
	}
	
	scale(x: number | ArrayLike<number>, y?: number, z?: number): this {
		if (checkArray(x, 3)) {
			y = (x as ArrayLike<number>)[1];
			z = (x as ArrayLike<number>)[2];
			x = (x as ArrayLike<number>)[0];
		}
		this.mult(Mat4.MakeScale(x, y, z));
		return this;
	}

    toString(): string {
        return  `[ ${this[ 0]}, ${this[ 1]}, ${this[ 2]}, ${this[ 3]}\n` +
                `  ${this[ 4]}, ${this[ 5]}, ${this[ 6]}, ${this[ 7]}\n` +
                `  ${this[ 8]}, ${this[ 9]}, ${this[10]}, ${this[11]}\n` +
                `  ${this[12]}, ${this[13]}, ${this[14]}, ${this[15]} ]`;
    }

    setScale(x: number, y: number, z: number): this {
		const rx = new Vec(this[0], this[4], this[8]).normalize().scale(x);
		const ry = new Vec(this[1], this[5], this[9]).normalize().scale(y);
		const rz = new Vec(this[2], this[6], this[10]).normalize().scale(z);
		this[0] = rx.x; this[4] = rx.y; this[8] = rx.z;
		this[1] = ry.x; this[5] = ry.y; this[9] = ry.z;
		this[2] = rz.x; this[6] = rz.y; this[10] = rz.z;
		return this;
	}

	setPosition(pos: Vec): this;
	setPosition(x: number, y: number, z: number): this;
	setPosition(pos: number | Vec, y?: number, z?: number): this {
		if (typeof(pos) === "number" && y !== undefined && z !== undefined) {
			this[12] = pos;
			this[13] = y;
			this[14] = z;
		}
		else if (typeof pos === 'object') {
			this[12] = pos.x;
			this[13] = pos.y;
			this[14] = pos.z;
		}
		return this;
	}

	setRotation(rotationMatrix: ArrayLike<number>): this {
		if (rotationMatrix.length === 9) {
			this[0] = rotationMatrix[0]; this[1] = rotationMatrix[1]; this[2] = rotationMatrix[2];
			this[4] = rotationMatrix[3]; this[5] = rotationMatrix[4]; this[6] = rotationMatrix[5];
			this[8] = rotationMatrix[6]; this[9] = rotationMatrix[7]; this[10] = rotationMatrix[8];
		}
		else if (rotationMatrix.length === 16) {
			this[0] = rotationMatrix[0]; this[1] = rotationMatrix[1]; this[2] = rotationMatrix[2];
			this[4] = rotationMatrix[4]; this[5] = rotationMatrix[5]; this[6] = rotationMatrix[6];
			this[8] = rotationMatrix[8]; this[9] = rotationMatrix[9]; this[10] = rotationMatrix[10];
		}
		else {
			throw new Error("Invalid parameter setting rotation matrix");
		}
		return this;
	}

    mult(a: number): this;
    mult(a: Mat4): this;
    mult(a: number | Mat4): this {
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

        this[0 ] = Vec.Dot(r0, c0); this[1 ] = Vec.Dot(r0, c1); this[2 ] = Vec.Dot(r0, c2); this[3 ] = Vec.Dot(r0, c3);
        this[4 ] = Vec.Dot(r1, c0); this[5 ] = Vec.Dot(r1, c1); this[6 ] = Vec.Dot(r1, c2); this[7 ] = Vec.Dot(r1, c3);
        this[8 ] = Vec.Dot(r2, c0); this[9 ] = Vec.Dot(r2, c1); this[10] = Vec.Dot(r2, c2); this[11] = Vec.Dot(r2, c3);
        this[12] = Vec.Dot(r3, c0); this[13] = Vec.Dot(r3, c1); this[14] = Vec.Dot(r3, c2); this[15] = Vec.Dot(r3, c3);

		return this;
	}

	multVector(vec: ArrayLike<number>): Vec {
        if (vec.length<3) {
            throw new Error("Invalid parameter multiplying Mat4 by vector");
        }

		const x = vec[0];
		const y = vec[1];
		const z = vec[2];
		const w = vec.length >3 ? vec[3] : 1.0;
	
		return new Vec( this[0] * x + this[4] * y + this[ 8] * z + this[12] * w,
						this[1] * x + this[5] * y + this[ 9] * z + this[13] * w,
						this[2] * x + this[6] * y + this[10] * z + this[14] * w,
						this[3] * x + this[7] * y + this[11] * z + this[15] * w);
	}
	
	invert(): this {
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
	
	traspose(): this {
		const r0 = new Vec(this[0], this[4], this[ 8], this[12]);
		const r1 = new Vec(this[1], this[5], this[ 9], this[13]);
		const r2 = new Vec(this[2], this[6], this[10], this[14]);
		const r3 = new Vec(this[3], this[7], this[11], this[15]);
	
		this.setRow(0, r0);
		this.setRow(1, r1);
		this.setRow(2, r2);
		this.setRow(3, r3);
		return this;
	}

    ///////// Factory methods
    static MakeIdentity(): Mat4 {
        const m = new Mat4();
        return m.identity();
    }

	static MakeZero(): Mat4 {
		const m = new Mat4();
		return m.zero();
	}

	static MakeWithQuaternion(q: ArrayLike<number>): Mat4 {
		const m = Mat4.MakeIdentity();
		m.setRotation(Mat3.MakeWithQuaternion(q));
        return m;
	}
	
    static MakeTranslation(x: number | ArrayLike<number>, y?: number, z?: number): Mat4 {
		if (checkArray(x, 3)) {
			y = (x as ArrayLike<number>)[1];
			z = (x as ArrayLike<number>)[2];
			x = (x as ArrayLike<number>)[0];
		}
		return new Mat4(
			1.0, 0.0, 0.0, 0.0,
			0.0, 1.0, 0.0, 0.0,
			0.0, 0.0, 1.0, 0.0,
			  x as number,   y as number,   z as number, 1.0
		);
	}
		
	static MakeRotation(alpha: number, x: number, y: number, z: number): Mat4 {
		const axis = new Vec(x,y,z);
		axis.normalize();
				
		var cosAlpha = Math.cos(alpha);
		var acosAlpha = 1.0 - cosAlpha;
		var sinAlpha = Math.sin(alpha);
		
		return new Mat4(
			axis.x * axis.x * acosAlpha + cosAlpha, axis.x * axis.y * acosAlpha + axis.z * sinAlpha, axis.x * axis.z * acosAlpha - axis.y * sinAlpha, 0,
			axis.y * axis.x * acosAlpha - axis.z * sinAlpha, axis.y * axis.y * acosAlpha + cosAlpha, axis.y * axis.z * acosAlpha + axis.x * sinAlpha, 0,
			axis.z * axis.x * acosAlpha + axis.y * sinAlpha, axis.z * axis.y * acosAlpha - axis.x * sinAlpha, axis.z * axis.z * acosAlpha + cosAlpha, 0,
			0,0,0,1
		);
	}

	static MakeRotationWithDirection(direction: Vec, up?: Vec): Mat4 {
		const trx = Mat4.MakeIdentity();
		trx.setRotation(Mat3.MakeRotationWithDirection(direction, up));
		return trx;
	}

	static MakeScale(x: number | ArrayLike<number>, y?: number, z?: number): Mat4 {
		if (checkArray(x, 3)) {
            y = (x as ArrayLike<number>)[1];
			z = (x as ArrayLike<number>)[2];
			x = (x as ArrayLike<number>)[0];
		}
		return new Mat4(
			x as number, 0, 0, 0,
			0, y as number, 0, 0,
			0, 0, z as number, 0,
			0, 0, 0, 1
		)
	}
    

    static MakePerspective(fovy: number, aspect: number, nearPlane: number, farPlane: number): Mat4 {
		return (new Mat4()).perspective(fovy, aspect, nearPlane, farPlane);
	}
	
	static MakeFrustum(left: number, right: number, bottom: number, top: number, nearPlane: number, farPlane: number): Mat4 {
		return (new Mat4()).frustum(left, right, bottom, top, nearPlane, farPlane);
	}
	
	static MakeOrtho(left: number, right: number, bottom: number, top: number, nearPlane: number, farPlane: number): Mat4 {
		return (new Mat4()).ortho(left, right, bottom, top, nearPlane, farPlane);
	}

	static MakeLookAt(origin: Vec, target: Vec, up: Vec): Mat4 {
		return (new Mat4()).lookAt(origin,target,up);
	}

	// Other static methods. This function multyplies two B x A matrices. It works opposite than the non-static mult() function:
	// A.mult(B) is the same as Mat4.Mult(B,A)
	static Mult(A: Mat4, B: Mat4): Mat4 {
		const result = new Mat4(B);
		return result.mult(A);
	}

    static Unproject(x: number, y: number, depth: number, mvMat: Mat4, pMat: Mat4, viewport: Vec): Vec {
		let mvp = new Mat4(pMat);
		mvp.mult(mvMat);
		mvp.invert();

		const vin = new Vec(((x - viewport.y) / viewport.width) * 2.0 - 1.0,
								((y - viewport.x) / viewport.height) * 2.0 - 1.0,
								depth * 2.0 - 1.0,
								1.0);
		
		const result = mvp.multVector(vin);
		if (result.z==0) {
			result.setValue(0, 0, 0, 0);
		}
		else {
			result.setValue(result.x/result.w,
						result.y/result.w,
						result.z/result.w,
						result.w/result.w);
		}

		return result;
	}

    static GetScale(m: ArrayLike<number>): Vec {
		return new Vec(
            Vec.Magnitude([m[1], m[5], m[9]]),
			Vec.Magnitude([m[0], m[4], m[8]]),
			Vec.Magnitude([m[2], m[6], m[10]])
		);
	}

    static GetRotation(m: ArrayLike<number>): Mat4 {
		const scale = Mat4.GetScale(m);
		return new Mat4(
				m[0] / scale.x, m[1] / scale.y, m[ 2] / scale.z, 0,
				m[4] / scale.x, m[5] / scale.y, m[ 6] / scale.z, 0,
				m[8] / scale.x, m[9] / scale.y, m[10] / scale.z, 0,
				0,	   0,	  0, 	1
		);
	}

	static GetPosition(m: ArrayLike<number>): Vec {
		return new Vec(m[12], m[13], m[14]);
	}

	static GetInverted(m: Mat4): Mat4 {
		const inverted = new Mat4(m);
		inverted.invert();
		return inverted;
	}

	static GetNormalMatrix(m: Mat4): Mat3 {
		return new Mat4(m)
			.invert()
			.traspose()
			.mat3;
	}
	
    static Equals(m: ArrayLike<number>, n: ArrayLike<number>): boolean {
		return	m[ 0] == n[ 0] && m[ 1] == n[ 1] && m[ 2] == n[ 2] && m[ 3] == n[ 3] &&
				m[ 4] == n[ 4] && m[ 5] == n[ 5] && m[ 6] == n[ 6] && m[ 7] == n[ 7] &&
				m[ 8] == n[ 8] && m[ 9] == n[ 9] && m[10] == n[10] && m[11] == n[11] &&
				m[12] == n[12] && m[13] == n[13] && m[14] == n[14] && m[15] == n[15];
	}

    static TransformDirection(M: Mat4, dir: Vec): Vec {
		const direction = new Vec(dir);
		const trx = new Mat4(M);
		trx.setRow(3, new Vec(0, 0, 0, 1));
		direction.assign(trx.multVector(direction).xyz);
		direction.normalize();
		return direction;
	}

    static IsNan(m: ArrayLike<number>): boolean {
        return	isNaN(m[ 0]) || isNaN(m[ 1]) || isNaN(m[ 2]) || isNaN(m[ 3]) ||
                isNaN(m[ 4]) || isNaN(m[ 5]) || isNaN(m[ 6]) || isNaN(m[ 7]) ||
                isNaN(m[ 8]) || isNaN(m[ 9]) || isNaN(m[10]) || isNaN(m[11]) ||
                isNaN(m[12]) || isNaN(m[13]) || isNaN(m[14]) || isNaN(m[15]);
    }

    static IsZero(m: ArrayLike<number>): boolean {
		return	isZero(m[ 0]) && isZero(m[ 1]) && isZero(m[ 2]) && isZero(m[ 3]) &&
				isZero(m[ 4]) && isZero(m[ 5]) && isZero(m[ 6]) && isZero(m[ 7]) &&
				isZero(m[ 8]) && isZero(m[ 9]) && isZero(m[10]) && isZero(m[11]) &&
				isZero(m[12]) && isZero(m[13]) && isZero(m[14]) && isZero(m[15]);
	}
	
	static IsIdentity(m: ArrayLike<number>): boolean {
		return	equals(m[ 0],1) && equals(m[ 1],0) && equals(m[ 2],0) && equals(m[ 3],0) &&
				equals(m[ 4],0) && equals(m[ 5],1) && equals(m[ 6],0) && equals(m[ 7],0) &&
				equals(m[ 8],0) && equals(m[ 9],0) && equals(m[10],1) && equals(m[11],0) &&
				equals(m[12],0) && equals(m[13],0) && equals(m[14],0) && equals(m[15],1);
	}
}
