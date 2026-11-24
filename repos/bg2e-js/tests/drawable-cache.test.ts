import assert from 'node:assert/strict';
import test, { type TestContext } from 'node:test';
import type Canvas from '../src/app/Canvas';
import Color from '../src/base/Color';
import Material from '../src/base/Material';
import PolyList from '../src/base/PolyList';
import Texture from '../src/base/Texture';
import Bg2LoaderPlugin from '../src/db/Bg2LoaderPlugin';
import DrawableCache from '../src/db/DrawableCache';
import Loader, { registerLoaderPlugin } from '../src/db/Loader';
import VitscnjLoaderPlugin from '../src/db/VitscnjLoaderPlugin';
import Drawable from '../src/scene/Drawable';
import Node from '../src/scene/Node';
import { registerComponents } from '../src/scene/index';

const canvas = {} as Canvas;
const modelUrl = 'https://example.test/models/chair.bg2?revision=1';
const modelData = {
    materials: [{ name: 'Finish', albedo: [1, 0, 0, 1] }],
    polyLists: [{
        name: 'Seat', matName: 'Finish',
        vertex: [0, 0, 0, 1, 0, 0, 0, 1, 0], normal: [0, 0, 1, 0, 0, 1, 0, 0, 1],
        index: [0, 1, 2], texCoord0: [0, 0, 1, 0, 0, 1], texCoord1: [], texCoord2: []
    }],
    components: []
};

function makeDrawable(name = 'Chair'): Drawable {
    const drawable = new Drawable(name);
    const geometry = new PolyList();
    geometry.name = 'Seat';
    geometry.vertex = [...modelData.polyLists[0].vertex];
    geometry.normal = [...modelData.polyLists[0].normal];
    geometry.index = [...modelData.polyLists[0].index];
    geometry.texCoord0 = [...modelData.polyLists[0].texCoord0];
    const material = new Material(canvas);
    material.albedo = Color.Red();
    const texture = new Texture(canvas);
    texture.setByteImageData(1, 1, new Uint8Array([255, 0, 0, 255]));
    material.albedoTexture = texture;
    drawable.addPolyList(geometry, material);
    return drawable;
}

function mockBg2(t: TestContext, loader: Loader): void {
    registerLoaderPlugin(new Bg2LoaderPlugin());
    t.mock.method(loader.wasm, 'load', async () => ({
        loadBg2FileAsJson: () => structuredClone(modelData)
    }));
}

test('manual cache entries own their snapshots and count links across subtree detach', t => {
    const cache = new DrawableCache();
    const source = makeDrawable();
    const resource = cache.add('chair', source);
    assert.equal(cache.find('chair'), resource);
    assert.throws(() => cache.add('chair', source), /already exists/);
    const lease = resource.retain();
    const second = resource.retain();
    assert.equal(lease.geometry(0), second.geometry(0));
    const destroyGeometry = t.mock.method(lease.geometry(0), 'destroy', () => {});
    const originalTexture = lease.createAppearance(0).material;
    assert.equal(originalTexture.albedoTexture!.imageData, source.items[0].material.albedoTexture!.imageData);
    originalTexture.destroy(true);

    const owner = new Drawable();
    owner.bindResource(resource);
    const parent = new Node('Parent');
    const child = new Node('Owner');
    child.addComponent(owner);
    parent.addChild(child);
    parent.removeChild(child);
    assert.equal(resource.activeLinks, 3);
    assert.equal(cache.remove('chair'), false);
    assert.equal(cache.clear(), false);

    owner.items[0].material.albedo = Color.Blue();
    owner.items[0].polyList.vertex[0] = 10;
    source.items[0].material.albedo = Color.White();
    source.items[0].polyList.vertex[0] = 20;
    assert.equal(lease.geometry(0).vertex[0], 0);
    child.destroy();
    const appearance = lease.createAppearance(0);
    assert.equal(appearance.material.albedo.b, 0);
    assert.equal(appearance.material.albedo.r, 1);
    appearance.material.destroy(true);
    assert.equal(destroyGeometry.mock.callCount(), 0);

    lease.release();
    lease.release();
    assert.throws(() => lease.geometry(0), /released/);
    assert.equal(resource.activeLinks, 1);
    second.release();
    assert.equal(cache.remove('chair'), true);
    assert.equal(destroyGeometry.mock.callCount(), 1);
    assert.equal(cache.find('chair'), undefined);
    assert.throws(() => resource.retain(), /removed/);
});

test('equivalent BG2 URLs share a pending request and failures can be retried', async t => {
    const loader = new Loader(canvas);
    const cache = new DrawableCache();
    mockBg2(t, loader);
    loader.currentPath = 'https://example.test/models/';
    let attempts = 0;
    t.mock.method(globalThis, 'fetch', async (url: string) => {
        assert.equal(url, modelUrl);
        attempts++;
        return attempts === 1 ? new Response(null, { status: 404 }) : new Response(new Uint8Array(1));
    });

    const first = cache.loadBg2('./chair.bg2?revision=1#mesh', loader);
    const second = cache.loadBg2('https://EXAMPLE.test:443/models/old/../chair.bg2?revision=1', loader);
    assert.equal(first, second);
    assert.equal(cache.find(modelUrl), undefined);
    assert.throws(() => cache.add(modelUrl, makeDrawable()), /is loading/);
    await assert.rejects(first, /Resource not found/);
    assert.equal(attempts, 1);
    const loaded = await cache.loadBg2('chair.bg2?revision=1', loader);
    assert.equal(cache.find(modelUrl), loaded);
    assert.equal(await cache.loadBg2(modelUrl, loader), loaded);
    assert.equal(attempts, 2);
    assert.equal(cache.remove(modelUrl), true);
});

test('removing a pending load leaves a newer publication intact', async t => {
    const loader = new Loader(canvas);
    const cache = new DrawableCache();
    mockBg2(t, loader);
    let started!: () => void;
    let reply!: (response: Response) => void;
    const requested = new Promise<void>(resolve => { started = resolve; });
    t.mock.method(globalThis, 'fetch', () => new Promise<Response>(resolve => { reply = resolve; started(); }));

    const pending = cache.loadBg2(modelUrl, loader);
    await requested;
    assert.equal(cache.remove(modelUrl), true);
    const replacement = cache.add(modelUrl, makeDrawable('Replacement'));
    const rejected = assert.rejects(pending, /load was removed/);
    reply(new Response(new Uint8Array(1)));
    await rejected;
    assert.equal(await cache.loadBg2(modelUrl, loader), replacement);
    assert.equal(cache.clear(), true);
    assert.equal(cache.find(modelUrl), undefined);
});

test('scene import reuses BG2 within a scene and accepts an explicit cache', async t => {
    const supplied = new DrawableCache();
    const loader = new Loader(canvas, { drawableCache: supplied });
    mockBg2(t, loader);
    registerComponents();
    registerLoaderPlugin(new VitscnjLoaderPlugin());
    const url = 'https://example.test/scene.json';
    let modelReads = 0;
    t.mock.method(globalThis, 'fetch', async (path: string) => {
        if (path === url) return new Response(JSON.stringify({ scene: [
            { name: 'A', components: [{ type: 'Drawable', path: modelUrl }] },
            { name: 'B', components: [{ type: 'Drawable', path: './models/chair.bg2?revision=1' }] }
        ] }));
        assert.equal(path, modelUrl);
        modelReads++;
        return new Response(new Uint8Array(1));
    });

    const scene: Node = await loader.loadNode(url);
    const resource = supplied.find(modelUrl)!;
    assert.equal(scene.drawableCache, supplied);
    assert.equal(modelReads, 1);
    assert.equal(resource.activeLinks, 2);
    const [a, b] = scene.children.map(node => node.drawable!);
    assert.equal(a.resource, b.resource);
    assert.notEqual(a.items[0].polyList, b.items[0].polyList);
    a.items[0].material.albedo = Color.Blue();
    assert.equal(b.items[0].material.albedo.b, 0);
    for (const child of scene.children) child.destroy();
    assert.equal(supplied.remove(modelUrl), true);

    const defaultLoader = new Loader(canvas);
    mockBg2(t, defaultLoader);
    const first: Node = await defaultLoader.loadNode(url);
    const second: Node = await defaultLoader.loadNode(url);
    assert.ok(first.drawableCache && second.drawableCache);
    assert.notEqual(first.drawableCache, second.drawableCache);
    assert.equal(modelReads, 3);
    for (const root of [first, second]) {
        for (const child of root.children) child.destroy();
        assert.equal(root.drawableCache!.clear(), true);
    }
});
