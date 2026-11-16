import type { TextParameters } from './Text';
export interface TextRasterization {
    width: number; height: number; rgba: Uint8Array; renderable: boolean; overflowed: boolean;
    contentWidth: number; contentHeight: number;
    lines: { firstGlyph: number; glyphCount: number; width: number; baseline: number }[];
    glyphs: { index: number; x: number; baseline: number }[];
}
export interface TextWasmModule {
    openFont(bytes: Uint8Array, faceIndex: number): number;
    closeFont(handle: number): void;
    rasterize(handle: number, parameters: TextParameters): TextRasterization;
}
/** One immutable font file, with lazily opened collection faces. Owned by its Loader. */
export default class TextFont {
    private faces = new Map<number, number>();
    private bytes: Uint8Array;
    private _disposed = false;
    constructor(private module: TextWasmModule, bytes: Uint8Array, readonly path = '') {
        this.bytes = bytes.slice();
        this.face(0); // Detect corrupt/unsupported files at the load boundary.
    }
    get disposed(): boolean { return this._disposed; }
    private face(index: number): number {
        if (this.disposed) throw new Error('TextFont has been disposed');
        index = Number.isInteger(index) && index >= 0 && index < 32 ? index : 0;
        let handle = this.faces.get(index);
        if (!handle) {
            handle = this.module.openFont(this.bytes, index);
            if (!handle) throw new Error(`Unsupported or invalid font: ${this.path}`);
            this.faces.set(index, handle);
        }
        return handle;
    }
    rasterize(parameters: TextParameters, faceIndex = 0): TextRasterization {
        return this.module.rasterize(this.face(faceIndex), parameters);
    }
    dispose(): void {
        for (const handle of this.faces.values()) this.module.closeFont(handle);
        this.faces.clear(); this.bytes = new Uint8Array(); this._disposed = true;
    }
}
