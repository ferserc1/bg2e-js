
import { isAbsolute, jointUrl, ResourceType } from '../tools/Resource';
import { 
    PluginOperationType,
    createPluginDatabase, 
    registerPluginInDatabase, 
    getPluginFromDatabase,
    DBPlugin,
    PluginDatabase
} from './DBPluginApi';
import Canvas from '../app/Canvas';
import PolyList from '../base/PolyList';
import Drawable from '../scene/Drawable';
import Node from '../scene/Node';
import Texture from '../base/Texture';
import Material from '../base/Material';

interface LoaderCache {
    PolyList: { [key: string]: PolyList };
    Drawable: { [key: string]: Drawable };
    Node: { [key: string]: Node };
    Texture: { [key: string]: Texture };
    Material: { [key: string]: Material };
}

const g_loadPluginDatabase: PluginDatabase = createPluginDatabase(PluginOperationType.Read);

export const registerLoaderPlugin = (pluginInstance: DBPlugin): void => {
    pluginInstance.dependencies?.forEach(dep => registerPluginInDatabase(dep, g_loadPluginDatabase));
    registerPluginInDatabase(pluginInstance, g_loadPluginDatabase);
}

export const getLoaderPlugin = (path: string, type: ResourceType | string): DBPlugin => {
    return getPluginFromDatabase(path, type, g_loadPluginDatabase);
}

const getClearedCache = (): LoaderCache => {
    return {
        PolyList: {},
        Drawable: {},
        Node: {},
        Texture: {},
        Material: {}
    }
}

export default class Loader {
    private _canvas: Canvas;
    private _cache: LoaderCache;
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

    findCache<T extends keyof LoaderCache>(path: string, type: T): LoaderCache[T][string] | undefined {
        return this._cache[type] && this._cache[type][path];
    }

    async loadResource(path: string, type: ResourceType | string): Promise<any> {
        if (!isAbsolute(path) && this.currentPath !== "") {
            path = jointUrl(this.currentPath, path);
        }
        let result = this.findCache(path, type as keyof LoaderCache);
        if (!result) {
            const plugin = getLoaderPlugin(path, type) as any;
            result = await plugin.load(path, type, this);
        }
        return result;
    }

    async loadResourceBuffer(buffer: ArrayBuffer, format: string, dependencies: any, type: ResourceType | string): Promise<any> {
        const plugin = getLoaderPlugin(`file.${ format }`, type) as any;
        const result = await plugin.loadBuffer(buffer, format, dependencies, type, this);
        return result;
    }

    async loadPolyList(path: string): Promise<PolyList> {
        return await this.loadResource(path, ResourceType.PolyList);
    }

    async loadDrawable(path: string): Promise<Drawable> {
        return await this.loadResource(path, ResourceType.Drawable);
    }

    async loadDrawableBuffer(buffer: ArrayBuffer, format: string, dependencies: any): Promise<Drawable> {
        return await this.loadResourceBuffer(buffer, format, dependencies, ResourceType.Drawable);
    }

    async loadNode(path: string): Promise<Node> {
        return await this.loadResource(path, ResourceType.Node);
    }

    async loadTexture(path: string): Promise<Texture> {
        return await this.loadResource(path, ResourceType.Texture);
    }

    async loadMaterial(path: string): Promise<Material> {
        return await this.loadResource(path, ResourceType.Material);
    }
}

