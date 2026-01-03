import { isNode, isBrowser } from "./processType";

export const base64ToArrayBuffer = async (base64: string) : Promise<Uint8Array> => {
    if (isBrowser() || isNode()) {
        return new Uint8Array(atob(base64).split('').map(c => c.charCodeAt(0)));
    }
    else {
        throw new Error("base64ToArrayBuffer: Unsupported platform. Valid platforms are NodeJS or Browser");
    }
}

