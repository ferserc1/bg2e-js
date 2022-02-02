
import { Vec } from 'bg2e-math';

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
    RANDOM_NOISE: 1
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

export default class Texture {
    constructor() {
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
    }

    get dataType() { return this._dataType; }
    set dataType(v) { this._dataType = v; }
    get wrapModeX() { return this._wrapModeX; }
    set wrapModeX(v) { this._wrapModeX = v; }
    get wrapModeY() { return this._wrapModeY; }
    set wrapModeY(v) { this._wrapModeY = v; }
    set wrapModeXY(xy) {
        this.wrapModeX = xy;
        this.wrapModeY = xy;
    }
    get magFilter() { return this._magFilter; }
    set magFilter(v) { this._magFilter = v; }
    get minFilter() { return this._minFilter; }
    set minFilter(v) { this._minFilter = v; }
    get target() { return this._target; }
    set target(v) { this._target = v; }
    get size() { return this._size; }
    set size(v) { this._size = v; }
    get fileName() { return this._fileName; }
    set fileName(v) { this._fileName = v; }
    get proceduralFunction() { return this._proceduralFunction; }
    set proceduralFunction(v) { this._proceduralFunction = v; }
    get proceduralParameters() { return this._proceduralParameters; }
    set proceduralParameters(v) { this._proceduralParameters = v; }

    deserialize(sceneData) {
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
    }

    serialize(sceneData) {
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
};
