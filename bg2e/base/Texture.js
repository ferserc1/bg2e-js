
import Vec from '../math/Vec';
import Resource from '../tools/Resource';
import { generateImageHash } from '../tools/image';
import Color from './Color';

export const TextureDataType = Object.freeze({
    NONE: 0,
    IMAGE: 1,
    IMAGE_DATA: 2,
    CUBEMAP: 3,
    CUBEMAP_DATA: 4,
    VIDEO: 5,
    PROCEDURAL: 6,
    RENDER_TARGET: 7
});

export const TextureWrap = Object.freeze({
    REPEAT: 0,
    CLAMP: 1,
    MIRRORED_REPEAT: 2
});

export const TextureFilter = Object.freeze({
    NEAREST_MIPMAP_NEAREST: 0,
    LINEAR_MIPMAP_NEAREST: 1,
    NEAREST_MIPMAP_LINEAR: 2,
    LINEAR_MIPMAP_LINEAR: 3,
    NEAREST: 4,
    LINEAR: 5
});

export const TextureTarget = Object.freeze({
    TEXTURE_2D: 0,
    CUBE_MAP: 1
});

export const ProceduralTextureFunction = Object.freeze({
    PLAIN_COLOR: 0,
    RANDOM_NOISE: 1,
    DYNAMIC_CUBEMAP: 2,
    FROM_BASE64: 3,
    CANVAS_2D: 4
});

export const TextureRenderTargetAttachment = Object.freeze({
    COLOR_ATTACHMENT_0: 0,
    COLOR_ATTACHMENT_1: 1,
    COLOR_ATTACHMENT_2: 2,
    COLOR_ATTACHMENT_3: 3,
    COLOR_ATTACHMENT_4: 4,
    COLOR_ATTACHMENT_5: 5,
    COLOR_ATTACHMENT_6: 6,
    COLOR_ATTACHMENT_7: 7,
    COLOR_ATTACHMENT_8: 8,
    COLOR_ATTACHMENT_9: 9,
    COLOR_ATTACHMENT_10: 10,
    COLOR_ATTACHMENT_11: 11,
    COLOR_ATTACHMENT_12: 12,
    COLOR_ATTACHMENT_13: 13,
    COLOR_ATTACHMENT_14: 14,
    COLOR_ATTACHMENT_15: 15,
    DEPTH_ATTACHMENT: 100,
    STENCIL_ATTACHMENT: 200
});

export const TextureComponentFormat = Object.freeze({
    UNSIGNED_BYTE: 0,
    FLOAT32: 1
});

export const TextureChannel = Object.freeze({
    R: 1,
    G: 2,
    B: 3,
    A: 4
});

export const TextureDataTypeName = Object.freeze({
    0: "NONE",
    1: "IMAGE",
    2: "IMAGE_DATA",
    3: "CUBEMAP",
    4: "CUBEMAP_DATA",
    5: "VIDEO",
    6: "PROCEDURAL",
    7: "RENDER_TARGET"
});

export const TextureWrapName = Object.freeze({
    0: "REPEAT",
    1: "CLAMP",
    2: "MIRRORED_REPEAT"
});

export const TextureFilterName = Object.freeze({
     0: "NEAREST_MIPMAP_NEAREST",
     1: "LINEAR_MIPMAP_NEAREST",
     2: "NEAREST_MIPMAP_LINEAR",
     3: "LINEAR_MIPMAP_LINEAR",
     4: "NEAREST",
     5: "LINEAR"
});

export const TextureTargetName = Object.freeze({
    0: "TEXTURE_2D",
    1: "CUBE_MAP"
});

export const ProceduralTextureFunctionName = Object.freeze({
    0: "PLAIN_COLOR",
    1: "RANDOM_NOISE",
    2: "DYNAMIC_CUBEMAP",
    3: "FROM_BASE64",
    4: "CANVAS_2D"
});

export const TextureRenderTargetAttachmentNames = Object.freeze({
    0: "COLOR_ATTACHMENT_0",
    1: "COLOR_ATTACHMENT_1",
    2: "COLOR_ATTACHMENT_2",
    3: "COLOR_ATTACHMENT_3",
    4: "COLOR_ATTACHMENT_4",
    5: "COLOR_ATTACHMENT_5",
    6: "COLOR_ATTACHMENT_6",
    7: "COLOR_ATTACHMENT_7",
    8: "COLOR_ATTACHMENT_8",
    9: "COLOR_ATTACHMENT_9",
    10: "COLOR_ATTACHMENT_10",
    11: "COLOR_ATTACHMENT_11",
    12: "COLOR_ATTACHMENT_12",
    13: "COLOR_ATTACHMENT_13",
    14: "COLOR_ATTACHMENT_14",
    15: "COLOR_ATTACHMENT_15",
    100: "DEPTH_ATTACHMENT",
    200: "STENCIL_ATTACHMENT"
});

export const TextureComponentFormatNames = Object.freeze({
    0: "UNSIGNED_BYTE",
    1: "FLOAT32"
});

export const TextureChannelNames = Object.freeze({
    1: "R",
    2: "G",
    3: "B",
    4: "A"
});

const g_loadedImages = {};
let g_resource = null;
const loadImageFromFile = async fileUrl => {
    if (!g_resource) {
        g_resource = new Resource();
    }
    const image = await g_resource.load(fileUrl);
    // Flip image Y coord
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#00000000';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.scale(1, -1);
    ctx.drawImage(image, 0, 0, canvas.width, -canvas.height);
    const flipImage = new Image();
    const loadFlipImage = () => {
        return new Promise(resolve => {
            flipImage.onload = () => {
                flipImage._hash = generateImageHash(flipImage);
                resolve();
            }
            flipImage.src = canvas.toDataURL();
        })
    } 
    await loadFlipImage();    
    
    return flipImage;
}
const loadBase64Image = async base64Img => {
    const loadImage = () => {
        return new Promise(resolve => {
            const image = new Image();
            image.onload = () => {
                resolve(image);
            }
            image.src = base64Img;
        });
    }

    const image = await loadImage();
    
    // Flip image Y coord
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const ctx = canvas.getContext('2d');
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.scale(1, -1);
    ctx.drawImage(image, 0, 0, canvas.width, -canvas.height);
    const flipImage = new Image();
    const loadFlipImage = () => {
        return new Promise(resolve => {
            flipImage.onload = () => {
                flipImage._hash = generateImageHash(flipImage);
                resolve();
            }
            flipImage.src = canvas.toDataURL("image/png");
        })
    } 
    await loadFlipImage();    
    
    return flipImage;
}

export default class Texture {
    constructor() {
        // This flag allows to the renderer to know if the texture object
        // has been updated. In this case, the renderer texture must to
        // be regenerated.
        this._dirty = true;

        this._dataType = TextureDataType.NONE;
        this._wrapModeX = TextureWrap.REPEAT;
        this._wrapModeY = TextureWrap.REPEAT;
        this._magFilter = TextureFilter.LINEAR;
        this._minFilter = TextureFilter.LINEAR;
        this._target = TextureTarget.TEXTURE_2D;
        this._size = new Vec(64, 64);
        this._fileName = "";
        this._proceduralFunction = ProceduralTextureFunction.PLAIN_COLOR;
        this._proceduralParameters = {};
        this._renderTargetAttachment = TextureRenderTargetAttachment.COLOR_ATTACHMENT_0;
        this._componentFormat = TextureComponentFormat.UNSIGNED_BYTE;

        // This attribute is generated from the previous attributes, for example,
        // calling loadImageData() after setting the fileName attribute
        this._imageData = null;

        // Reference counter, to know if a texture can be purged
        this._references = 0;
    }

    get references() {
        return this._references;
    }

    incReferences() {
        this._references++;
    }

    decReferences() {
        this._references--;
    }

    clone() {
        const copy = new Texture();
        copy.assign(this);
        return copy;
    }

    assign(other) {
        this._dataType = other._dataType;
        this._wrapModeX = other._wrapModeX;
        this._wrapModeY = other._wrapModeY;
        this._magFilter = other._magFilter;
        this._minFilter = other._minFilter;
        this._target = other._target;
        this._size = new Vec(other._size);
        this._fileName = other._fileName;
        this._proceduralFunction = other._proceduralFunction;
        this._proceduralParameters = other._proceduralParameters;
        this._imageData = other._imageData;
        this._renderTargetAttachment = other._renderTargetAttachment;
        this._componentFormat = other._componentFormat;

        this._dirty = true;
    }

    get dirty() {
        return this._dirty;
    }

    setUpdated(updated = true) {
        this._dirty = !updated;
    }

    get dataType() { return this._dataType; }
    set dataType(v) {
        this._dataType = v;
        if (!this.isPowerOfTwo) {
            this.wrapModeXY = TextureWrap.CLAMP;
        }
        this.magFilter = TextureFilter.LINEAR;
        this.minFilter = TextureFilter.LINEAR;
        this._dirty = true;
    }

    get isPowerOfTwo() {
        const pot = (n) => n!==0 && (n & (n - 1)) === 0;
        return pot(this.size[0]) && pot(this.size[1]);
    }

    get wrapModeX() { return this._wrapModeX; }
    set wrapModeX(v) { this._wrapModeX = v; this._dirty = true; }
    get wrapModeY() { return this._wrapModeY; }
    set wrapModeY(v) { this._wrapModeY = v; this._dirty = true; }
    set wrapModeXY(xy) {
        this.wrapModeX = xy;
        this.wrapModeY = xy;
        this._dirty = true; 
    }
    get magFilter() { return this._magFilter; }
    set magFilter(v) { this._magFilter = v; this._dirty = true; }
    get minFilter() { return this._minFilter; }
    set minFilter(v) { this._minFilter = v; this._dirty = true; }
    get target() { return this._target; }
    set target(v) { this._target = v; this._dirty = true; }
    get size() { return this._size; }
    set size(v) {
        if (!v.length) {
            throw new Error("Invalid parameter specified setting texture size.");
        }
        this._size = new Vec(v[0],v[1]);
        this._dirty = true; 
    }
    get fileName() { return this._fileName; }
    set fileName(v) { this._fileName = v; this._dirty = true; this._imageData = null; }
    get proceduralFunction() { return this._proceduralFunction; }
    set proceduralFunction(v) { this._proceduralFunction = v; this._dirty = true; }
    get proceduralParameters() { return this._proceduralParameters; }
    set proceduralParameters(v) {
        if (typeof(v) !== 'object' || !v) {
            throw new Error("Invalid parameter specified setting procedural texture parameters.");
        }
        this._proceduralParameters = v;
        this._dirty = true; 
    }
    get renderTargetAttachment() { return this._renderTargetAttachment; }
    set renderTargetAttachment(att) { this._renderTargetAttachment = att; this._dirty = true; }
    get componentFormat() { return this._componentFormat; }
    set componentFormat(fmt) { this._componentFormat = fmt; this._dirty = true; }

    get mipmapRequired() {
        return  this._minFilter === TextureFilter.NEAREST_MIPMAP_NEAREST ||
                this._minFilter === TextureFilter.LINEAR_MIPMAP_NEAREST ||
                this._minFilter === TextureFilter.NEAREST_MIPMAP_LINEAR ||
                this._minFilter === TextureFilter.LINEAR_MIPMAP_LINEAR ||
                this._magFilter === TextureFilter.NEAREST_MIPMAP_NEAREST ||
                this._magFilter === TextureFilter.LINEAR_MIPMAP_NEAREST ||
                this._magFilter === TextureFilter.NEAREST_MIPMAP_LINEAR ||
                this._magFilter === TextureFilter.LINEAR_MIPMAP_LINEAR;
    }

    // If imageData === undefined it's because the function loadImageData() has not been called
    get imageData() {
        return this._imageData;
    }

    // The this._renderer variable is initialized by the texture renderer
    get renderer() {
        return this._renderer;
    }

    destroy() {
        if (this.renderer) {
            this.renderer.destroy();
        }
    }

    async deserialize(sceneData) {
        this._dataType = sceneData.dataType !== undefined ? TextureDataType[sceneData.dataType] : TextureDataType.NONE;
        this._wrapModeX = sceneData.wrapModeX !== undefined ? TextureWrap[sceneData.wrapModeX] : TextureWrap.REPEAT;
        this._wrapModeY = sceneData.wrapModeY !== undefined ? TextureWrap[sceneData.wrapModeY] : TextureWrap.REPEAT;
        this._magFilter = sceneData.magFilter !== undefined ? TextureFilter[sceneData.magFilter] : TextureFilter.LINEAR;
        this._minFilter = sceneData.minFilter !== undefined ? TextureFilter[sceneData.minFilter] : TextureFilter.LINEAR;
        this._target = sceneData.target !== undefined ? TextureTarget[sceneData.target] : TextureTarget.TEXTURE_2D;
        this._size = sceneData.size?.length === 2 ? new Vec(sceneData.size[0], sceneData.size[1]) : new Vec(64, 64);
        this._fileName = sceneData.fileName !== undefined ? sceneData.fileName : "";
        this._proceduralFunction = sceneData.proceduralFunction !== undefined ? ProceduralTextureFunction[sceneData.proceduralFunction] : ProceduralTextureFunction.PLAIN_COLOR;
        this._proceduralParameters = sceneData.proceduralParameters !== undefined ? sceneData.proceduralParameters : {};
        this._renderTargetAttachment = sceneData.renderTargetAttachment !== undefined ? sceneData.renderTargetAttachment : TextureRenderTargetAttachment.COLOR_ATTACHMENT_0;
        this._componentFormat = sceneData.componentFormat !== undefined ? sceneData.componentFormat : TextureComponentFormat.UNSIGNED_BYTE;
        this._dirty = true; 
    }

    async serialize(sceneData) {
        sceneData.dataType = TextureDataTypeName[this.dataType];
        sceneData.wrapModeX = TextureWrapName[this.wrapModeX];
        sceneData.wrapModeY = TextureWrapName[this.wrapModeY];
        sceneData.magFilter = TextureFilterName[this.magFilter];
        sceneData.minFilter = TextureFilterName[this.minFilter];
        sceneData.target = TextureTargetName[this.target];
        sceneData.size = this.size;
        sceneData.fileName = this.fileName;
        sceneData.proceduralFunction = ProceduralTextureFunctionName[this.proceduralFunction];
        sceneData.proceduralParameters = this.proceduralParameters;
        sceneData.renderTargetAttachment = TextureRenderTargetAttachmentNames[this.renderTargetAttachment];
        sceneData.componentFormat = TextureComponentFormatNames[this.componentFormat];
    }

    async loadImageData(refresh = false) {
        if (this.fileName) {
            if (g_loadedImages[this.fileName] && refresh) {
                delete g_loadedImages[this.fileName];
            }

            if (g_loadedImages[this.fileName]) {
                this._imageData = g_loadedImages[this.fileName];
            }
            else {
                this._imageData = await loadImageFromFile(this.fileName);
                g_loadedImages[this.fileName] = this._imageData;
            }

            this._size = new Vec(this._imageData.width, this._imageData.height);

            this._dirty = true; 
        }
        else if (this.dataType === TextureDataType.RENDER_TARGET) {
            // This object will store data to determine if the 
            // texture must to be resized, and other information
            // from the framebuffer
            this._imageData = {
                currentSize: new Vec(this.size)
            };
            this._dirty = true;
        }
        else if (this.proceduralFunction === ProceduralTextureFunction.PLAIN_COLOR) {
            if (this._imageData && refresh === false) {
                return;
            }

            if ((!Array.isArray(this.proceduralParameters) && !(this.proceduralParameters instanceof Vec)) || this.proceduralParameters.length<3) {
                throw new Error("Error generating procedural plain color texture. invalid 'proceduralParameters' set.")
            }
            const color = new Color(this.proceduralParameters);
            const canvas = document.createElement('canvas');
            canvas.width = this.size.x;
            canvas.height = this.size.y;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = color.hexColor;
            ctx.fillRect(0, 0, this.size.x, this.size.y);

            const loadProceduralImage = () => {
                return new Promise(resolve => {
                    this._imageData = new Image();
                    this._imageData.onload = () => {
                        resolve();
                    }
                    this._imageData.src = canvas.toDataURL("image/png");
                    //document.body.appendChild(canvas);
                })
            } 
            await loadProceduralImage();            

            this._dirty = true;
        }
        else if (this.proceduralFunction === ProceduralTextureFunction.FROM_BASE64) {
            if (this._imageData && refresh === false) {
                return;
            }

            if (!/;base64/i.test(this.proceduralParameters?.imageData)) {
                throw new Error("Error generating procedural texture from base64 string. Invalid base64 image");
            }

            this._imageData = await loadBase64Image(this.proceduralParameters.imageData);
            this._size = new Vec(this._imageData.width, this._imageData.height);
            this._dirty = true;
        }
        else if (this.proceduralFunction == ProceduralTextureFunction.CANVAS_2D) {
            if (this._imageData && refresh === false) {
                return;
            }

            const canvas = this.proceduralParameters?.canvas;
            if (!/canvas/i.test(canvas?.tagName)) {
                throw new Error("Error generating procedural texture from HTML canvas. Invalid 'canvas' parameter.");
            }

            const imageData = canvas.toDataURL();
            this._imageData = await loadBase64Image(imageData);
            this._size = new Vec(this._imageData.width, this._imageData.height);
            this._dirty = true;
        }
        else {
            // TODO: load other classes of procedural image data
            throw new Error("Texture: loadImageData(): not implemented");
        }
    }

    async updateImageData() {
        // TODO: improve this function. It is possible to optimize the
        // texture refresh in some cases
        this.loadImageData(true);
    }

};
