
export const isBigEndian = () => {
    let arr32 = new Uint32Array(1);
    let arr8 = new Uint8Array(arr32.buffer);
    arr32[0] = 255;
    return arr32[3]==255;
};

export const isLittleEndian = () => {
    let arr32 = new Uint32Array(1);
    let arr8 = new Uint8Array(arr32.buffer);
    arr32[0] = 255;
    return arr32[0]==255;
};

