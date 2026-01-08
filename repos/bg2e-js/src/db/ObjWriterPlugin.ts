import { ResourceType } from "../tools/Resource";
import WriterPlugin from "./WriterPlugin";
import Writer from "./Writer";

export default class ObjWriterPlugin extends WriterPlugin {
    get supportedExtensions(): string[] {
        return ["obj"];
    }

    get resourceTypes(): ResourceType[] {
        return [ResourceType.Drawable];
    }

    async write(path: string, data: any, type: ResourceType, writer: Writer): Promise<void> {
        console.log(path);
        console.log(data);
        console.log(type);
    }
}