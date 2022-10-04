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

export const whiteTexture = async (renderer) => {
    if (!g_textureDatabase.whiteTexture[renderer.uniqueId]) {
        g_textureDatabase.whiteTexture[renderer.uniqueId] = await createColorTexture(Color.White());
    }
    return g_textureDatabase.whiteTexture[renderer.uniqueId];
}

export const blackTexture = async (renderer) => {
    if (!g_textureDatabase.blackTexture[renderer.uniqueId]) {
        g_textureDatabase.blackTexture[renderer.uniqueId] = await createColorTexture(Color.Black());
    }
    return g_textureDatabase.blackTexture[renderer.uniqueId];
}

export const normalTexture = async (renderer) => {
    if (!g_textureDatabase.normalTexture[renderer.uniqueId]) {
        g_textureDatabase.normalTexture[renderer.uniqueId] = await createColorTexture(new Color([0.5, 0.5, 1, 1]));
    }
    return g_textureDatabase.normalTexture[renderer.uniqueId];
}
