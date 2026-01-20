import Texture, { TextureRenderTargetAttachment, TextureTarget } from "../base/Texture";
import IrradianceMapCubeShader from "../shaders/IrradianceMapCubeShader";
import SpecularMapCubeShader from "../shaders/SpecularMapCubeShader";
import RenderBuffer from "./RenderBuffer";
import Renderer from "./Renderer";
import SkySphere from "./SkySphere";
import SkyCube from "./SkyCube";
import Mat4 from "../math/Mat4";

type TextureResources = {
    renderer: Renderer;
    texture: Texture;
    renderBuffer: RenderBuffer;
    skyShape: SkySphere | SkyCube | null;
}

const createTextureResources = async (renderer: Renderer, size: [number, number]) : Promise<TextureResources> => {
    const texture = new Texture();
    texture.renderTargetAttachment = TextureRenderTargetAttachment.COLOR_ATTACHMENT_0;
    texture.target = TextureTarget.CUBE_MAP;
    
    const renderBuffer = renderer.factory.renderBuffer();
    await renderBuffer.attachTexture(texture);
    renderBuffer.size = size;

    return { renderer, texture, renderBuffer, skyShape: null };
}

const destroyTextureResources = (resources: TextureResources) => {
    resources.texture.destroy();
    resources.renderBuffer.destroy();
}

const updateMap = (mapResources: TextureResources) => { 
    const { renderBuffer, skyShape } = mapResources;
    renderBuffer.update((face,viewMatrix,projectionMatrix) => {
        mapResources.renderer.clearBuffer();
        skyShape?.updateRenderState({
            viewMatrix: viewMatrix || Mat4.MakeIdentity(),
            projectionMatrix
        });
        skyShape?.draw();
    })
}

export default class Environment {
    protected _renderer: Renderer;
    protected _updated: boolean = false;

    protected _environmentMapResources: TextureResources | null = null;
    protected _specularMapResources: TextureResources | null = null;
    protected _irradianceMapResources: TextureResources | null = null;
    protected _envMapSize: [number, number] = [512, 512];
    protected _specMapSize: [number, number] = [128, 128];
    protected _irrMapSize: [number, number] = [32, 32];

    constructor(renderer: Renderer) {
        this._renderer = renderer;
    }

    get renderer() {
        return this._renderer;
    }

    get updated() {
        return this._updated;
    }

    get environmentMap(): Texture | null {
        return this._environmentMapResources?.texture || null;
    }

    get specularMap(): Texture | null {
        return this._specularMapResources?.texture || null;
    }

    get irradianceMap(): Texture | null {
        return this._irradianceMapResources?.texture || null;
    }

    async load({ 
        textureUrl = null,
        environmentMapSize = [ 512, 512 ],
        specularMapSize = [ 128, 128 ],
        irradianceMapSize = [32, 32]
    } : {
        textureUrl?: string | null,
        environmentMapSize?: [number, number],
        specularMapSize?: [number, number],
        irradianceMapSize?: [number, number]
    } = {}): Promise<void> {
        this._envMapSize = environmentMapSize;
        this._specMapSize = specularMapSize;
        this._irrMapSize = irradianceMapSize;

        this._environmentMapResources = await createTextureResources(this.renderer, environmentMapSize);
        const envShape = this.renderer.factory.skySphere();
        await envShape.load(textureUrl || null);
        this._environmentMapResources.skyShape = envShape;

        this._specularMapResources = await createTextureResources(this.renderer, specularMapSize);
        const specShape = this.renderer.factory.skyCube();
        specShape.load(this._environmentMapResources.texture, SpecularMapCubeShader, [0.5]);
        this._specularMapResources.skyShape = specShape;

        this._irradianceMapResources = await createTextureResources(this.renderer, irradianceMapSize);
        const irrShape = this.renderer.factory.skyCube();
        await irrShape.load(this._environmentMapResources.texture, IrradianceMapCubeShader);
        this._irradianceMapResources.skyShape = irrShape;
        this._updated = false;
    }

    destroy() {
        this._environmentMapResources && destroyTextureResources(this._environmentMapResources);
        this._specularMapResources && destroyTextureResources(this._specularMapResources);
        this._irradianceMapResources && destroyTextureResources(this._irradianceMapResources);
        this._updated = false;
    }

    updateMaps() {
        this._environmentMapResources && updateMap(this._environmentMapResources);
        this._specularMapResources && updateMap(this._specularMapResources);
        this._irradianceMapResources && updateMap(this._irradianceMapResources);
        this._updated = true;
    }

    async reloadImage(imageUrl: string) {
        if (!this._environmentMapResources) {
            return;
        }
        if (this._environmentMapResources.skyShape instanceof SkySphere) {
            await this._environmentMapResources.skyShape.setTexture(imageUrl);
        }
        this._updated = false;
    }
}