
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

    async write(url,data) {
        return await this.writeStrategy.writeData(url,data);
    }
}
