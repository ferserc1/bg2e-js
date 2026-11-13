import assert from 'node:assert/strict';
import test from 'node:test';
import { decodeRadianceHDR } from '../src/tools/RadianceHDR';
import Texture, { TextureComponentFormat } from '../src/base/Texture';

function image(width: number, height: number, pixels: number[], orientation = '-Y') {
    const header = new TextEncoder().encode(`#?RADIANCE\nFORMAT=32-bit_rle_rgbe\n\n${orientation} ${height} +X ${width}\n`);
    return new Uint8Array([...header, ...pixels]).buffer;
}

test('RGBE flat and scanline RLE preserve linear HDR energy and orientation', () => {
    const flat = decodeRadianceHDR(image(1, 2, [128, 64, 32, 130, 128, 128, 128, 129]));
    assert.deepEqual(Array.from(flat.data), [2, 1, 0.5, 1, 1, 1, 1, 1]);
    const flipped = decodeRadianceHDR(image(1, 2, [128, 64, 32, 130, 128, 128, 128, 129], '+Y'));
    assert.deepEqual(Array.from(flipped.data.slice(0, 4)), [1, 1, 1, 1]);
    const rle = decodeRadianceHDR(image(8, 1, [2, 2, 0, 8, 136, 128, 136, 64, 136, 32, 136, 130]));
    assert.deepEqual(Array.from(rle.data.slice(28)), [2, 1, 0.5, 1]);
    assert.throws(() => decodeRadianceHDR(image(8, 1, [2, 2, 0, 8, 137, 128])));
    assert.throws(() => decodeRadianceHDR(image(1, 1, [128, 64])));
});

test('float image data is uploaded as linear float32 rather than converted to SDR', () => {
    const texture = new Texture({} as any);
    texture.setFloatImageData(1, 1, new Float32Array([100000, 3, 2, 1]));
    assert.equal(texture.componentFormat, TextureComponentFormat.FLOAT32);
    assert.equal(texture.linearData, true);
    assert.equal((texture.imageData as any).data[0], 100000);
    assert.throws(() => texture.setFloatImageData(1, 1, new Float32Array([Infinity, 0, 0, 1])));
});
