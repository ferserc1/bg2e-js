import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve, join } from 'node:path';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
const helperUrl = pathToFileURL(resolve(process.cwd(), 'src/bg2e-vite.js')).href;
const { bg2eWasmAssets, copyBg2eAssets } = await import(/* @vite-ignore */ helperUrl);
import Loader from '../src/db/Loader';
import Bg2LoaderPlugin from '../src/db/Bg2LoaderPlugin';
import { ResourceType } from '../src/tools/Resource';
import type Canvas from '../src/app/Canvas';

const nodeModulesPath = resolve(process.cwd(), '../../node_modules');
test('build helper copies both modules and serves artifacts under a Vite base', async () => {
    const manifest = bg2eWasmAssets({ nodeModulesPath });
    assert.deepEqual(manifest.map((a: { name: string }) => a.name), ['bg2io.js','bg2io.wasm','bg2text.js','bg2text.wasm']);
    const plugin = copyBg2eAssets({ nodeModulesPath });
    const out = await mkdtemp(join(tmpdir(), 'bg2e-wasm-build-'));
    try {
        await (plugin as any).writeBundle({ dir: out });
        for (const artifact of manifest) assert.deepEqual(await readFile(join(out, 'bg2io', artifact.name)), await readFile(artifact.source));
        let middleware: any;
        (plugin as any).configureServer({ config: { base: '/demo/', logger: console }, middlewares: { use(fn: any) { middleware = fn; } } });
        for (const url of ['/bg2io/bg2text.wasm', '/demo/bg2io/bg2text.wasm?v=1']) {
            let body: any, contentType: string | undefined;
            await middleware({ url }, { setHeader(_name: string, value: string) { contentType = value; }, end(value: any) { body = value; } }, () => assert.fail('WASM URL was not served'));
            assert.equal(contentType, 'application/wasm'); assert.equal(body[0], 0); assert.equal(body[1], 97);
        }
    } finally { await rm(out, { recursive: true, force: true }); }
});

test('BG2 model plugin uses the shared loader location and still decodes real model buffers', async () => {
    const require = createRequire(join(nodeModulesPath, 'bg2io/package.json'));
    const factory = require('./bg2io.js');
    const wasmBinary = await readFile(join(nodeModulesPath, 'bg2io/bg2io.wasm'));
    const file = await readFile(resolve(process.cwd(), '../../samples/resources/sphere.bg2'));
    const buffer = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);
    const loader = new Loader({} as Canvas, { wasmBaseUrl: '/custom/wasm/' });
    let initializations = 0;
    loader.wasm.loadScriptFactory = async (name, symbol, baseUrl) => {
        assert.equal(name, 'bg2io.js'); assert.equal(symbol, 'Bg2ioModule');
        assert.equal(baseUrl, '/custom/wasm/');
        return async (options: any) => {
            initializations++;
            assert.equal(options.locateFile('bg2io.wasm'), '/custom/wasm/bg2io.wasm');
            return factory({ ...options, wasmBinary });
        };
    };
    const plugin = new Bg2LoaderPlugin();
    const first = await plugin.loadBuffer(buffer, 'bg2', [], ResourceType.PolyList, loader);
    const second = await plugin.loadBuffer(buffer, 'bg2', [], ResourceType.PolyList, loader);
    assert.equal(initializations, 1); assert.ok(first.length > 0);
    assert.ok(first[0].vertex.length > 0); assert.deepEqual(second[0].index, first[0].index);
});
