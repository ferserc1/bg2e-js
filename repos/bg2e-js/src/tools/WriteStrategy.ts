
export default class WriteStrategy {
    async writeBytes(path: string, data: ArrayBuffer): Promise<void> {
        throw new Error("WriteStrategy: writeBytes() not implemented");
    }

    async writeImage(path: string, img: HTMLImageElement | ImageData): Promise<void> {
        throw new Error("WriteStrategy: writeImage() not implemented");
    }

    async writeText(path: string, data: string): Promise<void> {
        throw new Error("WriteStrategy: writeText() not implemented");
    }

    async writeJson(path: string, object: any): Promise<void> {
        throw new Error("WriteStrategy: writeJson() not implemented");
    }

    async copyFile(srcPath: string, dstPath: string): Promise<void> {
        throw new Error("WriteStrategy: copyFile() not implemented");
    }
}
