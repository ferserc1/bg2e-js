
import { isAbsolute, jointUrl, ResourceType } from '../tools/Resource';
import { 
    PluginOperationType,
    createPluginDatabase, 
    registerPluginInDatabase, 
    getPluginFromDatabase 
} from './DBPluginApi';
import Canvas from '../app/Canvas';

const g_loadPluginDatabase = createPluginDatabase(PluginOperationType.Read);

export const registerLoaderPlugin = (pluginInstance) => {
    pluginInstance.dependencies.forEach(dep => registerPluginInDatabase(dep, g_loadPluginDatabase));
    registerPluginInDatabase(pluginInstance, g_loadPluginDatabase);
}

export const getLoaderPlugin = (path, type) => {
    return getPluginFromDatabase(path, type, g_loadPluginDatabase);
}

const getClearedCache = () => {
    return {
        PolyList: {},
        Drawable: {},
        Node: {},
        Texture: {},
        Material: {}
    }
}

export default class Loader {
    constructor(canvas) {
        this._canvas = canvas || Canvas.FirstCanvas();
        this._cache = getClearedCache();
        this._currentPath = "";
    }

    get canvas() {
        return this._canvas;
    }

    get currentPath() {
        return this._currentPath;
    }

    set currentPath(p) {
        this._currentPath = p;
    }

    clearCache() {
        this._cache = getClearedCache();
    }

    findCache(path,type) {
        return this._cache[type] && this._cache[type][path];
    }

    async loadResource(path,type) {
        if (!isAbsolute(path) && this.currentPath !== "") {
            path = jointUrl(this.currentPath, path);
        }
        let result = this.findCache(path, type);
        if (!result) {
            const plugin = getLoaderPlugin(path, type);
            result = await plugin.load(path, type, this);
        }
        return result;
    }

    async loadResourceBuffer(buffer, format, dependencies, type) {
        const plugin = getLoaderPlugin(`file.${ format }`, type);
        const result = await plugin.loadBuffer(buffer, format, dependencies, type, this);
        return result;
    }

    async loadPolyList(path) {
        return await this.loadResource(path, ResourceType.PolyList);
    }

    async loadDrawable(path) {
        return await this.loadResource(path, ResourceType.Drawable);
    }

    async loadDrawableBuffer(buffer, format, dependencies) {
        return await this.loadResourceBuffer(buffer, format, dependencies, ResourceType.Drawable);
    }

    async loadNode(path) {
        return await this.loadResource(path, ResourceType.Node);
    }

    async loadTexture(path) {
        return await this.loadResource(path, ResourceType.Texture);
    }

    async loadMaterial(path) {
        return await this.loadResource(path, ResourceType.Material);
    }
}

