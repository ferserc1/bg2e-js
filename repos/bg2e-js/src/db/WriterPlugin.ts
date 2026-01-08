
import { ResourceType } from '../tools/Resource';
import Writer from './Writer';

export default abstract class WriterPlugin {
    // Returns an array of valid file extensions for this plugin
    //  example: ['obj','dae']
    abstract get supportedExtensions(): string[];

    // Returns the resource types that the loader plugin can handle
    // example: [ResourceType.PolyList, ResourceType.Drawable]
    abstract get resourceTypes(): ResourceType[];

    // Performs the write action to the specified path, using the specified data
    // and for the specified type.
    async write(path: string, data: any, type: ResourceType | string, writer: Writer): Promise<any> {
        throw new Error("WriterPlugin.write(): method not implemented");
    }
}
