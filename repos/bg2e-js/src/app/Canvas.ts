import { generateUUID } from "../tools/crypto";

export const getMouseEventOffset = (evt: any, canvas: Canvas): { x: number; y: number } => {
    const offset = canvas.domElement.getBoundingClientRect();
    return {
        x: evt.clientX - offset.left,
        y: evt.clientY - offset.top
    };
}

export const getEventTouches = (evt: any, canvas: Canvas): any[] => {
    const offset = canvas.domElement.getBoundingClientRect();
    const touches = Array.from(evt.touches).map((touch: any) => {
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

let g_firstCanvas: Canvas | null = null;

export default class Canvas {
    private _renderer: any;
    private _domElement: HTMLCanvasElement;
    _mainLoop: any;

    static FirstCanvas(): Canvas {
        if (!g_firstCanvas) {
            throw new Error("No Canvas instance has been created yet.");
        }
        return g_firstCanvas;
    }

    constructor(domElement: HTMLCanvasElement, renderer: any) {
        this._renderer = renderer;
        this._domElement = domElement;
        (this._domElement as any)._bg2e_id = generateUUID();

        g_firstCanvas = g_firstCanvas || this;

        // Initialized in mainLoop constructor
        this._mainLoop = null;
    }

    get id(): string {
        return (this._domElement as any)._bg2e_id;
    }

    async init(): Promise<void> {
        await this._renderer.init(this);
    }

    get mainLoop(): any { return this._mainLoop; }

    get renderer(): any { return this._renderer; }

    get domElement(): HTMLCanvasElement { return this._domElement; }

    get width(): number { return this._domElement.clientWidth; }

    get height(): number { return this._domElement.clientHeight; }

    get viewport(): { width: number; height: number; aspectRatio: number } { return { width: this.width, height: this.height, aspectRatio: this.width / this.height }; }

    updateViewportSize(): void {
        const sizeInPx = { w: this.domElement.clientWidth, h: this.domElement.clientHeight };
        this.domElement.width = sizeInPx.w * window.devicePixelRatio;
        this.domElement.height = sizeInPx.h * window.devicePixelRatio;
    }

    screenshot(format?: string, width?: number, height?: number): string {
        let canvasStyle = "";
        const prevSize = {
            width: 0,
            height: 0
        };

        if (width) {
            height = height ? height : width;
            canvasStyle = this.domElement.style.cssText;
            prevSize.width = this.domElement.width;
            prevSize.height = this.domElement.height;

            this.domElement.style.cssText = `top:auto;left:auto;bottom:auto;right:auto;width:${width}px;height:${height}px;`;
            this.domElement.width = width;
            this.domElement.height = height;
            this.mainLoop.appController.reshape(width, height);
            this.mainLoop.appController.display();
        }

        const data = this.domElement.toDataURL(format);
        if (width) {
            this.domElement.style.cssText = canvasStyle;
            this.domElement.width = prevSize.width;
            this.domElement.height = prevSize.height;
            this.mainLoop.appController.reshape(prevSize.width, prevSize.height);
            this.mainLoop.appController.display();
        }
        return data;
    }
}
