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

import Component from "../scene/Component";

// Marker component: a node needs a Transform and a Gizmo component to be eligible
// to display the shared gizmo Drawable (managed by GizmoManager) when it is selected.
export default class GizmoComponent extends Component {
    private _enabled: boolean;

    constructor() {
        super("Gizmo");
        this._enabled = true;
    }

    get enabled(): boolean { return this._enabled; }
    set enabled(e: boolean) { this._enabled = e; }

    clone(): GizmoComponent {
        const result = new GizmoComponent();
        result.assign(this);
        return result;
    }

    assign(other: GizmoComponent): void {
        this._enabled = other._enabled;
    }

    async deserialize(sceneData: any, loader: any): Promise<void> {
        this._enabled = sceneData.enabled ?? true;
    }

    async serialize(sceneData: any, writer: any): Promise<void> {
        await super.serialize(sceneData, writer);
        sceneData.enabled = this._enabled;
    }
}
