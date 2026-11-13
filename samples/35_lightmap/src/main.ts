import Canvas from "bg2e-js/ts/app/Canvas.ts";
import MainLoop, { FrameUpdate } from "bg2e-js/ts/app/MainLoop.ts";
import Loader, { registerLoaderPlugin } from "bg2e-js/ts/db/Loader.ts";
import VitscnjLoaderPlugin from "bg2e-js/ts/db/VitscnjLoaderPlugin.ts";
import SceneAppController from "bg2e-js/ts/render/SceneAppController.ts";
import WebGLSceneRenderer from "bg2e-js/ts/render/webgl/SceneRenderer.ts";
import WebGLRenderer from "bg2e-js/ts/render/webgl/Renderer.ts";
import CameraComponent from "bg2e-js/ts/scene/Camera.ts";
import { registerComponents } from "bg2e-js/ts/scene/index.ts";

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
        const soft = document.createElement('input');
        soft.type = 'checkbox';
        soft.addEventListener('change', () => { this.sceneRenderer!.softShadows = soft.checked; });
        panel.append(document.createElement('br'), soft, ' Soft shadows');
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
        const root = await new Loader().loadNode('./resources/lightmap-test/lightmap-test.json');
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
