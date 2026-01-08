
import { isAbsolute, jointUrl, ResourceType } from '../tools/Resource';
import { 
    PluginOperationType,
    createPluginDatabase, 
    registerPluginInDatabase, 
    getPluginFromDatabase 
} from './DBPluginApi';
import Canvas from '../app/Canvas';
import LoaderPlugin from './LoaderPlugin';
import PolyList from '../base/PolyList';
import Texture from '../base/Texture';

const g_loadPluginDatabase = createPluginDatabase(PluginOperationType.Read);

type ResourceCache = {
    [ResourceType.PolyList]: Record<string, PolyList>;
    [ResourceType.Drawable]: Record<string, any>;
    [ResourceType.Node]: Record<string, any>;
    [ResourceType.Texture]: Record<string, Texture>;
    [ResourceType.Material]: Record<string, any>;
}

export const registerLoaderPlugin = (pluginInstance: LoaderPlugin): void => {
    pluginInstance.dependencies.forEach(dep => registerPluginInDatabase(dep, g_loadPluginDatabase));
    registerPluginInDatabase(pluginInstance, g_loadPluginDatabase);
}

export const getLoaderPlugin = (path: string, type: ResourceType): LoaderPlugin => {
    return getPluginFromDatabase(path, type, g_loadPluginDatabase);
}

const getClearedCache = (): ResourceCache => {
    return {
        [ResourceType.PolyList]: {},
        [ResourceType.Drawable]: {},
        [ResourceType.Node]: {},
        [ResourceType.Texture]: {},
        [ResourceType.Material]: {}
    }
}

export default class Loader {
    private _canvas: Canvas;
    private _cache: ResourceCache;
    private _currentPath: string;

    constructor(canvas?: Canvas | null) {
        this._canvas = canvas || Canvas.FirstCanvas();
        this._cache = getClearedCache();
        this._currentPath = "";
    }

    get canvas(): Canvas {
        return this._canvas;
    }

    get currentPath(): string {
        return this._currentPath;
    }

    set currentPath(p: string) {
        this._currentPath = p;
    }

    clearCache(): void {
        this._cache = getClearedCache();
    }

    findCache(path: string, type: ResourceType): any {
        return this._cache[type] && this._cache[type][path];
    }

    async loadResource(path: string, type: ResourceType): Promise<any> {
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

    async loadResourceBuffer(buffer: ArrayBuffer, format: string, dependencies: string[], type: ResourceType): Promise<any> {
        const plugin = getLoaderPlugin(`file.${ format }`, type);
        const result = await plugin.loadBuffer(buffer, format, dependencies, type, this);
        return result;
    }

    async loadPolyList(path: string): Promise<PolyList> {
        return await this.loadResource(path, ResourceType.PolyList);
    }

    async loadDrawable(path: string): Promise<any> {
        return await this.loadResource(path, ResourceType.Drawable);
    }

    async loadDrawableBuffer(buffer: ArrayBuffer, format: string, dependencies: string[]): Promise<any> {
        return await this.loadResourceBuffer(buffer, format, dependencies, ResourceType.Drawable);
    }

    async loadNode(path: string): Promise<any> {
        return await this.loadResource(path, ResourceType.Node);
    }

    async loadTexture(path: string): Promise<Texture> {
        return await this.loadResource(path, ResourceType.Texture);
    }

    async loadMaterial(path: string): Promise<any> {
        return await this.loadResource(path, ResourceType.Material);
    }
}

