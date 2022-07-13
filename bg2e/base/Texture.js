
import Vec from '../math/Vec';
import Resource from '../tools/Resource';
import { generateImageHash } from '../tools/image';

export const TextureDataType = {
    NONE: 0,
    IMAGE: 1,
    IMAGE_DATA: 2,
    CUBEMAP: 3,
    CUBEMAP_DATA: 4,
    VIDEO: 5,
    PROCEDURAL: 6
};

export const TextureWrap = {
    REPEAT: 0,
    CLAMP: 1,
    MIRRORED_REPEAT: 2
};

export const TextureFilter = {
    NEAREST_MIPMAP_NEAREST: 0,
    LINEAR_MIPMAP_NEAREST: 1,
    NEAREST_MIPMAP_LINEAR: 2,
    LINEAR_MIPMAP_LINEAR: 3,
    NEAREST: 4,
    LINEAR: 5
};

export const TextureTarget = {
    TEXTURE_2D: 0,
    CUBE_MAP: 1,
    POSITIVE_X_FACE: 2,
    NEGATIVE_X_FACE: 3,
    POSITIVE_Y_FACE: 4,
    NEGATIVE_Y_FACE: 5,
    POSITIVE_Z_FACE: 6,
    NEGATIVE_Z_FACE: 7
};

export const ProceduralTextureFunction = {
    PLAIN_COLOR: 0,
    RANDOM_NOISE: 1,
    DYNAMIC_CUBEMAP: 2
};

export const TextureDataTypeName = {
    0: "NONE",
    1: "IMAGE",
    2: "IMAGE_DATA",
    3: "CUBEMAP",
    4: "CUBEMAP_DATA",
    5: "VIDEO",
    6: "PROCEDURAL"
};

export const TextureWrapName = {
    0: "REPEAT",
    1: "CLAMP",
    2: "MIRRORED_REPEAT"
};

export const TextureFilterName = {
     0: "NEAREST_MIPMAP_NEAREST",
     1: "LINEAR_MIPMAP_NEAREST",
     2: "NEAREST_MIPMAP_LINEAR",
     3: "LINEAR_MIPMAP_LINEAR",
     4: "NEAREST",
     5: "LINEAR"
};

export const TextureTargetName = {
    0: "TEXTURE_2D",
    1: "CUBE_MAP",
    2: "POSITIVE_X_FACE",
    3: "NEGATIVE_X_FACE",
    4: "POSITIVE_Y_FACE",
    5: "NEGATIVE_Y_FACE",
    6: "POSITIVE_Z_FACE",
    7: "NEGATIVE_Z_FACE"
};

export const ProceduralTextureFunctionName = {
    0: "PLAIN_COLOR",
    1: "RANDOM_NOISE"
};

const g_loadedImages = {};
let g_resource = null;
const loadImageFromFile = async fileUrl => {
    if (!g_resource) {
        g_resource = new Resource();
    }
    return await g_resource.load(fileUrl);
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

        // This attribute is generated from the previous attributes, for example,
        // calling loadImageData() after setting the fileName attribute
        this._imageData = null;

        // Reference counter, to know if a texture can be purged
        this._references = 0;
    }

    get references() {
        return this._references;
    }

    incRefecences() {
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
        
        this._dirty = true;
    }

    get dirty() {
        return this._dirty;
    }

    setUpdated(updated = true) {
        this._dirty = !updated;
    }

    get dataType() { return this._dataType; }
    set dataType(v) { this._dataType = v; this._dirty = true; }
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

            // Generate a symbol to use as unique identifier of the image
            this._imageData._hash = generateImageHash(this._imageData);
            this._dirty = true; 
        }
        else if (this.proceduralFunction === ProceduralTextureFunction.PLAIN_COLOR) {
            if (this._imageData && refresh === false) {
                return;
            }

            if (!Array.isArray(this.proceduralParameters) || this.proceduralParameters.length<3) {
                throw new Error("Error generating procedural plain color texture. invalid 'proceduralParameters' set.")
            }
            const color = new Vec(this.proceduralParameters);
            const canvas = document.createElement('canvas');
            canvas.width = this.size.x;
            canvas.height = this.size.y;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = color.hexColor;
            ctx.fillRect(0, 0, this.size.x, this.size.y);
            this._imageData = new Image();
            this._imageData.src = canvas.toDataURL("image/png");
            document.body.appendChild(canvas);

            this._dirty = true;
        }
        else {
            // TODO: load other classes of procedural image data
            throw new Error("Texture: loadImageData(): not implemented");
        }
    }

};
