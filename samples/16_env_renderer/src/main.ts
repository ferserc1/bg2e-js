import AppController from "bg2e-js/ts/app/AppController.ts";
import Bg2KeyboardEvent from "bg2e-js/ts/app/Bg2KeyboardEvent.ts";
import Bg2MouseEvent from "bg2e-js/ts/app/Bg2MouseEvent.ts";
import Canvas from "bg2e-js/ts/app/Canvas.ts";
import MainLoop, { FrameUpdate } from "bg2e-js/ts/app/MainLoop.ts";
import Mat4 from "bg2e-js/ts/math/Mat4.ts";
import Vec from "bg2e-js/ts/math/Vec.ts";
import Renderer from "bg2e-js/ts/render/Renderer.ts";
import WebGLRenderer from "bg2e-js/ts/render/webgl/Renderer.js";

class MyAppController extends AppController {
    protected _alpha: number = 0;
    protected _cameraMatrix: Mat4 = Mat4.MakeIdentity();
    protected _cameraPosition: Vec = new Vec([0,0,0]);
    protected _projectionMatrix: Mat4 = Mat4.MakeIdentity();
    protected _env: any;
    protected _skyCube: any;
    protected _environmentUpdated: boolean = false;
    protected _mousePos: Vec = new Vec([0,0]);
    protected _mouseOffset: Vec = new Vec([0,0]);

    async init() {
        if (!(this.renderer instanceof WebGLRenderer)) {
            throw new Error("This example works only with WebGL Renderer");
        }

        this.renderer.state.depthTestEnabled = true;

        // The view matrix will be used to render the cubemap, and also to render the scene
        // The projection matrix will be used only to render the scene
        this._alpha = 0;
        this._cameraMatrix = Mat4.MakeTranslation(0, 1, 5);
        this._cameraPosition = Mat4.GetPosition(this._cameraMatrix);
        this._projectionMatrix = Mat4.MakePerspective(50, this.canvas.viewport.aspectRatio,0.1,100.0);

       
        this._env = this.renderer.factory.environment();
        await this._env.load({ textureUrl: '../resources/country_field_sun.jpg' });

        this._skyCube = this.renderer.factory.skyCube();
        await this._skyCube.load(this._env.environmentMap);

        this._mouseOffset = new Vec([0,0]);
    }

    reshape(width: number,height: number) {
        const { state } = this.renderer;
        state.viewport = new Vec(width, height);
        this._projectionMatrix = Mat4.MakePerspective(50, this.canvas.viewport.aspectRatio,0.1,100.0);
        this.renderer.canvas.updateViewportSize();
    }


    async frame(delta: number) {
        this._cameraMatrix
            .identity()
            .translate(0, 0, 5)
            .rotate(this._mouseOffset.y * -0.002, 1, 0, 0)
            .rotate(this._mouseOffset.x * -0.002, 0, 1, 0);

        const viewMatrix = Mat4.GetInverted(this._cameraMatrix);

        this._skyCube.updateRenderState({ viewMatrix, projectionMatrix: this._projectionMatrix });
    }

    display() {
        const { state } = this.renderer;
        state.clear();

        if (!this._environmentUpdated) {
            console.log("Update cubemap render");
            this._env.updateMaps();
            this._environmentUpdated = true;
        }

        this._skyCube.draw();
    }

    destroy() {
        this._skyCube?.destroy();
    }

    keyDown(evt: Bg2KeyboardEvent) {
        if (evt.key === "Digit1") {
            this._skyCube.texture = this._env.environmentMap;
        }
        else if (evt.key === "Digit2") {
            this._skyCube.texture = this._env.specularMap;
        }
        else if (evt.key === "Digit3") {
            this._skyCube.texture = this._env.irradianceMap;
        }
    }

    mouseDown(evt: Bg2MouseEvent) {
        const { x, y } = evt;
        this._mousePos = new Vec([x,y]);
    }
    
    mouseDrag(evt: Bg2MouseEvent) {
        const newPos = new Vec([evt.x, evt.y]);
        const diff = Vec.Sub(this._mousePos, newPos);
        this._mouseOffset = Vec.Add(this._mouseOffset,diff);
        this._mousePos = newPos;
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
