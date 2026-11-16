import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { gunzipSync } from 'node:zlib';
import Text from '../src/base/Text';
import TextFont, { type TextWasmModule } from '../src/base/TextFont';
import Texture from '../src/base/Texture';
import Canvas from '../src/app/Canvas';
import Loader, { registerLoaderPlugin } from '../src/db/Loader';
import LoaderPlugin from '../src/db/LoaderPlugin';
import WasmResources from '../src/db/WasmResources';
import { ResourceType } from '../src/tools/Resource';
import TextComponent from '../src/scene/TextComponent';
import TextFontComponent from '../src/scene/TextFontComponent';
import Node from '../src/scene/Node';
import { prepareTextResources, reloadTextFonts } from '../src/scene/TextResources';
import { getLoaderPlugin } from '../src/db/Loader';
import TextFontLoaderPlugin from '../src/db/TextFontLoaderPlugin';
import { registerComponents } from '../src/scene/index';
import { deserializeComponent } from '../src/scene/Component';

const root = process.cwd();
const originalCanvas = Canvas.FirstCanvas;
Canvas.FirstCanvas = () => ({} as Canvas);
const modulePath = pathToFileURL(resolve(root, 'wasm/assets/bg2text.js')).href;
const { default: createModule } = await import(/* @vite-ignore */ modulePath);
const module: TextWasmModule = await createModule({ wasmBinary: await readFile(resolve(root, 'wasm/assets/bg2text.wasm')) });
const bytes = await readFile(resolve(root, '../../samples/36_text/public/fonts/didact-gothic/DidactGothic-Regular.ttf'));
const document = JSON.parse(await readFile(resolve(root, 'tests/fixtures/text-scene.json'), 'utf8'));
const tutorial = new Text(document.scene[0].components[1].text);
const font = new TextFont(module, bytes);
test.after(() => { font.dispose(); Canvas.FirstCanvas = originalCanvas; });

test('WASM text agrees with the native C++ tutorial mask and positions', async () => {
    const r = font.rasterize(tutorial.parameters);
    assert.equal(r.width, 2048); assert.equal(r.height, 512);
    assert.equal(r.lines.length, 1); assert.equal(r.glyphs.length, 11);
    assert.ok(Math.abs(r.lines[0].width - 585.812366) < .001);
    assert.ok(Math.abs(r.lines[0].baseline - 175.658277) < .001);
    const reference = gunzipSync(await readFile(resolve(root, 'tests/fixtures/text-native.rgba.gz')));
    assert.equal(r.rgba.length, reference.length);
    let differences = 0;
    for (let i = 0; i < reference.length; i++) {
        assert.ok(Math.abs(r.rgba[i] - reference[i]) <= 1, `Coverage mismatch at byte ${i}`);
        if (r.rgba[i] !== reference[i]) differences++;
    }
    assert.ok(differences < 20, `${differences} differing bytes`);
});

test('line breaks, wrapping and logical layout are independent of bitmap density', () => {
    const text = new Text({ content: 'Árbol AV\r\nEspaña\n', fontSize: 32, paragraphSize: { width: 180, height: 200 } });
    const a = font.rasterize(text.parameters);
    text.setParameters({ ...text.parameters, bitmapResolution: { width: 180, height: 200 } });
    const b = font.rasterize(text.parameters);
    assert.equal(a.lines.length, 3); assert.equal(a.lines[2].glyphCount, 0);
    assert.deepEqual(a.lines, b.lines); assert.deepEqual(a.glyphs, b.glyphs);
    text.setParameters({ ...text.parameters, content: 'AV AV AV', paragraphSize: { width: 50, height: 200 } });
    assert.ok(font.rasterize(text.parameters).lines.length > 1);
});

test('empty, whitespace and hidden overflow never produce coverage; clipping respects margins', () => {
    for (const content of ['', ' \t ', 'too large to fit']) {
        const r = font.rasterize(new Text({ content, fontSize: 100, paragraphSize: { width: 30, height: 20 }, overflowPolicy: 'hide', bitmapResolution: { width: 60, height: 40 } }).parameters);
        assert.ok(!r.rgba.some((v, i) => i % 4 === 3 && v > 0));
    }
    const r = font.rasterize(new Text({ content: 'Overflow', fontSize: 80, paragraphSize: { width: 100, height: 50 }, bitmapResolution: { width: 100, height: 50 }, margins: { left: 10, top: 10, right: 10, bottom: 10 } }).parameters);
    assert.equal(r.overflowed, true);
    for (let y = 0; y < r.height; y++) for (let x = 0; x < r.width; x++) {
        if (x < 10 || x >= 90 || y < 10 || y >= 40) assert.equal(r.rgba[(y*r.width+x)*4+3], 0);
    }
});

test('missing characters use .notdef, unavailable faces recover to face zero, corrupt fonts fail', () => {
    const p = new Text({ content: '\u{10ffff}' }).parameters;
    assert.equal(font.rasterize(p).glyphs[0].index, 0);
    assert.deepEqual(font.rasterize(tutorial.parameters, 31).lines, font.rasterize(tutorial.parameters).lines);
    assert.throws(() => new TextFont(module, new Uint8Array(20)));
    const copy = new TextFont(module, bytes); copy.dispose(); copy.dispose();
    assert.throws(() => copy.rasterize(p));
});

test('text normalization bounds allocations, preserves scalar boundaries and revisions', () => {
    const t = new Text({ content: 'á'.repeat(40000), fontSize: NaN, bitmapResolution: { width: 8192, height: 8192 } });
    assert.equal(new TextEncoder().encode(t.content).length, 65536);
    assert.ok(!t.content.includes('\ufffd'));
    const p = t.parameters;
    assert.ok(p.bitmapResolution.width * p.bitmapResolution.height <= 16*1024*1024);
    assert.equal(p.fontSize, 32);
    const revision = t.revision; t.setParameters(p); assert.equal(t.revision, revision);
    p.margins.left = 99999; assert.notEqual(t.parameters.margins.left, p.margins.left);
});

test('WASM initialization is shared per loader/location and rejected loads can be retried', async () => {
    const wasm = new WasmResources('/one/'); let calls = 0;
    const create = async (resolve: (file: string) => string) => { calls++; return resolve('module.wasm'); };
    const a = wasm.load('test', create), b = wasm.load('test', create);
    assert.equal(a, b); assert.equal(await a, '/one/module.wasm'); assert.equal(calls, 1);
    wasm.baseUrl = '/two/'; assert.equal(await wasm.load('test', create), '/two/module.wasm');
    await assert.rejects(wasm.load('retry', async () => { throw new Error('failed'); }));
    assert.equal(await wasm.load('retry', async () => 42), 42);
    assert.throws(() => wasm.resolve('../outside.wasm'));
});

class FontFixturePlugin extends LoaderPlugin {
    calls = 0;
    get supportedExtensions() { return ['fixturefont']; }
    get resourceTypes() { return [ResourceType.TextFont]; }
    async load(path: string) { this.calls++; if (path.includes('missing')) throw new Error('missing font'); return new TextFont(module, bytes); }
}

test('scene font preparation is order independent, cached, reloadable and disables duplicates', async () => {
    const plugin = new FontFixturePlugin(); registerLoaderPlugin(plugin);
    const loader = new Loader({} as Canvas);
    const scene = new Node(); const textNode = new Node(); const text = new TextComponent();
    text.text.setParameters(tutorial.parameters); textNode.addComponent(text); scene.addChild(textNode);
    const declarationNode = new Node(); const fonts = new TextFontComponent();
    fonts.addFont('tutorial', '/tutorial.fixturefont'); declarationNode.addComponent(fonts); scene.addChild(declarationNode);
    await prepareTextResources(scene, loader); assert.equal(text.canRender, true); assert.equal(plugin.calls, 1);
    const raster = text.rasterization; const quad = text.items[0].polyList;
    await prepareTextResources(scene); assert.equal(text.rasterization, raster);
    text.text.content = 'España'; await prepareTextResources(scene);
    assert.notEqual(text.rasterization, raster); assert.equal(text.items[0].polyList, quad);
    assert.equal(scene.children[0].drawable, text);
    const duplicate = new Node(); const other = new TextFontComponent(); other.addFont('tutorial', '/other.fixturefont'); duplicate.addComponent(other); scene.addChild(duplicate);
    await prepareTextResources(scene); assert.equal(text.canRender, false);
    scene.removeChild(duplicate); await reloadTextFonts(scene); assert.equal(text.canRender, true);
    const clone = scene.clone(true); await prepareTextResources(clone, loader);
    assert.equal((clone.children[0].component('Text') as TextComponent).canRender, true);
    fonts.setDeclarations([{ identifier: 'tutorial', path: '/missing.fixturefont' }]);
    await prepareTextResources(scene); await prepareTextResources(scene); assert.equal(text.canRender, false);
    const count = plugin.calls; await prepareTextResources(scene); assert.equal(plugin.calls, count);
    loader.dispose();
});

test('native Text JSON roundtrips authored state without persisting the generated mask', async () => {
    registerComponents();
    const loader = new Loader({} as Canvas);
    const text = await deserializeComponent(document.scene[0].components[1], loader) as TextComponent;
    text.prepareResources({ font, faceIndex: 0 }, 1);
    const data: any = {}; await text.serialize(data);
    assert.equal(data.type, 'Text'); assert.equal(data.material.albedoTexture, undefined);
    assert.equal(data.material.doubleSided, true); assert.equal(data.material.isUnlit, false);
    assert.deepEqual(data.size, [2,1.4]); assert.deepEqual(text.size, [5.6,1.4]);
    const restored = await deserializeComponent(data, loader) as TextComponent;
    assert.deepEqual(restored.text.parameters, text.text.parameters);
    assert.deepEqual(restored.size, text.size);
    text.setHeight(2); assert.deepEqual(text.size, [8,2]);
    restored.text.content = ''; restored.prepareResources({ font, faceIndex: 0 }); assert.equal(restored.canRender, false);
    loader.dispose();
});

test('font plugin selection accepts query strings and RGBA8 texture upload owns its data', () => {
    registerLoaderPlugin(new TextFontLoaderPlugin());
    assert.ok(getLoaderPlugin('/font.ttf?v=1', ResourceType.TextFont) instanceof TextFontLoaderPlugin);
    const texture = new Texture({} as Canvas), bytes = new Uint8Array([255,255,255,128]);
    texture.setByteImageData(1,1,bytes); bytes[3] = 0;
    assert.equal((texture.imageData as any).data[3],128); assert.equal(texture.linearData,true);
});

test('native scene loader resolves font URLs relative to the document and loads fonts after parsing all nodes', async () => {
    const { default: VitscnjLoaderPlugin } = await import('../src/db/VitscnjLoaderPlugin');
    registerLoaderPlugin(new VitscnjLoaderPlugin()); registerComponents();
    const loader = new Loader({} as Canvas);
    const originalFetch = globalThis.fetch;
    const calls: string[] = [];
    globalThis.fetch = (async (url: any) => {
        calls.push(String(url));
        if (String(url) === 'https://example.test/scenes/text.json') return new Response(JSON.stringify(document), { headers: { 'Content-Type': 'application/json' } });
        if (String(url) === 'https://example.test/scenes/fonts/didact-gothic/DidactGothic-Regular.ttf') return new Response(bytes);
        throw new Error(`Unexpected URL: ${url}`);
    }) as typeof fetch;
    loader.wasm.load = (async () => module) as typeof loader.wasm.load;
    try {
        const scene = await loader.loadNode('https://example.test/scenes/text.json') as Node;
        const text = scene.children[0].component('Text') as TextComponent;
        assert.equal(text.canRender, true);
        assert.deepEqual(calls, ['https://example.test/scenes/text.json', 'https://example.test/scenes/fonts/didact-gothic/DidactGothic-Regular.ttf']);
        assert.equal(loader.currentPath, '');
    } finally { globalThis.fetch = originalFetch; loader.dispose(); }
});
