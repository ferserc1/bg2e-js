import { ResourceType } from "../tools/Resource.js";
import Writer from "./Writer";

export default class WriterPlugin {
    // Returns an array of valid file extensions for this plugin
    //  example: ['obj','dae']
    get supportedExtensions(): string[] {
        throw new Error("WriterPlugin.supportedExtensions: attribute not implemented");
    }

    // Returns the resource types that the loader plugin can handle
    // example: [ResourceType.PolyList, ResourceType.Drawable]
    get resourceTypes(): ResourceType[] {
        throw new Error("WriterPlugin.resourceTypes: attribute not implemented");
    }

    // Performs the write action to the specified path, using the specified data
    // and for the specified type.
    async write(path: string, data: any, type: ResourceType, writer: Writer): Promise<any> {
        throw new Error("WriterPlugin.write(): method not implemented");
    }
}
