import { NumericArray } from "./constants";

class Matrix3 extends NumericArray {
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
};

export default {
    Matrix3: Matrix3,

    mat3: {
        identity() {
            const m = new Matrix3();
            return m.identity();
        }
    }
}
