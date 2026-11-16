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
import Drawable from '../scene/Drawable';

import WasmResources from "./WasmResources";
import TextFont from "../base/TextFont";

const g_loadPluginDatabase = createPluginDatabase(PluginOperationType.Read);

type ResourceCache = {
    [ResourceType.PolyList]: Record<string, PolyList>;
    [ResourceType.Drawable]: Record<string, any>;
    [ResourceType.Node]: Record<string, any>;
    [ResourceType.Texture]: Record<string, Texture>;
    [ResourceType.Material]: Record<string, any>;
    [ResourceType.TextFont]: Record<string, TextFont>;
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
    private disposed = false;
    private fontLoads = new Map<string, Promise<TextFont>>();
    private ownedFonts = new Set<TextFont>();
    readonly wasm: WasmResources;
    private _canvas: Canvas;
    private _cache: ResourceCache;
    private _currentPath: string;

    constructor(canvas?: Canvas | null, options: { wasmBaseUrl?: string } = {}) {
        this.wasm = new WasmResources(options.wasmBaseUrl);
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

    setupModelDropZone(dropZone: HTMLElement, fileFormats: string[], cb: (drawable: Drawable) => void): void {
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

            const modelFile = files.find(f => f.name.toLowerCase().endsWith(".bg2") || f.name.toLowerCase().endsWith(".vwglb"));
            if (modelFile) {
                const buffer = await modelFile.arrayBuffer();
                const drawable = await this.loadDrawableBuffer(buffer, "bg2", files.filter(f => f !== modelFile));
                cb(drawable);
            }
        });
    }

    clearTextFontCache(): void {
        this.fontLoads.clear();
        this._cache[ResourceType.TextFont] = {};
    }

    dispose(): void {
        this.disposed = true;
        for (const font of this.ownedFonts) font.dispose();
        this.ownedFonts.clear();
        this.clearCache();
    }

    clearCache(): void {
        this.clearTextFontCache();
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
        if (this.disposed) throw new Error("Loader has been disposed");
        const resolved = !isAbsolute(path) && this.currentPath ? jointUrl(this.currentPath, path) : path;
        const cached = this._cache[ResourceType.TextFont][resolved];
        if (cached && !cached.disposed) return cached;
        let pending = this.fontLoads.get(resolved);
        if (!pending) {
            const plugin = getLoaderPlugin(resolved, ResourceType.TextFont);
            pending = plugin.load(resolved, ResourceType.TextFont, this).then((font: TextFont) => {
                if (this.disposed) { font.dispose(); throw new Error("Loader disposed during font load"); }
                this.ownedFonts.add(font);
                if (this.fontLoads.get(resolved) === pending) this._cache[ResourceType.TextFont][resolved] = font;
                return font;
            });
            // Failures stay cached until explicit cache clear/reload.
            this.fontLoads.set(resolved, pending);
        }
        return pending;
    }

    async loadTextFontBuffer(buffer: ArrayBuffer, format = "ttf"): Promise<TextFont> {
        if (this.disposed) throw new Error("Loader has been disposed");
        const font = await this.loadResourceBuffer(buffer, format, [], ResourceType.TextFont) as TextFont;
        if (this.disposed) { font.dispose(); throw new Error("Loader disposed during font load"); }
        this.ownedFonts.add(font);
        return font;
    }

    async loadMaterial(path: string): Promise<any> {
        return await this.loadResource(path, ResourceType.Material);
    }
}

