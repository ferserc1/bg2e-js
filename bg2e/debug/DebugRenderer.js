import Color from "../base/Color";
import Material from "../base/Material";
import Mat4 from "../math/Mat4";
import Vec from "../math/Vec";
import { createSphere } from "../primitives";
import BasicDiffuseColorShader from "../shaders/BasicDiffuseColorShader";
import Transform from "../scene/Transform";
import Texture, { 
    TextureRenderTargetAttachment, 
    TextureComponentFormat, 
    TextureWrap
} from "../base/Texture";
import DebugRenderShader from "../shaders/DebugRenderShader";
import PresentDebugFramebufferShader from "../shaders/PresentDebugFramebufferShader";

const g_renderers = {};

export default class DebugRenderer {

    static Get(renderer) {
        if (!g_renderers[renderer.uniqueId]) {
            g_renderers[renderer.uniqueId] = new DebugRenderer(renderer);
        }
        return g_renderers[renderer.uniqueId];
    }

    constructor(renderer) {
        this._renderer = renderer;

        this._objects = [];

        this._sphere = createSphere(1);
        this._sphereRenderer = this.renderer.factory.polyList(this._sphere);

        this._baseMaterial = new Material();
        this._materialRenderer = this.renderer.factory.material(this._baseMaterial);
    }

    get renderer() { return this._renderer; }

    async init() {
        const renderer = this._renderer;
        
        this._shader = new DebugRenderShader(renderer);
        await this._shader.load();

        this._presentShader = new PresentDebugFramebufferShader(renderer);
        await this._presentShader.load();

        this._targetTexture = new Texture();
        this._targetTexture.name = `DebugRendererTargetTexture`;
        this._targetTexture.renderTargetAttachment = TextureRenderTargetAttachment.COLOR_ATTACHMENT_0;
        this._targetTexture.componentFormat = TextureComponentFormat.UNSIGNED_BYTE;
        this._targetTexture.wrapModeXY = TextureWrap.CLAMP;

        this._renderBuffer = renderer.factory.renderBuffer();
        await this._renderBuffer.attachTexture(this._targetTexture);
    }

    beginFrame() {
        this._objects = [];
    }

    drawSphere({ radius = 1, color = Color.White(), transformMatrix = null, position = null } = {}) {
        console.debug(`DebugRenderer.drawSphere() - radius: ${ radius }, color: ${ color }`);

        if (!transformMatrix && position) {
            transformMatrix = Mat4.MakeTranslation(position);
        }
        else if (!transformMatrix) {
            transformMatrix = Mat4.MakeIdentity();
        }

        this._objects.push({
            renderer: this._sphereRenderer,
            radius,
            color,
            transformMatrix
        });
    }

    setViewportSize(width, height) {
        console.debug(`DebugRenderer.setViewportSize(${ width }, ${ height })`);
        this._renderBuffer.size = new Vec(width, height);
    }

    draw(camera) {
        console.debug(`DebugRenderer.draw()`);

        const cameraView = Mat4.GetInverted(Transform.GetWorldMatrix(camera.node));
        const viewMatrix = cameraView;
        const projectionMatrix = camera.projectionMatrix;
        this._renderBuffer.update(() => {
            this._renderBuffer.frameBuffer.clear();

            this._objects.forEach(object => {
                const matrix = object.transformMatrix.scale(object.radius, object.radius, object.radius);
                this._materialRenderer.material.diffuse = object.color;
    
                object.renderer.bindBuffers();
                this._shader.setup(
                    object.renderer,
                    this._materialRenderer,
                    matrix,
                    viewMatrix,
                    projectionMatrix
                );
                object.renderer.draw();
            })
        });

        console.debug(`DebugRenderer.draw() - present texture`);
        const shader = this._presentShader;
        this._renderer.presentTexture(this._targetTexture, { clearBuffers: false, shader });
        console.debug(`DebugRenderer.draw() - done`);
    }

    destoy() {
        this._renderBuffer.destroy();
        this._targetTexture.destroy();
        this._renderBuffer = null;
        this._targetTexture = null;
    }
}
