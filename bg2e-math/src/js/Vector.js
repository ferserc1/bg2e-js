import { NumericArray } from "./constants";

export default {
    Vector() {
        switch (arguments.length) {
        case 2:
            return new NumericArray([arguments[0],arguments[1]]);
        case 3:
            return new NumericArray([arguments[0],arguments[1],arguments[2]]);
        case 4:
            return new NumericArray([arguments[0],arguments[1],arguments[2],arguments[3]]);
        default:
            throw new Error(`Invalid array size: ${ arguments.length }`);
        }
    },

    VectorFunc: {
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
                throw new Error(`Invalid array size: ${ v1.length }`);
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
                throw new Error(`Invalid array size: ${ v1.length }`);
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
                throw new Error(`Invalid array size: ${ v1.length }`);
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
                throw new Error(`Invalid array size: ${ v1.length }`);
            }
        }
    }    
}

