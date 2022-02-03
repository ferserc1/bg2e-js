import { Vec } from 'bg2e-math';

export default class Color extends Vec {
    constructor() {
        if (arguments.length === 1 && arguments[0].length === 4) {
            // 4 elements array
            super(arguments[0]);
        }
        else if (arguments.length === 1 && arguments[0].length === 3) {
            super(arguments[0][0], arguments[0][1], arguments[0][2], 1);
        }
        else if (typeof(arguments) === "object" &&
            arguments[0].rgb !== undefined ||
            arguments[0].r !== undefined ||
            arguments[0].g !== undefined ||
            arguments[0].b !== undefined ||
            arguments[0].a !== undefined
        ) {
            const r = arguments[0].r || arguments[0].rgb || 0;
            const g = arguments[0].g || arguments[0].rgb || 0;
            const b = arguments[0].b || arguments[0].rgb || 0;
            const a = arguments[0].a || arguments[0].a || 1;
            super(r, g, b, a);
        }
        else if (arguments.length === 0) {
            super([0, 0, 0, 1]);
        }
        else {
            throw new Error('Invalid initialization parameters in Color constructor');
        }
    }
   
    static Yellow() { return new Color([1.0,1.0,0.0,1.0]); }
    static Orange() { return new Color([1.0,0.5,0.0,1.0]); }
    static Red() { return new Color([1.0,0.0,0.0,1.0]); }
    static Violet() { return new Color([0.5,0.0,1.0,1.0]); }
    static Blue() { return new Color([0.0,0.0,1.0,1.0]); }
    static Green() { return new Color([0.0,1.0,0.0,1.0]); }
    static White() { return new Color([1.0,1.0,1.0,1.0]); }
    static LightGray() { return new Color([0.8,0.8,0.8,1.0]); }
    static Gray() { return new Color([0.5,0.5,0.5,1.0]); }
    static DarkGray() { return new Color([0.2,0.2,0.2,1.0]); }
    static Black() { return new Color([0.0,0.0,0.0,1.0]); }
    static Brown() { return new Color([0.4,0.2,0.0,1.0]); }
    static Transparent() { return new Color([0,0,0,0]); }

    get r() { return this[0]; }
    set r(v) { this[0] = v; }
    get g() { return this[1]; }
    set g(v) { this[1] = v; }
    get b() { return this[2]; }
    set b(v) { this[2] = v; }
    get a() { return this[3]; }
    set a(v) { this[3] = v; }

    get rgb() { return new Vec(this[0], this[1], this[2]); }
    set rgb(rgb) {
        if (rgb.length === 3) {
            this[0] = rgb[0];
            this[1] = rgb[1];
            this[2] = rgb[2];
        }
        else {
            throw new Error("Invalid parameter settings rgb values in Color");
        }
    }
}
