
export default class Canvas {
    constructor(domElement,renderer) {
        this._renderer = renderer;

        this._domElement = domElement;
        this._domElement.style.pointerEvents = 'none';

        // Initialized in mainLoop constructor
        this._mainLoop = null;
    }

    async init() {
        await this._renderer.init(this._domElement);
    }

    get mainLoop() { return this._mainLoop; }

    get renderer() { return this._renderer; }

    get domElement() { return this._domElement; }

    get width() { return this._domElement.clientWidth; }

    get height() { return this._domElement.clientHeight; }

    get viewport() { return { width: this.width, height: this.height, aspectRatio: this.width / this.height }; }

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
