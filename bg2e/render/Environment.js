import Texture, { TextureRenderTargetAttachment, TextureTarget } from "../base/Texture";
import IrradianceMapCubeShader from "../shaders/IrradianceMapCubeShader";
import SpecularMapCubeShader from "../shaders/SpecularMapCubeShader";

const createTextureResources = async (renderer, size) => {
    const texture = new Texture();
    texture.renderTargetAttachment = TextureRenderTargetAttachment.COLOR_ATTACHMENT_0;
    texture.target = TextureTarget.CUBE_MAP;
    
    const renderBuffer = renderer.factory.renderBuffer();
    await renderBuffer.attachTexture(texture);
    renderBuffer.size = size;

    return { renderer, texture, renderBuffer };
}

const destroyTextureResources = (resources) => {
    resources.texture.destroy();
    resources.renderBuffer.destroy();
}

const updateMap = (mapResources) => {
    const { state } = mapResources.renderer; 
    const { renderBuffer, skyShape } = mapResources;
    renderBuffer.update((face,viewMatrix,projectionMatrix) => {
        state.clear();
        skyShape.updateRenderState({ viewMatrix, projectionMatrix });
        skyShape.draw();
    })
}

export default class Environment {
    constructor(renderer) {
        this._renderer = renderer;

        this._environmentMap = null;
        this._specularMap = null;
        this._irradianceMap = null;

        this._updated = false;
    }

    get renderer() {
        return this._renderer;
    }

    get updated() {
        return this._updated;
    }

    get environmentMap() {
        return this._environmentMapResources.texture;
    }

    get specularMap() {
        return this._specularMapResources.texture;
    }

    get irradianceMap() {
        return this._irradianceMapResources.texture;
    }

    async load({ 
        textureUrl, 
        environmentMapSize = [ 512, 512 ],
        specularMapSize = [ 128, 128 ],
        irradianceMapSize = [32, 32]
    }) {
        this._envMapSize = environmentMapSize;
        this._specMapSize = specularMapSize;
        this._irrMapSize = irradianceMapSize;

        this._environmentMapResources = await createTextureResources(this.renderer, environmentMapSize);
        this._environmentMapResources.skyShape = this.renderer.factory.skySphere();
        await this._environmentMapResources.skyShape.load(textureUrl);

        this._specularMapResources = await createTextureResources(this.renderer, specularMapSize);
        this._specularMapResources.skyShape = this.renderer.factory.skyCube();
        await this._specularMapResources.skyShape.load(this._environmentMapResources.texture, SpecularMapCubeShader, [0.5]);

        this._irradianceMapResources = await createTextureResources(this.renderer, irradianceMapSize);
        this._irradianceMapResources.skyShape = this.renderer.factory.skyCube();
        await this._irradianceMapResources.skyShape.load(this._environmentMapResources.texture, IrradianceMapCubeShader);
        this._updated = false;
    }

    destroy() {
        destroyTextureResources(this._environmentMapResources);
        destroyTextureResources(this._specularMapResources);
        destroyTextureResources(this._irradianceMapResources);
        this._updated = false;
    }

    updateMaps() {
        updateMap(this._environmentMapResources);
        updateMap(this._specularMapResources);
        updateMap(this._irradianceMapResources);
        this._updated = true;
    }

    async reloadImage(imageUrl) {
        await this._environmentMapResources.skyShape.setTexture(imageUrl);
        this._updated = false;
    }
}