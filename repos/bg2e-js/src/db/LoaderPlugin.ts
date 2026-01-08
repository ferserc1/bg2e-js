import { ResourceType } from "../tools/Resource.js";

export default class LoaderPlugin {
    // Returns an array of valid file extensions for this plugin
    //  example: ["obj","dae"]
    get supportedExtensions(): string[] {
        throw new Error("LoaderPlugin.supportedExtensions: attribute not implemented");
    }

    // Returns the resource types that the loader plugin can handle
    // example: [ ResourceType.PolyList, ResourceType.Scene ]
    get resourceTypes(): ResourceType[] {
        throw new Error("LoaderPlugin.resourceTypes: attribute not implemented");
    }

    // Returns the resource loaded with the path. The resource type must be one
    // of the specified in the resourceTypes attribute
    async load(path: string, type: ResourceType, loader: any): Promise<any> {
        throw new Error("LoaderPlugin.load(): method not implemented");
    }

    async loadBuffer(buffer: ArrayBuffer, format: string, dependencies: string[], type: ResourceType, loader: any): Promise<any> {
        throw new Error("LoaderPlugin.loadBuffer(): method not implemented");
    }

    // Returns an array of LoaderPlugin objects that are necessary for this plugin to work.
    get dependencies(): LoaderPlugin[] {
        return [];
    }

    async write(path: string, data: any, type: ResourceType, writer: any): Promise<any> {
        throw new Error("LoaderPlugin.write(): method not implemented");
    }
}
