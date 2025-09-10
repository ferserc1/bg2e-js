import { generateUUID } from "../tools/crypto";

export const getMouseEventOffset = (evt,canvas) => {
    const offset = canvas.domElement.getBoundingClientRect();
    return {
        x: evt.clientX - offset.left,
        y: evt.clientY - offset.top
    };
}

export const getEventTouches = (evt,canvas) => {
    const offset = canvas.domElement.getBoundingClientRect();
    const touches = Array.from(evt.touches).map(touch => {
        return {
            identifier: touch.identifier,
            x: touch.clientX - offset.left,
            y: touch.clientY - offset.top,
            force: touch.force,
            rotationAngle: touch.rotationAngle,
            radiusX: touch.radiusX,
            radiusY: touch.radiusY
        };
    });
    return touches;
}

let g_firstCanvas = null;

export default class Canvas {
    static FirstCanvas() {
        return g_firstCanvas;
    }

    constructor(domElement,renderer) {
        this._renderer = renderer;
        this._domElement = domElement;
        this._domElement._bg2e_id = generateUUID();

        g_firstCanvas = g_firstCanvas || this;

        // Initialized in mainLoop constructor
        this._mainLoop = null;
    }

    get id() {
        return this._domElement._bg2e_id;
    }

    async init() {
        await this._renderer.init(this);
    }

    get mainLoop() { return this._mainLoop; }

    get renderer() { return this._renderer; }

    get domElement() { return this._domElement; }

    get width() { return this._domElement.clientWidth; }

    get height() { return this._domElement.clientHeight; }

    get viewport() { return { width: this.width, height: this.height, aspectRatio: this.width / this.height }; }

    updateViewportSize() {
        const sizeInPx = { w: this.domElement.clientWidth, h: this.domElement.clientHeight };
        this.domElement.width = sizeInPx.w * window.devicePixelRatio;
        this.domElement.height = sizeInPx.h * window.devicePixelRatio;
    }

    screenshot(format, width, height) {
        let canvasStyle = "";
        const prevSize = {};

        if (width) {
            height = height ? height : width;
            canvasStyle = this.domElement.style.cssText;
            prevSize.width = this.domElement.width;
            prevSize.height = this.domElement.height;

            this.domElement.style.cssText = `top:auto;left:auto;bottom:auto;right:auto;width:${width}px;height:${height}px;`;
            this.domElement.width = width;
            this.domElement.height = height;
            this.mainLoop.appController.reshape(width,height);
            this.mainLoop.appController.display();
        }

        const data = this.domElement.toDataURL(format);
        if (width) {
            this.domElement.cssText = canvasStyle;
            this.domElement.width = prevSize.width;
            this.domElement.height = prevSize.height;
            this.mainLoop.appController.reshape(prevSize.width, prevSize.heigth);
            this.mainLoop.appController.display();
        }
        return data;
    }
}
