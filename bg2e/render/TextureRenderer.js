import { TextureTarget } from "../base/Texture";
export default class TextureRenderer {
    constructor(renderer, texture) {
        if (texture.renderer) {
            throw new Error("Invalid initialization of texture renderer: The texture object is already controlled by another texture renderer.");
        }

        this._renderer = renderer;
        this._texture = texture;
        this._texture._renderer = this;
    }

    get renderer() {
        return this._renderer;
    }

    get texture() {
        return this._texture;
    }

    getApiObject(texture) {
        // Return the specific texture identifier for renderer type
        throw new Error("TextureRenderer: getApiObject() invalid usage of generic implementation of TextureRenderer");
    }

    // Call this function from child class to determine if the
    // texture must to be deleted or not.
    deleteTexture(texture) {
        if (texture.references === 0) {
            return true;
        }
        return false;
    }
}