import LoaderPlugin from "./LoaderPlugin";
import { ResourceType, getFileName, removeExtension } from "./../tools/Resource";
import Resource from "../tools/Resource";
import PolyList from "../base/PolyList";
import Drawable from "../scene/Drawable";
import Material from "../base/Material";

import Bg2ioWrapper from 'bg2io/Bg2ioBrowser';

let g_bg2Wrapper = null;

const bg2ioFactory = async (path) => {
    if (g_bg2Wrapper === null) {
        const params = path ? { wasmPath: path } : {};
        g_bg2Wrapper = await Bg2ioWrapper(params);
    }
    return g_bg2Wrapper;
}

const createPolyList = (jsonData) => {
    const result = jsonData.polyLists.map(plData => {
        const plist = new PolyList();
        const materialData = jsonData.materials.find(m => m.name === plData.matName);
        plist.name = plData.name
        plist.visible = plData.visible;
        if (materialData) {
            plist.groupName = materialData.groupName || "";
        }
        plist.vertex = plData.vertex;
        plist.normal = plData.normal;
        plist.texCoord0 = plData.texCoord0
        plist.texCoord1 = plData.texCoord1
        plist.texCoord2 = plData.texCoord2
        plist.index = plData.index;
        return { plist, materialData };
    });

    return result;
}

const createDrawable = (jsonData,filePath) => {
    const name = removeExtension(getFileName(filePath));
    const drawable = new Drawable(name);
    createPolyList(jsonData).forEach(item => {
        const mat = new Material();
        mat.deserialize(item.materialData);
        drawable.addPolyList(item.plist, mat);
    });
    return drawable;
}

const createNode = (jsonData) => {
    throw new Error("Bg2LoaderPlugin: createNode. Not implemented");
}

export default class Bg2LoaderPlugin extends LoaderPlugin {
    constructor( { bg2ioPath = null } = {}) {
        super();
        this._bg2ioPath = bg2ioPath;
        this._resource = new Resource();
    }

    get supportedExtensions() { return ["bg2"]; }

    get resourceTypes() {
        return [
            ResourceType.PolyList, 
            ResourceType.Drawable,
            ResourceType.Node
        ]; 
    }

    async load(path,resourceType) {
        const bg2io = await bg2ioFactory(this._bg2ioPath);

        const buffer = await this._resource.load(path);
        const jsonData = bg2io.loadBg2FileAsJson(buffer);

        switch (resourceType) {
        case ResourceType.PolyList:
            return createPolyList(jsonData).map(item => item.plist);
        case ResourceType.Drawable:
            return createDrawable(jsonData,path);
        case ResourceType.Node:
            return createNode(jsonData)
        default:
            throw new Error(`Bg2LoaderPlugin.load() unexpected resource type received: ${resourceType}`);
        }
    }
}
