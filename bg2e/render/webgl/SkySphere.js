
import SkySphere from '../SkySphere';

export default class WebGLSkySphere extends SkySphere {
    constructor(renderer) {
        super(renderer);
    }

    async load(equirectangularTextureUrl) {
        this._texture = new Texture();
        this._texture.fileName = equirectangularTextureUrl;
        await this._texture.loadImageData();

        console.log(`TODO: Load sky sphere texture texture '${this.texture}'`);
    }

    getRenderState({ viewMatrix, projectionMatrix }) {
        
    }
}