import Component from './Component';
import type Loader from '../db/Loader';
import { isAbsolute, jointUrl } from '../tools/Resource';
export interface FontDeclaration { identifier: string; path: string; faceIndex?: number; notices?: string[]; }
export default class TextFontComponent extends Component {
    private value: FontDeclaration[] = [];
    constructor() { super('TextFonts'); }
    get declarations(): FontDeclaration[] { return structuredClone(this.value); }
    setDeclarations(fonts: FontDeclaration[]): void {
        const seen = new Set<string>();
        this.value = fonts.slice(0, 128).filter(f => {
            if (!/^[A-Za-z0-9_.:-]{1,128}$/.test(f.identifier) || !f.path || f.path.includes('\0') || seen.has(f.identifier)) return false;
            seen.add(f.identifier); return true;
        }).map(f => ({ ...f, faceIndex: Number.isInteger(f.faceIndex) && f.faceIndex! >= 0 && f.faceIndex! < 32 ? f.faceIndex : 0, notices: f.notices?.slice(0, 32) ?? [] }));
        this.node?.setSceneChanged();
    }
    addFont(identifier: string, path: string, faceIndex = 0): void { this.setDeclarations([...this.value, { identifier, path, faceIndex }]); }
    removeFont(identifier: string): void { this.setDeclarations(this.value.filter(f => f.identifier !== identifier)); }
    clone(): TextFontComponent { const result = new TextFontComponent(); result.setDeclarations(this.declarations); return result; }
    async deserialize(data: any, loader: Loader): Promise<void> {
        if (!Array.isArray(data.fonts)) return;
        const resolve = (p: string) => {
            const resolved = isAbsolute(p) ? p : jointUrl(loader.currentPath, p);
            return typeof document !== 'undefined' ? new URL(resolved, document.baseURI).href : resolved;
        };
        this.setDeclarations(data.fonts.filter((f: any) => f && typeof f.identifier === 'string' && typeof f.path === 'string').map((f: any) => ({
            identifier: f.identifier, path: resolve(f.path), faceIndex: f.faceIndex,
            notices: Array.isArray(f.notices) ? f.notices.filter((p: unknown) => typeof p === 'string').map(resolve) : []
        })));
    }
    async serialize(data: any): Promise<void> { data.type = this.typeId; data.fonts = this.declarations; }
}
