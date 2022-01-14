import ContextObject from "../app/ContextObject";
import { seededRandom, checkPowerOfTwo } from "../math/functions";
import TextureCache from "./TextureCache";
import TextureLoaderPlugin from "./TextureLoaderPlugin";
import { emitImageLoadEvent } from "../utils/Resource";
import { Vector2, Vector3, Color } from "../math/Vector";
import Engine from "../utils/Engine";

export const TextureUnit = {
    TEXTURE_0: 0,
    TEXTURE_1: 1,
    TEXTURE_2: 2,
    TEXTURE_3: 3,
    TEXTURE_4: 4,
    TEXTURE_5: 5,
    TEXTURE_6: 6,
    TEXTURE_7: 7,
    TEXTURE_8: 8,
    TEXTURE_9: 9,
    TEXTURE_10: 10,
    TEXTURE_11: 11,
    TEXTURE_12: 12,
    TEXTURE_13: 13,
    TEXTURE_14: 14,
    TEXTURE_15: 15,
    TEXTURE_16: 16,
    TEXTURE_17: 17,
    TEXTURE_18: 18,
    TEXTURE_19: 19,
    TEXTURE_20: 20,
    TEXTURE_21: 21,
    TEXTURE_22: 22,
    TEXTURE_23: 23,
    TEXTURE_24: 24,
    TEXTURE_25: 25,
    TEXTURE_26: 26,
    TEXTURE_27: 27,
    TEXTURE_28: 28,
    TEXTURE_29: 29,
    TEXTURE_30: 30
};

export const TextureWrap = {
    REPEAT: null,
    CLAMP: null,
    MIRRORED_REPEAT: null
};

export const TextureFilter = {
    NEAREST_MIPMAP_NEAREST: null,
    LINEAR_MIPMAP_NEAREST: null,
    NEAREST_MIPMAP_LINEAR: null,
    LINEAR_MIPMAP_LINEAR: null,
    NEAREST: null,
    LINEAR: null
};

export const TextureTarget = {
    TEXTURE_2D: null,
    CUBE_MAP: null,
    POSITIVE_X_FACE: null,
    NEGATIVE_X_FACE: null,
    POSITIVE_Y_FACE: null,
    NEGATIVE_Y_FACE: null,
    POSITIVE_Z_FACE: null,
    NEGATIVE_Z_FACE: null
};
    
export class TextureImpl {
    constructor(context) {
        this.initFlags(context);
    }

    initFlags(context) {
        console.log("TextureImpl: initFlags() method not implemented");
    }
    
    create(context) {
        console.log("TextureImpl: create() method not implemented");
        return null;
    }
    
    setActive(context,texUnit) {
        console.log("TextureImpl: setActive() method not implemented");
    }
    
    bind(context,target,texture) {
        console.log("TextureImpl: bind() method not implemented");
    }
    
    unbind(context,target) {
        console.log("TextureImpl: unbind() method not implemented");
    }
    
    setTextureWrapX(context,target,texture,wrap) {
        console.log("TextureImpl: setTextureWrapX() method not implemented");
    }
    
    setTextureWrapY(context,target,texture,wrap) {
        console.log("TextureImpl: setTextureWrapY() method not implemented");
    }
    
    setImage(context,target,minFilter,magFilter,texture,img,flipY) {
        console.log("TextureImpl: setImage() method not implemented");
    }
    
    setImageRaw(context,target,minFilter,magFilter,texture,width,height,data) {
        console.log("TextureImpl: setImageRaw() method not implemented");
    }

    setTextureFilter(context,target,minFilter,magFilter) {
        console.log("TextureImpl: setTextureFilter() method not implemented");
    }

    setCubemapImage(context,face,image) {
        console.log("TextureImpl: setCubemapImage() method not implemented");
    }

    setCubemapRaw(context,face,rawImage,w,h) {
        console.log("TextureImpl: setCubemapRaw() method not implemented");
    }

    setVideo(context,target,texture,video,flipY) {
        console.log("TextureImpl: setVideo() method not implemented");
    }

    updateVideoData(context,target,texture,video) {
        console.log("TextureImpl: updateVideoData() method not implemented");
    }

    destroy(context,texture) {
        console.log("TextureImpl: destroy() method not implemented");
    }
}


export const TextureDataType = {
    NONE: 0,
    IMAGE: 1,
    IMAGE_DATA: 2,
    CUBEMAP: 3,
    CUBEMAP_DATA: 4,
    VIDEO: 5
};

window.s_bg_base_base64TexturePreventRemove = [];

export default class Texture extends ContextObject {
    static IsPowerOfTwoImage(image) {
        return checkPowerOfTwo(image.width) && checkPowerOfTwo(image.height);
    }

    static FromCanvas(context,canvas2d) {
        return Texture.FromBase64Image(context,canvas2d.toDataURL("image/png"));
    }

    static UpdateCanvasImage(texture,canvas2d) {
        if (!texture.valid) {
            return false;
        }
        let imageData = canvas2d.toDataURL("image/png");
        let recreate = false;
        if (texture.img.width!=imageData.width || texture.img.height!=imageData.height) {
            recreate = true;
        }
        texture.img = new Image();
        window.s_bg_base_base64TexturePreventRemove.push(texture);
        setTimeout(() => {
            texture.bind();
            if (Texture.IsPowerOfTwoImage(texture.img)) {
                texture.minFilter = TextureLoaderPlugin.GetMinFilter();
                texture.magFilter = TextureLoaderPlugin.GetMagFilter();
            }
            else {
                texture.minFilter = TextureFilter.NEAREST;
                texture.magFilter = TextureFilter.NEAREST;
                texture.wrapX = TextureWrap.CLAMP;
                texture.wrapY = TextureWrap.CLAMP;
            }
            texture.setImage(texture.img,true);
            texture.unbind();
            let index = window.s_bg_base_base64TexturePreventRemove.indexOf(texture);
            if (index!=-1) {
                window.s_bg_base_base64TexturePreventRemove.splice(index,1);
            }
            emitImageLoadEvent(texture.img);
        },10);
        texture.img.src = imageData;
        
        return texture;
    }

    static FromBase64Image(context,imgData) {
        let tex = new Texture(context);
        tex.img = new Image();
        window.s_bg_base_base64TexturePreventRemove.push(tex);
        setTimeout(() => {
            tex.create();
            tex.bind();
            if (Texture.IsPowerOfTwoImage(tex.img)) {
                tex.minFilter = TextureLoaderPlugin.GetMinFilter();
                tex.magFilter = TextureLoaderPlugin.GetMagFilter();
            }
            else {
                tex.minFilter = TextureFilter.NEAREST;
                tex.magFilter = TextureFilter.NEAREST;
                tex.wrapX = TextureWrap.CLAMP;
                tex.wrapY = TextureWrap.CLAMP;
            }
            tex.setImage(tex.img,false);	// Check this: flip base64 image?
            tex.unbind();
            let index = window.s_bg_base_base64TexturePreventRemove.indexOf(tex);
            if (index!=-1) {
                window.s_bg_base_base64TexturePreventRemove.splice(index,1);
            }
            emitImageLoadEvent(tex.img);
        },10);
        tex.img.src = imgData;
        
        return tex;
    }
    
    static ColorTexture(context,color,size) {
        let colorTexture = new Texture(context);
        colorTexture.create();
        colorTexture.bind();

        var dataSize = size.width * size.height * 4;
        var textureData = [];
        for (var i = 0; i < dataSize; i+=4) {
            textureData[i]   = color.r * 255;
            textureData[i+1] = color.g * 255;
            textureData[i+2] = color.b * 255;
            textureData[i+3] = color.a * 255;
        }
        
        textureData = new Uint8Array(textureData);

        colorTexture.minFilter = TextureFilter.NEAREST;
        colorTexture.magFilter = TextureFilter.NEAREST;
        colorTexture.setImageRaw(size.width,size.height,textureData);
        colorTexture.unbind();

        return colorTexture;
    }
    
    static WhiteTexture(context,size) {
        return Texture.ColorTexture(context,Color.White(),size);
    }

    static WhiteCubemap(context) {
        return Texture.ColorCubemap(context, Color.White());
    }

    static BlackCubemap(context) {
        return Texture.ColorCubemap(context, Color.Black());
    }

    static ColorCubemap(context,color) {
        let cm = new Texture(context);
        cm.target = TextureTarget.CUBE_MAP;
        cm.create();
        cm.bind();

        let dataSize = 32 * 32 * 4;
        let textureData = [];
        for (let i = 0; i<dataSize; i+=4) {
            textureData[i] 		= color.r * 255;
            textureData[i + 1] 	= color.g * 255;
            textureData[i + 2] 	= color.b * 255;
            textureData[i + 3] 	= color.a * 255;
        }

        textureData = new Uint8Array(textureData);

        cm.setCubemapRaw(
            32,
            32,
            textureData,
            textureData,
            textureData,
            textureData,
            textureData,
            textureData
        );

        cm.unbind();
        return cm;
    }
    
    static NormalTexture(context,size) {
        return Texture.ColorTexture(context,new Color(0.5,0.5,1,1),size);
    }
    
    static BlackTexture(context,size) {
        return Texture.ColorTexture(context,Color.Black(),size);
    }

    static RandomTexture(context,size) {
        let colorTexture = new Texture(context);
        colorTexture.create();
        colorTexture.bind();

        var dataSize = size.width * size.height * 4;
        var textureData = [];
        for (var i = 0; i < dataSize; i+=4) {
            let randVector = new Vector3(seededRandom() * 2.0 - 1.0,
                                        seededRandom() * 2.0 - 1.0,
                                        0);
            randVector.normalize();

            textureData[i]   = randVector.x * 255;
            textureData[i+1] = randVector.y * 255;
            textureData[i+2] = randVector.z * 255;
            textureData[i+3] = 1;
        }
        
        textureData = new Uint8Array(textureData);

        colorTexture.minFilter = TextureFilter.NEAREST;
        colorTexture.magFilter = TextureFilter.NEAREST;
        colorTexture.setImageRaw(size.width,size.height,textureData);
        colorTexture.unbind();

        return colorTexture;
    }

    /*
     *	Precomputed BRDF, for using with PBR shaders
     */
    static PrecomputedBRDFLookupTexture(context) {
        return new Promise((resolve) => {
            import(/* webpackChunkName: "brdfLUT" */ "./BRDFLutData")
                .then(brdf => {
                    return Texture.FromBase64Image(context, brdf.default);
                })
                .then((tex) => {
                    resolve(tex);
                })
                .catch(err => {
                    console.error("Error loading BRDF lut data");
                    console.error(err);
                });
        });
    }

    /*
     *	Create a texture using an image.
     *		context: the rendering context
     *		image: a valid image object (for example, an <image> tag)
     *		url: unique URL for this image, used as index for the texture cache
     */
    static FromImage(context,image,url) {
        let texture = null;
        if (image) {
            texture = TextureCache.Get(context).find(url);
            if (!texture) {
                console.debug(`Texture ${url} not found. Loading texture`);
                texture = new Texture(context);
                texture.create();
                texture.bind();
                texture.minFilter = TextureLoaderPlugin.GetMinFilter();
                texture.magFilter = TextureLoaderPlugin.GetMagFilter();
                texture.setImage(image);
                texture.fileName = url;
                TextureCache.Get(context).register(url,texture);
            }
        }
        return texture;
    }
    
    static SetActive(context,textureUnit) {
        Engine.Get().texture.setActive(context,textureUnit);
    }
    
    static Unbind(context, target) {
        if (!target) {
            target = TextureTarget.TEXTURE_2D;
        }
        Engine.Get().texture.unbind(context,target);
    }
    
    constructor(context) {
        super(context);
        
        this._texture = null;
        this._fileName = "";
        this._size = new Vector2(0);
        this._target = TextureTarget.TEXTURE_2D;
        
        this._minFilter = TextureFilter.LINEAR;
        this._magFilter = TextureFilter.LINEAR;
        
        this._wrapX = TextureWrap.REPEAT;
        this._wrapY = TextureWrap.REPEAT;

        this._video = null;
    }
    
    get texture() { return this._texture; }
    get target() { return this._target; }
    set target(t) { this._target = t; }
    get fileName() { return this._fileName; }
    set fileName(fileName) { this._fileName = fileName; }
    set minFilter(f) { this._minFilter = f; }
    set magFilter(f) { this._magFilter = f; }
    get minFilter() { return this._minFilter; }
    get magFilter() { return this._magFilter; }
    set wrapX(w) { this._wrapX = w; }
    set wrapY(w) { this._wrapY = w; }
    get wrapX() { return this._wrapX; }
    get wrapY() { return this._wrapY; }
    get size() { return this._size; }
    

    // Access to image data structures
    get image() { return this._image; }
    get imageData() { return this._imageData; }
    get cubeMapImages() { return this._cubeMapImages; }
    get cubeMapData() { return this._cubeMapData; }
    get video() { return this._video; }

    get dataType() {
        if (this._image) {
            return TextureDataType.IMAGE;
        }
        else if (this._imageData) {
            return TextureDataType.IMAGE_DATA;
        }
        else if (this._cubeMapImages) {
            return TextureDataType.CUBEMAP;
        }
        else if (this._cubeMapData) {
            return TextureDataType.CUBEMAP_DATA;
        }
        else if (this._video) {
            return TextureDataType.VIDEO;
        }
        else {
            return TextureDataType.NONE;
        }
    }

    create() {
        if (this._texture!==null) {
            this.destroy()
        }
        this._texture = Engine.Get().texture.create(this.context);
    }
    
    setActive(textureUnit) {
        Engine.Get().texture.setActive(this.context,textureUnit);
    }
    
    
    bind() {
        Engine.Get().texture.bind(this.context,this._target,this._texture);
    }
    
    unbind() {
        Texture.Unbind(this.context,this._target);
    }
    
    setImage(img, flipY) {
        if (flipY===undefined) flipY = true;
        this._size.width = img.width;
        this._size.height = img.height;
        Engine.Get().texture.setTextureWrapX(this.context,this._target,this._texture,this._wrapX);
        Engine.Get().texture.setTextureWrapY(this.context,this._target,this._texture,this._wrapY);
        Engine.Get().texture.setImage(this.context,this._target,this._minFilter,this._magFilter,this._texture,img,flipY);

        this._image = img;
        this._imageData = null;
        this._cubeMapImages = null;
        this._cubeMapData = null;
        this._video = null;
    }

    updateImage(img, flipY) {
        if (flipY===undefined) flipY = true;
        this._size.width = img.width;
        this._size.height = img.height;
        Engine.Get().texture.setTextureWrapX(this.context,this._target,this._texture,this._wrapX);
        Engine.Get().texture.setTextureWrapY(this.context,this._target,this._texture,this._wrapY);
        Engine.Get().texture.setImage(this.context,this._target,this._minFilter,this._magFilter,this._texture,img,flipY);

        this._image = img;
        this._imageData = null;
        this._cubeMapImages = null;
        this._cubeMapData = null;
        this._video = null;
    }
    
    setImageRaw(width,height,data,type,format) {
        if (!type) {
            type = this.context.RGBA;
        }
        if (!format) {
            format = this.context.UNSIGNED_BYTE;
        }
        this._size.width = width;
        this._size.height = height;
        Engine.Get().texture.setTextureWrapX(this.context,this._target,this._texture,this._wrapX);
        Engine.Get().texture.setTextureWrapY(this.context,this._target,this._texture,this._wrapY);
        Engine.Get().texture.setImageRaw(this.context,this._target,this._minFilter,this._magFilter,this._texture,width,height,data,type,format);

        this._image = null;
        this._imageData = data;
        this._cubeMapImages = null;
        this._cubeMapData = null;
        this._video = null;
    }

    setCubemap(posX,negX,posY,negY,posZ,negZ) {
        Engine.Get().texture.bind(this.context,this._target,this._texture);
        Engine.Get().texture.setTextureWrapX(this.context,this._target,this._texture,this._wrapX);
        Engine.Get().texture.setTextureWrapX(this.context,this._target,this._texture,this._wrapY);
        Engine.Get().texture.setTextureFilter(this.context,this._target,this._minFilter,this._magFilter);
        Engine.Get().texture.setCubemapImage(this.context,TextureTarget.POSITIVE_X_FACE,posX);
        Engine.Get().texture.setCubemapImage(this.context,TextureTarget.NEGATIVE_X_FACE,negX);
        Engine.Get().texture.setCubemapImage(this.context,TextureTarget.POSITIVE_Y_FACE,posY);
        Engine.Get().texture.setCubemapImage(this.context,TextureTarget.NEGATIVE_Y_FACE,negY);
        Engine.Get().texture.setCubemapImage(this.context,TextureTarget.POSITIVE_Z_FACE,posZ);
        Engine.Get().texture.setCubemapImage(this.context,TextureTarget.NEGATIVE_Z_FACE,negZ);

        this._image = null;
        this._imageData = null;
        this._cubeMapImages = {
            posX: posX,
            negX: negX,
            posY: posY,
            negY: negY,
            posZ: posZ,
            negZ: negZ
        };
        this._cubeMapData = null;
        this._video = null;
    }

    setCubemapRaw(w,h,posX,negX,posY,negY,posZ,negZ) {
        Engine.Get().texture.bind(this.context,this._target,this._texture);
        Engine.Get().texture.setTextureWrapX(this.context,this._target,this._texture,this._wrapX);
        Engine.Get().texture.setTextureWrapX(this.context,this._target,this._texture,this._wrapY);
        Engine.Get().texture.setTextureFilter(this.context,this._target,this._minFilter,this._magFilter);
        Engine.Get().texture.setCubemapRaw(this.context,TextureTarget.POSITIVE_X_FACE,posX,w,h);
        Engine.Get().texture.setCubemapRaw(this.context,TextureTarget.NEGATIVE_X_FACE,negX,w,h);
        Engine.Get().texture.setCubemapRaw(this.context,TextureTarget.POSITIVE_Y_FACE,posY,w,h);
        Engine.Get().texture.setCubemapRaw(this.context,TextureTarget.NEGATIVE_Y_FACE,negY,w,h);
        Engine.Get().texture.setCubemapRaw(this.context,TextureTarget.POSITIVE_Z_FACE,posZ,w,h);
        Engine.Get().texture.setCubemapRaw(this.context,TextureTarget.NEGATIVE_Z_FACE,negZ,w,h);

        this._image = null;
        this._imageData = null;
        this._cubeMapImages = null;
        this._cubeMapData = {
            width: w,
            height: h,
            posX:posX,
            negX:negX,
            posY:posY,
            negY:negY,
            posZ:posZ,
            negZ:negZ
        };
        this._video = null;
    }

    setVideo(video, flipY) {
        if (flipY===undefined) flipY = true;
        this._size.width = video.videoWidth;
        this._size.height = video.videoHeight;
        Engine.Get().texture.setVideo(this.context,this._target,this._texture,video,flipY);
        this._video = video;

        this._image = null;
        this._imageData = null;
        this._cubeMapImages = null;
        this._cubeMapData = null;
    }

    destroy() {
        Engine.Get().texture.destroy(this.context,this._texture);
        this._texture = null;
        this._minFilter = null;
        this._magFilter = null;
        this._fileName = "";
    }

    valid() {
        return this._texture!==null;
    }

    update() {
        Engine.Get().texture.updateVideoData(this.context,this._target,this._texture,this._video);
    }
}
