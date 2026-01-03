
export const isBigEndian = (): boolean => {
    const arr32 = new Uint32Array(1);
    arr32[0] = 255;
    return arr32[3] === 255;
};

export const isLittleEndian = (): boolean => {
    const arr32 = new Uint32Array(1);
    arr32[0] = 255;
    return arr32[0] === 255;
};

