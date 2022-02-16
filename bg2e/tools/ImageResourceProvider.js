
import ResourceProvider from "./ResourceProvider.js";
import { generateUUID } from "./crypto.js";

// In this array we keep a reference to the images being loaded to
// prevent them from being deleted from memory
const g_preventImageDump = [];

const beginLoadImage = (img) => {
    if (g_preventImageDump.indexOf(img) === -1) {
        g_preventImageDump.push(img);
    }
};

const endLoadImage = (img) => {
    const i = g_preventImageDump.indexOf(img);
    if (i !== -1) {
        g_preventImageDump.splice(i, 1);
    }
}

const loadImage = (url,preventCache = false) => {
    return new Promise((resolve,reject) => {
        const img = new Image();
        beginLoadImage(img);
        img.crossOrigin = "";
        img.addEventListener("load", evt => {
            endLoadImage(evt.target);
            resolve(evt.target);
        });
        img.addEventListener("error", evt => {
            endLoadImage(evt.target);
            reject(new Error(`Error loading image '${ url }'.`));
        });
        img.addEventListener("abort", evt => {
            endLoadImage(evt.target);
            reject(new Error(`Image load aborted '${ url }'.`));
        });
        img.src = url + (preventCache ? `?${generateUUID()}` : "");
    })
}

export default class ImageResourceProvider extends ResourceProvider {
    async load(url) {
        const img = await loadImage(url, true);
        return img;
    }
}
