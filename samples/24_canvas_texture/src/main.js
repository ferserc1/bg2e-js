import { app, base, db, math, render, scene } from "bg2e-js";

const {
    MainLoop,
    FrameUpdate,
    Canvas
} = app;
const {
    Texture,
    ProceduralTextureFunction
} = base;
const {
    Loader,
    registerLoaderPlugin,
    VitscnjLoaderPlugin
} = db;
const {
    Vec
} = math;
const {
    WebGLRenderer,
    SceneAppController
} = render;
const {
    OpticalProjectionStrategy,
    OrbitCameraController,
    registerComponents,
    FindNodeVisitor,
    CameraComponent,
    registercomponents
} = scene;


class MyAppController extends SceneAppController {
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

    printText(text) {
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
        mainCamera.projectionStrategy = new OpticalProjectionStrategy();
        mainCamera.projectionStrategy.focalLength = 55;
        mainCamera.projectionStrategy.frameSize = 35;
        mainCamera.projectionStrategy.near = 0.1;
        mainCamera.projectionStrategy.far = 1000.0;

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

        window.findVisitor = findVisitor;

        window.root = root;
        return root;
    }

    async loadDone() {
        this.selectionManager.onSelectionChanged("appController", selection => {
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
    const canvas = document.getElementById('canvas-2d');
    const ctx = canvas.getContext("2d");

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

    const canvas = new Canvas(document.getElementById('gl-canvas'), new WebGLRenderer());
    canvas.domElement.style.width = "50vw";
    canvas.domElement.style.height = "100vh";
    const appController = new MyAppController();
    const mainLoop = new MainLoop(canvas, appController);
    mainLoop.updateMode = FrameUpdate.MANUAL;
    await mainLoop.run();
    window.mainLoop = mainLoop;
}
