import Mat4 from "./Mat4";


export default class MatrixStrategy {
    private _target: Mat4 | null;

    constructor(target: Mat4 | null = null) {
        if (target !== null && !(target instanceof Mat4)) {
            throw Error("MatrixStrategy: invalid target object. Target object must be of type bg.math.Mat4");
        }
        this._target = target;
    }

    get target() {
        return this._target;
    }

    set target(t) {
        this._target = t;
    }

    apply() {
        throw Error("MatrixStrategy.apply(): method not implemented");
    }
}
