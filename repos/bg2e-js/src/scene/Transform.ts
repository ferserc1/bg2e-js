import Component from './Component';
import Node from './Node';
import Mat4 from "../math/Mat4";
import NodeVisitor from './NodeVisitor';

export class TransformVisitor extends NodeVisitor {
    _matrix: Mat4;

    constructor() {
        super();
        this._matrix = Mat4.MakeIdentity();
    }

    get matrix(): Mat4 {
        return this._matrix;
    }

    visit(node: any): void {
        if (node.transform) {
            this._matrix = Mat4.Mult(this._matrix, node.transform.matrix);
        }
    }
}

export default class Transform extends Component {
    static GetWorldMatrix(node: Node | Component): Mat4 {
        if (node instanceof Component) {
            node = node.node;
        }
        const visitor = new TransformVisitor();
        node.acceptReverse(visitor);
        return visitor.matrix;
    }

    _matrix: Mat4;

    constructor(mat: Mat4 = Mat4.MakeIdentity()) {
        super("Transform");
        this._matrix = mat;
    }

    get matrix(): Mat4 { return this._matrix; }
    set matrix(m: Mat4) { this._matrix = m; }

    clone(): Transform {
        const result = new Transform();
        result.assign(this);
        return result;
    }

    assign(other: Transform): void {
        this._matrix = new Mat4(other.matrix);
    }

    async deserialize(sceneData: any, loader: any): Promise<void> {
        if (Array.isArray(sceneData.transformMatrix) && sceneData.transformMatrix.length === 16) {
            this._matrix.assign(sceneData.transformMatrix);
        }
        else {
            console.warn("Transform.deserialize(): invalid transformMatrix attribute found in scene data");
        }
    }

    async serialize(sceneData: any, writer: any): Promise<void> {
        await super.serialize(sceneData,writer);
        throw new Error("Transform.serialice() not implemented");
    }

    update(delta: number, modelMatrix: Mat4): void {
        //modelMatrix.mult(this._matrix);
        modelMatrix.assign(Mat4.Mult(modelMatrix, this._matrix));
    }
}
