import Canvas from "bg2e-js/ts/app/Canvas.ts";
import MainLoop, { FrameUpdate } from "bg2e-js/ts/app/MainLoop.ts";
import Loader, { registerLoaderPlugin } from "bg2e-js/ts/db/Loader.ts";
import VitscnjLoaderPlugin from "bg2e-js/ts/db/VitscnjLoaderPlugin.ts";
import SceneAppController from "bg2e-js/ts/render/SceneAppController.ts";
import WebGLSceneRenderer from "bg2e-js/ts/render/webgl/SceneRenderer.ts";
import WebGLRenderer from "bg2e-js/ts/render/webgl/Renderer.ts";
import CameraComponent from "bg2e-js/ts/scene/Camera.ts";
import Node from "bg2e-js/ts/scene/Node.ts";
import { deserializeComponent } from "bg2e-js/ts/scene/Component.ts";
import { registerComponents } from "bg2e-js/ts/scene/index.ts";

// This sample adapts the native scene dialect without changing the shared loader.
async function loadNativeScene(url: string): Promise<Node> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Cannot load scene: ${response.status} ${url}`);
    const data = await response.json();
    if (data.fileType !== 'bg2e::scene' || !Array.isArray(data.scene)) {
        throw new Error('Expected a native bg2e scene');
    }
    const loader = new Loader();
    loader.currentPath = url.slice(0, url.lastIndexOf('/') + 1);
    const loadNode = async (data: any): Promise<Node> => {
        const node = new Node(data.name);
        node.enabled = data.enabled ?? true;
        node.steady = data.steady ?? false;
        for (const original of data.components ?? []) {
            let componentData = { ...original };
            switch (componentData.type) {
                case 'Drawable':
                    componentData.name = componentData.path.replace(/\.(bg2|vwglb)$/i, '');
                    break;
                case 'Camera':
                    componentData = { ...componentData, ...componentData.cameraData,
                        projectionMethod: { ...componentData.cameraData?.projection, type: 'PerspectiveProjectionMethod' } };
                    break;
                case 'LightSource':
                    componentData = {
                        ...componentData.lightData,
                        type: 'Light',
                        lightType: componentData.lightData.type === 'kTypeSun' ? 'kTypeDirectional' : componentData.lightData.type,
                        // Native LightComponent::direction() transforms local +Z.
                        direction: [0, 0, 1]
                    };
                    break;
            }
            const component = await deserializeComponent(componentData, loader);
            if (component) node.addComponent(component);
        }
        for (const child of data.children ?? []) node.addChild(await loadNode(child));
        return node;
    };
    const root = new Node('Lightmap scene');
    for (const node of data.scene) root.addChild(await loadNode(node));
    return root;
}

class LightmapAppController extends SceneAppController {
    private shadowControls: HTMLElement | null = null;

    async loadDone() {
        const panel = document.createElement('label');
        panel.style.cssText = 'position:fixed;top:16px;right:16px;padding:12px;background:#20242bee;color:white;font:14px system-ui;border-radius:8px';
        const toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.checked = true;
        toggle.addEventListener('change', () => {
            (this.sceneRenderer as WebGLSceneRenderer).shader.shadowsEnabled = toggle.checked;
        });
        panel.append(toggle, ' Dynamic shadows');
        document.body.append(panel);
        this.shadowControls = panel;
    }

    destroy() {
        this.shadowControls?.remove();
        super.destroy();
    }

    async loadScene() {
        registerLoaderPlugin(new VitscnjLoaderPlugin({ bg2ioPath: 'bg2io/' }));
        registerComponents();
        const root = await loadNativeScene('./resources/lightmap-test/lightmap-test.json');
        if (!CameraComponent.GetMain(root)) throw new Error('The lightmap scene has no camera');
        return root;
    }


}

window.onload = async () => {
    try {
        const element = document.getElementById('gl-canvas') as HTMLCanvasElement;
        const canvas = new Canvas(element, new WebGLRenderer());
        const loop = new MainLoop(canvas, new LightmapAppController());
        loop.updateMode = FrameUpdate.AUTO;
        await loop.run();
    } catch (error) {
        console.error(error);
        const message = document.createElement('pre');
        message.textContent = `Unable to load the lightmap example: ${error}`;
        document.body.replaceChildren(message);
    }
};
