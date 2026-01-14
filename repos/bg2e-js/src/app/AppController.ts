import MouseEvent from "./MouseEvent";
import KeyboardEvent from "./KeyboardEvent";
import TouchEvent from "./TouchEvent";

export default class AppController {
    _mainLoop: any;

    constructor() {
        this._mainLoop = null;
    }

    get mainLoop(): any { return this._mainLoop; }
    set mainLoop(ml: any) { this._mainLoop = ml; }

    get canvas(): any { return this._mainLoop?.canvas; }

    get renderer(): any { return this._mainLoop?.canvas?.renderer; }

    get viewport(): { width: number; height: number; aspectRatio: number } { 
        return this.canvas?.viewport || { width: 0, height: 0, aspectRatio: 0 }; 
    }

    async init(): Promise<void> {}
    reshape(width: number, height: number): void {}
    async frame(delta: number): Promise<void> {}
    display(): void {}
    destroy(): void {}
    keyDown(evt: KeyboardEvent): void {}
    keyUp(evt: KeyboardEvent): void {}
    mouseUp(evt: MouseEvent): void {}
    mouseDown(evt: MouseEvent): void {}
    mouseMove(evt: MouseEvent): void {}
    mouseOut(evt: MouseEvent): void {}
    mouseDrag(evt: MouseEvent): void {}
    mouseWheel(evt: MouseEvent): void {}
    touchStart(evt: TouchEvent): void {}
    touchMove(evt: TouchEvent): void {}
    touchEnd(evt: TouchEvent): void {}
}
