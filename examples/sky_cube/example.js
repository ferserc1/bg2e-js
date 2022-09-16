import MainLoop, { FrameUpdate } from "bg2e/app/MainLoop";
import Canvas from "bg2e/app/Canvas";
import AppController from "bg2e/app/AppController";
import WebGLRenderer from "bg2e/render/webgl/Renderer";
import Vec from "bg2e/math/Vec";
import Mat4 from "bg2e/math/Mat4";
import { createCube, createSphere } from "bg2e/primitives";
import Material from "bg2e/base/Material";
import RenderState from "bg2e/render/RenderState";
import BasicDiffuseColorShader from "bg2e/shaders/BasicDiffuseColorShader";
import Texture, { TextureRenderTargetAttachment, TextureTarget, TextureTargetName } from "bg2e/base/Texture";
import IrradianceMapCubeShader from "bg2e/shaders/IrradianceMapCubeShader";

class MyAppController extends AppController {
    async init() {
        if (!this.renderer instanceof WebGLRenderer) {
            throw new Error("This example works only with WebGL Renderer");
        }

        this.renderer.state.depthTestEnabled = true;

        // The view matrix will be used to render the cubemap, and also to render the scene
        // The projection matrix will be used only to render the scene
        this._alpha = 0;
        this._cameraMatrix = Mat4.MakeTranslation(0, 1, 5);
        this._cameraPosition = Mat4.GetPosition(this._cameraMatrix);
        this._projectionMatrix = Mat4.MakePerspective(50, this.canvas.viewport.aspectRatio,0.1,100.0);

       
        // In this example, we are going to convert an equirectangular texture into
        // a cubemap texture, to render it using a SkyCube.
        // The SkySphere object uses an equirectangular texture to draw the sky. We are
        // going to render it into a render buffer to generate the cube map texture
        this._skySphere = this.renderer.factory.skySphere();
        await this._skySphere.load('../resources/country_field_sun.jpg');

        // Cubemap resources: we need a RenderBuffer and a Texture
        this._cubemapTexture = new Texture();
        this._cubemapTexture.renderTargetAttachment = TextureRenderTargetAttachment.COLOR_ATTACHMENT_0;
        this._cubemapTexture.target = TextureTarget.CUBE_MAP;

        this._renderBuffer = this.renderer.factory.renderBuffer();
        await this._renderBuffer.attachTexture(this._cubemapTexture);
        // This is the size of each cube face
        this._renderBuffer.size = new Vec(512, 512);

        this._skyCube = this.renderer.factory.skyCube();
        await this._skyCube.load(this._cubemapTexture, IrradianceMapCubeShader);

        this._mouseOffset = new Vec([0,0]);
    }

    reshape(width,height) {
        const { state } = this.renderer;
        state.viewport = new Vec(width, height);
        this._projectionMatrix = Mat4.MakePerspective(50, this.canvas.viewport.aspectRatio,0.1,100.0);
        this.renderer.canvas.updateViewportSize();
    }


    frame(delta) {
        this._cameraMatrix
            .identity()
            .translate(0, 0, 5)
            .rotate(this._mouseOffset.y * -0.002, 1, 0, 0)
            .rotate(this._mouseOffset.x * -0.002, 0, 1, 0);

        const viewMatrix = Mat4.GetInverted(this._cameraMatrix);

        this._skySphere.updateRenderState({ viewMatrix, projectionMatrix: this._projectionMatrix });
        this._skyCube.updateRenderState({ viewMatrix, projectionMatrix: this._projectionMatrix });
    }

    display() {
        const { state } = this.renderer;
        state.clear();

        if (!this._environmentUpdated) {
            console.log("Update cubemap render");
            this._renderBuffer.update((face,viewMatrix,projectionMatrix) => {
                state.clear();
                this._skySphere.updateRenderState({ viewMatrix, projectionMatrix })
                this._skySphere.draw();
            });
            this._environmentUpdated = true;
        }

        this._skyCube.draw();
    }

    destroy() {
        this._skySphere.destroy();
    }

    mouseDown(evt) {
        const { x, y } = evt;
        this._mousePos = new Vec([x,y]);
    }
    
    mouseDrag(evt) {
        const newPos = new Vec([evt.x, evt.y]);
        const diff = Vec.Sub(this._mousePos, newPos);
        this._mouseOffset = Vec.Add(this._mouseOffset,diff);
        this._mousePos = newPos;
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
