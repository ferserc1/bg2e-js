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

import { RenderLayer } from "../base/PolyList";
import Texture, { TextureComponentFormat, TextureRenderTargetAttachment, TextureWrap } from "../base/Texture";
import PickSelectionShader from "../shaders/PickSelectionShader";
import RenderQueue from "../render/RenderQueue";
import Vec from "../math/Vec";
import Mat4 from "../math/Mat4";
import Renderer from "../render/Renderer";
import RenderBuffer from "../render/RenderBuffer";
import Drawable from "../scene/Drawable";

// GPU color-picking pass scoped to the single shared gizmo Drawable, used to
// resolve which labeled PolyList (if any) was hit on mouseDown. Unlike
// SelectionBuffer, it never traverses the scene tree: it draws the gizmo
// Drawable directly with the already computed (fixed-scale) model matrix.
export default class GizmoPickBuffer {
    protected _renderer: Renderer;
    protected _targetTexture: Texture | null = null;
    protected _renderBuffer: RenderBuffer | null = null;
    protected _shader: PickSelectionShader | null = null;
    protected _renderQueue: RenderQueue | null = null;

    constructor(renderer: Renderer) {
        this._renderer = renderer;
    }

    async init(): Promise<void> {
        const renderer = this._renderer;
        this._targetTexture = new Texture();
        this._targetTexture.renderTargetAttachment = TextureRenderTargetAttachment.COLOR_ATTACHMENT_0;
        this._targetTexture.componentFormat = TextureComponentFormat.UNSIGNED_BYTE;
        this._targetTexture.wrapModeXY = TextureWrap.CLAMP;

        this._renderBuffer = renderer.factory.renderBuffer();
        await this._renderBuffer.attachTexture(this._targetTexture);

        this._shader = new PickSelectionShader(renderer);
        await this._shader.load();
        this._shader.forceDraw = true;

        this._renderQueue = new RenderQueue(renderer);
        this._renderQueue.enableQueue(RenderLayer.GIZMO_PICK, this._shader);
    }

    reshape(width: number, height: number): void {
        if (!this._renderBuffer) {
            return;
        }
        this._renderBuffer.size = new Vec(width, height);
    }

    draw(gizmoDrawable: Drawable, modelMatrix: Mat4, viewMatrix: Mat4, projectionMatrix: Mat4, x: number, y: number): Uint8Array | undefined {
        if (!this._renderQueue || !this._renderBuffer) {
            return undefined;
        }

        this._renderQueue.viewMatrix = viewMatrix;
        this._renderQueue.projectionMatrix = projectionMatrix;
        this._renderQueue.newFrame();
        gizmoDrawable.draw(this._renderQueue, modelMatrix);

        let result: Uint8Array | undefined;
        this._renderBuffer.update(() => {
            this._renderBuffer?.frameBuffer.clear();
            this._renderQueue?.draw(RenderLayer.GIZMO_PICK);
            result = this._renderBuffer?.readPixels(x, y, 1, 1);
        });

        return result;
    }

    destroy(): void {
        this._renderBuffer?.destroy();
        this._targetTexture?.destroy();
        this._renderBuffer = null;
        this._targetTexture = null;
    }
}
