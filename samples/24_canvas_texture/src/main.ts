import Canvas from "bg2e-js/ts/app/Canvas.ts";
import MainLoop, { FrameUpdate } from "bg2e-js/ts/app/MainLoop.ts";
import Texture, { ProceduralTextureFunction } from "bg2e-js/ts/base/Texture.ts";
import Loader, { registerLoaderPlugin } from "bg2e-js/ts/db/Loader.ts";
import VitscnjLoaderPlugin from "bg2e-js/ts/db/VitscnjLoaderPlugin.ts";
import SceneAppController from "bg2e-js/ts/render/SceneAppController.ts";
import WebGLRenderer from "bg2e-js/ts/render/webgl/Renderer.js";
import CameraComponent, { OpticalProjectionStrategy, ProjectionStrategy } from "bg2e-js/ts/scene/Camera.ts";
import FindNodeVisitor from "bg2e-js/ts/scene/FindNodeVisitor.ts";
import { registerComponents } from "bg2e-js/ts/scene/index.ts";

class MyAppController extends SceneAppController {
    private _textContainer!: HTMLElement;

    createOutputText() {
        const textContainer = document.createElement("h1");
        document.body.appendChild(textContainer);
        textContainer.style.position = "absolute";
        textContainer.style.top = "0px";
        textContainer.style.left = "0px";
        textContainer.style.color = "white";
        textContainer.style.textShadow = "0px 0px 18px rgba(0,0,0,0.8)";
        this._textContainer = textContainer;
    }

    printText(text: string) {
        this._textContainer.innerHTML += `<br/>${text}`;
    }

    clearText() {
        this._textContainer.innerHTML = "";
    }

    get selectionManagerEnabled() {
        return true;
    }

    get selectionHighlightEnabled() {
        return true;
    }

    async loadScene() {
        //this.updateOnInputEvents = false;
        // Register loader plugins
        // bg2ioPath is the path from the html file to the distribution files of the bg2io library, if
        // this path is different from the compiled js file (generated from this file, in this case, 
        // using Rollup)
        registerLoaderPlugin(new VitscnjLoaderPlugin({ bg2ioPath: "dist/" }));
        registerComponents();

        // Load scene
        const loader = new Loader();
        const root = await loader.loadNode("../resources/test-scene/test-scene.vitscnj");

        // Get main camera
        // Add Orbit camera controller component to the camera node
        const mainCamera = CameraComponent.GetMain(root);
        if (!mainCamera) {
            throw new Error("No main camera found in the scene");
        }
        const proj = new OpticalProjectionStrategy();
        mainCamera.projectionStrategy = proj;
        proj.focalLength = 55;
        proj.frameSize = 35;
        proj.near = 0.1;
        proj.far = 1000.0;

        // Find floor to set the canvas texture
        const findVisitor = new FindNodeVisitor();
        findVisitor.name = "Floor";
        root.accept(findVisitor);

        const texture = new Texture();
        const canvas = document.getElementById("canvas-2d");
        texture.proceduralFunction = ProceduralTextureFunction.CANVAS_2D;
        texture.proceduralParameters = { canvas };
        await texture.loadImageData();

        window.addEventListener('bg2e:updateCanvas', async evt => {
            await texture.updateImageData();
            this.mainLoop.postRedisplay();
        });

        findVisitor.result.length && findVisitor.result.forEach(node => {
            node.drawable && node.drawable.items.forEach(({material}) => {
                material.albedoTexture = texture;
                material.roughness = 1.0;
            });
        });

        return root;
    }

    async loadDone() {
        this.selectionManager?.onSelectionChanged("appController", selection => {
            this.clearText();
            this.printText("Selection changed:");
            selection.forEach(item => {
                this.printText(`&nbsp;${ item.drawable.name }`);
            });
        });

        this.createOutputText();
    }
}

function initCanvas() {
    const canvas = document.getElementById('canvas-2d') as HTMLCanvasElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) {
        console.error("Cannot find canvas element with id 'canvas-2d' or cannot get 2D context");
        return;
    }

    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, 255, 255);

    ctx.fillStyle = "green";
    ctx.fillRect(16, 16, 224, 224);

    canvas.addEventListener('click', evt => {
        console.log(evt.offsetX, ', ', evt.offsetY);
        
        ctx.font = '50px serif'
        // use these alignment properties for "better" positioning
        ctx.textAlign = "center"; 
        ctx.textBaseline = "middle"; 
        // draw the emoji
        ctx.fillText('😜', evt.offsetX, evt.offsetY);

        window.dispatchEvent(new Event("bg2e:updateCanvas"));
    });
}

window.onload = async () => {
    initCanvas();

    const canvasElem = document.getElementById('gl-canvas') as HTMLCanvasElement;
    if (!canvasElem) {
        console.error("Cannot find canvas element with id 'gl-canvas'");
        return;
    }
    const canvas = new Canvas(canvasElem, new WebGLRenderer());
    canvas.domElement.style.width = "50vw";
    canvas.domElement.style.height = "100vh";
    const appController = new MyAppController();
    const mainLoop = new MainLoop(canvas, appController);
    mainLoop.updateMode = FrameUpdate.MANUAL;
    await mainLoop.run();
}
