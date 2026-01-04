
import ImageResourceProvider from "./ImageResourceProvider.js";
import VideoResourceProvider from "./VideoResourceProvider.js";
import BinaryResourceProvider from "./BinaryResourceProvider.js";
import TextResourceProvider from "./TextResourceProvider.js";
import ResourceProvider from "./ResourceProvider.js";

interface WriteStrategy {
    writeBytes(url: string, data: Uint8Array): Promise<void>;
    writeImage(url: string, data: HTMLImageElement): Promise<void>;
    writeText(url: string, data: string): Promise<void>;
    writeJson(url: string, data: any): Promise<void>;
}

interface ResourceConstructorOptions {
    imageProvider?: ImageResourceProvider | null;
    videoProvider?: VideoResourceProvider | null;
    binaryProvider?: BinaryResourceProvider | null;
    textProvider?: TextResourceProvider | null;
    writeStrategy?: WriteStrategy | null;
}

export enum ResourceType {
    PolyList = 'PolyList',   // Array of meshes
    Drawable = 'Drawable',
    Node = 'Node',
    Texture = 'Texture',
    Material = 'Material'
}

export const getExtension = (url: string): string => {
    const reResult = /\.([a-z0-9]+)$/i.exec(url);
    if (reResult) {
        return reResult[1];
    }
    else {
        return "";
    }
}

export const getFileName = (url: string): string => {
    const reResult = /(.+)\/(.+)$/.exec(url);
    if (reResult) {
        return reResult[2];
    }
    else {
        return url;
    }
}

export const removeExtension = (url: string): string => {
    const reResult = /(.+)\.(.+)$/.exec(url);
    if (reResult) {
        return reResult[1];
    }
    else {
        return url;
    }
}

export const removeFileName = (url: string): string => {
    const i = url.lastIndexOf('/');
    if (i != -1) {
        return url.substring(0,i + 1);
    }
    return url;
}

export const isAbsolute = (url: string): boolean => {
    return /^http|^\//i.test(url);
}

export const jointUrl = (base: string, append: string): string => {
    if (base[base.length - 1] !== '/' && append[0] !== '/') {
        return `${base}/${append}`;
    }
    else if ((base[base.length - 1] === '/' && append[0] !== '/') ||
             (base[base.length - 1] !== '/' && append[0] === '/')) {
        return `${base}${append}`;
    }
    else {
        return `${base}${append.slice(1)}`;
    }
}

export const isFormat = (url: string, formats: string[]): boolean => formats.some(fmt => (new RegExp(`\.${fmt}`,'i')).test(url));

export const addFormats = (fmts: string | string[], dst: string[]): void => {
    if (!Array.isArray(fmts)) {
        fmts = [fmts]
    }
    fmts.forEach(fmt => {
        if (dst.indexOf(fmt) === -1) {
            dst.push(fmt);
        }
    });
}


const g_validImageFormats = [
    "jpg",
    "jpeg",
    "gif",
    "png"
];

export const isValidImage = (url: string): boolean => isFormat(url,g_validImageFormats);

export const addImageFormats = (fmts: string | string[]): void => {
    addFormats(fmts, g_validImageFormats);
}

export const getValidImageFormats = (): string[] => g_validImageFormats;

const g_validVideoFormats = [
    "mp4",
    "m4v"
];

export const isValidVideo = (url: string): boolean => isFormat(url,g_validVideoFormats);

export const addVideoFormats = (fmts: string | string[]): void => {
    addFormats(fmts, g_validVideoFormats);
}

export const getValidVideoFormats = (): string[] => g_validVideoFormats;

const g_validBinaryFormats = [
    "vwglb",
    "bg2"
];

export const isValidBinary = (url: string): boolean => isFormat(url, g_validBinaryFormats);

export const addBinaryFormats = (fmts: string | string[]): void => {
    addFormats(fmts, g_validBinaryFormats);
}

export const getValidBinaryFormats = (): string[] => g_validBinaryFormats;

export default class Resource {
    private _imageProvider: ImageResourceProvider;
    private _videoProvider: VideoResourceProvider;
    private _binaryProvider: BinaryResourceProvider;
    private _textProvider: TextResourceProvider;
    private _writeStrategy?: WriteStrategy;

    constructor({
        imageProvider = null,
        videoProvider = null,
        binaryProvider = null,
        textProvider = null,
        writeStrategy = undefined
    }: ResourceConstructorOptions = {}) {
        this._imageProvider = imageProvider || new ImageResourceProvider();
        this._videoProvider = videoProvider || new VideoResourceProvider();
        this._binaryProvider = binaryProvider || new BinaryResourceProvider();
        this._textProvider = textProvider || new TextResourceProvider();

        if (writeStrategy) {
            this.writeStrategy = writeStrategy;
        }
    }

    set writeStrategy(ws: WriteStrategy | undefined) {
        this._writeStrategy = ws;

        if (ws) {
            this._imageProvider.writeStrategy = ws;
            this._videoProvider.writeStrategy = ws;
            this._binaryProvider.writeStrategy = ws;
            this._textProvider.writeStrategy = ws;
        }
    }

    get writeStrategy(): WriteStrategy | undefined {
        return this._writeStrategy;
    }

    getProvider(url: string): ResourceProvider {
        switch (true) {
        case isValidImage(url):
            return this._imageProvider;
        case isValidVideo(url):
            return this._videoProvider;
        case isValidBinary(url):
            return this._binaryProvider;
        default:
            return this._textProvider;
        }
    }

    async load(url: string): Promise<any> {
        const provider = this.getProvider(url);
        const data = await provider.load(url);
        return data;
    }

    async write(url: string, data: any): Promise<void> {
        const provider = this.getProvider(url);
        return await provider.write(url,data);
    }
}
