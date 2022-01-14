
import { Vector3, Vector4 } from "./Vector";
import { NumericArray, NumericArrayHighP } from "./constants";

export default class Matrix3 {
	static Identity() {
		return new Matrix3(1,0,0, 0,1,0, 0,0,1);
	}
	
	constructor(v00=1,v01=0,v02=0,v10=0,v11=1,v12=0,v20=0,v21=0,v22=1) {
		this._m = new NumericArray(9);
		if (Array.isArray(typeof(v00))) {
			this._m[0] = v00[0]; this._m[1] = v00[1]; this._m[2] = v00[0];
			this._m[3] = v00[3]; this._m[4] = v00[4]; this._m[5] = v00[5];
			this._m[6] = v00[6]; this._m[7] = v00[7]; this._m[8] = v00[8];
		}
		else if (typeof(v00)=="number") {
			this._m[0] = v00; this._m[1] = v01; this._m[2] = v02;
			this._m[3] = v10; this._m[4] = v11; this._m[5] = v12;
			this._m[6] = v20; this._m[7] = v21; this._m[8] = v22;
		}
		else {
			this.assign(v00);
		}
	}
	
	get m() { return this._m; }

	toArray() {
		return [
			this._m[0], this._m[1], this._m[2],
			this._m[3], this._m[4], this._m[5],
			this._m[6], this._m[7], this._m[8]
		]
	}
	
	get m00() { return this._m[0]; }
	get m01() { return this._m[1]; }
	get m02() { return this._m[2]; }
	get m10() { return this._m[3]; }
	get m11() { return this._m[4]; }
	get m12() { return this._m[5]; }
	get m20() { return this._m[6]; }
	get m21() { return this._m[7]; }
	get m22() { return this._m[8]; }
	
	set m00(v) { this._m[0] = v; }
	set m01(v) { this._m[1] = v; }
	set m02(v) { this._m[2] = v; }
	set m10(v) { this._m[3] = v; }
	set m11(v) { this._m[4] = v; }
	set m12(v) { this._m[5] = v; }
	set m20(v) { this._m[6] = v; }
	set m21(v) { this._m[7] = v; }
	set m22(v) { this._m[8] = v; }
	
	zero() {
		this._m[0] = this._m[1] = this._m[2] =
		this._m[3] = this._m[4] = this._m[5] =
		this._m[6] = this._m[7] = this._m[8] = 0;
		return this;
	}

	identity() {
		this._m[0] = 1; this._m[1] = 0; this._m[2] = 0;
		this._m[3] = 0; this._m[4] = 1; this._m[5] = 0;
		this._m[6] = 0; this._m[7] = 0; this._m[8] = 1;
		return this;
	}
	
	isZero() {
		return	this._m[0]==0.0 && this._m[1]==0.0 && this._m[2]==0.0 &&
				this._m[3]==0.0 && this._m[4]==0.0 && this._m[5]==0.0 &&
				this._m[6]==0.0 && this._m[7]==0.0 && this._m[8]==0.0;
	}
	
	isIdentity() {
		return	this._m[0]==1.0 && this._m[1]==0.0 && this._m[2]==0.0 &&
				this._m[3]==0.0 && this._m[4]==1.0 && this._m[5]==0.0 &&
				this._m[6]==0.0 && this._m[7]==0.0 && this._m[8]==1.0;
	}

	row(i) { return new Vector3(this._m[i*3], this._m[i*3 + 1], this._m[i*3 + 2]); }
	setRow(i, row) { this._m[i*3]=row._v[0]; this._m[i*3 + 1]=row._v[1]; this._m[i*3 + 2]=row._v[2]; return this; }

	setScale(x,y,z) { 
		let rx = new Vector3(this._m[0], this._m[3], this._m[6]).normalize().scale(x);
		let ry = new Vector3(this._m[1], this._m[4], this._m[7]).normalize().scale(y);
		let rz = new Vector3(this._m[2], this._m[5], this._m[8]).normalize().scale(z);
		this._m[0] = rx.x; this._m[3] = rx.y; this._m[6] = rx.z;
		this._m[1] = ry.x; this._m[4] = ry.y; this._m[7] = ry.z;
		this._m[2] = rz.x; this._m[5] = rz.y; this._m[8] = rz.z;
		return this;
	}
	getScale() {
		return new Vector3(
			new Vector3(this._m[0], this._m[3], this._m[6]).module,
			new Vector3(this._m[1], this._m[4], this._m[7]).module,
			new Vector3(this._m[2], this._m[5], this._m[8]).module
		);
	}
	
	get length() { return this._m.length; }
	
	traspose() {
		let r0 = new Vector3(this._m[0], this._m[3], this._m[6]);
		let r1 = new Vector3(this._m[1], this._m[4], this._m[7]);
		let r2 = new Vector3(this._m[2], this._m[5], this._m[8]);
		
		this.setRow(0, r0);
		this.setRow(1, r1);
		this.setRow(2, r2);

		return this;
	}
	
	elemAtIndex(i) { return this._m[i]; }
	assign(a) {
		if (a.length==9) {
			this._m[0] = a._m[0]; this._m[1] = a._m[1]; this._m[2] = a._m[2];
			this._m[3] = a._m[3]; this._m[4] = a._m[4]; this._m[5] = a._m[5];
			this._m[6] = a._m[6]; this._m[7] = a._m[7]; this._m[8] = a._m[8];
		}
		else if (a.length==16) {
			this._m[0] = a._m[0]; this._m[1] = a._m[1]; this._m[2] = a._m[2];
			this._m[3] = a._m[4]; this._m[4] = a._m[5]; this._m[5] = a._m[6];
			this._m[6] = a._m[8]; this._m[7] = a._m[9]; this._m[8] = a._m[10];
		}
		return this;
	}
	
	equals(m) {
		return	this._m[0] == m._m[0] && this._m[1] == m._m[1]  && this._m[2] == m._m[2] &&
				this._m[3] == m._m[3] && this._m[4] == m._m[4]  && this._m[5] == m._m[5] &&
				this._m[6] == m._m[6] && this._m[7] == m._m[7]  && this._m[8] == m._m[8];
	}

	notEquals(m) {
		return	this._m[0] != m._m[0] || this._m[1] != m._m[1]  || this._m[2] != m._m[2] &&
				this._m[3] != m._m[3] || this._m[4] != m._m[4]  || this._m[5] != m._m[5] &&
				this._m[6] != m._m[6] || this._m[7] != m._m[7]  || this._m[8] != m._m[8];
	}
		
	mult(a) {
		if (typeof(a)=="number") {
			this._m[0] *= a; this._m[1] *= a; this._m[2] *= a;
			this._m[3] *= a; this._m[4] *= a; this._m[5] *= a;
			this._m[6] *= a; this._m[7] *= a; this._m[8] *= a;
			
		}
		else {
			let rm = this._m;
			let lm = a._m;
			
			let res = new NumericArray(9);
			res[0] = lm[0] * rm[0] + lm[1] * rm[1] + lm[2] * rm[2];
			res[1] = lm[0] * rm[1] + lm[1] * rm[4] + lm[2] * rm[7];
			res[2] = lm[0] * rm[2] + lm[1] * rm[5] + lm[2] * rm[8];
			
			res[3] = lm[3] * rm[0] + lm[4] * rm[3] + lm[5] * rm[6];
			res[4] = lm[3] * rm[1] + lm[4] * rm[4] + lm[5] * rm[7];
			res[5] = lm[3] * rm[2] + lm[4] * rm[5] + lm[5] * rm[8];
			
			res[6] = lm[6] * rm[0] + lm[7] * rm[3] + lm[8] * rm[6];
			res[7] = lm[6] * rm[1] + lm[7] * rm[4] + lm[8] * rm[7];
			res[8] = lm[6] * rm[2] + lm[7] * rm[5] + lm[8] * rm[8];
			this._m = res;
		}
		return this;
	}

	multVector(vec) {
		if (typeof(vec)=='object' && vec._v && vec._v.length>=2) {
			vec = vec._v;
		}
		let x=vec[0];
		let y=vec[1];
		let z=1.0;
	
		return new Vector3(	this._m[0]*x + this._m[3]*y + this._m[6]*z,
								this._m[1]*x + this._m[4]*y + this._m[7]*z,
								this._m[2]*x + this._m[5]*y + this._m[8]*z);
	}
		
	isNan() {
		return	!isNaN(_m[0]) && !isNaN(_m[1]) && !isNaN(_m[2]) &&
				!isNaN(_m[3]) && !isNaN(_m[4]) && !isNaN(_m[5]) &&
				!isNaN(_m[6]) && !isNaN(_m[7]) && !isNaN(_m[8]);
	}

	toString() {
		return "[" + this._m[0] + ", " + this._m[1] + ", " + this._m[2] + "]\n" +
			   " [" + this._m[3] + ", " + this._m[4] + ", " + this._m[5] + "]\n" +
			   " [" + this._m[6] + ", " + this._m[7] + ", " + this._m[8] + "]";
	}
}
