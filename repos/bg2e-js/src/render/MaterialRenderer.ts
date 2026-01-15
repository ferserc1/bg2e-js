import Texture from "../base/Texture";
import Renderer from "./Renderer";
import Material from "../base/Material";
import TextureRenderer from "./TextureRenderer";

export default class MaterialRenderer {
    protected _renderer: Renderer;
    protected _material: Material;

    constructor(renderer: Renderer, material: Material) {
        this._renderer = renderer;
        this._material = material;
    }

    get renderer() {
        return this._renderer;
    }

    get material() {
        return this._material;
    }

    getTextureRenderer(materialAttribute: keyof Material): TextureRenderer | null {
        const element = this.material[materialAttribute];
        if (element instanceof Texture) {
            // The texture renderer factory will create a texture renderer, or
            // return the existing one
            return this.renderer.factory.texture(element);
        }
        return null;
    }

}

