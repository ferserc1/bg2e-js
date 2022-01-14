
window.s_bg_utils_Engine = null;

export default class Engine {
    static Set(engine) {
        window.s_bg_utils_Engine = engine;
    }
    
    static Get() {
        return window.s_bg_utils_Engine;
    }

    constructor() {
        this._shaderLibrary = {
            inputs: {},
            functions: {}
        }
    }
    
    get id() { return this._engineId; }
    
    get texture() { return this._texture; }
    get pipeline() { return this._pipeline; }
    get polyList() { return this._polyList; }
    get shader() { return this._shader; }
    get colorBuffer() { return this._colorBuffer; }
    get textureBuffer() { return this._textureBuffer; }
    get shaderSource() { return this._shaderSource; }
    get cubemapCapture() { return this._cubemapCapture; }
    get textureMerger() { return this._textureMerger; }
}
