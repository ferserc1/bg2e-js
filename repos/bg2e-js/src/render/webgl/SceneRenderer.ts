import PBRLightIBLShader from "../../shaders/PBRLightIBLShader";
import SceneRenderer from "../SceneRenderer";
import { RenderLayer } from "../../base/PolyList";
import Mat4 from "../../math/Mat4";
import Camera from "../../scene/Camera";
import Transform from "../../scene/Transform";
import type Renderer from "../Renderer";
import type Node from "../../scene/Node";
import type Environment from "../Environment";
import type Vec from "../../math/Vec";

export default class WebGLSceneRenderer extends SceneRenderer {
    _shader: PBRLightIBLShader;

    constructor(renderer: Renderer) {
        super(renderer);
        this._shader = new PBRLightIBLShader(this.renderer);
    }

    get shader(): PBRLightIBLShader {
        return this._shader;
    }

    set brightness(value: number) {
        this._shader.brightness = value;
    }

    get brightness(): number {
        return this._shader.brightness;
    }

    set contrast(value: number) {
        this._shader.contrast = value;
    }

    get contrast(): number {
        return this._shader.contrast;
    }

    async setEnvironment(env: Environment): Promise<void> {
        await super.setEnvironment(env);
        this._shader.environment = env;
    }

    async init(params?: { shadowMapSize?: Vec | number }): Promise<void> {
        await super.init(params);

        await this.shader.load();

        this.renderQueue?.enableQueue(RenderLayer.OPAQUE_DEFAULT, this._shader);
        this.renderQueue?.enableQueue(RenderLayer.TRANSPARENT_DEFAULT, this._shader);
    }

    async frame(sceneRoot: Node, delta: number): Promise<void> {
        if (!this.renderQueue?.lights) {
            return;
        }
        await super.frame(sceneRoot, delta);

        const mainCamera = Camera.GetMain(sceneRoot);

        this.shader.lights = this.renderQueue.lights.map(({light}) => light);
        this.shader.lightTransforms = this.renderQueue.lights.map(({transform}) => transform);
        const cameraMatrix: Mat4 = mainCamera ? Transform.GetWorldMatrix(mainCamera.node) : Mat4.MakeIdentity();
        const pos = Mat4.GetPosition(cameraMatrix);
        this.shader.cameraPosition = pos;
    }
}