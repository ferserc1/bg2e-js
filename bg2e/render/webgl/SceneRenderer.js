import PBRLightIBLShader from "../../shaders/PBRLightIBLShader";
import SceneRenderer from "../SceneRenderer";
import { RenderLayer } from "../../base/PolyList";
import Mat4 from "../../math/Mat4";
import Camera from "../../scene/Camera";
import Transform from "../../scene/Transform";

export default class WebGLSceneRenderer extends SceneRenderer {
    constructor(renderer) {
        super(renderer);
        this._shader = new PBRLightIBLShader(this.renderer);
    }

    get shader() {
        return this._shader;
    }

    async setEnvironment(env) {
        await super.setEnvironment(env);
        this._shader.environment = env;
    }

    async init() {
        await super.init();

        await this.shader.load();

        this.renderQueue.enableQueue(RenderLayer.OPAQUE_DEFAULT, this._shader);
        this.renderQueue.enableQueue(RenderLayer.TRANSPARENT_DEFAULT, this._shader);
    }

    frame(sceneRoot,delta) {
        super.frame(sceneRoot,delta);

        const mainCamera = Camera.GetMain(sceneRoot);

        this.shader.lights = this.renderQueue.lights.map(({light}) => light);
        this.shader.lightTransforms = this.renderQueue.lights.map(({transform}) => transform);
        const cameraMatrix = Transform.GetWorldMatrix(mainCamera.node);
        const pos = Mat4.GetPosition(cameraMatrix);
        this.shader.cameraPosition = pos;
    }
}