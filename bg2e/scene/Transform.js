import Component from './Component';
import Mat4 from "../math/Mat4";
import NodeVisitor from './NodeVisitor';

export class TransformVisitor extends NodeVisitor {
    constructor() {
        super();
        this._matrix = Mat4.MakeIdentity();
    }

    get matrix() {
        return this._matrix;
    }

    visit(node) {
        if (node.transform) {
            this._matrix = Mat4.Mult(node.transform.matrix, this._matrix);
        }
    }
}

export default class Transform extends Component {
    static GetWorldMatrix(node) {
        if (!node instanceof Node && !node instanceof Component) {
            throw new Error("Invalid parameter in Transform.GetWorldMatrix() function. The parameter is not an instance of Node or Component");
        }
        else if (node instanceof Component) {
            node = node.node;
        }
        const visitor = new TransformVisitor();
        node.acceptReverse(visitor);
        return visitor.matrix;
    }

    constructor(mat = Mat4.MakeIdentity()) {
        super("Transform");
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
        if (Array.isArray(sceneData.transformMatrix) && sceneData.transformMatrix.length === 16) {
            this._matrix.assign(sceneData.transformMatrix);
        }
        else {
            console.warn("Transform.deserialize(): invalid transformMatrix attribute found in scene data");
        }
    }

    async serialize(sceneData,writer) {
        await super.serialize(sceneData,writer);
        throw new Error("Transform.serialice() not implemented");
    }

    update(delta,modelMatrix) {
        //modelMatrix.mult(this._matrix);
        modelMatrix.assign(Mat4.Mult(this._matrix, modelMatrix));
    }
}
