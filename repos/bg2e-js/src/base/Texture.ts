
import Vec from '../math/Vec';
import Resource from '../tools/Resource';
import { generateImageHash } from '../tools/image';
import Color from './Color';
import Canvas from '../app/Canvas';

export enum TextureDataType {
    NONE = 0,
    IMAGE = 1,
    IMAGE_DATA = 2,
    CUBEMAP = 3,
    CUBEMAP_DATA = 4,
    VIDEO = 5,
    PROCEDURAL = 6,
    RENDER_TARGET = 7
}

export enum TextureWrap {
    REPEAT = 0,
    CLAMP = 1,
    MIRRORED_REPEAT = 2
}

export enum TextureFilter {
    NEAREST_MIPMAP_NEAREST = 0,
    LINEAR_MIPMAP_NEAREST = 1,
    NEAREST_MIPMAP_LINEAR = 2,
    LINEAR_MIPMAP_LINEAR = 3,
    NEAREST = 4,
    LINEAR = 5
}

export enum TextureTarget {
    TEXTURE_2D = 0,
    CUBE_MAP = 1
}

export enum ProceduralTextureFunction {
    PLAIN_COLOR = 0,
    RANDOM_NOISE = 1,
    DYNAMIC_CUBEMAP = 2,
    FROM_BASE64 = 3,
    CANVAS_2D = 4
}

export enum TextureRenderTargetAttachment {
    COLOR_ATTACHMENT_0 = 0,
    COLOR_ATTACHMENT_1 = 1,
    COLOR_ATTACHMENT_2 = 2,
    COLOR_ATTACHMENT_3 = 3,
    COLOR_ATTACHMENT_4 = 4,
    COLOR_ATTACHMENT_5 = 5,
    COLOR_ATTACHMENT_6 = 6,
    COLOR_ATTACHMENT_7 = 7,
    COLOR_ATTACHMENT_8 = 8,
    COLOR_ATTACHMENT_9 = 9,
    COLOR_ATTACHMENT_10 = 10,
    COLOR_ATTACHMENT_11 = 11,
    COLOR_ATTACHMENT_12 = 12,
    COLOR_ATTACHMENT_13 = 13,
    COLOR_ATTACHMENT_14 = 14,
    COLOR_ATTACHMENT_15 = 15,
    DEPTH_ATTACHMENT = 100,
    STENCIL_ATTACHMENT = 200
}

export enum TextureComponentFormat {
    UNSIGNED_BYTE = 0,
    FLOAT32 = 1
}

export enum TextureChannel {
    R = 1,
    G = 2,
    B = 3,
    A = 4
}

interface ExtendedHTMLImageElement extends HTMLImageElement {
    _hash?: string;
}

interface RenderTargetImageData {
    currentSize: Vec;
}

interface ProceduralCanvasParameters {
    canvas?: HTMLCanvasElement;
}

interface ProceduralBase64Parameters {
    imageData?: string;
}

type TextureImageData = ExtendedHTMLImageElement | RenderTargetImageData | null;

const g_loadedImages: Record<string, Promise<HTMLImageElement> | null> = {};
let g_resource: Resource | null = null;
const g_loadPromises: Record<string, Promise<HTMLImageElement> | null> = {};
const loadImageFromFile = async (fileUrl: string): Promise<HTMLImageElement> => {
    if (!g_resource) {
        g_resource = new Resource();
    }

    if (g_loadPromises[fileUrl]) {
        console.log(`Image already loaded or loading: ${fileUrl}`);
    }
    else {
        console.log(`Loading image: ${fileUrl}`);
        g_loadPromises[fileUrl] = new Promise(async (resolve, reject) => {
            const image = await g_resource?.load(fileUrl);
            // Flip image Y coord
            const canvas = document.createElement("canvas");
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
    
            const ctx = canvas.getContext('2d');
            ctx!.fillStyle = '#00000000';
            ctx!.clearRect(0, 0, canvas.width, canvas.height);
            ctx!.fillRect(0, 0, canvas.width, canvas.height);
            ctx!.scale(1, -1);
            ctx!.drawImage(image, 0, 0, canvas.width, -canvas.height);
            const flipImage = new Image();
            const loadFlipImage = () => {
                return new Promise<void>(resolve => {
                    flipImage.onload = () => {
                        (flipImage as any)._hash = generateImageHash(flipImage);
                        resolve();
                    }
                    flipImage.src = canvas.toDataURL();
                })
            } 
            await loadFlipImage();    
            
            resolve(flipImage);
        })
    }

    return g_loadPromises[fileUrl];
}
const loadBase64Image = async (base64Img: string): Promise<HTMLImageElement> => {
    const loadImage = () => {
        return new Promise<HTMLImageElement>(resolve => {
            const image = new Image();
            image.onload = () => {
                resolve(image);
            }
            image.src = base64Img;
        });
    }

    const image = await loadImage();
    
    // Flip image Y coord
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const ctx = canvas.getContext('2d');
    ctx!.fillRect(0, 0, canvas.width, canvas.height);
    ctx!.scale(1, -1);
    ctx!.drawImage(image, 0, 0, canvas.width, -canvas.height);
    const flipImage = new Image();
    const loadFlipImage = () => {
        return new Promise<void>(resolve => {
            flipImage.onload = () => {
                (flipImage as any)._hash = generateImageHash(flipImage);
                resolve();
            }
            flipImage.src = canvas.toDataURL("image/png");
        })
    } 
    await loadFlipImage();    
    
    return flipImage;
}

export default class Texture {
    private _canvas: Canvas;
    private _dirty: boolean;
    private _dataType: TextureDataType;
    private _wrapModeX: TextureWrap;
    private _wrapModeY: TextureWrap;
    private _magFilter: TextureFilter;
    private _minFilter: TextureFilter;
    private _target: TextureTarget;
    private _size: Vec;
    private _fileName: string;
    private _proceduralFunction: ProceduralTextureFunction;
    private _proceduralParameters: any;
    private _renderTargetAttachment: TextureRenderTargetAttachment;
    private _componentFormat: TextureComponentFormat;
    private _imageData: TextureImageData;
    private _references: number;
    private _name: string;
    _renderer?: any;

    constructor(canvas: Canvas | null = null) {
        this._canvas = canvas || Canvas.FirstCanvas();

        // This flag allows to the renderer to know if the texture object
        // has been updated. In this case, the renderer texture must to
        // be regenerated.
        this._dirty = true;

        this._dataType = TextureDataType.NONE;
        this._wrapModeX = TextureWrap.REPEAT;
        this._wrapModeY = TextureWrap.REPEAT;
        this._magFilter = TextureFilter.LINEAR;
        this._minFilter = TextureFilter.LINEAR;
        this._target = TextureTarget.TEXTURE_2D;
        this._size = new Vec(64, 64);
        this._fileName = "";
        this._proceduralFunction = ProceduralTextureFunction.PLAIN_COLOR;
        this._proceduralParameters = {};
        this._renderTargetAttachment = TextureRenderTargetAttachment.COLOR_ATTACHMENT_0;
        this._componentFormat = TextureComponentFormat.UNSIGNED_BYTE;

        // This attribute is generated from the previous attributes, for example,
        // calling loadImageData() after setting the fileName attribute
        this._imageData = null;

        // Reference counter, to know if a texture can be purged
        this._references = 0;

        // Object name, form debugging purposes
        this._name = "";
    }

    get canvas(): Canvas {
        return this._canvas;
    }

    get references(): number {
        return this._references;
    }

    incReferences(): void {
        this._references++;
    }

    decReferences(): void {
        this._references--;
    }

    clone(): Texture {
        const copy = new Texture(this.canvas);
        copy.assign(this);
        return copy;
    }

    assign(other: Texture): void {
        this._dataType = other._dataType;
        this._wrapModeX = other._wrapModeX;
        this._wrapModeY = other._wrapModeY;
        this._magFilter = other._magFilter;
        this._minFilter = other._minFilter;
        this._target = other._target;
        this._size = new Vec(other._size);
        this._fileName = other._fileName;
        this._proceduralFunction = other._proceduralFunction;
        this._proceduralParameters = other._proceduralParameters;
        this._imageData = other._imageData;
        this._renderTargetAttachment = other._renderTargetAttachment;
        this._componentFormat = other._componentFormat;

        this._dirty = true;
    }

    get dirty(): boolean {
        return this._dirty;
    }

    setUpdated(updated: boolean = true): void {
        this._dirty = !updated;
    }

    get dataType(): TextureDataType { return this._dataType; }
    set dataType(v: TextureDataType) {
        this._dataType = v;
        if (!this.isPowerOfTwo) {
            this.wrapModeXY = TextureWrap.CLAMP;
        }
        this.magFilter = TextureFilter.LINEAR;
        this.minFilter = TextureFilter.LINEAR;
        this._dirty = true;
    }

    get isPowerOfTwo(): boolean {
        const pot = (n: number) => n!==0 && (n & (n - 1)) === 0;
        return pot(this.size[0]) && pot(this.size[1]);
    }

    get wrapModeX(): TextureWrap { return this._wrapModeX; }
    set wrapModeX(v: TextureWrap) { this._wrapModeX = v; this._dirty = true; }
    get wrapModeY(): TextureWrap { return this._wrapModeY; }
    set wrapModeY(v: TextureWrap) { this._wrapModeY = v; this._dirty = true; }
    set wrapModeXY(xy: TextureWrap) {
        this.wrapModeX = xy;
        this.wrapModeY = xy;
        this._dirty = true; 
    }
    get magFilter(): TextureFilter { return this._magFilter; }
    set magFilter(v: TextureFilter) {
        if (v === TextureFilter.LINEAR || v === TextureFilter.NEAREST) {
            this._magFilter = v;
            this._dirty = true;
        }
        else {
            console.warn(`Unsupported texture magnification filter: ${TextureFilter[v]}. Command ignored.`);
        }
    }
    get minFilter(): TextureFilter { return this._minFilter; }
    set minFilter(v: TextureFilter) { this._minFilter = v; this._dirty = true; }
    get target(): TextureTarget { return this._target; }
    set target(v: TextureTarget) { this._target = v; this._dirty = true; }
    get size(): Vec { return this._size; }
    set size(v: Vec | number[]) {
        if (!v.length) {
            throw new Error("Invalid parameter specified setting texture size.");
        }
        this._size = new Vec(v[0],v[1]);
        this._dirty = true; 
    }
    get fileName(): string { return this._fileName; }
    set fileName(v: string) { this._fileName = v; this._dirty = true; this._imageData = null; this._name = v; }
    get proceduralFunction(): ProceduralTextureFunction { return this._proceduralFunction; }
    set proceduralFunction(v: ProceduralTextureFunction) { this._proceduralFunction = v; this._dirty = true; }
    get proceduralParameters(): any { return this._proceduralParameters; }
    set proceduralParameters(v: any) {
        if (typeof(v) !== 'object' || !v) {
            throw new Error("Invalid parameter specified setting procedural texture parameters.");
        }
        this._proceduralParameters = v;
        this._dirty = true; 
    }
    get renderTargetAttachment(): TextureRenderTargetAttachment { return this._renderTargetAttachment; }
    set renderTargetAttachment(att: TextureRenderTargetAttachment) { this._renderTargetAttachment = att; this._dirty = true; }
    get componentFormat(): TextureComponentFormat { return this._componentFormat; }
    set componentFormat(fmt: TextureComponentFormat) { this._componentFormat = fmt; this._dirty = true; }

    get mipmapRequired(): boolean {
        return  this._minFilter === TextureFilter.NEAREST_MIPMAP_NEAREST ||
                this._minFilter === TextureFilter.LINEAR_MIPMAP_NEAREST ||
                this._minFilter === TextureFilter.NEAREST_MIPMAP_LINEAR ||
                this._minFilter === TextureFilter.LINEAR_MIPMAP_LINEAR ||
                this._magFilter === TextureFilter.NEAREST_MIPMAP_NEAREST ||
                this._magFilter === TextureFilter.LINEAR_MIPMAP_NEAREST ||
                this._magFilter === TextureFilter.NEAREST_MIPMAP_LINEAR ||
                this._magFilter === TextureFilter.LINEAR_MIPMAP_LINEAR;
    }

    // If imageData === undefined it's because the function loadImageData() has not been called
    get imageData(): TextureImageData {
        return this._imageData;
    }

    // The this._renderer variable is initialized by the texture renderer
    get renderer(): any {
        return this._renderer;
    }

    get name(): string {
        return this._name;
    }

    set name(n: string) {
        this._name = n;
    }

    destroy(): void {
        if (this.renderer) {
            this.renderer.destroy();
        }
    }

    async deserialize(sceneData: any): Promise<void> {
        this._dataType = sceneData.dataType !== undefined ? TextureDataType[sceneData.dataType as keyof typeof TextureDataType] : TextureDataType.NONE;
        this._wrapModeX = sceneData.wrapModeX !== undefined ? TextureWrap[sceneData.wrapModeX as keyof typeof TextureWrap] : TextureWrap.REPEAT;
        this._wrapModeY = sceneData.wrapModeY !== undefined ? TextureWrap[sceneData.wrapModeY as keyof typeof TextureWrap] : TextureWrap.REPEAT;
        this._magFilter = sceneData.magFilter !== undefined ? TextureFilter[sceneData.magFilter as keyof typeof TextureFilter] : TextureFilter.LINEAR;
        this._minFilter = sceneData.minFilter !== undefined ? TextureFilter[sceneData.minFilter as keyof typeof TextureFilter] : TextureFilter.LINEAR;
        this._target = sceneData.target !== undefined ? TextureTarget[sceneData.target as keyof typeof TextureTarget] : TextureTarget.TEXTURE_2D;
        this._size = sceneData.size?.length === 2 ? new Vec(sceneData.size[0], sceneData.size[1]) : new Vec(64, 64);
        this._fileName = sceneData.fileName !== undefined ? sceneData.fileName : "";
        this._proceduralFunction = sceneData.proceduralFunction !== undefined ? ProceduralTextureFunction[sceneData.proceduralFunction as keyof typeof ProceduralTextureFunction] : ProceduralTextureFunction.PLAIN_COLOR;
        this._proceduralParameters = sceneData.proceduralParameters !== undefined ? sceneData.proceduralParameters : {};
        this._renderTargetAttachment = sceneData.renderTargetAttachment !== undefined ? sceneData.renderTargetAttachment : TextureRenderTargetAttachment.COLOR_ATTACHMENT_0;
        this._componentFormat = sceneData.componentFormat !== undefined ? sceneData.componentFormat : TextureComponentFormat.UNSIGNED_BYTE;
        this._name = sceneData.name !== undefined ? sceneData.name : this._name;
        this._dirty = true; 
    }

    async serialize(sceneData: any): Promise<void> {
        sceneData.dataType = TextureDataType[this.dataType];
        sceneData.wrapModeX = TextureWrap[this.wrapModeX];
        sceneData.wrapModeY = TextureWrap[this.wrapModeY];
        sceneData.magFilter = TextureFilter[this.magFilter];
        sceneData.minFilter = TextureFilter[this.minFilter];
        sceneData.target = TextureTarget[this.target];
        sceneData.size = this.size;
        sceneData.fileName = this.fileName;
        sceneData.proceduralFunction = ProceduralTextureFunction[this.proceduralFunction];
        sceneData.proceduralParameters = this.proceduralParameters;
        sceneData.renderTargetAttachment = TextureRenderTargetAttachment[this.renderTargetAttachment];
        sceneData.componentFormat = TextureComponentFormat[this.componentFormat];
        sceneData.name = this._name;
    }

    async loadImageData(refresh: boolean = false): Promise<void> {
        if (this.fileName) {
            if (g_loadedImages[this.fileName] && refresh) {
                delete g_loadedImages[this.fileName];
            }

            let loadPromise = g_loadedImages[this.fileName];
            if (!loadPromise) {
                loadPromise = loadImageFromFile(this.fileName);
                g_loadedImages[this.fileName] = loadPromise;
            }
            else {
                console.debug(`Texture: loadImageData(): image already loaded or is loading: ${this.fileName}`)
            }
            this._imageData = await loadPromise;

            this._size = new Vec((this._imageData as HTMLImageElement).width, (this._imageData as HTMLImageElement).height);

            this._dirty = true; 
        }
        else if (this.dataType === TextureDataType.RENDER_TARGET) {
            // This object will store data to determine if the 
            // texture must to be resized, and other information
            // from the framebuffer
            this._imageData = {
                currentSize: new Vec(this.size)
            };
            this._dirty = true;
        }
        else if (this.proceduralFunction === ProceduralTextureFunction.PLAIN_COLOR) {
            if (this._imageData && refresh === false) {
                return;
            }

            if ((!Array.isArray(this.proceduralParameters) && !(this.proceduralParameters instanceof Vec)) || this.proceduralParameters.length<3) {
                throw new Error("Error generating procedural plain color texture. invalid 'proceduralParameters' set.")
            }
            const color = new Color(this.proceduralParameters);
            const canvas = document.createElement('canvas');
            canvas.width = this.size.x;
            canvas.height = this.size.y;
            const ctx = canvas.getContext('2d');
            ctx!.fillStyle = color.hexColor;
            ctx!.fillRect(0, 0, this.size.x, this.size.y);

            const loadProceduralImage = () => {
                return new Promise<void>(resolve => {
                    this._imageData = new Image();
                    this._imageData.onload = () => {
                        resolve();
                    }
                    this._imageData.src = canvas.toDataURL("image/png");
                    //document.body.appendChild(canvas);
                })
            } 
            await loadProceduralImage();            

            this._dirty = true;
        }
        else if (this.proceduralFunction === ProceduralTextureFunction.FROM_BASE64) {
            if (this._imageData && refresh === false) {
                return;
            }

            if (!/;base64/i.test(this.proceduralParameters?.imageData)) {
                throw new Error("Error generating procedural texture from base64 string. Invalid base64 image");
            }

            this._imageData = await loadBase64Image(this.proceduralParameters.imageData);
            this._size = new Vec(this._imageData.width, this._imageData.height);
            this._dirty = true;
        }
        else if (this.proceduralFunction == ProceduralTextureFunction.CANVAS_2D) {
            if (this._imageData && refresh === false) {
                return;
            }

            const canvas = this.proceduralParameters?.canvas;
            if (!/canvas/i.test(canvas?.tagName)) {
                throw new Error("Error generating procedural texture from HTML canvas. Invalid 'canvas' parameter.");
            }

            const imageData = canvas.toDataURL();
            this._imageData = await loadBase64Image(imageData);
            this._size = new Vec(this._imageData.width, this._imageData.height);
            this._dirty = true;
        }
        else {
            // TODO: load other classes of procedural image data
            throw new Error("Texture: loadImageData(): not implemented");
        }
    }

    async updateImageData(): Promise<void> {
        // TODO: improve this function. It is possible to optimize the
        // texture refresh in some cases
        this.loadImageData(true);
    }

};
