
import MaterialRenderer from "./MaterialRenderer";
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
}
