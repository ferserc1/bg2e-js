import Texture from "../base/Texture";

export default class MaterialRenderer {
    constructor(renderer, material) {
        this._renderer = renderer;
        this._material = material;
    }

    get renderer() {
        return this._renderer;
    }

    get material() {
        return this._material;
    }

    getTextureRenderer(materialAttribute) {
        const element = this.material[materialAttribute];
        if (element instanceof Texture) {
            // The texture renderer factory will create a texture renderer, or
            // return the existing one
            return this.renderer.factory.texture(element);
        }
        return null;
    }

}

