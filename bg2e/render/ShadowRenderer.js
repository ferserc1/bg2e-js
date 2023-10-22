import Texture, {
    TextureComponentFormat,
    TextureRenderTargetAttachment,
    TextureWrap
} from "../base/Texture";
import Mat4 from "../math/Mat4";
import Vec from "../math/Vec";
import Camera from "../scene/Camera";
import LightComponent from "../scene/LightComponent";
import Transform from "../scene/Transform";
import BasicDiffuseColorShader from "../shaders/BasicDiffuseColorShader";


export default class ShadowRenderer {
    constructor(renderer) {
        this._renderer = renderer;
    }

    get renderer() { return this._renderer; }

    get size() {
        return this._size;
    }

    // TODO: set size. Update the shadow map size

    async create(size = new Vec(1024, 1024)) {
        this._size = size;

        this._texture = new Texture();
        this._texture.renderTargetAttachment = TextureRenderTargetAttachment.COLOR_ATTACHMENT_0;
        this._texture.componentFormat = TextureComponentFormat.UNSIGNED_BYTE;
        this._texture.wrapModeXY = TextureWrap.CLAMP;

        this._renderBuffer = this.renderer.factory.renderBuffer();

        await this._renderBuffer.attachTexture(this._texture);
        this._renderBuffer.size = this._size;

        this._shader = new BasicDiffuseColorShader(this.renderer);
        await this._shader.load();
    }

    getLightPosition(camera, light) {
        let cameraNode = null;
        if (camera instanceof Camera) {
            cameraNode = camera.node;
        }
        else if (camera instanceof Node) {
            cameraNode = camera;
            camera = cameraNode.camera;
        }

        if (!cameraNode || !camera) {
            throw Error(`ShadowRenderer.getLightPosition(): invalid camera parameter. Camera must be a Node or a Camera component, and the camera must be added to the scene.`);
        }

        let lightNode = null;
        if (light instanceof LightComponent) {
            lightNode = light.node;
        }
        else if (light instanceof Node) {
            lightNode = light;
            light = light.lightComponent;
        }

        if (!lightNode || !light) {
            throw Error(`ShadowRenderer.getLightPosition(): invalid light. Light must be a Node or a LightComponent`);
        }

        const focus = camera.focusDistance;
        const cameraTransform = Transform.GetWorldMatrix(cameraNode);
        const cameraPos = Vec.Add(Mat4.GetPosition(cameraTransform), Vec.Mult(cameraTransform.forwardVector, focus));

        const lightTransform = Transform.GetWorldMatrix(lightNode);
        const lightVector = Mat4.GetRotation(lightTransform).forwardVector;

        return Vec.Add(cameraPos, lightVector);
    }

    update(camera, light, renderCallback) {  

        // Point of view of the shadow map render camera
        const pos = this.getLightPosition(camera, light);
        const viewMatrix = Mat4.MakeTranslation(pos.x, pos.y, pos.z);
        // TODO: Apply light rotation to the viewMatrix

        const proj = light.projection;
        
        this._renderBuffer.update(() => {
            renderCallback(this.renderer);
        });
    }
}
