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

import LoaderPlugin from "./LoaderPlugin";
import { ResourceType, getExtension, getFileName, removeExtension, removeFileName } from "../tools/Resource";
import BinaryResourceProvider from "../tools/BinaryResourceProvider";
import PolyList from "../base/PolyList";
import Drawable from "../scene/Drawable";
import Node from "../scene/Node";
import Material from "../base/Material";
import { deserializeComponent } from "../scene/Component";

import Bg2ioWrapper from './Bg2ioDataAdapter.js';
import Loader from './Loader';

const bg2ioFactory = (loader: Loader, path?: string | null): Promise<any> =>
    loader.wasm.load('bg2io', async resolve => {
        const factory = await loader.wasm.loadScriptFactory('bg2io.js', 'Bg2ioModule', path ?? loader.wasm.baseUrl);
        const instance = await factory({ locateFile: (file: string) => resolve(file) });
        return new Bg2ioWrapper({ instance });
    }, path ?? loader.wasm.baseUrl);

type Bg2Data = ReturnType<Bg2ioWrapper["loadBg2FileAsJson"]>;
type MaterialMatches = { entries: any[]; next: number };

const createPolyLists = (data: Bg2Data, importMaterial?: MaterialImportCallback) => {
    const byName = new Map<string, MaterialMatches>();
    for (const material of data.materials) {
        const name = typeof material.name === "string" ? material.name : "";
        let matches = byName.get(name);
        if (!matches) {
            matches = { entries: [], next: 0 };
            byName.set(name, matches);
        }
        // Compatibility with 1.4 models
        if (!material.type) {
            material.type = material["class"];
            delete material["class"];
        }
        matches.entries.push(importMaterial ? importMaterial(material) : material);
    }

    return data.polyLists.map(plData => {
        const matches = byName.get(plData.matName);
        if (!matches) {
            throw new Error(`BG2 polygon list "${plData.name}" references missing material "${plData.matName}"`);
        }
        const materialData = matches.entries[matches.next < matches.entries.length ? matches.next++ : 0];
        const plist = new PolyList();
        plist.name = plData.name;
        plist.groupName = typeof materialData.groupName === "string" ? materialData.groupName : "";
        plist.visible = typeof materialData.visible === "boolean" ? materialData.visible : true;
        if (typeof materialData.doubleSided === "boolean") plist.enableCullFace = !materialData.doubleSided;
        else if (typeof materialData.cullFace === "boolean") plist.enableCullFace = materialData.cullFace;
        plist.vertex = plData.vertex;
        plist.normal = plData.normal;
        // Web image loading flips the image rows, which compensates for BG2's V convention.
        plist.texCoord0 = plData.texCoord0;
        plist.texCoord1 = plData.texCoord1.length ? plData.texCoord1 : [...plData.texCoord0];
        plist.texCoord2 = plData.texCoord2;
        plist.index = plData.index;
        return { plist, materialData };
    });
}

const createDrawable = async (items: ReturnType<typeof createPolyLists>, filePath: string, loader: Loader, dependencies?: File[]): Promise<Drawable> => {
    const name = removeExtension(getFileName(filePath));
    const relativePath = removeFileName(filePath);
    const drawable = new Drawable(name);
    for (const item of items) {
        const mat = new Material(loader.canvas);
        if (dependencies) {
            await mat.deserializeWithDependencies(item.materialData, dependencies);
        }
        else {
            await mat.deserialize(item.materialData, relativePath);
        }
        drawable.addPolyList(item.plist, mat);
    }
    return drawable;
}

const createNode = async (drawable: Drawable, components: Bg2Data["components"], loader: Loader): Promise<Node> => {
    const node = new Node(drawable.name);
    node.addComponent(drawable);
    for (const compData of components) {
        try {
            const comp = await deserializeComponent(compData, loader, node);
            comp && node.addComponent(comp);
        }
        catch (err: any) {
            console.warn(err.message);
        }
    }
    return node;
}

export type MaterialImportCallback = (matData: any) => any;

export default class Bg2LoaderPlugin extends LoaderPlugin {
    private _bg2ioPath: string | null;
    private _resource = new BinaryResourceProvider();
    private _materialImportCallback?: MaterialImportCallback;

    constructor( {
        bg2ioPath = null,
        materialImportCallback
    }: {
        bg2ioPath?: string | null,
        materialImportCallback?: MaterialImportCallback
    } = {}) {
        super();
        this._bg2ioPath = bg2ioPath;
        this._materialImportCallback = materialImportCallback;
    }

    get supportedExtensions(): string[] { return ["bg2"]; }

    get resourceTypes(): ResourceType[] {
        return [
            ResourceType.PolyList, 
            ResourceType.Drawable,
            ResourceType.Node
        ]; 
    }

    override async load(path: string, resourceType: ResourceType, loader: Loader): Promise<any> {
        if (getExtension(path).toLowerCase() !== "bg2") {
            throw new Error(`Expected a .bg2 model file: '${path}'`);
        }
        const bg2io = await bg2ioFactory(loader, this._bg2ioPath);

        const buffer = await this._resource.load(path);
        return this.createResource(bg2io.loadBg2FileAsJson(buffer), resourceType, loader, path);
    }

    override async loadBuffer(buffer: ArrayBuffer, format: string, dependencies: File[], type: ResourceType, loader: Loader): Promise<any> {
        if (format.toLowerCase() !== "bg2") {
            throw new Error(`Unsupported BG2 buffer format: '${format}'`);
        }
        const bg2io = await bg2ioFactory(loader, this._bg2ioPath);
        return this.createResource(bg2io.loadBg2FileAsJson(buffer), type, loader, "", dependencies);
    }

    private async createResource(data: Bg2Data, type: ResourceType, loader: Loader, filePath: string, dependencies?: File[]): Promise<PolyList[] | Drawable | Node> {
        const items = createPolyLists(data, this._materialImportCallback);
        switch (type) {
        case ResourceType.PolyList:
            return items.map(item => item.plist);
        case ResourceType.Drawable:
            return createDrawable(items, filePath, loader, dependencies);
        case ResourceType.Node:
            const drawable = await createDrawable(items, filePath, loader, dependencies);
            const modelLoader = filePath ? loader.withBasePath(removeFileName(filePath)) : loader;
            return createNode(drawable, data.components, modelLoader);
        default:
            throw new Error(`Bg2LoaderPlugin unexpected resource type received: ${type}`);
        }
    }
}
