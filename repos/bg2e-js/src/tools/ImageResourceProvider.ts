import ResourceProvider from "./ResourceProvider";
import { generateUUID } from "./crypto";

// In this array we keep a reference to the images being loaded to
// prevent them from being deleted from memory
const g_preventImageDump: HTMLImageElement[] = [];

const beginLoadImage = (img: HTMLImageElement): void => {
    if (g_preventImageDump.indexOf(img) === -1) {
        g_preventImageDump.push(img);
    }
};

const endLoadImage = (img: HTMLImageElement): void => {
    const i = g_preventImageDump.indexOf(img);
    if (i !== -1) {
        g_preventImageDump.splice(i, 1);
    }
}

const loadImage = (url: string, preventCache: boolean = false): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        beginLoadImage(img);
        img.crossOrigin = "";
        img.addEventListener("load", evt => {
            endLoadImage(evt.target as HTMLImageElement);
            resolve(evt.target as HTMLImageElement);
        });
        img.addEventListener("error", evt => {
            endLoadImage(evt.target as HTMLImageElement);
            reject(new Error(`Error loading image '${ url }'.`));
        });
        img.addEventListener("abort", evt => {
            endLoadImage(evt.target as HTMLImageElement);
            reject(new Error(`Image load aborted '${ url }'.`));
        });
        img.src = url + (preventCache ? `?${generateUUID()}` : "");
    })
}

export default class ImageResourceProvider extends ResourceProvider {
    async load(url: string): Promise<HTMLImageElement> {
        const img = await loadImage(url, false);
        return img;
    }

    async write(url: string, img: HTMLImageElement | string): Promise<void> {
        let data: Uint8Array | null = null;
        if (img instanceof Image) {
            // TODO: convert to Uint8Array data
            throw new Error("ImageResourceProvider.write(): write from HTMLImageElement not implemented yet.");
        }
        else if (typeof(img) === "string" && /base64/i.test(img)) {
            // Convert base64 image into Uint8Array data
            throw new Error("ImageResourceProvider.write(): write from base64 string not implemented yet.");
        }
        else if (typeof(img) === "string") {
            // Path: copy image
            throw new Error("ImageResourceProvider.write(): copy image from path not implemented yet.");
        }
        else {
            throw new Error("Unsupported image type specified for write");
        }
    }
}
