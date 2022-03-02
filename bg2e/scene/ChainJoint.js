import Component from "./Component";
import Joint, { LinkTransformOrder, LinkJoint } from "../phsics/joint";

export class ChainJoint extends Component {
    constructor(typeId) {
        super(typeId);

        this._joint = new LinkJoint();
    }

    get joint() { return this._joint; }
    set joint(j) { this._joint = j; }

    assign(other) {
        this.joint.assign(other.joint);
    }

    async deserialize(sceneData,loader) {
        if (sceneData.joint) {
            this.joint = Joint.Factory(sceneData.joint);
        }
    }

    async serialize(sceneData,writer) {
        await super.serialize(sceneData,writer);
        sceneData.joint = {};
        this.joint.serialize(sceneData.joint);
    }
}

export class InputChainJoint extends ChainJoint {
    constructor() {
        super('InputChainJoint');
        this.joint.transformOrder = LinkTransformOrder.ROTATE_TRANSLATE;
    }

    clone() {
        const result = new InputChainJoint();
        result.assign(this);
        return result;
    }
}

export class OutputChainJoint extends ChainJoint {
    constructor() {
        super('OutputChainJoint');
        this.joint.transformOrder = LinkTransformOrder.TRANSLATE_ROTATE;
    }

    clone() {
        const result = new OutputChainJoint();
        result.assign(this);
        return result;
    }
}
