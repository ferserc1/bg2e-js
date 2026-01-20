
import WebGLRenderer from '../render/webgl/Renderer';
import type Texture from '../base/Texture';

export default class WebGLTextureViewer {
    private _renderer: WebGLRenderer;
    private _size: [number, number];
    private _canvas: HTMLCanvasElement;
    private _context: CanvasRenderingContext2D | null;

    constructor(renderer: WebGLRenderer) {
        if (!(renderer instanceof WebGLRenderer)) {
            throw new Error("WebGLTextureViewer works only with WebGL Renderer");
        }

        this._renderer = renderer;

        this._size = [512,512];

        this._canvas = document.createElement('canvas');
        this._canvas.width = this._size[0];
        this._canvas.height = this._size[1];
        this._context = this._canvas.getContext('2d');
    }

    get canvas(): HTMLCanvasElement { return this._canvas; }
    get context(): CanvasRenderingContext2D | null { return this._context; }

    attachToElement(element: HTMLElement): void {
        element.appendChild(this._canvas);
    }

    drawTexture(texture: Texture): void {
        const { gl } = this._renderer;
        const textureWithApi = texture as any;

        if (!textureWithApi._apiObject) {
            throw new Error("Error drawing WebGL texture: WebGL texture not initialized");
        }

        this._canvas.width = texture.size.width;
        this._canvas.height = texture.size.height;

        // Save current state
        const currentTexture = gl.getParameter(gl.TEXTURE_BINDING_2D);
        const currentFramebuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);

        // Draw texture to canvas
        gl.bindTexture(gl.TEXTURE_2D, textureWithApi._apiObject);
        
        // Create a framebuffer to read the texture data
        const framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textureWithApi._apiObject, 0);
        
        // Read texture data
        let data = new Uint8Array(texture.size.width * texture.size.height * 4);
        gl.readPixels(0, 0, texture.size[0], texture.size[1], gl.RGBA, gl.UNSIGNED_BYTE, data);

        // Draw texture data to canvas
        const imageData = new ImageData(new Uint8ClampedArray(data), texture.size.width, texture.size.height);
        const w = imageData.width, h = imageData.height;
        const flipped = imageData.data;
        Array.from({length: h}, (val, i) => data.slice(i * w * 4, (i + 1) * w * 4))
                .forEach((val, i) => flipped.set(val, (h - i - 1) * w * 4));
        const ctx = this._context;
        if (ctx) {
            ctx.putImageData(imageData, 0, 0);
        }

        // Restore previous state
        gl.bindTexture(gl.TEXTURE_2D, currentTexture);
        gl.bindFramebuffer(gl.FRAMEBUFFER, currentFramebuffer);
    }
}
