import Texture, { TextureTarget } from "../base/Texture";
import Renderer from "./Renderer";

export default class TextureRenderer {
    protected _renderer: Renderer;
    protected _texture: Texture;

    constructor(renderer: Renderer, texture: Texture) {
        if ((texture as any).renderer) {
            throw new Error("Invalid initialization of texture renderer: The texture object is already controlled by another texture renderer.");
        }

        this._renderer = renderer;
        this._texture = texture;
        (this._texture as any)._renderer = this;
    }

    get renderer(): Renderer {
        return this._renderer;
    }

    get texture(): Texture {
        return this._texture;
    }

    getApiObject(texture: Texture): any {
        // Return the specific texture identifier for renderer type
        throw new Error("TextureRenderer: getApiObject() invalid usage of generic implementation of TextureRenderer");
    }

    destroy(): void {
        throw new Error("TextureRenderer: destroy() invalid usage of generic implementation of TextureRenderer");
    }
}
