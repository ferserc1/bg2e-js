
import Mat4 from "../math/Mat4";
import Component from "./Component";

export default class Chain extends Component {
    constructor() {
        super('Chain');
    }

    willUpdate(frame,matrixState) {
        if (this.node) {
            const matrix = Mat4.MakeIdentity();
            this.node.children.forEach((child, index) => {
                const trx = child.component("Transform");
                const inJoint = child.component("InputChainJoint");
                const outJoint = child.component("OutputChainJoint");

                if (index>0 && inJoint) {
                    inJoint.joint.applyTransform(matrix);
                }
                else {
                    matrix.identity();
                }

                if (trx) {
                    trx.matrix.assign(matrix);
                }

                if (outJoint) {
                    outJoint.joint.applyTransform(matrix);
                }
            });
        }
    }
    
    clone() { return new Chain(); }
    assign(other) {}
    async deserialize(sceneData,loader) {}

    async serialize(sceneData,writer) {
        await super.serialize(sceneData,writer);
    }
}
