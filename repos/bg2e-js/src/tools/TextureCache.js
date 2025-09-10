
import Canvas from '../app/Canvas';

const g_canvasCache = {};

export default class TextureCache {
    static Get(canvas = null) {
        canvas = canvas || Canvas.FirstCanvas();
        if (!canvas && !g_canvasCache["__no_canvas__"]) {
            console.warn("TextureCache.Get() No canvas available. If your application uses a canvas, ensure that it has been created before using TexturCache. If your application does not use a canvas, you may disregard this message.");
        }

        if (canvas && !g_canvasCache[canvas.id]) {
            g_canvasCache[canvas.id] = new TextureCache(canvas);
        }
        else if (!canvas && !g_canvasCache["__no_canvas__"]) {
            g_canvasCache["__no_canvas__"] = new TextureCache(null);
        }

        return g_canvasCache[canvas ? canvas.id : "__no_canvas__"];
    }

    constructor(canvas) {
        this._canvas = canvas;
        this._cache = {};
    }

    get canvas() { return this._canvas; }

    registerTexture(texture) {
        if (!texture.fileName) {
            throw new Error("TextureCache.registerTexture() texture path is empty");
        }
        this._cache[texture.fileName] = texture;
    }

    getTexture(texturePath) {
        return this._cache[texturePath];
    }

    findTexture(texturePath) {
        return this._cache[texturePath] != null;
    }

    clear() {
        this._cache = {};
    }
}