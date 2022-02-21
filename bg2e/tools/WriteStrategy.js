
export default class WriteStrategy {
    async writeData(path, data, options) {
        throw new Error("WriteStrategy: writeData() not implemented");
    }

    async copyFile(srcPath, dstPath) {
        throw new Error("WriteStrategy: copyFile() not implemented");
    }
}
