export interface TextParameters {
    content: string;
    fontIdentifier: string;
    fontSize: number;
    lineSpacing: number;
    characterSpacing: number;
    paragraphSize: { width: number; height: number };
    bitmapResolution: { width: number; height: number };
    margins: { left: number; top: number; right: number; bottom: number };
    alignment: 'left' | 'center' | 'right';
    verticalAlignment: 'top' | 'center' | 'bottom';
    wrapMode: 'none' | 'word' | 'character';
    overflowPolicy: 'clip' | 'hide';
}
export type TextOptions = Partial<Omit<TextParameters, 'paragraphSize' | 'bitmapResolution' | 'margins'>> & {
    paragraphSize?: Partial<TextParameters['paragraphSize']>;
    bitmapResolution?: Partial<TextParameters['bitmapResolution']>;
    margins?: Partial<TextParameters['margins']>;
};
const finite = (v: unknown, fallback: number, min: number, max: number): number =>
    typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;
const positive = (v: unknown, fallback: number, min: number, max: number): number =>
    typeof v === 'number' && v > 0 ? finite(v, fallback, min, max) : fallback;
const choice = <T extends string>(v: unknown, values: T[], fallback: T): T => values.includes(v as T) ? v as T : fallback;
/** CPU paragraph value. Rendering and final safety normalization are performed by the native WASM core. */
export default class Text {
    private value!: TextParameters;
    private _revision = 0;
    constructor(parameters: TextOptions = {}) { this.setParameters(parameters); }
    get revision(): number { return this._revision; }
    get parameters(): TextParameters { return structuredClone(this.value); }
    get content(): string { return this.value.content; }
    set content(content: string) { this.setParameters({ ...this.value, content }); }
    get fontIdentifier(): TextParameters['fontIdentifier'] { return structuredClone(this.value.fontIdentifier); }
    set fontIdentifier(value: TextParameters['fontIdentifier']) { this.setParameters({ ...this.value, fontIdentifier: value }); }
    get fontSize(): TextParameters['fontSize'] { return structuredClone(this.value.fontSize); }
    set fontSize(value: TextParameters['fontSize']) { this.setParameters({ ...this.value, fontSize: value }); }
    get lineSpacing(): TextParameters['lineSpacing'] { return structuredClone(this.value.lineSpacing); }
    set lineSpacing(value: TextParameters['lineSpacing']) { this.setParameters({ ...this.value, lineSpacing: value }); }
    get characterSpacing(): TextParameters['characterSpacing'] { return structuredClone(this.value.characterSpacing); }
    set characterSpacing(value: TextParameters['characterSpacing']) { this.setParameters({ ...this.value, characterSpacing: value }); }
    get paragraphSize(): TextParameters['paragraphSize'] { return structuredClone(this.value.paragraphSize); }
    set paragraphSize(value: TextParameters['paragraphSize']) { this.setParameters({ ...this.value, paragraphSize: value }); }
    get bitmapResolution(): TextParameters['bitmapResolution'] { return structuredClone(this.value.bitmapResolution); }
    set bitmapResolution(value: TextParameters['bitmapResolution']) { this.setParameters({ ...this.value, bitmapResolution: value }); }
    get margins(): TextParameters['margins'] { return structuredClone(this.value.margins); }
    set margins(value: TextParameters['margins']) { this.setParameters({ ...this.value, margins: value }); }
    get alignment(): TextParameters['alignment'] { return structuredClone(this.value.alignment); }
    set alignment(value: TextParameters['alignment']) { this.setParameters({ ...this.value, alignment: value }); }
    get verticalAlignment(): TextParameters['verticalAlignment'] { return structuredClone(this.value.verticalAlignment); }
    set verticalAlignment(value: TextParameters['verticalAlignment']) { this.setParameters({ ...this.value, verticalAlignment: value }); }
    get wrapMode(): TextParameters['wrapMode'] { return structuredClone(this.value.wrapMode); }
    set wrapMode(value: TextParameters['wrapMode']) { this.setParameters({ ...this.value, wrapMode: value }); }
    get overflowPolicy(): TextParameters['overflowPolicy'] { return structuredClone(this.value.overflowPolicy); }
    set overflowPolicy(value: TextParameters['overflowPolicy']) { this.setParameters({ ...this.value, overflowPolicy: value }); }
    setContent(content: string): void { this.content = content; }
    setParameters(p: TextOptions): void {
        let content = typeof p.content === 'string' ? p.content : '';
        const encoder = new TextEncoder();
        const bytes = encoder.encode(content);
        if (bytes.length > 65536) {
            let end = 65536;
            while ((bytes[end] & 0xc0) === 0x80) end--;
            content = new TextDecoder().decode(bytes.subarray(0, end));
        } else content = new TextDecoder().decode(bytes);
        const paragraphSize = { width: positive(p.paragraphSize?.width, 512, 1, 1e6), height: positive(p.paragraphSize?.height, 256, 1, 1e6) };
        const bitmapResolution = { width: Math.floor(positive(p.bitmapResolution?.width, 1024, 1, 8192)), height: Math.floor(positive(p.bitmapResolution?.height, 512, 1, 8192)) };
        const ratio = Math.min(1, Math.sqrt(16 * 1024 * 1024 / (bitmapResolution.width * bitmapResolution.height)));
        bitmapResolution.width = Math.max(1, Math.floor(bitmapResolution.width * ratio));
        bitmapResolution.height = Math.max(1, Math.floor(bitmapResolution.height * ratio));
        const margins = { left: finite(p.margins?.left, 8, 0, 1e6), top: finite(p.margins?.top, 8, 0, 1e6), right: finite(p.margins?.right, 8, 0, 1e6), bottom: finite(p.margins?.bottom, 8, 0, 1e6) };
        if (margins.left + margins.right >= paragraphSize.width) margins.left = margins.right = 0;
        if (margins.top + margins.bottom >= paragraphSize.height) margins.top = margins.bottom = 0;
        const next: TextParameters = {
            content, fontIdentifier: typeof p.fontIdentifier === 'string' && /^[A-Za-z0-9_.:-]{1,128}$/.test(p.fontIdentifier) ? p.fontIdentifier : 'default',
            fontSize: positive(p.fontSize, 32, 1, 4096), lineSpacing: positive(p.lineSpacing, 1.2, .1, 10),
            characterSpacing: finite(p.characterSpacing, 0, -4096, 4096), paragraphSize, bitmapResolution, margins,
            alignment: choice(p.alignment, ['left', 'center', 'right'], 'left'), verticalAlignment: choice(p.verticalAlignment, ['top', 'center', 'bottom'], 'top'),
            wrapMode: choice(p.wrapMode, ['none', 'word', 'character'], 'word'), overflowPolicy: (p.overflowPolicy as string) === 'error' ? 'hide' : choice(p.overflowPolicy, ['clip', 'hide'], 'clip')
        };
        if (JSON.stringify(next) !== JSON.stringify(this.value)) { this.value = next; this._revision++; }
    }
    clone(): Text { return new Text(this.parameters); }
}
