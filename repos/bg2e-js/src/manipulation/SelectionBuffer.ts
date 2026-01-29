import { RenderLayer } from "../base/PolyList";
import Texture, { TextureComponentFormat, TextureRenderTargetAttachment, TextureWrap } from "../base/Texture";
import PickSelectionShader from "../shaders/PickSelectionShader";
import { FrameVisitor } from "../render/SceneRenderer";
import RenderQueue from "../render/RenderQueue";
import Vec from "../math/Vec";
import Mat4 from "../math/Mat4";
import Transform from "../scene/Transform";
import Renderer from "../render/Renderer";
import RenderBuffer from "../render/RenderBuffer";
import Camera from "../scene/Camera";
import Node from "../scene/Node";

export default class SelectionBuffer {
    protected _renderer: Renderer;
    protected _targetTexture: Texture | null = null;
    protected _renderBuffer: RenderBuffer | null = null;
    protected _shader: PickSelectionShader | null = null
    protected _renderQueue: RenderQueue | null = null;
    protected _frameVisitor: FrameVisitor | null = null;

    constructor(renderer: Renderer) {
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

    reshape(width: number, height: number) {
        if (!this._renderBuffer) {
            return;
        }
        this._renderBuffer.size = new Vec(width,height);
    }

    draw(scene: Node, camera: Camera, x: number, y: number, width = 1, height = 1) {
        if (!this._renderQueue || !this._frameVisitor || !this._renderBuffer) {
            return;
        }
        const cameraView = Mat4.GetInverted(Transform.GetWorldMatrix(camera.node));
        this._renderQueue.viewMatrix = cameraView;
        this._renderQueue.projectionMatrix = camera.projectionMatrix;
        this._renderQueue.newFrame();
        this._frameVisitor.delta = 0;
        this._frameVisitor.modelMatrix.identity();
        scene.accept(this._frameVisitor);

        let result = null;
        this._renderBuffer.update(() => {
            this._renderBuffer?.frameBuffer.clear();
            this._renderQueue?.draw(RenderLayer.SELECTION_DEFAULT);
            result = this._renderBuffer?.readPixels(x, y, width, height);
        });

        return result;
    }

    destroy() {
        this._renderBuffer?.destroy();
        this._targetTexture?.destroy();
        this._renderBuffer = null;
        this._targetTexture = null;
    }
}

