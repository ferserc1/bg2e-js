import { ResourceType } from "../tools/Resource";
import WriterPlugin from "./WriterPlugin";

export default class ObjWriterPlugin extends WriterPlugin {
    get supportedExtensions() {
        return ["obj"];
    }

    get resourceTypes() {
        return ResourceType.Drawable;
    }

    async write(path, data, type) {
        console.log(path);
        console.log(data);
        console.log(type);
    }
}