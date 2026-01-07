
import Canvas from '../app/Canvas';
import Texture from '../base/Texture';

const g_canvasCache: { [key: string]: TextureCache } = {};

export default class TextureCache {
    static Get(canvas: Canvas | null = null): TextureCache {
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

    private _canvas: Canvas | null;
    private _cache: { [key: string]: Texture };

    constructor(canvas: Canvas | null) {
        this._canvas = canvas;
        this._cache = {};
    }

    get canvas(): Canvas | null { return this._canvas; }

    registerTexture(texture: Texture): void {
        if (!texture.fileName) {
            throw new Error("TextureCache.registerTexture() texture path is empty");
        }
        this._cache[texture.fileName] = texture;
    }

    getTexture(texturePath: string): Texture | undefined {
        return this._cache[texturePath];
    }

    findTexture(texturePath: string): boolean {
        return this._cache[texturePath] != null;
    }

    clear(): void {
        this._cache = {};
    }
}