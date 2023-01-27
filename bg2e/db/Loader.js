
import { isAbsolute, jointUrl, ResourceType } from '../tools/Resource';
import { 
    PluginOperationType,
    createPluginDatabase, 
    registerPluginInDatabase, 
    getPluginFromDatabase 
} from './DBPluginApi';

const g_loadPluginDatabase = createPluginDatabase(PluginOperationType.Read);

export const registerLoaderPlugin = (pluginInstance) => {
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
    constructor() {
        this._cache = getClearedCache();
        this._currentPath = "";
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

    async loadPolyList(path) {
        return await this.loadResource(path, ResourceType.PolyList);
    }

    async loadDrawable(path) {
        return await this.loadResource(path, ResourceType.Drawable);
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

