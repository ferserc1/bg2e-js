import Resource, { ResourceType } from "../tools/Resource";
import LoaderPlugin from "./LoaderPlugin";

export default class VitscnjLoaderPlugin extends LoaderPlugin {
    constructor() {
        super();
    }

    get supportedExtensions() { return ["vitscnj"]; }

    get resourceTypes() {
        return [
            ResourceType.Node
        ];
    }

    async load(path,resourceType,loader) {
        if (resourceType !== ResourceType.Node) {
            throw new Error(`VitscnjLoaderPlugin.load() unexpected resource type received: ${resourceType}`);
        }

        const resource = new Resource();

        const textData = await resource.load(path);
        console.log(textData);

        return null;
    }
}