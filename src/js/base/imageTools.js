
import md5 from "../utils/md5";
import Loader from "./Loader";
import Resource from "../utils/Resource";
import Texture from "./Texture";
import TextureCache from "./TextureCache";
import TextureLoaderPlugin from "./TextureLoaderPlugin";

window.s_bg_base_imageTools = {
    base64Images: {}
}

export default {
    isAbsolutePath(path) {
        return /^(f|ht)tps?:\/\//i.test(path);
    },

    mergePaths(path,component) {
        return path.slice(-1)!='/' ? path + '/' + component :  path + component;
    },

    getTexture(context,texturePath,resourcePath) {
        let texture = null;
        if (texturePath) {
            if (!isAbsolutePath(texturePath)) {
                if (resourcePath.slice(-1)!='/') {
                    resourcePath += '/';
                }
                texturePath = `${resourcePath}${texturePath}`;
            }
    
            texture = TextureCache.Get(context).find(texturePath);
            if (!texture) {
                texture = new Texture(context);
                texture.create();
                texture.fileName = texturePath;
                TextureCache.Get(context).register(texturePath,texture);
    
                (function(path,tex) {
                    Resource.Load(path)
                        .then(function(imgData) {
                            tex.bind();
                            texture.minFilter = TextureLoaderPlugin.GetMinFilter();
                            texture.magFilter = TextureLoaderPlugin.GetMagFilter();
                            tex.fileName = path;
                            tex.setImage(imgData);
                        });
                })(texturePath,texture);
            }
        }
        return texture;
    },

    getPath(texture) {
        return texture ? texture.fileName:"";
    },


    readTexture(context,basePath,texData,mat,property) {
        return new Promise((resolve) => {
            if (!texData) {
                resolve();
            }
            else if (/data\:image\/[a-z]+\;base64\,/.test(texData)) {
                let hash = md5(texData);
                if (window.s_bg_base_imageTools.base64Images[hash]) {
                    mat[property] = window.s_bg_base_imageTools.base64Images[hash];
                }
                else {
                    mat[property] = Texture.FromBase64Image(context,texData);
                    window.s_bg_base_imageTools.base64Images[hash] = mat[property];
                }
                resolve(mat[property]);
            }
    //			else if (/data\:md5/.test(texData)) {

    //			}
            else {
                let fullPath = basePath + texData;	// TODO: add full path
                Loader.Load(context,fullPath)
                    .then(function(tex) {
                        mat[property] = tex;
                        resolve(tex);
                    });
            }
        });
    }
}
