import Color from "../base/Color"
import Texture, { ProceduralTextureFunction, TextureFilter, TextureTarget, TextureWrap } from "../base/Texture"
import BRDFIntegrationMap from "../render/BRDFIntegrationMap";
import Renderer from "../render/Renderer";

interface TextureCache {
    [key: string]: Texture;
}

interface TextureDatabaseType {
    whiteTexture: TextureCache;
    blackTexture: TextureCache;
    normalTexture: TextureCache;
    brdfIntegrationTexture: TextureCache;
}

const g_textureDatabase: TextureDatabaseType = {
    whiteTexture: {},
    blackTexture: {},
    normalTexture: {},
    brdfIntegrationTexture: {}
}

const createColorTexture = async (color: Color, name: string = ""): Promise<Texture> => {
    const result = new Texture();
    result.magFilter = TextureFilter.NEAREST;
    result.minFilter = TextureFilter.NEAREST;
    result.wrapModeXY = TextureWrap.REPEAT;
    result.proceduralFunction = ProceduralTextureFunction.PLAIN_COLOR;
    result.proceduralParameters = color;
    result.size = [2, 2];
    name = name || `ColorTexture_${color.r}_${color.g}_${color.b}_${color.a}`;
    result.name = `${ name }_${result.size.width}_${result.size.height}`;
    await result.loadImageData();
    return result;
}

export const createWhiteTexture = async (renderer: Renderer): Promise<Texture> => {
    if (!g_textureDatabase.whiteTexture[renderer.uniqueId]) {
        g_textureDatabase.whiteTexture[renderer.uniqueId] = await createColorTexture(Color.White(), "WhiteTexture");
    }
    return g_textureDatabase.whiteTexture[renderer.uniqueId];
}

export const whiteTexture = (renderer: Renderer): Texture => {
    if (!g_textureDatabase.whiteTexture[renderer.uniqueId]) {
        throw new Error(`TextureResourceDatabase: whiteTexture is not initialize. Call 'createWhiteTexture' before use 'whiteTexture' function`);
    }
    return g_textureDatabase.whiteTexture[renderer.uniqueId];
}

export const createBlackTexture = async (renderer: Renderer): Promise<Texture> => {
    if (!g_textureDatabase.blackTexture[renderer.uniqueId]) {
        g_textureDatabase.blackTexture[renderer.uniqueId] = await createColorTexture(Color.Black(), "BlackTexture");
    }
    return g_textureDatabase.blackTexture[renderer.uniqueId];
}

export const blackTexture = (renderer: Renderer): Texture => {
    if (!g_textureDatabase.blackTexture[renderer.uniqueId]) {
        throw new Error(`TextureResourceDatabase: blackTexture is not initialize. Call 'createBlackTexture' before use 'blackTexture' function`);
    }
    return g_textureDatabase.blackTexture[renderer.uniqueId];
}

export const createNormalTexture = async (renderer: Renderer): Promise<Texture> => {
    if (!g_textureDatabase.normalTexture[renderer.uniqueId]) {
        g_textureDatabase.normalTexture[renderer.uniqueId] = await createColorTexture(new Color([0.5, 0.5, 1, 1]), "NormalMapTexture");
    }
    return g_textureDatabase.normalTexture[renderer.uniqueId];
}

export const normalTexture = (renderer: Renderer): Texture => {
    if (!g_textureDatabase.normalTexture[renderer.uniqueId]) {
        throw new Error(`TextureResourceDatabase: normalTexture is not initialized. Call 'createNormalTexture' before use 'normalTexture' function`);
    }
    return g_textureDatabase.normalTexture[renderer.uniqueId];
}

export const createBRDFIntegrationTexture = async (renderer: Renderer): Promise<Texture> => {
    if (!g_textureDatabase.brdfIntegrationTexture[renderer.uniqueId]) {
        const tex = new Texture();
        tex.name = "BRDFIntegrationMapTexture";
        tex.target = TextureTarget.TEXTURE_2D;
        tex.proceduralFunction = ProceduralTextureFunction.FROM_BASE64;
        tex.proceduralParameters = {
            imageData: BRDFIntegrationMap
        };
        await tex.loadImageData();
        g_textureDatabase.brdfIntegrationTexture[renderer.uniqueId] = tex;
    }
    return g_textureDatabase.brdfIntegrationTexture[renderer.uniqueId];
}

export const BRDFIntegrationTexture = (renderer: Renderer): Texture => {
    if (!g_textureDatabase.brdfIntegrationTexture[renderer.uniqueId]) {
        throw new Error(`TextureResourceDatabase: BRDFIntegrationTexture is not initialized. Call 'createBRDFIntegrationTexture' before use 'BRDFIntegrationTexture' function`);
    }
    return g_textureDatabase.brdfIntegrationTexture[renderer.uniqueId];
}
