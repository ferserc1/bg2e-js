
import { RenderLayer } from "../base/PolyList";
import Texture, { TextureRenderTargetAttachment, TextureComponentFormat, TextureWrap } from "../base/Texture";
import Mat4 from "../math/Mat4";
import Vec from "../math/Vec";
import RenderQueue from "../render/RenderQueue";
import { FrameVisitor } from "../render/SceneRenderer";
import Transform from "../scene/Transform";
import PickSelectionShader from "../shaders/PickSelectionShader";
import SelectionHighlightShader from "../shaders/SelectionHighlightShader";
import Renderer from "../render/Renderer";
import RenderBuffer from "../render/RenderBuffer";
import Node from "../scene/Node";
import Camera from "../scene/Camera";

export default class SelectionHighlight {
    protected _renderer: Renderer;
    protected _targetTexture: Texture | null = null
    protected _renderBuffer: RenderBuffer | null = null;
    protected _shader: PickSelectionShader | null = null;
    protected _renderQueue: RenderQueue | null = null
    protected _frameVisitor: FrameVisitor | null = null;
    protected _selectionDrawShader: SelectionHighlightShader | null = null;

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
        this._shader.forceDraw = false;

        this._renderQueue = new RenderQueue(renderer);
        this._renderQueue.enableQueue(RenderLayer.SELECTION_DEFAULT, this._shader);

        this._frameVisitor = new FrameVisitor(this._renderQueue);

        this._selectionDrawShader = new SelectionHighlightShader(renderer);
        await this._selectionDrawShader.load();
    }

    setViewportSize(width: number, height: number) {
        this._renderBuffer!.size = new Vec(width,height);
    }

    draw(scene: Node, camera: Camera) {
        if (!this._renderQueue || !this._frameVisitor || !this._renderBuffer || !this._targetTexture) {
            return;
        }

        const cameraView = Mat4.GetInverted(Transform.GetWorldMatrix(camera.node));
        this._renderQueue.viewMatrix = cameraView;
        this._renderQueue.projectionMatrix = camera.projectionMatrix;
        this._renderQueue.newFrame();
        this._frameVisitor.delta = 0;
        this._frameVisitor.modelMatrix.identity();
        scene.accept(this._frameVisitor);

        this._renderBuffer.update(() => {
            this._renderBuffer?.frameBuffer.clear();
            this._renderQueue?.draw(RenderLayer.SELECTION_DEFAULT);
        });

        // TODO: Draw target texture using a border detection shader
        const shader = this._selectionDrawShader;
        this._renderer.presentTexture(this._targetTexture, { clearBuffers: false, shader });
    }

    destroy() {
        this._renderBuffer?.destroy();
        this._targetTexture?.destroy();
        this._renderBuffer = null;
        this._targetTexture = null;
    }
}
