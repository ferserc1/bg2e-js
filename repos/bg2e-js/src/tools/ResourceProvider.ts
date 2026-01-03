import { isBrowser } from './processType';
import { base64ToArrayBuffer } from './base64';

export enum DataFormat {
    BYTES = 0,          // Uint8Array
    IMAGE = 1,          // DOM img
    BASE64 = 2,         // Base64 string. It can include or not the Base64 image prefix
    TEXT = 3,           // Text string
    JSON_STRING = 4,    // JSON text
    JSON_OBJECT = 5,    // JSON serializable object
    FILE_PATH = 6       // File path (used to implement file copy)
}

interface WriteStrategy {
    writeBytes(url: string, data: Uint8Array): Promise<void>;
    writeImage(url: string, data: HTMLImageElement): Promise<void>;
    writeText(url: string, data: string): Promise<void>;
    writeJson(url: string, data: any): Promise<void>;
}

export default class ResourceProvider {
    private _writeStrategy?: WriteStrategy;

    set writeStrategy(ws: WriteStrategy) {
        this._writeStrategy = ws;
    }

    get writeStrategy(): WriteStrategy {
        if (!this._writeStrategy) {
            throw new Error("ResourceProvider.write(): no write strategy configured.");
        }
        return this._writeStrategy;
    }

    async load(url: string): Promise<any> {

    }

    async write(url: string, data: any, format: DataFormat = DataFormat.TEXT): Promise<void> {
        switch (format) {
        case DataFormat.BYTES:
            return this.writeStrategy.writeBytes(url,data);
        case DataFormat.IMAGE:
            if (isBrowser()) {
                return this.writeStrategy.writeImage(url, data);
            }
            else {
                throw new Error("ResourceProvider.write() unsupported data format: Image data format is supported only on browsers or electron renderer process.");
            }
        case DataFormat.BASE64:
            const bytes = await base64ToArrayBuffer(data);
            return this.writeStrategy.writeBytes(url, bytes);
        case DataFormat.TEXT:
            return this.writeStrategy.writeText(url, data);
        case DataFormat.JSON_STRING:
            return this.writeStrategy.writeText(url, data);
        case DataFormat.JSON_OBJECT:
            return this.writeStrategy.writeJson(url, data);
        case DataFormat.FILE_PATH:
            return this.copyFile(url, data);
        default:
            throw new Error("ResourceProvider.write() invalid format");
        }
    }

    async copyFile(destinationUrl: string, sourceFilePath: string): Promise<void> {
        throw new Error("ResourceProvider.copyFile(): not implemented");
    }
}
