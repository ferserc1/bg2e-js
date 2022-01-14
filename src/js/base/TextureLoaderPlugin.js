
import Texture, { TextureWrap, TextureFilter } from "./Texture";
import TextureCache from "./TextureCache";
import Resource from "../utils/Resource";
import { LoaderPlugin } from "./Loader";

window.s_bg_base_textureLoaderPlugin_wrapX = null;
window.s_bg_base_textureLoaderPlugin_wrapY = null;
window.s_bg_base_textureLoaderPlugin_minFilter = null;
window.s_bg_base_textureLoaderPlugin_magFilter = null;

/* Extra data:
 * 	wrapX
 *  wrapY
 *  minFilter
 *  magFilter
 */
export default class TextureLoaderPlugin extends LoaderPlugin {
    static GetWrapX() {
        return window.s_bg_base_textureLoaderPlugin_wrapX || TextureWrap.REPEAT;
    }

    static GetWrapY() {
        return window.s_bg_base_textureLoaderPlugin_wrapY || TextureWrap.REPEAT;
    }

    static GetMinFilter() {
        return window.s_bg_base_textureLoaderPlugin_minFilter || TextureFilter.LINEAR_MIPMAP_NEAREST;
    }

    static GetMagFilter() {
        return window.s_bg_base_textureLoaderPlugin_magFilter || TextureFilter.LINEAR;
    }

    static SetMinFilter(f) {
        window.s_bg_base_textureLoaderPlugin_minFilter = f;
    }

    static SetMagFilter(f) {
        window.s_bg_base_textureLoaderPlugin_magFilter = f;
    }

    static SetWrapX(w) {
        window.s_bg_base_textureLoaderPlugin_wrapX = w;
    }

    static SetWrapY(w) {
        window.s_bg_base_textureLoaderPlugin_wrapY = w;
    }
    
    acceptType(url,data) {
        return Resource.IsImage(url);
    }
    
    load(context,url,data,extraData) {
        return new Promise((accept,reject) => {
            if (data) {
                let texture = TextureCache.Get(context).find(url);
                if (!texture) {
                    console.log(`Texture ${url} not found. Loading texture`);
                    texture = new Texture(context);
                    texture.create();
                    texture.bind();
                    texture.wrapX = extraData.wrapX || TextureLoaderPlugin.GetWrapX();
                    texture.wrapY = extraData.wrapY || TextureLoaderPlugin.GetWrapY();
                    texture.minFilter = extraData.minFilter || TextureLoaderPlugin.GetMinFilter();
                    texture.magFilter = extraData.magFilter || TextureLoaderPlugin.GetMagFilter();
                    texture.setImage(data);
                    texture.fileName = url;
                    TextureCache.Get(context).register(url,texture);
                }
                accept(texture);
            }
            else {
                reject(new Error("Error loading texture image data"));
            }
        });
    }
}
