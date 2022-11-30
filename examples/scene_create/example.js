import AppController from "bg2e/app/AppController";
import Canvas from "bg2e/app/Canvas";
import MainLoop, { FrameUpdate } from "bg2e/app/MainLoop";
import Mat4 from "bg2e/math/Mat4";
import WebGLRenderer from "bg2e/render/webgl/Renderer";
import Node from "bg2e/scene/Node";
import Transform from "bg2e/scene/Transform";
import { registerComponents } from "bg2e/scene";
import LightComponent from "bg2e/scene/LightComponent";
import { LightType } from "bg2e/base/Light";

class MyAppController extends AppController {
    createScene() {
        const root = new Node("scene root");

        const addLight = ({ color, position, type, intensity }) => {
            const lightNode = new Node("Light node");
            lightNode.addComponent(new LightComponent());
            lightNode.lightComponent.setProperties({ color, position, type, intensity });
            return lightNode;
        }

        root.addChild(addLight({ position: [10.0, 10.0, -10.0], color: [1, 0.3, 0.1], intensity:300, lightType: LightType.POINT }));
        root.addChild(addLight({ position: [-10.0, 10.0, -10.0], color: [0.3, 1, 0.1], intensity:300, lightType: LightType.POINT }));
        root.addChild(addLight({ position: [-10.0,-10.0, -10.0], color: [0.1, 0.3, 1], intensity:300, lightType: LightType.POINT }));
        root.addChild(addLight({ position: [ 10.0,-10.0, -10.0], color: [0.1, 1, 0.3], intensity:300, lightType: LightType.POINT }));

        
    }

    async init() {
        registerComponents();
        this._sceneRoot = this.createScene();

        console.log(this._sceneRoot);
    }

    reshape(width,height) {

    }

    frame(delta) {

    }

    display() {

    }

    destroy() {

    }

    keyUp(evt) {

    }

    mouseWheel(evt) {

    }

    mouseDown(evt) {

    }

    mouseDrag(evt) {

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