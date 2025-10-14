import LoaderPlugin from "./LoaderPlugin";
import { ResourceType, getFileName, removeExtension, removeFileName } from "./../tools/Resource";
import Resource from "../tools/Resource";
import PolyList from "../base/PolyList";
import Drawable from "../scene/Drawable";
import Node from "../scene/Node";
import Material from "../base/Material";
import { deserializeComponent } from "../scene/Component";

import Bg2ioWrapper from 'bg2io/Bg2ioBrowser';

let g_bg2Wrapper = null;

const bg2ioFactory = async (path) => {
    if (g_bg2Wrapper === null) {
        const params = path ? { wasmPath: path } : {};
        g_bg2Wrapper = await Bg2ioWrapper(params);
    }
    return g_bg2Wrapper;
}

const createPolyList = (jsonData,loader) => {
    const result = jsonData.polyLists.map(plData => {
        const plist = new PolyList();
        const materialData = jsonData.materials.find(m => m.name === plData.matName);
        plist.name = plData.name
        plist.visible = plData.visible;
        if (materialData) {
            plist.groupName = materialData.groupName || "";
            plist.enableCullFace = materialData.cullFace;
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

const createDrawable = async (jsonData,filePath,loader) => {
    const name = removeExtension(getFileName(filePath));
    const relativePath = removeFileName(filePath);
    const drawable = new Drawable(name);
    for (const item of createPolyList(jsonData)) {
        const mat = new Material(loader.canvas);
        await mat.deserialize(item.materialData, relativePath);
        drawable.addPolyList(item.plist, mat);
    }
    //createPolyList(jsonData).forEach(item => {
    //    const mat = new Material();
    //    mat.deserialize(item.materialData, relativePath);
    //    drawable.addPolyList(item.plist, mat);
    //});
    return drawable;
}

const createNode = async (jsonData,filePath,loader) => {
    const name = removeExtension(getFileName(filePath));
    const drawable = await createDrawable(jsonData,filePath,loader);
    const node = new Node(name);
    node.addChild(drawable);
    for (const compData of jsonData.components) {
        try {
            const comp = await deserializeComponent(compData,loader);
            node.addComponent(comp);
        }
        catch (err) {
            console.warn(err.message);
        }
    }
    console.log(jsonData);
    return node;
}

export default class Bg2LoaderPlugin extends LoaderPlugin {
    constructor( { bg2ioPath = null } = {}) {
        super();
        this._bg2ioPath = bg2ioPath;
        this._resource = new Resource();
    }

    get supportedExtensions() { return ["bg2","vwglb"]; }

    get resourceTypes() {
        return [
            ResourceType.PolyList, 
            ResourceType.Drawable,
            ResourceType.Node
        ]; 
    }

    async load(path,resourceType,loader) {
        const bg2io = await bg2ioFactory(this._bg2ioPath);

        const buffer = await this._resource.load(path);
        const jsonData = bg2io.loadBg2FileAsJson(buffer);

        // Compatibility with 1.4 models
        jsonData.materials.forEach(mat => {
            if (!mat.type) {
                mat.type = mat["class"];
                delete mat["class"];
            }
        });
        
        switch (resourceType) {
        case ResourceType.PolyList:
            return createPolyList(jsonData,loader).map(item => item.plist);
        case ResourceType.Drawable:
            return createDrawable(jsonData,path,loader);
        case ResourceType.Node:
            return await createNode(jsonData,path,loader);
        default:
            throw new Error(`Bg2LoaderPlugin.load() unexpected resource type received: ${resourceType}`);
        }
    }
}
