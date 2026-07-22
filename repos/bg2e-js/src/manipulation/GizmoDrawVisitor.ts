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

import NodeVisitor from "../scene/NodeVisitor";
import Node from "../scene/Node";
import Mat4 from "../math/Mat4";
import RenderQueue from "../render/RenderQueue";
import type GizmoManager from "./GizmoManager";

// Draws the shared gizmo Drawable at the resolved target node, using a
// world matrix with a fixed, camera-distance-independent scale.
// Invoked with `targetNode.accept(visitor)`, so only the target node itself
// (matched by reference) triggers a draw.
export default class GizmoDrawVisitor extends NodeVisitor {
    private _gizmoManager: GizmoManager;
    private _renderQueue: RenderQueue;
    private _targetNode: Node | null = null;
    private _viewMatrix: Mat4 = Mat4.MakeIdentity();

    constructor(gizmoManager: GizmoManager, renderQueue: RenderQueue) {
        super();
        this._gizmoManager = gizmoManager;
        this._renderQueue = renderQueue;
    }

    set targetNode(node: Node | null) { this._targetNode = node; }
    get targetNode(): Node | null { return this._targetNode; }

    set viewMatrix(m: Mat4) { this._viewMatrix = m; }

    visit(node: Node): void {
        if (!this._targetNode || node !== this._targetNode) {
            return;
        }
        const gizmoDrawable = this._gizmoManager.gizmoDrawable;
        if (!gizmoDrawable) {
            return;
        }
        const modelMatrix = this._gizmoManager.computeGizmoMatrix(node, this._viewMatrix);
        gizmoDrawable.draw(this._renderQueue, modelMatrix);
    }
}
