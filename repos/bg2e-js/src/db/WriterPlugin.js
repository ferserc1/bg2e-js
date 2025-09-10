
export default class WriterPlugin {
    // Returns an array of valid file extensions for this plugin
    //  example: ['obj','dae']
    get supportedExtensions() {
        throw new Error("WriterPlugin.supportedExtensions: attribute not implemented");
    }

    // Returns the resource types that the loader plugin can handle
    // example: [ResourceType.PolyList, ResourceType.Drawable]
    get resourceTypes() {
        throw new Error("WriterPlugin.resourceTypes: attribute not implemented");
    }

    // Performs the write action to the specified path, using the specified data
    // and for the specified type.
    async write(path, data, type) {
        throw new Error("WriterPlugin.write(): method not implemented");
    }
}
