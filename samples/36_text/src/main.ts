import Canvas from 'bg2e-js/ts/app/Canvas.ts';
import MainLoop, { FrameUpdate } from 'bg2e-js/ts/app/MainLoop.ts';
import Loader, { registerLoaderPlugin } from 'bg2e-js/ts/db/Loader.ts';
import TextFontLoaderPlugin from 'bg2e-js/ts/db/TextFontLoaderPlugin.ts';
import TextFontComponent from 'bg2e-js/ts/scene/TextFontComponent.ts';
import SceneAppController from 'bg2e-js/ts/render/SceneAppController.ts';
import WebGLRenderer from 'bg2e-js/ts/render/webgl/Renderer.ts';
import Node from 'bg2e-js/ts/scene/Node.ts';
import Camera, { PerspectiveProjectionStrategy } from 'bg2e-js/ts/scene/Camera.ts';
import Transform from 'bg2e-js/ts/scene/Transform.ts';
import Drawable from 'bg2e-js/ts/scene/Drawable.ts';
import LightComponent from 'bg2e-js/ts/scene/LightComponent.ts';
import TextComponent from 'bg2e-js/ts/scene/TextComponent.ts';
import { prepareTextResources, reloadTextFonts } from 'bg2e-js/ts/scene/TextResources.ts';
import Material from 'bg2e-js/ts/base/Material.ts';
import Color from 'bg2e-js/ts/base/Color.ts';
import Mat4 from 'bg2e-js/ts/math/Mat4.ts';
import Vec from 'bg2e-js/ts/math/Vec.ts';
import plane from 'bg2e-js/ts/primitives/plane.ts';

const status = document.getElementById('status')!;
const input = document.getElementById('content') as HTMLTextAreaElement;
const retry = document.getElementById('retry') as HTMLButtonElement;

class TextApp extends SceneAppController {

    private loader!: Loader;
    private text!: TextComponent;
    get selectionManagerEnabled() { return false; }
    get selectionHighlightEnabled() { return false; }
    get gizmoManagerEnabled() { return false; }

    async loadScene(): Promise<Node> {
        registerLoaderPlugin(new TextFontLoaderPlugin());
        this.loader = new Loader(); // Default WASM location; supplied by copyBg2eAssets().
        const root = new Node('Text tutorial');

        // Declare the font on the scene root, just like the native tutorial.
        const fontDirectory = `${import.meta.env.BASE_URL}fonts/didact-gothic`;
        const fonts = new TextFontComponent();
        fonts.setDeclarations([{
            identifier: 'tutorial',
            path: `${fontDirectory}/DidactGothic-Regular.ttf`,
            faceIndex: 0,
            notices: [`${fontDirectory}/OFL.txt`, `${fontDirectory}/README.md`]
        }]);
        root.addComponent(fonts);

        // Create editable paragraph data independently of its world-space size.
        this.text = new TextComponent();
        this.text.text.setParameters({
            content: 'Hello World',
            fontIdentifier: 'tutorial',
            fontSize: 160,
            lineSpacing: 1.2,
            characterSpacing: 0,
            paragraphSize: { width: 1024, height: 256 },
            bitmapResolution: { width: 2048, height: 512 },
            margins: { left: 24, top: 24, right: 24, bottom: 24 },
            alignment: 'center',
            verticalAlignment: 'center',
            wrapMode: 'word',
            overflowPolicy: 'clip'
        });
        this.text.setHeight(1.4);
        this.text.material.albedo = new Color([.07, .28, .8, 1]);
        this.text.material.metalness = 0;
        this.text.material.roughness = .9;
        this.text.material.unlit = false;
        this.text.material.alphaCutoff = .1;
        // TextComponent defaults to a double-sided quad, with readable front +Z.
        const textNode = new Node('Editable text');
        textNode.addComponent(new Transform(
            // Set position after rotation: rotate() also rotates an existing translation.
            Mat4.MakeRotation(-Math.PI / 2, 1, 0, 0).setPosition(0, 2.2, 0)
        ));
        textNode.addComponent(this.text);
        root.addChild(textNode);

        const cameraNode = new Node('Camera');
        const camera = new Camera();
        // Look mostly along the upward-facing text normal. Frame the text and
        // its floor shadow together, with their midpoint at the viewport center.
        const cameraPosition = new Vec(0, 8, 4.5);
        const cameraTarget = new Vec(0, 1.1, 1.1);
        camera.focusDistance = Vec.Magnitude(Vec.Sub(cameraPosition, cameraTarget));
        const projection = new PerspectiveProjectionStrategy();
        projection.near = .1; projection.far = 50;
        camera.projectionStrategy = projection;
        cameraNode.addComponent(camera);
        cameraNode.addComponent(new Transform(
            Mat4.GetInverted(Mat4.MakeLookAt(
                cameraPosition,
                cameraTarget,
                new Vec(0,1,0))
            ))
        );
        root.addChild(cameraNode);
        camera.setMain(root);

        const floor = new Node('Floor');
        const floorDrawable = new Drawable();
        const floorMaterial = new Material();
        floorMaterial.albedo = new Color([.45,.45,.45,1]);
        floorMaterial.metalness = 0;
        floorMaterial.roughness = .9;
        floorDrawable.addPolyList(plane(10,8), floorMaterial);
        floor.addComponent(new Transform());
        floor.addComponent(floorDrawable);
        root.addChild(floor);

        const lightNode = new Node('Directional light');
        const light = new LightComponent();
        light.light.intensity = 2.5; 
        light.light.castShadows = true;
        light.light.shadowStrength = 1;
        light.light.sourceSize = 0;
        light.light.shadowSamples = 1;
        light.light.direction = new Vec(0,0,1);

        // Match the native tutorial: local +Z travels down toward world +Z.
        lightNode.addComponent(new Transform(Mat4.MakeRotation(Math.PI/4,1,0,0)));
        lightNode.addComponent(light); root.addChild(lightNode);

        // Load the declared font and generate the text mask after building the tree.
        // SceneRenderer repeats this preparation only when authored data changes.
        await prepareTextResources(root, this.loader);
        return root;
    }

    async loadDone(): Promise<void> {
        input.disabled = retry.disabled = false;
        const updateStatus = () => { status.textContent = this.text.canRender ? 'Fuente cargada · texto visible' : input.value.trim() ? 'Texto no disponible: revisa fuente, caja o desbordamiento' : 'Texto vacío'; };
        input.oninput = () => {
            // CPU edit only. SceneRenderer prepares the new mask before its next traversal.
            this.text.text.content = input.value;
            this.mainLoop.postRedisplay({ frames: 2 });
        };
        retry.onclick = async () => {
            retry.disabled = true;
            try { this.text.retryResources(); await reloadTextFonts(this.sceneRoot!); updateStatus(); this.mainLoop.postRedisplay({ frames: 2 }); }
            catch (error) { status.textContent = String(error); }
            finally { retry.disabled = false; }
        };
        updateStatus();
    }

    async frame(delta: number): Promise<void> {
        await super.frame(delta);
        status.textContent = this.text.canRender ? 'Didact Gothic cargada · texto visible' : input.value.trim() ? 'Texto no disponible: revisa fuente o desbordamiento' : 'Texto vacío · sin sombra';
    }

    destroy(): void {
        input.oninput = null; retry.onclick = null;
        super.destroy(); this.text?.destroy(); this.loader?.dispose();
    }
}

window.addEventListener('load', async () => {
    try {
        const canvas = new Canvas(document.getElementById('gl-canvas') as HTMLCanvasElement, new WebGLRenderer());
        const loop = new MainLoop(canvas, new TextApp()); loop.updateMode = FrameUpdate.AUTO;
        await loop.run();
    } catch (error) {
        console.error(error); status.textContent = `Error: ${error}`;
    }
});
