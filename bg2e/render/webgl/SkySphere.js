
import SkySphere from '../SkySphere';

export default class WebGLSkySphere extends SkySphere {
    constructor(renderer) {
        super(renderer);
    }

    async load(equirectangularTextureUrl) {
        this._texture = equirectangularTextureUrl;

        console.log(`TODO: Load sky sphere texture texture '${this.texture}'`);
    }

    getRenderState({ viewMatrix, projectionMatrix }) {
        
    }
}