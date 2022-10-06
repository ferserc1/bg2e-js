import Color from "../base/Color"
import Texture, { ProceduralTextureFunction, TextureFilter, TextureWrap } from "../base/Texture"

const g_textureDatabase = {
    whiteTexture: {},
    blackTexture: {},
    normalTexture: {}
}

const createColorTexture = async (color) => {
    const result = new Texture();
    result.magFilter = TextureFilter.NEAREST;
    result.minFilter = TextureFilter.NEAREST;
    result.wrapModeXY = TextureWrap.REPEAT;
    result.proceduralFunction = ProceduralTextureFunction.PLAIN_COLOR;
    result.proceduralParameters = color;
    result.size = [2, 2];
    await result.loadImageData();
    return result;
}

export const createWhiteTexture = async (renderer) => {
    if (!g_textureDatabase.whiteTexture[renderer.uniqueId]) {
        g_textureDatabase.whiteTexture[renderer.uniqueId] = await createColorTexture(Color.White());
    }
}
export const whiteTexture = (renderer) => {
    if (!g_textureDatabase.whiteTexture[renderer.uniqueId]) {
        throw new Error(`TextureResourceDatabase: whiteTexture is not initialize. Call 'createWhiteTexture' before use 'whiteTexture' function`);
    }
    return g_textureDatabase.whiteTexture[renderer.uniqueId];
}

export const createBlackTexture = async (renderer) => {
    if (!g_textureDatabase.blackTexture[renderer.uniqueId]) {
        g_textureDatabase.blackTexture[renderer.uniqueId] = await createColorTexture(Color.Black());
    }
}

export const blackTexture = (renderer) => {
    if (!g_textureDatabase.blackTexture[renderer.uniqueId]) {
        throw new Error(`TextureResourceDatabase: blackTexture is not initialize. Call 'createBlackTexture' before use 'blackTexture' function`);
    }
    return g_textureDatabase.blackTexture[renderer.uniqueId];
}

export const createNormalTexture = async (renderer) => {
    if (!g_textureDatabase.normalTexture[renderer.uniqueId]) {
        g_textureDatabase.normalTexture[renderer.uniqueId] = await createColorTexture(new Color([0.5, 0.5, 1, 1]));
    }
}

export const normalTexture = (renderer) => {
    if (!g_textureDatabase.normalTexture[renderer.uniqueId]) {
        throw new Error(`TextureResourceDatabase: normalTexture is not initialize. Call 'createNormalTexture' before use 'normalTexture' function`);
    }
    return g_textureDatabase.normalTexture[renderer.uniqueId];
}
