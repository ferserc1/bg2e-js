import { isNode, isBrowserOrElectronRenderer } from "./processType";

export const base64ToArrayBuffer = async (base64) => {
    if (isBrowserOrElectronRenderer()) {
        return new Uint8Array(atob(base64).split('').map(c => c.charCodeAt(0)));
    }
    else if (isNode()) {
        const Buffer = await import('buffer');
        return Buffer.atob(base64).split('').map(c => c.charCodeAt(0));
    }
    else {
        throw new Error("base64ToArrayBuffer: Unsupported platform. Valid platforms are NodeJS, Browser or ElectronRenderer");
    }
}

