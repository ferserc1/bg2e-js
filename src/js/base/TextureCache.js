

import Texture from "./Texture";
import { Vector2 } from "../math/Vector";

window.s_bg_base_textureCache = {};
	
let COLOR_TEXTURE_SIZE = 8;

const s_whiteTexture = "static-white-color-texture";
const s_blackTexture = "static-black-color-texture";
const s_normalTexture = "static-normal-color-texture";
const s_randomTexture = "static-random-color-texture";
const s_whiteCubemap = "static-white-cubemap-texture";
const s_blackCubemap = "static-white-cubemap-texture";

export default class TextureCache {
    static SetColorTextureSize(size) { COLOR_TEXTURE_SIZE = size; }
    static GetColorTextureSize() { return COLOR_TEXTURE_SIZE; }

    static WhiteCubemap(context) {
        let cache = TextureCache.Get(context);
        let tex = cache.find(s_whiteCubemap);

        if (!tex) {
            tex = Texture.WhiteCubemap(context);
            cache.register(s_whiteCubemap,tex);
        }
        return tex;
    }

    static BlackCubemap(context) {
        let cache = TextureCache.Get(context);
        let tex = cache.find(s_blackCubemap);

        if (!tex) {
            tex = Texture.BlackCubemap(context);
            cache.register(s_blackCubemap,tex);
        }
        return tex;
    }
    
    static WhiteTexture(context) {
        let cache = TextureCache.Get(context);
        let tex = cache.find(s_whiteTexture);
        
        if (!tex) {
            tex = Texture.WhiteTexture(context,new Vector2(COLOR_TEXTURE_SIZE));
            cache.register(s_whiteTexture,tex);
        }
        
        return tex;
    }
    
    static BlackTexture(context) {
        let cache = TextureCache.Get(context);
        let tex = cache.find(s_blackTexture);
        
        if (!tex) {
            tex = Texture.BlackTexture(context,new Vector2(COLOR_TEXTURE_SIZE));
            cache.register(s_blackTexture,tex);
        }
        
        return tex;
    }
    
    static NormalTexture(context) {
        let cache = TextureCache.Get(context);
        let tex = cache.find(s_normalTexture);
        
        if (!tex) {
            tex = Texture.NormalTexture(context,new Vector2(COLOR_TEXTURE_SIZE));
            cache.register(s_normalTexture,tex);
        }
        
        return tex;
    }

    static RandomTexture(context) {
        let cache = TextureCache.Get(context);
        let tex = cache.find(s_randomTexture);

        if (!tex) {
            tex = Texture.RandomTexture(context,new Vector2(64));
            cache.register(s_randomTexture,tex);
        }

        return tex;
    }
    
    static Get(context) {
        if (!window.s_bg_base_textureCache[context.uuid]) {
            window.s_bg_base_textureCache[context.uuid] = new TextureCache(context);
        }
        return window.s_bg_base_textureCache[context.uuid];
    }

    static PrecomputedBRDFLookupTexture(context) {
        if (!window.s_bg_base_textureCache["_bg_base_brdfLutData_"]) {
            window.s_bg_base_textureCache["_bg_base_brdfLutData_"] = Texture.PrecomputedBRDFLookupTexture(context);
        }
        return window.s_bg_base_textureCache["_bg_base_brdfLutData_"];
    }
    
    constructor(context) {
        this._context = context;
        this._textures = {};
    }
    
    find(url) {
        return this._textures[url];
    }
    
    register(url,texture) {
        if (texture instanceof Texture) {
            this._textures[url] = texture;
        }
    }
    
    unregister(url) {
        if (this._textures[url]) {
            delete this._textures[url];
        }
    }
    
    clear() {
        this._textures = {};
    }
}