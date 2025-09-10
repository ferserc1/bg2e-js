import { isBrowserOrElectronRenderer } from './processType';
import { base64ToArrayBuffer } from './base64';

export const DataFormat = {
    BYTES:          0, // Uint8Array
    IMAGE:          1, // DOM img
    BASE64:         2, // Base64 string. It can include or not the Base64 image prefix
    TEXT:           3,    // Text string
    JSON_STRING:    4, // JSON text
    JSON_OBJECT:    5, // JSON serializable object
    FILE_PATH:      6 // File path (used to implement file copy)
};

export default class ResourceProvider {
    set writeStrategy(ws) {
        this._writeStrategy = ws;
    }

    get writeStrategy() {
        if (!this._writeStrategy) {
            throw new Error("ResourceProvider.write(): no write strategy configured.");
        }
        return this._writeStrategy;
    }

    async load(url) {

    }

    async write(url,data,format = DataFormat.TEXT) {
        switch (format) {
        case BYTES:
            return this.writeStrategy.writeBytes(url,data);
        case IMAGE:
            if (isBrowserOrElectronRenderer()) {
                return this.writeStrategy.writeImage(url, data);
            }
            else {
                throw new Error("ResourceProvider.write() unsupported data format: Image data format is supported only on browsers or electron renderer process.");
            }
        case BASE64:
            const bytes = base64ToArrayBuffer(data);
            return this.writeStrategy.writeBytes(url,bytes);
        case TEXT:
            return this.writeStrategy.writeText(url,data);
        case JSON_STRING:
            return this.writeStrategy.writeText(url,data);
        case JSON_OBJECT:
            return this.writeStrategy.writeJson(url,data);
        case FILE_PATH:
            return this.copyFile(url,data);
        default:
            throw new Error("ResourceProvider.write() invalid format");
        }
    }
}
