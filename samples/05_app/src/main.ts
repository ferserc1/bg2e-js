
import { app, render } from "bg2e-js/ts";

const {
	MainLoop,
	FrameUpdate,
	Canvas,
	AppController
} = app;

const {
	WebGLRenderer
} = render;

import Bg2KeyboardEvent from "bg2e-js/ts/app/Bg2KeyboardEvent.ts";
import Bg2MouseEvent from "bg2e-js/ts/app/Bg2MouseEvent.ts";
import Bg2TouchEvent from "bg2e-js/ts/app/Bg2TouchEvent.ts";


class MyAppController extends AppController {
    async init() {
        console.log("init");
    }

    reshape(width: number, height: number) {
        console.log(`reshape - width:${width}, height:${height}`);
        const { gl } = this.renderer;
        gl.viewport(0, 0, width, height);
    }

    async frame(delta: number) {
        console.log(`frame - elapsed time: ${ delta }`);
    }

    display() {
        const { gl } = this.renderer;
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        console.log("display");
    }

    keyDown(evt: Bg2KeyboardEvent) {
        console.log(`keyDown - key: ${evt.key}`);
    }

    keyUp(evt: Bg2KeyboardEvent) {
        console.log(`keyUp - key: ${evt.key}`);
    }

    mouseUp(evt: Bg2MouseEvent) {
        console.log(`mouseUp - mouse location: ${evt.x}, ${evt.y}`);
    }

    mouseDown(evt: Bg2MouseEvent) {
        console.log(`mouseDown - mouse location: ${evt.x}, ${evt.y}`);
    }

    mouseMove(evt: Bg2MouseEvent) {
        console.log(`mouseMove - mouse location: ${evt.x}, ${evt.y}`);
    }

    mouseOut(evt: Bg2MouseEvent) {
        console.log(`mouseOut - mouse location: ${evt.x}, ${evt.y}`);
    }

    mouseDrag(evt: Bg2MouseEvent) {
        console.log(`mouseDrag - mouse location: ${evt.x}, ${evt.y}`);
        this.mainLoop.postRedisplay();
    }

    mouseWheel(evt: Bg2MouseEvent) {
        console.log(`mouseWheel - mouse location: ${evt.x}, ${evt.y}, delta: ${ evt.delta }`);
        evt.stopPropagation();
    }

    touchStart(evt: Bg2TouchEvent) {
        console.log(`touchStart`);
    }

    touchMove(evt: Bg2TouchEvent) {
        console.log(`touchMove`);
    }

    touchEnd(evt: Bg2TouchEvent) {
        console.log(`touchEnd`);
    }
}

window.onload = async () => {
    const canvasElem = document.getElementById('gl-canvas') as HTMLCanvasElement;
    if (!canvasElem) {
        console.error("Cannot find canvas element with id 'gl-canvas'");
        return;
    }
    const canvas = new Canvas(canvasElem, new WebGLRenderer());
    const appController = new MyAppController();
    const mainLoop = new MainLoop(canvas, appController);
    mainLoop.updateMode = FrameUpdate.MANUAL;
    await mainLoop.run();
}
