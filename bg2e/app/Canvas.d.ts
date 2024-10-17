
import { MainLoop } from './MainLoop';

export type Touch = {
    identifier: number
    x: number
    y: number
    force: number
    rotationAngle: number
    radiusX: number
    radiusY: number
}

export declare function getMouseEventOffset(evt: any, canvas: Canvas) : { x: number, y: number };

export declare function getEventTouches(evt: any, canvas: Canvas) : Touch[];

export default class Canvas {
    static FirstCanvas() : Canvas;

    constructor(domElement: HTMLElement, renderer: any);

    get id() : string;

    async init() : Promise<void>;

    get mainLoop() : MainLoop;

    get renderer() { return this._renderer; }

    get domElement() { return this._domElement; }

    get width() { return this._domElement.clientWidth; }

    get height() { return this._domElement.clientHeight; }

    get viewport() { return { width: this.width, height: this.height, aspectRatio: this.width / this.height }; }

    updateViewportSize() : void;

    screenshot(format: string, width: number, height: number);
}
