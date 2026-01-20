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
import Renderer from "./Renderer";
import Node from "../scene/Node";
import type RenderBuffer from "./RenderBuffer";
import type RenderQueue from "./RenderQueue";

export default class ShadowRenderer {
    _renderer: Renderer;
    _size: Vec | null = null;
    _texture: Texture | null = null;
    _renderBuffer: RenderBuffer | null = null;
    _depthTexture: Texture | null = null;
    _shader: DepthRenderShader | null = null;
    _shadowMapRenderDistance: number;
    _debug: boolean;

    constructor(renderer: Renderer) {
        this._renderer = renderer;
        this._shadowMapRenderDistance = 100;
        this._debug = false;
    }

    get renderer(): Renderer { return this._renderer; }

    get size(): Vec {
        return this._size || new Vec(0, 0);
    }

    get shadowMapRenderDistance(): number {
        return this._shadowMapRenderDistance;
    }

    get debug(): boolean {
        return this._debug;
    }

    set debug(d: boolean) {
        this._debug = d;
    }

    set shadowMapRenderDistance(d: number) {
        this._shadowMapRenderDistance = d;
    }

    // TODO: set size. Update the shadow map size

    get depthTexture(): Texture | null {
        return this._depthTexture;
    }

    async create(size: Vec = new Vec(1024, 1024)): Promise<void> {
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

    getLightTransform(camera: Camera | Node, light: LightComponent | Node): Mat4 {
        let cameraNode: Node | null = null;
        let cameraComponent: Camera | null = null;
        let lightComponent: LightComponent | null = null;
        
        if (camera instanceof Camera) {
            cameraNode = camera.node;
            cameraComponent = camera;
        }
        else if (camera instanceof Node) {
            cameraNode = camera;
            cameraComponent = cameraNode.camera ?? null;
        }

        if (!cameraNode || !cameraComponent) {
            throw Error(`ShadowRenderer.getLightPosition(): invalid camera parameter. Camera must be a Node or a Camera component, and the camera must be added to the scene.`);
        }

        let lightNode: Node | null = null;
        if (light instanceof LightComponent) {
            lightNode = light.node;
            lightComponent = light;
        }
        else if (light instanceof Node) {
            lightNode = light;
            lightComponent = light.lightComponent || null;
        }

        if (!lightNode || !lightComponent) {
            throw Error(`ShadowRenderer.getLightPosition(): invalid light. Light must be a Node or a LightComponent`);
        }

        // Get the camera focus point
        const focus = cameraComponent!.focusDistance;
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

    update(camera: Camera | Node, lightComponent: LightComponent, renderQueue: RenderQueue): void {  
        const viewMatrix: Mat4 = Mat4.GetInverted(this.getLightTransform(camera, lightComponent));
        
        this._renderBuffer?.update(() => {
            this._renderBuffer!.renderer.state.clear();
            const layer: RenderLayer = RenderLayer.OPAQUE_DEFAULT;
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
