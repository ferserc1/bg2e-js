
import { RenderLayer } from "../base/PolyList";
import Texture, { TextureRenderTargetAttachment, TextureComponentFormat, TextureWrap } from "../base/Texture";
import Mat4 from "../math/Mat4";
import Vec from "../math/Vec";
import RenderQueue from "../render/RenderQueue";
import { FrameVisitor } from "../render/SceneRenderer";
import Transform from "../scene/Transform";
import PickSelectionShader from "../shaders/PickSelectionShader";
import SelectionHighlightShader from "../shaders/SelectionHighlightShader";

export default class SelectionHighlight {
    constructor(renderer) {
        this._renderer = renderer;
    }

    async init() {
        const renderer = this._renderer;
        this._targetTexture = new Texture();
        this._targetTexture.renderTargetAttachment = TextureRenderTargetAttachment.COLOR_ATTACHMENT_0;
        this._targetTexture.componentFormat = TextureComponentFormat.UNSIGNED_BYTE;
        this._targetTexture.wrapModeXY = TextureWrap.CLAMP;

        this._renderBuffer = renderer.factory.renderBuffer();
        await this._renderBuffer.attachTexture(this._targetTexture);

        this._shader = new PickSelectionShader(renderer);
        await this._shader.load();

        this._renderQueue = new RenderQueue(renderer);
        this._renderQueue.enableQueue(RenderLayer.SELECTION_DEFAULT, this._shader);

        this._frameVisitor = new FrameVisitor(this._renderQueue);

        this._selectionDrawShader = new SelectionHighlightShader(renderer);
        await this._selectionDrawShader.load();
    }

    setViewportSize(width,height) {
        this._renderBuffer.size = new Vec(width,height);
    }

    draw(scene,camera) {
        const cameraView = Mat4.GetInverted(Transform.GetWorldMatrix(camera.node));
        this._renderQueue.viewMatrix = cameraView;
        this._renderQueue.projectionMatrix = camera.projectionMatrix;
        this._renderQueue.newFrame();
        this._frameVisitor.delta = 0;
        this._frameVisitor.modelMatrix.identity();
        scene.accept(this._frameVisitor);

        this._renderBuffer.update(() => {
            this._renderBuffer.frameBuffer.clear();
            this._renderQueue.draw(RenderLayer.SELECTION_DEFAULT);
        });

        // TODO: Draw target texture using a border detection shader
        const shader = this._selectionDrawShader;
        this._renderer.presentTexture(this._targetTexture, { shader });
    }

    destroy() {
        this._renderBuffer.destroy();
        this._targetTexture.destroy();
        this._renderBuffer = null;
        this._targetTexture = null;
    }
}
