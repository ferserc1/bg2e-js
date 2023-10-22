import Texture, {
    TextureComponentFormat,
    TextureRenderTargetAttachment,
    TextureWrap
} from "../base/Texture";
import Vec from "../math/Vec";
import BasicDiffuseColorShader from "../shaders/BasicDiffuseColorShader";


export default class ShadowRenderer {
    constructor(renderer) {
        this._renderer = renderer;
    }

    get renderer() { return this._renderer; }

    get size() {
        return this._size;
    }

    // TODO: set size. Update the shadow map size

    async create(size = new Vec(1024, 1024)) {
        this._size = size;

        this._texture = new Texture();
        this._texture.renderTargetAttachment = TextureRenderTargetAttachment.COLOR_ATTACHMENT_0;
        this._texture.componentFormat = TextureComponentFormat.UNSIGNED_BYTE;
        this._texture.wrapModeXY = TextureWrap.CLAMP;

        this._renderBuffer = this.renderer.factory.renderBuffer();

        await this._renderBuffer.attachTexture(this._texture);
        this._renderBuffer.size = this._size;

        this._shader = new BasicDiffuseColorShader(this.renderer);
        await this._shader.load();
    }

    update(camera, light, renderCallback) {
        // TODO: Position the camera in front of the camera
        // TODO: Extract view and projection matrix from light
        
        this.renderBuffer.update(() => {
            renderCallback(this.renderer);
        });
    }
}
