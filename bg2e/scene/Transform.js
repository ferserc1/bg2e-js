import Component from './Component';
import Mat4 from "../math/Mat4";

export default class Transform extends Component {
    constructor(mat = Mat4.MakeIdentity()) {
        super();
        if (!mat instanceof Mat4) {
            throw new Error("Invalid parameter in Transform component initialization. The parameter must be a Mat4 instance.");
        }
        this._matrix = mat;
    }

    get matrix() { return this._matrix; }
    set matrix(m) { this._matrix = m; }

    clone() {
        const result = new Transform();
        result.assign(this);
        return result;
    }

    assign(other) {
        this._matrix = new Mat4(other.matrix);
    }

    async deserialize(sceneData,loader) {
        throw new Error("Transform.deserialize() not implemented");
    }

    async serialize(sceneData,writer) {
        throw new Error("Transform.serialice() not implemented");
    }
}
