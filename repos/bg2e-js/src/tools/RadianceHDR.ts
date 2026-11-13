/** Decode Radiance RGBE, including scanline RLE and legacy flat/RLE pixels. */
export function decodeRadianceHDR(buffer: ArrayBuffer): { width: number; height: number; data: Float32Array } {
    const bytes = new Uint8Array(buffer);
    let offset = 0;
    const read = () => {
        if (offset >= bytes.length) throw new Error('Truncated Radiance HDR image');
        return bytes[offset++];
    };
    const line = () => {
        let result = '', value: number;
        while ((value = read()) !== 10) if (value !== 13) result += String.fromCharCode(value);
        return result;
    };
    if (!/^#\?(RADIANCE|RGBE)$/.test(line())) throw new Error('Invalid Radiance HDR header');
    let format = '', header: string;
    while ((header = line()) !== '') if (header.startsWith('FORMAT=')) format = header.slice(7);
    if (format !== '32-bit_rle_rgbe') throw new Error('Unsupported Radiance HDR format');
    const resolution = /^([+-])Y\s+(\d+)\s+([+-])X\s+(\d+)$/.exec(line());
    if (!resolution) throw new Error('Unsupported HDR axis order (expected Y then X)');
    const width = Number(resolution[4]), height = Number(resolution[2]);
    if (width < 1 || height < 1 || width * height > 64 * 1024 * 1024) throw new Error('Invalid HDR dimensions');
    const pixels = new Uint8Array(width * height * 4);
    for (let y = 0; y < height; ++y) {
        const start = y * width * 4;
        const first = [read(), read(), read(), read()];
        if (width >= 8 && width <= 32767 && first[0] === 2 && first[1] === 2 && (first[2] & 128) === 0) {
            if ((first[2] << 8 | first[3]) !== width) throw new Error('Invalid HDR scanline width');
            for (let channel = 0; channel < 4; ++channel) {
                let x = 0;
                while (x < width) {
                    const code = read(), count = code > 128 ? code - 128 : code;
                    if (count === 0 || x + count > width) throw new Error('Invalid HDR RLE packet');
                    if (code > 128) {
                        const value = read();
                        for (let i = 0; i < count; ++i) pixels[start + 4 * x++ + channel] = value;
                    } else {
                        for (let i = 0; i < count; ++i) pixels[start + 4 * x++ + channel] = read();
                    }
                }
            }
        } else {
            let x = 0, shift = 0, pixel = first;
            while (x < width) {
                if (pixel[0] === 1 && pixel[1] === 1 && pixel[2] === 1) {
                    const count = pixel[3] * Math.pow(256, shift++);
                    if (x === 0 || shift > 4 || x + count > width) throw new Error('Invalid legacy HDR run');
                    for (let i = 0; i < count; ++i) {
                        pixels.copyWithin(start + x * 4, start + (x - 1) * 4, start + x * 4); ++x;
                    }
                } else {
                    pixels.set(pixel, start + x++ * 4); shift = 0;
                }
                if (x < width) pixel = [read(), read(), read(), read()];
            }
        }
    }
    const data = new Float32Array(width * height * 4);
    for (let y = 0; y < height; ++y) for (let x = 0; x < width; ++x) {
        const source = (y * width + x) * 4;
        const targetY = resolution[1] === '-' ? y : height - 1 - y;
        const targetX = resolution[3] === '+' ? x : width - 1 - x;
        const target = (targetY * width + targetX) * 4;
        const scale = pixels[source + 3] === 0 ? 0 : Math.pow(2, pixels[source + 3] - 136);
        for (let c = 0; c < 3; ++c) {
            data[target + c] = pixels[source + c] * scale;
            if (!Number.isFinite(data[target + c])) throw new Error('Nonfinite HDR radiance');
        }
        data[target + 3] = 1;
    }
    return { width, height, data };
}
