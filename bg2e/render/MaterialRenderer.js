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

    // The specific MaterialRenderer class must call this function to
    // get the base.Texture object or null and get the equivalent 
    // render API object, for example, a webgl texture. If the base.Texture
    // object is dirty, the API texture must to be regenerated.
    getTexture(materialAttribute) {
        const element = this.material[materialAttribute];
        if (!element instanceof Texture) {
            return null;
        }
        else {
            return element;
        }
    }
}

