

export default class LoaderPlugin {
    // Returns an array of valid file extensions for this plugin
    //  example: ["obj","dae"]
    get supportedExtensions() {
        throw new Error("LoaderPlugin.supportedExtensions: attribute not implemented");
    }

    // Returns the resource types that the loader plugin can handle
    // example: [ ResourceType.PolyList, ResourceType.Scene ]
    get resourceTypes() {
        throw new Error("LoaderPlugin.resourceTypes: attribute not implemented");
    }

    // Returns the resource loaded with the path. The resource type must be one
    // of the specified in the resourceTypes attribute
    async load(path, type, loader) {
        throw new Error("LoaderPlugin.load(): method not implemented");
    }

    // Returns an array of LoaderPlugin objects that are necessary for this plugin to work.
    get dependencies() {
        return [];
    }
}
