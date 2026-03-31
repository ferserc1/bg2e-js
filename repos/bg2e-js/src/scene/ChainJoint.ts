/*
 *    business grade graphic engine (bg2 engine)
 *    Copyright (C) 2024  Fernando Serrano Carpena
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU General Public License as published by
 *    the Free Software Foundation, either version 3 of the License, or
 *    (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU General Public License for more details.
 *
 *    You should have received a copy of the GNU General Public License
 *    along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
