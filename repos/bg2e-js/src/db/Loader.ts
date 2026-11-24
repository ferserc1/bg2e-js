/*
 *    business grade graphic engine (bg2 engine)
 *    Copyright (C) 2024  Fernando Serrano Carpena
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU General Public License as published by
 *    the Free Software Foundation, either version 3 of the License, or
 *    (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU General Public License for more details.
 *
 *    You should have received a copy of the GNU General Public License
 *    along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */


import { resolveResourceUrl, ResourceType } from '../tools/Resource';
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
import Drawable from '../scene/Drawable';

import WasmResources from "./WasmResources";
import TextFont from "../base/TextFont";
import DrawableCache from "./DrawableCache";

const g_loadPluginDatabase = createPluginDatabase(PluginOperationType.Read);

type ResourceCache = {
    [ResourceType.PolyList]: Record<string, PolyList>;
    [ResourceType.Drawable]: Record<string, any>;
    [ResourceType.Node]: Record<string, any>;
    [ResourceType.Texture]: Record<string, Texture>;
    [ResourceType.Material]: Record<string, any>;
    [ResourceType.TextFont]: Record<string, TextFont>;
}

interface LoaderResources {
    disposed: boolean;
    fontLoads: Map<string, Promise<TextFont>>;
    ownedFonts: Set<TextFont>;
    wasm: WasmResources;
    cache: ResourceCache;
    suppliedDrawableCache?: DrawableCache;
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
        [ResourceType.Material]: {},
        [ResourceType.TextFont]: {}
    }
}

export default class Loader {
    private resources: LoaderResources;
    private _canvas: Canvas;
    private _currentPath = "";
    private _drawableCache?: DrawableCache;

    constructor(canvas?: Canvas | null, options: { wasmBaseUrl?: string; drawableCache?: DrawableCache } = {}) {
        this.resources = {
            disposed: false,
            fontLoads: new Map(),
            ownedFonts: new Set(),
            wasm: new WasmResources(options.wasmBaseUrl),
            cache: getClearedCache(),
            suppliedDrawableCache: options.drawableCache
        };
        this._drawableCache = options.drawableCache;
        this._canvas = canvas || Canvas.FirstCanvas();
    }

    get wasm(): WasmResources {
        return this.resources.wasm;
    }

    withBasePath(path: string): Loader {
        const scoped = new Loader(this.canvas);
        scoped.resources = this.resources;
        scoped.currentPath = path;
        scoped._drawableCache = this.drawableCache;
        return scoped;
    }

    withSceneBasePath(path: string): Loader {
        const scoped = this.withBasePath(path);
        scoped._drawableCache = this.resources.suppliedDrawableCache ?? new DrawableCache();
        return scoped;
    }

    get drawableCache(): DrawableCache | undefined {
        return this._drawableCache;
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

    setupModelDropZone(dropZone: HTMLElement, cb: (drawable: Drawable) => void): void {
        dropZone.addEventListener("dragover", event => {
            event.stopPropagation();
            event.preventDefault();
            //event.dataTransfer.dropEffect = "copy";
        });

        dropZone.addEventListener("drop", async event => {
            event.stopPropagation();
            event.preventDefault();
            const dataTransfer = event.dataTransfer;
            if (!dataTransfer) {
                return;
            }

            const files = Array.from(dataTransfer.files);

            const modelFile = files.find(f => f.name.toLowerCase().endsWith(".bg2"));
            if (modelFile) {
                const buffer = await modelFile.arrayBuffer();
                const drawable = await this.loadDrawableBuffer(buffer, "bg2", files.filter(f => f !== modelFile));
                cb(drawable);
            }
        });
    }

    clearTextFontCache(): void {
        this.resources.fontLoads.clear();
        this.resources.cache[ResourceType.TextFont] = {};
    }

    dispose(): void {
        this.resources.disposed = true;
        for (const font of this.resources.ownedFonts) font.dispose();
        this.resources.ownedFonts.clear();
        this.clearCache();
    }

    clearCache(): void {
        this.clearTextFontCache();
        this.resources.cache = getClearedCache();
    }

    findCache(path: string, type: ResourceType): any {
        return this.resources.cache[type]?.[path];
    }

    async loadResource(path: string, type: ResourceType): Promise<any> {
        path = resolveResourceUrl(this.currentPath, path);
        let result = this.findCache(path, type);
        if (!result) {
            const plugin = getLoaderPlugin(path, type);
            result = await plugin.load(path, type, this);
        }
        return result;
    }

    async loadResourceBuffer(buffer: ArrayBuffer, format: string, dependencies: File[], type: ResourceType): Promise<any> {
        const plugin = getLoaderPlugin(`file.${ format }`, type);
        const result = await plugin.loadBuffer(buffer, format, dependencies, type, this);
        return result;
    }

    async loadPolyList(path: string): Promise<PolyList[]> {
        return await this.loadResource(path, ResourceType.PolyList);
    }

    async loadDrawable(path: string): Promise<any> {
        return await this.loadResource(path, ResourceType.Drawable);
    }

    async loadDrawableBuffer(buffer: ArrayBuffer, format: string, dependencies: File[]): Promise<any> {
        return await this.loadResourceBuffer(buffer, format, dependencies, ResourceType.Drawable);
    }

    async loadNode(path: string): Promise<any> {
        return await this.loadResource(path, ResourceType.Node);
    }

    async loadTexture(path: string): Promise<Texture> {
        return await this.loadResource(path, ResourceType.Texture);
    }

    async loadTextFont(path: string): Promise<TextFont> {
        const resources = this.resources;
        if (resources.disposed) throw new Error("Loader has been disposed");
        const resolved = resolveResourceUrl(this.currentPath, path);
        const cached = resources.cache[ResourceType.TextFont][resolved];
        if (cached && !cached.disposed) return cached;
        let pending = resources.fontLoads.get(resolved);
        if (!pending) {
            const plugin = getLoaderPlugin(resolved, ResourceType.TextFont);
            pending = plugin.load(resolved, ResourceType.TextFont, this).then((font: TextFont) => {
                if (resources.disposed) { font.dispose(); throw new Error("Loader disposed during font load"); }
                resources.ownedFonts.add(font);
                if (resources.fontLoads.get(resolved) === pending) resources.cache[ResourceType.TextFont][resolved] = font;
                return font;
            });
            // Failures stay cached until explicit cache clear/reload.
            resources.fontLoads.set(resolved, pending);
        }
        return pending;
    }

    async loadTextFontBuffer(buffer: ArrayBuffer, format = "ttf"): Promise<TextFont> {
        if (this.resources.disposed) throw new Error("Loader has been disposed");
        const font = await this.loadResourceBuffer(buffer, format, [], ResourceType.TextFont) as TextFont;
        if (this.resources.disposed) { font.dispose(); throw new Error("Loader disposed during font load"); }
        this.resources.ownedFonts.add(font);
        return font;
    }

    async loadMaterial(path: string): Promise<any> {
        return await this.loadResource(path, ResourceType.Material);
    }
}

