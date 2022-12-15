import PBRLightIBLShader from "../../shaders/PBRLightIBLShader";
import SceneRenderer from "../SceneRenderer";

export default class WebGLSceneRenderer extends SceneRenderer {
    constructor() {
        super();
        this._shader = new PBRLightIBLShader(this);
    }

    get shader() {
        return this._shader;
    }

    set environment(env) {
        this._environment = env;
        this._shader.environment = env;
    }

    async init() {
        await super.init();

        await this.shader.load();

        this.renderQueue.enableQueue(RenderLayer.OPAQUE_DEFAULT, this._shader);
        this.renderQueue.enableQueue(RenderLayer.TRANSPARENT_DEFAULT, this._shader);
    }
}