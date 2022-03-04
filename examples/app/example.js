import MainLoop, { FrameUpdate } from "bg2e/app/MainLoop";
import Canvas from "bg2e/app/Canvas";
import AppController from "bg2e/app/AppController";
import WebGLRenderer from "bg2e/render/webgl/Renderer";

class MyAppController extends AppController {
    init() {
        console.log("init");
    }

    reshape(width,height) {
        console.log(`reshape - width:${width}, height:${height}`);
        const { gl } = this.renderer;
        gl.viewport(0, 0, width, height);
    }

    frame(delta) {
        console.log(`frame - elapsed time: ${ delta }`);
    }

    display() {
        const { gl } = this.renderer;
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        console.log("display");
    }

    keyDown(evt) {
        console.log(`keyDown - key: ${evt.key}`);
    }

    keyUp(evt) {
        console.log(`keyUp - key: ${evt.key}`);
    }

    mouseUp(evt) {
        console.log(`mouseUp - mouse location: ${evt.x}, ${evt.y}`);
    }

    mouseDown(evt) {
        console.log(`mouseDown - mouse location: ${evt.x}, ${evt.y}`);
    }

    mouseMove(evt) {
        console.log(`mouseMove - mouse location: ${evt.x}, ${evt.y}`);
    }

    mouseOut(evt) {
        console.log(`mouseOut - mouse location: ${evt.x}, ${evt.y}`);
    }

    mouseDrag(evt) {
        console.log(`mouseDrag - mouse location: ${evt.x}, ${evt.y}`);
        this.mainLoop.postRedisplay();
    }

    mouseWheel(evt) {
        console.log(`mouseWheel - mouse location: ${evt.x}, ${evt.y}, delta: ${ evt.delta }`);
        evt.stopPropagation();
    }

    touchStart(evt) {
        console.log(`touchStart`);
    }

    touchMove(evt) {
        console.log(`touchMove`);
    }

    touchEnd(evt) {
        console.log(`touchEnd`);
    }
}

window.onload = async () => {
    const canvas = new Canvas(document.getElementById('gl-canvas'), new WebGLRenderer());
    const appController = new MyAppController();
    const mainLoop = new MainLoop(canvas, appController);
    mainLoop.updateMode = FrameUpdate.MANUAL;
    await mainLoop.run();
}
