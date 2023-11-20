
import Canvas from '../app/Canvas';

const g_canvasCache = {};

export default class TextureCache {
    static Get(canvas = null) {
        canvas = canvas || Canvas.FirstCanvas();
        if (!canvas) {
            throw new Error("No canvas created. Create a canvas before using TextureCache.");
        }

        if (!g_canvasCache[canvas.id]) {
            g_canvasCache[canvas.id] = new TextureCache(canvas);
        }
        return g_canvasCache[canvas.id];
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