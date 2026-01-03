import Vec from '../math/Vec';

const checkLength = (v1: ArrayLike<number>, v2: ArrayLike<number> | null = null): void => {
    if (v1.length < 4 || (v2 !== null && v2.length < 4)) {
        throw new Error(`Invalid color component length`);
    }
}

interface ColorInitObject {
    r?: number;
    g?: number;
    b?: number;
    a?: number;
    rgb?: number;
}

export default class Color extends Vec {
    constructor();
    constructor(rgba: ArrayLike<number>);
    constructor(init: ColorInitObject);
    constructor(...args: any[]) {
        if (args.length === 1 && args[0].length === 4) {
            // 4 elements array
            super(args[0]);
        }
        else if (args.length === 1 && args[0].length === 3) {
            super(args[0][0], args[0][1], args[0][2], 1);
        }
        else if (typeof(args[0]) === "object" &&
            (args[0].rgb !== undefined ||
            args[0].r !== undefined ||
            args[0].g !== undefined ||
            args[0].b !== undefined ||
            args[0].a !== undefined)
        ) {
            const r = args[0].r || args[0].rgb || 0;
            const g = args[0].g || args[0].rgb || 0;
            const b = args[0].b || args[0].rgb || 0;
            const a = args[0].a !== undefined ? args[0].a : 1;
            super(r, g, b, a);
        }
        else if (args.length === 0) {
            super([0, 0, 0, 1]);
        }
        else {
            throw new Error('Invalid initialization parameters in Color constructor');
        }
    }
   
    static Yellow(): Color { return new Color([1.0,1.0,0.0,1.0]); }
    static Orange(): Color { return new Color([1.0,0.5,0.0,1.0]); }
    static Red(): Color { return new Color([1.0,0.0,0.0,1.0]); }
    static Violet(): Color { return new Color([0.5,0.0,1.0,1.0]); }
    static Blue(): Color { return new Color([0.0,0.0,1.0,1.0]); }
    static Green(): Color { return new Color([0.0,1.0,0.0,1.0]); }
    static White(): Color { return new Color([1.0,1.0,1.0,1.0]); }
    static LightGray(): Color { return new Color([0.8,0.8,0.8,1.0]); }
    static Gray(): Color { return new Color([0.5,0.5,0.5,1.0]); }
    static DarkGray(): Color { return new Color([0.2,0.2,0.2,1.0]); }
    static Black(): Color { return new Color([0.0,0.0,0.0,1.0]); }
    static Brown(): Color { return new Color([0.4,0.2,0.0,1.0]); }
    static Transparent(): Color { return new Color([0,0,0,0]); }

    get r(): number { return this[0]; }
    set r(v: number) { this[0] = v; }
    get g(): number { return this[1]; }
    set g(v: number) { this[1] = v; }
    get b(): number { return this[2]; }
    set b(v: number) { this[2] = v; }
    get a(): number { return this[3]; }
    set a(v: number) { this[3] = v; }

    get rgb(): Vec { return new Vec(this[0], this[1], this[2]); }
    set rgb(rgb: ArrayLike<number>) {
        if (rgb.length === 3) {
            this[0] = rgb[0];
            this[1] = rgb[1];
            this[2] = rgb[2];
        }
        else {
            throw new Error("Invalid parameter settings rgb values in Color");
        }
    }

    static Max(v1: ArrayLike<number>, v2: ArrayLike<number>): Color {
        checkLength(v1, v2);
        return new Color([
            v1[0]>v2[0] ? v1[0] : v2[0],
            v1[1]>v2[1] ? v1[1] : v2[1],
            v1[2]>v2[2] ? v1[2] : v2[2],
            v1[3]>v2[3] ? v1[3] : v2[3]
        ]);
    }

    static Min(v1: ArrayLike<number>, v2: ArrayLike<number>): Color {
        checkLength(v1, v2);
        return new Color([
            v1[0]<v2[0] ? v1[0] : v2[0],
            v1[1]<v2[1] ? v1[1] : v2[1],
            v1[2]<v2[2] ? v1[2] : v2[2],
            v1[3]<v2[3] ? v1[3] : v2[3]
        ]);
    }

    static Add(v1: ArrayLike<number>, v2: ArrayLike<number>): Color {
        checkLength(v1, v2);
        return new Color([
            v1[0] + v2[0],
            v1[1] + v2[1],
            v1[2] + v2[2],
            v1[3] + v2[3]
        ]);
    }

    static Sub(v1: ArrayLike<number>, v2: ArrayLike<number>): Color {
        checkLength(v1, v2);
        return new Color([
            v1[0] - v2[0],
            v1[1] - v2[1],
            v1[2] - v2[2],
            v1[3] - v2[3]
        ]);
    }

    static Mult(v: ArrayLike<number>, s: number): Color {
        checkLength(v);
        return new Color([ v[0] * s, v[1] * s, v[2] * s, v[3] * s ]);
    }

    static Div(v: ArrayLike<number>, s: number): Color {
        checkLength(v);
        return new Color([ v[0] / s, v[1] / s, v[2] / s, v[3] / s ]);
    }
}
