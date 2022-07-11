
import ImageResourceProvider from "./ImageResourceProvider.js";
import VideoResourceProvider from "./VideoResourceProvider.js";
import BinaryResourceProvider from "./BinaryResourceProvider.js";
import TextResourceProvider from "./TextResourceProvider.js";

export const ResourceType = {
    PolyList: 'PolyList',   // Array of meshes
    Drawable: 'Drawable',
    Node: 'Node',
    Texture: 'Texture',
    Material: 'Material'
};

export const getExtension = (url) => {
    const reResult = /\.([a-z0-9]+)$/i.exec(url);
    if (reResult) {
        return reResult[1];
    }
    else {
        return "";
    }
}

export const getFileName = (url) => {
    const reResult = /(.+)\/(.+)$/.exec(url);
    if (reResult) {
        return reResult[2];
    }
    else {
        return url;
    }
}

export const removeExtension = (url) => {
    const reResult = /(.+)\.(.+)$/.exec(url);
    if (reResult) {
        return reResult[1];
    }
    else {
        return url;
    }
}

export const removeFileName = (url) => {
    const i = url.lastIndexOf('/');
    if (i != -1) {
        return url.substring(0,i + 1);
    }
    return url;
}

export const isFormat = (url,formats) => formats.some(fmt => (new RegExp(`\.${fmt}`,'i')).test(url));

export const addFormats = (fmts, dst) => {
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

export const isValidImage = (url) => isFormat(url,g_validImageFormats);

export const addImageFormats = (fmts) => {
    addFormats(fmts, g_validImageFormats);
}

export const getValidImageFormats = () => g_validImageFormats;

const g_validVideoFormats = [
    "mp4",
    "m4v"
];

export const isValidVideo = (url) => isFormat(url,g_validVideoFormats);

export const addVideoFormats = (fmts) => {
    addFormats(fmts, g_validVideoFormats);
}

export const getValidVideoFormats = () => g_validVideoFormats;

const g_validBinaryFormats = [
    "vwglb",
    "bg2"
];

export const isValidBinary = (url) => isFormat(url, g_validBinaryFormats);

export const addBinaryFormats = (fmts) => {
    addFormats(fmts, g_validBinaryFormats);
}

export const getValidBinaryFormats = () => g_validBinaryFormats;

export default class Resource {

    constructor({
        imageProvider = null,
        videoProvider = null,
        binaryProvider = null,
        textProvider = null,
        writeStrategy = null
    } = {}) {
        this._imageProvider = imageProvider || new ImageResourceProvider();
        this._videoProvider = videoProvider || new VideoResourceProvider();
        this._binaryProvider = binaryProvider || new BinaryResourceProvider();
        this._textProvider = textProvider || new TextResourceProvider();
        this.writeStrategy = writeStrategy;
    }

    set writeStrategy(ws) {
        this._writeStrategy = ws;

        this._imageProvider.writeStrategy = ws;
        this._videoProvider.writeStrategy = ws;
        this._binaryProvider.writeStrategy = ws;
        this._textProvider.writeStrategy = ws;
    }

    get writeStrategy() {
        return this._writeStrategy;
    }

    getProvider(url) {
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

    async load(url) {
        const provider = this.getProvider(url);
        const data = await provider.load(url);
        return data;
    }

    async write(url,data) {
        const provider = this.getProvider(url);
        return await provider.write(url,data);
    }
}
