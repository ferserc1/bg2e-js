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
