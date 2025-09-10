import { RenderLayer } from "../base/PolyList";
import Texture, {
    TextureComponentFormat,
    TextureRenderTargetAttachment,
    TextureWrap
} from "../base/Texture";
import Mat4 from "../math/Mat4";
import Vec from "../math/Vec";
import Color from "../base/Color";
import Camera from "../scene/Camera";
import LightComponent from "../scene/LightComponent";
import Transform from "../scene/Transform";
import DebugRenderer from "../debug/DebugRenderer";
import DepthRenderShader from "../shaders/DepthRenderShader";


export default class ShadowRenderer {
    constructor(renderer) {
        this._renderer = renderer;
        this._shadowMapRenderDistance = 100;
        this._debug = false;
    }

    get renderer() { return this._renderer; }

    get size() {
        return this._size;
    }

    get shadowMapRenderDistance() {
        return this._shadowMapRenderDistance;
    }

    get debug() {
        return this._debug;
    }

    set debug(d) {
        this._debug = d;
    }

    set shadowMapRenderDistance(d) {
        this._shadowMapRenderDistance = d;
    }

    // TODO: set size. Update the shadow map size

    get depthTexture() {
        return this._depthTexture;
    }

    async create(size = new Vec(1024, 1024)) {
        this._size = size;

        this._texture = new Texture();
        this._texture.name = `ShadowMap_${ size.width }x${ size.height }`;
        this._texture.renderTargetAttachment = TextureRenderTargetAttachment.COLOR_ATTACHMENT_0;
        this._texture.componentFormat = TextureComponentFormat.UNSIGNED_BYTE;
        this._texture.wrapModeXY = TextureWrap.CLAMP;

        this._renderBuffer = this.renderer.factory.renderBuffer();

        await this._renderBuffer.attachTexture(this._texture);

        this._depthTexture = new Texture();
        this._depthTexture.name = `ShadowMapDepth_${ size.width }x${ size.height }`;
        this._depthTexture.renderTargetAttachment = TextureRenderTargetAttachment.DEPTH_ATTACHMENT;
        this._depthTexture.componentFormat = TextureComponentFormat.UNSIGNED_BYTE;
        this._depthTexture.wrapModeXY = TextureWrap.CLAMP;
        await this._renderBuffer.attachTexture(this._depthTexture);

        this._renderBuffer.size = this._size;

        this._shader = new DepthRenderShader(this.renderer);
        await this._shader.load();
    }

    getLightTransform(camera, light) {
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

        // Get the camera focus point
        const focus = camera.focusDistance;
        const cameraTransform = Transform.GetWorldMatrix(cameraNode);
        const cameraPos = Vec.Add(Mat4.GetPosition(cameraTransform), Vec.Mult(cameraTransform.forwardVector, -focus)); 

        // Get the light rotation vector and scale it to the light shadow map render distance
        const lightTransform = Transform.GetWorldMatrix(lightNode);
        const lightVector = Mat4.GetRotation(lightTransform).forwardVector;
        lightVector.scale(this._shadowMapRenderDistance);

        // Get the light render position, adding the camera focus point to the light vector
        const lightPos = Vec.Add(cameraPos, lightVector);

        // Set the light render position to the light transform matrix
        lightTransform.setPosition(lightPos);

        if (this._debug) {
            DebugRenderer.Get(this._renderer).drawSphere({ radius: 0.1, color: Color.Red(), position: cameraPos });
            DebugRenderer.Get(this.renderer).drawSphere({ radius: 0.1, color: Color.Blue(), position: lightPos });
            DebugRenderer.Get(this.renderer).drawArrow({ length: 0.8, color: Color.Green(), transformMatrix: lightTransform });
        }

        return lightTransform;
    }

    update(camera, lightComponent, renderQueue) {  
        const viewMatrix = Mat4.GetInverted(this.getLightTransform(camera, lightComponent));
        
        this._renderBuffer.update(() => {
            this._renderBuffer.renderer.state.clear();
            const layer = RenderLayer.OPAQUE_DEFAULT;
            const queue = renderQueue.getQueue(layer);
            if (queue) {

                if (typeof(queue.beginOperation) === "function") {
                    queue.beginOperation(layer);
                }
                queue.queue.forEach(rs => {
                    rs.draw({
                        overrideShader: this._shader,
                        overrideViewMatrix: viewMatrix,
                        overrideProjectionMatrix: lightComponent.light.projection
                    });
                });
                if (typeof(queue.endOperation) === "function") {
                    queue.endOperation(layer);
                }
            }
        });

        // Set the depthTexture to the light component. If the shader needs the depth texture, it will use it
        lightComponent.depthTexture = this._depthTexture;
        lightComponent.viewMatrix = viewMatrix;
    }
}
