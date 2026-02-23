import Loader, { registerLoaderPlugin } from "bg2e-js/ts/db/Loader.ts";
import VitscnjLoaderPlugin from "bg2e-js/ts/db/VitscnjLoaderPlugin.ts";
import Vec from "bg2e-js/ts/math/Vec.ts";
import SceneAppController from "bg2e-js/ts/render/SceneAppController.ts";
import CameraComponent, { OpticalProjectionStrategy } from "bg2e-js/ts/scene/Camera.ts";
import OrbitCameraController from "bg2e-js/ts/scene/OrbitCameraController.ts";
import { registerComponents } from "bg2e-js/ts/scene/index.ts";

export default class MyAppController extends SceneAppController {
    get selectionManagerEnabled() {
        return true;
    }

    get selectionHighlightEnabled() {
        return true;
    }

    async loadScene() {
        registerLoaderPlugin(new VitscnjLoaderPlugin({ bg2ioPath: "dist/" }));
        registerComponents();

        // Load scene
        const loader = new Loader();
        const root = await loader.loadNode("../resources/test-scene/test-scene.vitscnj");

        // Get main camera
        // Add Orbit camera controller component to the camera node
        const mainCamera = CameraComponent.GetMain(root);
        if (mainCamera) {
            const strategy = new OpticalProjectionStrategy();
            strategy.focalLength = 55;
            strategy.frameSize = 35;
            mainCamera.projectionStrategy = strategy;
            const cameraController = mainCamera.node.component("OrbitCameraController") as OrbitCameraController;
            if (cameraController) {
                cameraController.center = new Vec(0,1,0);
                cameraController.distance = 10;
            }
        }

        return root;
    }

    async loadDone(): Promise<void> {
        this.selectionManager?.setMultiSelectMode(true);
    }
}
