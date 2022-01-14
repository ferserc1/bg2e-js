
import { NumericArray } from "./constants";
import { Vector } from "./Vector";

export default class Bounds extends Vector {
    constructor(a=0,b=0,c=0,d=0,e=0,f=0) {
        super(new NumericArray(6));
        this._v[0] = a;
        this._v[1] = b;
        this._v[2] = c;
        this._v[3] = d;
        this._v[4] = e;
        this._v[5] = f;
    }
    
    elemAtIndex(i) { return this._v[i]; }
    equals(v) { return this._v[0]==v._v[0] && this._v[1]==v._v[1] && this._v[2]==v._v[2] && this._v[3]==v._v[3] && this._v[4]==v._v[4] && this._v[5]==v._v[5]; }
    notEquals(v) { return this._v[0]!=v._v[0] || this._v[1]!=v._v[1] || this._v[2]!=v._v[2] || this._v[3]!=v._v[3] || this._v[4]!=v._v[4] || this._v[5]!=v._v[5]; }
    assign(v) { this._v[0]=v._v[0]; this._v[1]=v._v[1]; this._v[2]=v._v[2]; this._v[3]=v._v[3]; this._v[4]=v._v[4]; this._v[5]=v._v[5]; }

    set(left, right, bottom, top, back, front) {
        this._v[0] = left;
        this._v[1] = (right===undefined) ? left:right;
        this._v[2] = (right===undefined) ? left:bottom;
        this._v[3] = (right===undefined) ? left:top;
        this._v[4] = (right===undefined) ? left:back;
        this._v[5] = (right===undefined) ? left:front;
    }

    get left() { return this._v[0]; }
    get right() { return this._v[1]; }
    get bottom() { return this._v[2]; }
    get top() { return this._v[3]; }
    get back() { return this._v[4]; }
    get front() { return this._v[5]; }
    
    set left(v) { this._v[0] = v; }
    set right(v) { this._v[1] = v; }
    set bottom(v) { this._v[2] = v; }
    set top(v) { this._v[3] = v; }
    set back(v) { this._v[4] = v; }
    set front(v) { this._v[5] = v; }

    get width() { return Math.abs(this._v[1] - this._v[0]); }
    get height() { return Math.abs(this._v[3] - this._v[2]); }
    get depth() { return Math.abs(this._v[5] - this._v[4]); }

    isNan() { return isNaN(this._v[0]) || isNaN(this._v[1]) || isNaN(this._v[2]) || isNaN(this._v[3]) || isNaN(this._v[4]) || isNaN(this._v[5]); }

    toString() {
        return "[" + this._v + "]";
    }

    isInBounds(/* vwgl.Vector3*/ v) {
        return v.x>=this._v[0] && v.x<=this._v[1] &&
                v.y>=this._v[2] && v.y<=this._v[3] &&
                v.z>=this._v[4] && v.z<=this._v[5];
    }
}
