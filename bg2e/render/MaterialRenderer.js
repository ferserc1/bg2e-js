import Texture from "../base/Texture";

// TODO: Create a generic implementation using TextureRenderer factory
export default class MaterialRenderer {
    constructor(renderer, material) {
        this._renderer = renderer;
        this._material = material;

        this._textureRenderers = {};
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
            this._textureRenderers[materialAttribute] = this._textureRenderers[materialAttribute] || 
                                                        this.renderer.factory.texture(element);
            return this._textureRenderers[materialAttribute];
        }
        return null;
    }

    deleteTextures() {
        for (const key in this._textureRenderers) {
            this._textureRenderers[key].deleteTexture();
        }
    }
}

