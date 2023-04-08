import { RenderLayer } from "../base/PolyList";
import Texture, { TextureComponentFormat, TextureRenderTargetAttachment, TextureWrap } from "../base/Texture";
import PickSelectionShader from "../shaders/PickSelectionShader";
import { FrameVisitor } from "../render/SceneRenderer";
import RenderQueue from "../render/RenderQueue";
import Vec from "../math/Vec";
import Mat4 from "../math/Mat4";
import Transform from "../scene/Transform";

export default class SelectionBuffer {
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
    }

    reshape(width,height) {
        this._renderBuffer.size = new Vec(width,height);
    }

    draw(scene,camera,x,y,width = 1,height = 1) {
        const cameraView = Mat4.GetInverted(Transform.GetWorldMatrix(camera.node));
        this._renderQueue.viewMatrix = cameraView;
        this._renderQueue.projectionMatrix = camera.projectionMatrix;
        this._renderQueue.newFrame();
        this._frameVisitor.delta = 0;
        this._frameVisitor.modelMatrix.identity();
        scene.accept(this._frameVisitor);

        let result = null;
        this._renderBuffer.update(() => {
            this._renderBuffer.frameBuffer.clear();
            this._renderQueue.draw(RenderLayer.SELECTION_DEFAULT);
            result = this._renderBuffer.readPixels(x, y, width, height);
        });

        return result;
    }

    destroy() {
        // TODO: destroy
    }
}

