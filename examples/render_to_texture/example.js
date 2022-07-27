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

class MyAppController extends AppController {
    async init() {
        if (!this.renderer instanceof WebGLRenderer) {
            throw new Error("This example works only with WebGL Renderer");
        }

        if (!this.renderer.supportsFeatures(EngineFeatures.RENDER_TARGET_TEXTURES)) {
            throw new Error("Unsupported features");
        }

        console.log(`Maximum render targets: ${ this.renderer.getMaximumRenderTargets()}`);

        // TODO: Example texture to present. Remove this code
        this._texture = new Texture();
        this._texture.fileName = '../resources/country_field_sun.jpg';
        await this._texture.loadImageData();

        this._rttTarget = new Texture();
        // When the texture data type is set to RENDER_TARGET, the wrapModeXY parameter
        // is set to CLAMP, and the minFilter and magFilter are set to LINEAR.
        this._rttTarget.dataType = TextureDataType.RENDER_TARGET;
        this._rttTarget.size = [512, 512];  // Initial size, will be updated in reshape() function
        // This is the default attachment, if any other is specified
        this._rttTarget.renderTargetAttachment = TextureRenderTargetAttachment.COLOR_ATTACHMENT_0;

        // In this case we use an unsigned byte texture, but it also can be used a floating point texture,
        // if the engine supports it
        this._rttTarget.componentFormat = TextureComponentFormat.UNSIGNED_BYTE;

        // Create the texture renderer for the render target texture
        this._rttTextureRenderer = this.renderer.factory.texture(this._rttTarget);

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

        // Update texture target
        this._rttTarget.size = size; 
    }

    frame(delta) {

        this._renderStates = this._objects.map(({
            materialRenderer,
            polyListRenderer,
            transform
        }) => {
            return new RenderState({
                shader: this._shader,
                materialRenderer,
                polyListRenderer,
                modelMatrix: transform,
                viewMatrix: this._viewMatrix,
                projectionMatrix: this._projMatrix
            });
        });
    }


    display() {
        const { state } = this.renderer;

        this._rttTextureRenderer.beginUpdate();
        state.clear();
        this._renderStates.forEach(rs => rs.draw());
        this._rttTextureRenderer.endUpdate();

        //this.renderer.presentTexture(this._rttTexture);
    }

    destroy() {
        this._shader.destroy();
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
