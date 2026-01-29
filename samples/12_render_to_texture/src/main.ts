import AppController from "bg2e-js/ts/app/AppController.ts";
import Bg2KeyboardEvent, { SpecialKey } from "bg2e-js/ts/app/Bg2KeyboardEvent.ts";
import Canvas from "bg2e-js/ts/app/Canvas.ts";
import MainLoop, { FrameUpdate } from "bg2e-js/ts/app/MainLoop.ts";
import Material from "bg2e-js/ts/base/Material.ts";
import Texture, { TextureComponentFormat, TextureRenderTargetAttachment, TextureWrap } from "bg2e-js/ts/base/Texture.ts";
import Mat4 from "bg2e-js/ts/math/Mat4.ts";
import Vec from "bg2e-js/ts/math/Vec.ts";
import { clamp } from "bg2e-js/ts/math/functions.ts";
import { createCube, createPlane, createSphere } from "bg2e-js/ts/primitives/index.ts";
import RenderBuffer from "bg2e-js/ts/render/RenderBuffer.js";
import RenderState from "bg2e-js/ts/render/RenderState.ts";
import Renderer, { EngineFeatures } from "bg2e-js/ts/render/Renderer.ts";
import TextureRenderer from "bg2e-js/ts/render/TextureRenderer.ts";
import WebGLRenderer from "bg2e-js/ts/render/webgl/Renderer.js";
import BasicDiffuseColorShader from "bg2e-js/ts/shaders/BasicDiffuseColorShader.ts";

class MyAppController extends AppController {
    private _rttTarget: Texture | null = null;
    private _rttDepth: Texture | null = null;
    private _renderBuffer: RenderBuffer | null = null;
    private _shader: BasicDiffuseColorShader | null = null;
    private _objects: {
        polyListRenderer: any,
        materialRenderer: any,
        transform: Mat4
    }[] = [];
    private _viewMatrix: Mat4 = Mat4.MakeIdentity();
    private _projMatrix: Mat4 = Mat4.MakeIdentity();
    private _renderStates: RenderState[] = [];
    private _rotation: number = 0;

    async init() {
        if (!(this.renderer instanceof WebGLRenderer)) {
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
        // If the texture is not a power of two (in this case it is not, because it is the size of
        // the viewport), you have to set the wrap mode to clamp
        this._rttTarget.wrapModeXY = TextureWrap.CLAMP;

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
        this._rttDepth.wrapModeXY = TextureWrap.CLAMP;
        await this._renderBuffer.attachTexture(this._rttDepth);

        this.renderer.state.depthTestEnabled = true;

        this._shader = new BasicDiffuseColorShader(this.renderer);
        await this._shader.load();
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

        this._viewMatrix = Mat4.MakeLookAt(
            new Vec(0, 1, -8),
            new Vec(0, 0, 0),
            new Vec(0, 1, 0)
        );
        this._projMatrix = Mat4.MakePerspective(45, this.canvas.viewport.aspectRatio, 0.1, 1000.0);
    }

    reshape(width: number,height: number) {
        const { state } = this.renderer;
        const size = new Vec(width, height);
        state.viewport = size;
        this.renderer.canvas.updateViewportSize();

        // Update the render buffer size
        if (this._renderBuffer) {
            this._renderBuffer.size = size;
        }

        // The aspect ratio is set to viewport.aspectRatio / 2 because in display loop, the texture is
        // presented twice side by side, so the aspect ratio is half the viewport aspect ratio 
        this._projMatrix = Mat4.MakePerspective(45, this.canvas.viewport.aspectRatio / 2, 0.1, 1000.0);
    }

    async frame(delta: number) {
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
                modelMatrix: Mat4.Mult(worldMatrix, transform),
                viewMatrix: this._viewMatrix,
                projectionMatrix: this._projMatrix
            });
        });
    }


    display() {
        if (this._renderBuffer) {
            this._renderBuffer.update(() => {
                this._renderBuffer!.frameBuffer.clear();
                this._renderStates.forEach(rs => rs.draw());
            });
        }

        this.renderer.presentTexture(this._rttTarget, {
            viewport: [0, 0, window.innerWidth / 2, window.innerHeight]
        });

        this.renderer.presentTexture(this._rttDepth, {
            clearBuffers: false,
            viewport: [window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight]
        });
    }

    destroy() {
        this._shader?.destroy();
        this._renderBuffer?.destroy();
        this._rttTarget?.destroy();
        this._rttDepth?.destroy();
        this._objects.forEach(objData => {
            objData.polyListRenderer.destroy();
        })
    }

    keyUp(evt: Bg2KeyboardEvent) {
        if (evt.key === SpecialKey.ESCAPE) {
            this.mainLoop.exit();
        }
    }
}

window.onload = async () => {
    const canvasElem = document.getElementById('gl-canvas') as HTMLCanvasElement;
    if (!canvasElem) {
        console.error("Cannot find canvas element with id 'gl-canvas'");
        return;
    }
    const canvas = new Canvas(canvasElem, new WebGLRenderer());
    canvas.domElement.style.width = "100vw";
    canvas.domElement.style.height = "100vh";
    const appController = new MyAppController();
    const mainLoop = new MainLoop(canvas, appController);
    mainLoop.updateMode = FrameUpdate.AUTO;
    await mainLoop.run();
}
