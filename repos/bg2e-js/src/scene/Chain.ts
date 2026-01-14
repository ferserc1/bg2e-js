
import Mat4 from "../math/Mat4";
import Component from "./Component";
import { ChainJoint } from "./ChainJoint";

export default class Chain extends Component {
    constructor() {
        super('Chain');
    }

    willUpdate(frame: number, matrixState: any): void {
        if (this.node) {
            const matrix = Mat4.MakeIdentity();
            this.node.children.forEach((child, index) => {
                const trx = child.transform;
                const inJoint = child.component("InputChainJoint") as ChainJoint;
                const outJoint = child.component("OutputChainJoint") as ChainJoint;

                if (index > 0 && inJoint) {
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
    
    clone(): Chain { return new Chain(); }
    assign(other: Chain): void {}
    async deserialize(sceneData: any, loader: any): Promise<void> {}

    async serialize(sceneData: any, writer: any): Promise<void> {
        await super.serialize(sceneData, writer);
    }
}
