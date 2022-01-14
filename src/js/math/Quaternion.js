import { Vector4 } from "./Vector";
import { sin, cos, sqrt } from "./functions";
import Matrix3 from "./Matrix3";
import Matrix4 from "./Matrix4";

export default class Quaternion extends Vector4 {
    static MakeWithMatrix(m) {
        return new Quaternion(m);
    }
    
    constructor(a,b,c,d) {
        super();
        if (a===undefined) this.zero();
        else if (b===undefined) {
            if (a._v && a._v.lenght>=4) this.clone(a);
            else if(a._m && a._m.length==9) this.initWithMatrix3(a);
            else if(a._m && a._m.length==16) this.initWithMatrix4(a);
            else this.zero();
        }
        else if (a!==undefined && b!==undefined && c!==undefined && d!==undefined) {
            this.initWithValues(a,b,c,d);
        }
        else {
            this.zero();
        }
    }
    
    initWithValues(alpha,x,y,z) {
        this._v[0] = x * sin(alpha/2);
        this._v[1] = y * sin(alpha/2);
        this._v[2] = z * sin(alpha/2);
        this._v[3] = cos(alpha/2);
        return this;
    }
    
    clone(q) {
        this._v[0] = q._v[0];
        this._v[1] = q._v[1];
        this._v[2] = q._v[2];
        this._v[3] = q._v[3];
    }
    
    initWithMatrix3(m) {
        let w = sqrt(1.0 + m._m[0] + m._m[4] + m._m[8]) / 2.0;
        let w4 = 4.0 * w;
        
        this._v[0] = (m._m[7] - m._m[5]) / w;
        this._v[1] = (m._m[2] - m._m[6]) / w4;
        this._v[2] = (m._m[3] - m._m[1]) / w4;
        this._v[3] = w;
    }
    
    initWithMatrix4(m) {
        let w = sqrt(1.0 + m._m[0] + m._m[5] + m._m[10]) / 2.0;
        let w4 = 4.0 * w;
        
        this._v[0] = (m._m[9] - m._m[6]) / w;
        this._v[1] = (m._m[2] - m._m[8]) / w4;
        this._v[2] = (m._m[4] - m._m[1]) / w4;
        this._v[3] = w;	
    }
    
    getMatrix4() {
        let m = Matrix4.Identity();
        let _v = this._v;
        m.setRow(0, new Vector4(1.0 - 2.0*_v[1]*_v[1] - 2.0*_v[2]*_v[2], 2.0*_v[0]*_v[1] - 2.0*_v[2]*_v[3], 2.0*_v[0]*_v[2] + 2.0*_v[1]*_v[3], 0.0));
        m.setRow(1, new Vector4(2.0*_v[0]*_v[1] + 2.0*_v[2]*_v[3], 1.0 - 2.0*_v[0]*_v[0] - 2.0*_v[2]*_v[2], 2.0*_v[1]*_v[2] - 2.0*_v[0]*_v[3], 0.0));
        m.setRow(2, new Vector4(2.0*_v[0]*_v[2] - 2.0*_v[1]*_v[3], 2.0*_v[1]*_v[2] + 2.0*_v[0]*_v[3], 1.0 - 2.0*_v[0]*_v[0] - 2.0*_v[1]*_v[1], 0.0));
        return m;
    }
    
    getMatrix3() {
        let m = Matrix3.Identity();
        let _v = this._v;
        
        m.setRow(0, new Vector3(1.0 - 2.0*_v[1]*_v[1] - 2.0*_v[2]*_v[2], 2.0*_v[0]*_v[1] - 2.0*_v[2]*_v[3], 2.0*_v[0]*_v[2] + 2.0*_v[1]*_v[3]));
        m.setRow(1, new Vector3(2.0*_v[0]*_v[1] + 2.0*_v[2]*_v[3], 1.0 - 2.0*_v[0]*_v[0] - 2.0*_v[2]*_v[2], 2.0*_v[1]*_v[2] - 2.0*_v[0]*_v[3]));
        m.setRow(2, new Vector3(2.0*_v[0]*_v[2] - 2.0*_v[1]*_v[3], 2.0*_v[1]*_v[2] + 2.0*_v[0]*_v[3], 1.0 - 2.0*_v[0]*_v[0] - 2.0*_v[1]*_v[1]));
        return m;
    }
}