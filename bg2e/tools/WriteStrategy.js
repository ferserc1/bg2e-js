
export default class WriteStrategy {
    async writeBytes(path, data) {
        throw new Error("WriteStrategy: writeBytes() not implemented");
    }

    async writeImage(path, img) {
        throw new Error("WriteStrategy: writeImage() not implemented");
    }

    async writeText(path, data) {
        throw new Error("WriteStrategy: writeText() not implemented");
    }

    async writeJson(path, object) {
        throw new Error("WriteStrategy: writeJson() not implemented");
    }

    async copyFile(srcPath, dstPath) {
        throw new Error("WriteStrategy: copyFile() not implemented");
    }
}
