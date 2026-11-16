import LoaderPlugin from './LoaderPlugin';
import type Loader from './Loader';
import TextFont, { type TextWasmModule } from '../base/TextFont';
import Resource, { ResourceType } from '../tools/Resource';
export default class TextFontLoaderPlugin extends LoaderPlugin {
    get supportedExtensions(): string[] { return ['ttf', 'otf', 'ttc', 'otc']; }
    get resourceTypes(): ResourceType[] { return [ResourceType.TextFont]; }
    private async create(buffer: ArrayBuffer, loader: Loader, path = ''): Promise<TextFont> {
        if (buffer.byteLength < 12 || buffer.byteLength > 64 * 1024 * 1024) throw new Error('Font size outside [12 bytes, 64 MiB]');
        const module = await loader.wasm.load<TextWasmModule>('bg2text', async resolve => {
            const url = new URL(resolve('bg2text.js'), document.baseURI).href;
            const { default: createModule } = await import(/* @vite-ignore */ url);
            return createModule({ locateFile: resolve });
        });
        return new TextFont(module, new Uint8Array(buffer), path);
    }
    async load(path: string, type: ResourceType, loader: Loader): Promise<TextFont> {
        if (type !== ResourceType.TextFont) throw new Error('Expected TextFont resource');
        return this.create(await new Resource().load(path), loader, path);
    }
    async loadBuffer(buffer: ArrayBuffer, _format: string, _dependencies: File[], type: ResourceType, loader: Loader): Promise<TextFont> {
        if (type !== ResourceType.TextFont) throw new Error('Expected TextFont resource');
        return this.create(buffer, loader);
    }
}
