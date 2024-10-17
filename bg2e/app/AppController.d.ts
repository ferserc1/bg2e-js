
import MainLoop from './MainLoop';
import Canvas from './Canvas';
import MouseEvent from  './MouseEvent';
import TouchEvent from './TouchEvent';
import KeyboardEvent from './KeyboardEvent';
import Renderer from '../render/Renderer';

export default class AppController {
    constructor();

    get mainLoop() ; MainLoop;
    set mainLoop(ml: MainLoop);

    get canvas() : Canvas;

    get renderer() : Renderer;

    get viewport() : { width: number, height: number, aspectRatio: number };

    async init();
    reshape(width: number, height: number);
    async frame(delta: number);
    display();
    destroy();
    keyDown(evt: KeyboardEvent);
    keyUp(evt: KeyboardEvent);
    mouseUp(evt: MouseEvent);
    mouseDown(evt: MouseEvent);
    mouseMove(evt: MouseEvent);
    mouseOut(evt: MouseEvent);
    mouseDrag(evt: MouseEvent);
    mouseWheel(evt: MouseEvent);
    touchStart(evt: TouchEvent);
    touchMove(evt: TouchEvent);
    touchEnd(evt: TouchEvent);
}
