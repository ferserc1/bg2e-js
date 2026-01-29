
import { app, render } from "bg2e-js";

const {
	MainLoop,
	FrameUpdate,
	Canvas,
	AppController
} = app;

const {
	WebGLRenderer
} = render;


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

    keyDown(evt: KeyboardEvent) {
        console.log(`keyDown - key: ${evt.key}`);
    }

    keyUp(evt: KeyboardEvent) {
        console.log(`keyUp - key: ${evt.key}`);
    }

    mouseUp(evt: MouseEvent) {
        console.log(`mouseUp - mouse location: ${evt.x}, ${evt.y}`);
    }

    mouseDown(evt: MouseEvent) {
        console.log(`mouseDown - mouse location: ${evt.x}, ${evt.y}`);
    }

    mouseMove(evt: MouseEvent) {
        console.log(`mouseMove - mouse location: ${evt.x}, ${evt.y}`);
    }

    mouseOut(evt: MouseEvent) {
        console.log(`mouseOut - mouse location: ${evt.x}, ${evt.y}`);
    }

    mouseDrag(evt: MouseEvent) {
        console.log(`mouseDrag - mouse location: ${evt.x}, ${evt.y}`);
        this.mainLoop.postRedisplay();
    }

    mouseWheel(evt: MouseEvent) {
        console.log(`mouseWheel - mouse location: ${evt.x}, ${evt.y}, delta: ${ evt.delta }`);
        evt.stopPropagation();
    }

    touchStart(evt: TouchEvent) {
        console.log(`touchStart`);
    }

    touchMove(evt: TouchEvent) {
        console.log(`touchMove`);
    }

    touchEnd(evt: TouchEvent) {
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
