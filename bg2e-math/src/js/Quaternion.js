import VectorUtils from "./Vector.js";

const Vec = VectorUtils.Vec;

class Quat extends Vec {
    constructor(a,b,c,d) {
        super(0,0,0,0);

        if (a === undefined) {
            Vec.Zero(this);
        }
        else if (b === undefined) {
            if (a.length === 4) {
                Vec.Assign(this, a);
            }
            else if (a.length === 9) {
                this.initWithMatrix3(a);
            }
            else if (a.length === 16) {
                this.initWithMatrix4(a);
            }
            else {
                throw new Error("Invalid parameter initializing Quaternion");
            }
        }
        else if (a !== undefined && b !== undefined && c !== undefined && d !== undefined) {
            this.initWithValues(a, b, c, d);
        }
        else {
            throw new Error("Invalid parameters initializing Quaternion");
        }
    }

    initWithMatrix3(m) {
        const w = Math.sqrt(1 + m[0] + m[4] + m[8]) / 2;
        const w4 = 4 * w;
        
        this[0] = (m[7] - m[5]) / w;
        this[1] = (m[2] - m[6]) / w4;
        this[2] = (m[3] - m[1]) / w4;
        this[3] = w;
    }

    initWithMatrix4(m) {
        const w = Math.sqrt(1 + m[0] + m[5] + m[10]) / 2;
        const w4 = 4 * w;
        
        this[0] = (m[9] - m[6]) / w;
        this[1] = (m[2] - m[8]) / w4;
        this[2] = (m[4] - m[1]) / w4;
        this[3] = w;
    }

    initWithValues(alpha, x, y, z) {
        this[0] = x * Math.sin( alpha / 2 );
        this[1] = y * Math.sin( alpha / 2 );
        this[2] = z * Math.sin( alpha / 2 );
        this[3] = Math.cos( alpha / 2 );
        return this;
    }
}

export default {
    Quat: Quat
}

