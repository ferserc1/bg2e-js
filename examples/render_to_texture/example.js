import MainLoop, { FrameUpdate } from "bg2e/app/MainLoop";
import Canvas from "bg2e/app/Canvas";
import AppController from "bg2e/app/AppController";
import WebGLRenderer from "bg2e/render/webgl/Renderer";
import Texture, { TextureComponentFormat, TextureDataType, TextureRenderTargetAttachment } from "bg2e/base/Texture";
import Vec from "bg2e/math/Vec";
import BasicDiffuseColorShader from "bg2e/shaders/BasicDiffuseColorShader";
import { createCube, createPlane, createSphere } from "bg2e/primitives";
import Material from "bg2e/base/Material";
import Mat4 from "bg2e/math/Mat4";
import RenderState from "bg2e/render/RenderState";
import { EngineFeatures } from "bg2e/render/Renderer";
import { SpecialKey } from "bg2e/app/KeyboardEvent";

class MyAppController extends AppController {
    async init() {
        if (!this.renderer instanceof WebGLRenderer) {
            throw new Error("This example works only with WebGL Renderer");
        }

        if (!this.renderer.supportsFeatures(EngineFeatures.RENDER_TARGET_TEXTURES)) {
            throw new Error("Unsupported features");
        }

        console.log(`Maximum render targets: ${ this.renderer.getMaximumRenderTargets()}`);

        this._rttTarget = new Texture();
        // This is the default attachment, if any other is specified
        this._rttTarget.renderTargetAttachment = TextureRenderTargetAttachment.COLOR_ATTACHMENT_0;
        // In this case we use an unsigned byte texture, but it also can be used a floating point texture,
        // if the engine supports it
        this._rttTarget.componentFormat = TextureComponentFormat.UNSIGNED_BYTE;

        // Create a render buffer and attach the texture renderer
        this._renderBuffer = this.renderer.factory.renderBuffer();
        // This function will set the texture data type to RENDER_TARGET, will  create a
        // TextureRenderer object and will attach the texture to the selected 
        // texture.renderTargetAttachment
        await this._renderBuffer.attachTexture(this._rttTarget);

        // The following code is required only to get the depth buffer texture. By default, if no depth
        // texture is attached, the render buffer will create a depth renderbuffer automatically
        this._rttDepth = new Texture();
        this._rttDepth.renderTargetAttachment = TextureRenderTargetAttachment.DEPTH_ATTACHMENT;
        this._rttDepth.componentFormat = TextureComponentFormat.UNSIGNED_BYTE;
        await this._renderBuffer.attachTexture(this._rttDepth);

        this.renderer.state.depthTestEnabled = true;

        this._shader = new BasicDiffuseColorShader(this.renderer);
        this._objects = [
            {
                polyListRenderer: this.renderer.factory.polyList(createCube(2, 2, 2)),
                materialRenderer: this.renderer.factory.material(await Material.Deserialize({
                    diffuse: [0.8, 0.4, 0.1]
                })),
                transform: Mat4.MakeRotation(45, 0, 1, 0)
            },

            {
                polyListRenderer: this.renderer.factory.polyList(createSphere(0.5)),
                materialRenderer: this.renderer.factory.material(await Material.Deserialize({
                    diffuse: [0.3, 0.98, 0.05]
                })),
                transform: Mat4.MakeTranslation(2, 0, 0)
            },

            {
                polyListRenderer: this.renderer.factory.polyList(createPlane(10, 10)),
                materialRenderer: this.renderer.factory.material(await Material.Deserialize({
                    diffuse: [0.3, 0.28, 0.95]
                })),
                transform: Mat4.MakeIdentity()
            }
        ];

        this._viewMatrix = Mat4.MakeLookAt([0, 1, -8], [0, 0, 0],[0, 1, 0]);
        this._projMatrix = Mat4.MakePerspective(45, this.canvas.viewport.aspectRatio, 0.1, 1000.0);
    }

    reshape(width,height) {
        const { state } = this.renderer;
        const size = new Vec(width, height);
        state.viewport = size;
        this.renderer.canvas.updateViewportSize();

        // Update the render buffer size
        this._renderBuffer.size = size;

        // The aspect ratio is set to viewport.aspectRatio / 2 because in display loop, the texture is
        // presented twice side by side, so the aspect ratio is half the viewport aspect ratio 
        this._projMatrix = Mat4.MakePerspective(45, this.canvas.viewport.aspectRatio / 2, 0.1, 1000.0);
    }

    frame(delta) {
        this._rotation = this._rotation || delta;
        this._rotation += delta * 0.001;
        const worldMatrix = Mat4.MakeIdentity();
        worldMatrix.rotate(this._rotation, 0, 1, 0);

        this._renderStates = this._objects.map(({
            materialRenderer,
            polyListRenderer,
            transform
        }) => {
            return new RenderState({
                shader: this._shader,
                materialRenderer,
                polyListRenderer,
                modelMatrix: Mat4.Mult(transform, worldMatrix),
                viewMatrix: this._viewMatrix,
                projectionMatrix: this._projMatrix
            });
        });
    }


    display() {
        const { state } = this.renderer;

        this._renderBuffer.beginUpdate();
        state.clear();
        this._renderStates.forEach(rs => rs.draw());
        this._renderBuffer.endUpdate();

        this.renderer.presentTexture(this._rttTarget, {
            viewport: [0, 0, window.innerWidth / 2, window.innerHeight]
        });

        this.renderer.presentTexture(this._rttDepth, {
            clearBuffers: false,
            viewport: [window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight]
        });
    }

    destroy() {
        this._shader.destroy();
        this._renderBuffer.destroy();
        this._rttTarget.destroy();
        this._rttDepth.destroy();
        this._objects.forEach(objData => {
            objData.polyListRenderer.destroy();
        })
    }

    keyUp(evt) {
        if (evt.key === SpecialKey.ESCAPE) {
            this.mainLoop.exit();
        }
    }
}

window.onload = async () => {
    const canvas = new Canvas(document.getElementById('gl-canvas'), new WebGLRenderer());
    canvas.domElement.style.width = "100vw";
    canvas.domElement.style.height = "100vh";
    const appController = new MyAppController();
    const mainLoop = new MainLoop(canvas, appController);
    mainLoop.updateMode = FrameUpdate.AUTO;
    await mainLoop.run();
}
