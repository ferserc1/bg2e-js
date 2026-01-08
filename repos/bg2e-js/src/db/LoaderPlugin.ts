
import { ResourceType } from '../tools/Resource';
import Loader from './Loader';

export default abstract class LoaderPlugin {
    // Returns an array of valid file extensions for this plugin
    //  example: ["obj","dae"]
    abstract get supportedExtensions(): string[];

    // Returns the resource types that the loader plugin can handle
    // example: [ ResourceType.PolyList, ResourceType.Scene ]
    abstract get resourceTypes(): ResourceType[];

    // Returns the resource loaded with the path. The resource type must be one
    // of the specified in the resourceTypes attribute
    async load(path: string, type: ResourceType | string, loader: Loader): Promise<any> {
        throw new Error("LoaderPlugin.load(): method not implemented");
    }

    async loadBuffer(buffer: ArrayBuffer, format: string, dependencies: any, type: ResourceType | string, loader: Loader): Promise<any> {
        throw new Error("LoaderPlugin.loadBuffer(): method not implemented");
    }

    // Returns an array of LoaderPlugin objects that are necessary for this plugin to work.
    get dependencies(): LoaderPlugin[] {
        return [];
    }
}
