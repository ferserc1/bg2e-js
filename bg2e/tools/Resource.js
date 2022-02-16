
import ImageResourceProvider from "./ImageResourceProvider.js";
import VideoResourceProvider from "./VideoResourceProvider.js";
import BinaryResourceProvider from "./BinaryResourceProvider.js";
import TextResourceProvider from "./TextResourceProvider.js";

export const getExtension = (url) => {
    const reResult = /\.([a-z0-9]+)$/i.exec(url);
    if (reResult) {
        return reResult[1];
    }
    else {
        return "";
    }
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
        textProvider = null 
    } = {}) {
        this._imageProvider = imageProvider || new ImageResourceProvider();
        this._videoProvider = videoProvider || new VideoResourceProvider();
        this._binaryProvider = binaryProvider || new BinaryResourceProvider();
        this._textProvider = textProvider || new TextResourceProvider();
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
}
