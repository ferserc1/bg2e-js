import Component from "./Component";
import Joint, { LinkTransformOrder, LinkJoint } from "../phsics/joint";

export class ChainJoint extends Component {
    protected _joint: LinkJoint;

    constructor(typeId: string) {
        super(typeId);

        this._joint = new LinkJoint();
    }

    get joint(): LinkJoint { return this._joint; }
    set joint(j: LinkJoint) { this._joint = j; }

    assign(other: ChainJoint): void {
        this.joint.assign(other.joint);
    }

    async deserialize(sceneData: any, loader: any): Promise<void> {
        const joint: Joint | null = Joint.Factory(sceneData.joint);
        if (joint && joint instanceof LinkJoint) {
            this.joint = joint;
        }
    }

    async serialize(sceneData: any, writer: any): Promise<void> {
        await super.serialize(sceneData, writer);
        sceneData.joint = {};
        this.joint.serialize(sceneData.joint);
    }
}

export class InputChainJoint extends ChainJoint {
    constructor() {
        super('InputChainJoint');
        this.joint.transformOrder = LinkTransformOrder.ROTATE_TRANSLATE;
    }

    clone(): InputChainJoint {
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

    clone(): OutputChainJoint {
        const result = new OutputChainJoint();
        result.assign(this);
        return result;
    }
}
