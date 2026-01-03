import ResourceProvider from "./ResourceProvider";

export default class BinaryResourceProvider extends ResourceProvider {
    async load(url: string): Promise<ArrayBuffer> {
        const response = await fetch(url);
        if (response.ok) {
            const binaryData = await response.arrayBuffer();
            return binaryData;
        }
        else {
            throw new Error(`Resource not found at '${ url }'`);
        }
    }
}
