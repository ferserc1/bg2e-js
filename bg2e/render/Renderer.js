
import MaterialRenderer from "./MaterialRenderer";
import PresentTextureShader from "../shaders/PresentTextureShader";
import Material from "../base/Material";
import PolyList from "../base/PolyList";

export const EngineFeatures = {
    RENDER_TARGET_TEXTURES:         0x1 << 0,
    RENDER_TARGET_FLOAT:            0x1 << 1,
    RENDER_TARGET_DEPTH:            0x1 << 2
};

export default class Renderer {
    constructor(identifier) {
        this._identifier = identifier;
    }

    async init(canvas) {
        this._canvas = canvas;
    }

    get canvas() {
        return this._canvas;
    }

    get presentTextureSurfaceRenderer() {
        if (!this._presentTextureSurface) {
            const plist = new PolyList();
            plist.vertex = [
                -1, -1, 0,
                 1, -1, 0,
                 1,  1, 0,
                -1,  1, 0
            ];
            plist.texCoord0 = [
                0, 1,
                1, 1,
                1, 0,
                0, 0
            ];
            plist.index = [
                0, 1, 2,
                2, 3, 0
            ];
            this._presentTextureSurface = this.factory.polyList(plist);
        }
        return this._presentTextureSurface;
    }

    get presentTextureShader() {
        if (!this._presentTextureShader) {
            this._presentTextureShader = new PresentTextureShader(this);
        }
        return this._presentTextureShader;
    }

    get presentTextureMaterialRenderer() {
        if (!this._presentTextureMaterial) {
            this._presentTextureMaterial = this.factory.material(new Material());
        }
        return this._presentTextureMaterial;
    }

    postReshape(width,height) {

    }

    postRedisplay() {

    }

    // The child function will call this function passing the specific
    // polyListRenderer instance, so plist here will be a PolyListRenderer
    // instance, instead of a PolyList
    polyListFactory(plist) {
        plist.init();
        plist.refresh();
        return plist;
    }

    materialFactory(material) {
        return new MaterialRenderer(this, material);
    }

    textureFactory(texture) {
        throw new Error("Calling base implementation of Renderer.textureFactory()")
    }

    get factory() {
        const renderer = this;
        return {
            polyList(plist) {
                return renderer.polyListFactory(plist);
            },
            material(material) {
                return renderer.materialFactory(material);
            },
            texture(texture) {
                return renderer.textureFactory(texture);
            }
        }
    }

    presentTexture(texture, params) {
        
    }

    // Compatibility function
    supportsFeatures(feature) {
        return false;
    }

    getMaximumRenderTargets() {
        return 1;
    }
}
