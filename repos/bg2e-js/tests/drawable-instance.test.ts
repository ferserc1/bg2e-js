import assert from 'node:assert/strict';
import test, { type TestContext } from 'node:test';
import type Canvas from '../src/app/Canvas';
import Color from '../src/base/Color';
import Material from '../src/base/Material';
import PolyList, { RenderLayer } from '../src/base/PolyList';
import Texture from '../src/base/Texture';
import DrawableCache, { type DrawableResource } from '../src/db/DrawableCache';
import Loader, { registerLoaderPlugin } from '../src/db/Loader';
import VitscnjLoaderPlugin from '../src/db/VitscnjLoaderPlugin';
import GizmoComponent from '../src/manipulation/GizmoComponent';
import GizmoManager from '../src/manipulation/GizmoManager';
import SelectionIdAssignVisitor from '../src/manipulation/SelectionIdAssignVisitor';
import SelectionManager from '../src/manipulation/SelectionManager';
import Mat4 from '../src/math/Mat4';
import MaterialRenderer from '../src/render/MaterialRenderer';
import Pipeline from '../src/render/Pipeline';
import PolyListRenderer from '../src/render/PolyListRenderer';
import Renderer from '../src/render/Renderer';
import RenderQueue from '../src/render/RenderQueue';
import type { SelectionState } from '../src/render/RenderState';
import Shader from '../src/render/Shader';
import AABoundingBox from '../src/scene/AABoundingBox';
import Drawable from '../src/scene/Drawable';
import DrawableInstance from '../src/scene/DrawableInstance';
import Node from '../src/scene/Node';
import Transform from '../src/scene/Transform';
import { registerComponents } from '../src/scene/index';

const canvas = {} as Canvas;
const directory = 'https://example.test/scenes/';
const sceneUrl = directory + 'room.json';
const path = 'models/chair.bg2';
const modelUrl = directory + path;
const vertex = [0, 0, 0, 1, 0, 0, 0, 1, 0];
const index = [0, 1, 2];

function sceneLoader(t: TestContext, cache?: DrawableCache): Loader {
    const loader = new Loader(canvas, { drawableCache: cache });
    registerComponents();
    registerLoaderPlugin(new VitscnjLoaderPlugin());
    t.mock.method(loader.wasm, 'load', async () => ({
        loadBg2FileAsJson: () => ({
            materials: [{ name: 'Finish', groupName: 'Original', albedo: [1, 0, 0, 1] }],
            polyLists: ['Seat', 'Back'].map(name => ({
                name, matName: 'Finish', vertex: [...vertex], index: [...index],
                normal: [0, 0, 1, 0, 0, 1, 0, 0, 1], texCoord0: [0, 0, 1, 0, 0, 1],
                texCoord1: [], texCoord2: []
            })),
            components: []
        })
    }));
    return loader;
}

function makeResource(cache: DrawableCache, key: string): DrawableResource {
    const source = new Drawable(key);
    const polyList = new PolyList();
    polyList.name = 'Triangle';
    polyList.vertex = [...vertex];
    polyList.index = [...index];
    polyList.visible = false;
    source.addPolyList(polyList, new Material(canvas));
    return cache.add(key, source);
}

test('scene instances load before owners and preserve original submeshes by index', async t => {
    const loader = sceneLoader(t);
    const report = t.mock.method(console, 'warn', () => {});
    let reads = 0;
    t.mock.method(globalThis, 'fetch', async (url: string) => {
        if (url === sceneUrl) return new Response(JSON.stringify({ fileType: 'bg2e::scene', scene: [
            { name: 'Earlier instance', components: [{
                type: 'DrawableInstance', priority: 9, path, rayTracingEnabled: false,
                submeshes: [
                    { name: 'Blue seat', groupName: 'Custom', visible: false,
                        transform: Array.from(Mat4.MakeTranslation(3, 0, 0)), material: { albedo: [0, 0, 1, 1] } },
                    null, { name: 'Surplus' }
                ]
            }] },
            { name: 'Second instance', components: [{ type: 'DrawableInstance', path,
                submeshes: [{ groupName: 3, transform: Array(16).fill(0) }] }] },
            ...['Owner A', 'Owner B'].map(name => ({ name, components: [{ type: 'Drawable', path }] }))
        ] }));
        assert.equal(url, modelUrl);
        reads++;
        return new Response(new Uint8Array(1));
    });

    const root: Node = await loader.loadNode(sceneUrl);
    const first = root.children[0].drawableInstance!;
    const second = root.children[1].drawableInstance!;
    const ownerA = root.children[2].drawable!;
    const ownerB = root.children[3].drawable!;
    assert.equal(reads, 1);
    assert.equal(first.priority, 9);
    assert.equal(first.resource, ownerA.resource);
    assert.equal(first.resource, second.resource);
    assert.equal(first.items.length, 2);
    assert.equal(first.items[0].polyList, second.items[0].polyList);
    assert.notEqual(first.items[0].polyList, ownerA.items[0].polyList);
    assert.equal(first.items[0].transform.translation.x, 3);
    assert.equal(first.items[0].name, 'Blue seat');
    assert.equal(first.items[0].groupName, 'Custom');
    assert.equal(first.items[0].visible, false);
    assert.equal(first.items[1].name, 'Back');
    assert.equal(second.items[0].transform.translation.x, 0);
    assert.equal(second.items[0].groupName, 'Original');
    ownerA.items[0].material.albedo = Color.Green();
    assert.equal(ownerB.items[0].material.albedo.r, 1);
    assert.equal(second.items[0].material.albedo.r, 1);
    assert.equal(first.items[0].material.albedo.b, 1);
    assert.ok(report.mock.calls.some(call => String(call.arguments[0]).includes('Expected 2 submeshes but found 3')));
    assert.ok(report.mock.calls.some(call => String(call.arguments[0]).includes('Invalid transform for submesh 0')));

    const clone = first.clone();
    assert.equal(clone.items[0].polyList, first.items[0].polyList);
    clone.items[0].transform[12] = 10;
    clone.items[0].material.albedo = Color.White();
    assert.equal(first.items[0].transform[12], 3);
    assert.equal(first.items[0].material.albedo.r, 0);
    clone.destroy();
    for (const node of root.children) node.destroy();
    assert.equal(root.drawableCache!.clear(), true);
});

test('model and texture failures keep authored state and allow scene-based retry', async t => {
    const loader = sceneLoader(t);
    const report = t.mock.method(console, 'warn', () => {});
    let online = false;
    let images = false;
    const textureUrls: string[] = [];
    t.mock.method(Texture.prototype, 'loadImageData', async function (this: Texture) {
        textureUrls.push(this.fileName);
        if (!images) throw new Error('Texture unavailable');
    });
    t.mock.method(globalThis, 'fetch', async (url: string) => {
        if (url === sceneUrl) return new Response(JSON.stringify({ scene: [
            { name: 'Retry chair', components: [{ type: 'DrawableInstance', path,
                submeshes: [{ material: { albedoTexture: 'images/seat.png' } }, {}] }] },
            { name: 'Independent sibling', components: [{ type: 'Transform', transformMatrix: Array.from(Mat4.MakeIdentity()) }] }
        ] }));
        assert.equal(url, modelUrl);
        return online ? new Response(new Uint8Array(1)) : new Response(null, { status: 404 });
    });
    const root: Node = await loader.loadNode(sceneUrl);
    const instance = root.children[0].drawableInstance!;
    assert.equal(instance.path, path);
    assert.ok(root.children[1].transform);
    assert.ok(instance.loadError);
    assert.equal(instance.valid, false);
    assert.equal(instance.items.length, 0);
    online = true;
    assert.equal(await instance.retryResources(), false);
    assert.equal(root.drawableCache!.find(modelUrl)!.activeLinks, 0);
    images = true;
    loader.currentPath = 'https://example.test/unrelated/';
    assert.equal(await instance.retryResources(), true);
    assert.equal(instance.loadError, undefined);
    assert.deepEqual(textureUrls, [directory + 'images/seat.png', directory + 'images/seat.png']);
    assert.ok(report.mock.calls.every(call => String(call.arguments[0]).includes('Retry chair')));
    instance.destroy();
    assert.equal(root.drawableCache!.clear(), true);
});

test('rebinding during texture preparation releases the stale lease and keeps the newer binding', async t => {
    const cache = new DrawableCache();
    const loader = sceneLoader(t, cache);
    loader.currentPath = directory;
    const original = makeResource(cache, modelUrl);
    const replacement = makeResource(cache, 'replacement');
    let begin!: () => void;
    let finish!: () => void;
    const started = new Promise<void>(resolve => { begin = resolve; });
    t.mock.method(Texture.prototype, 'loadImageData', () =>
        new Promise<void>(resolve => { finish = resolve; begin(); }));
    const instance = new DrawableInstance();
    const pending = instance.deserialize({ path, submeshes: [{ material: { albedoTexture: 'old.png' } }] }, loader);
    await started;
    assert.equal(original.activeLinks, 1);
    instance.bindResource(replacement);
    assert.equal(original.activeLinks, 0);
    assert.equal(cache.remove(modelUrl), true);
    finish();
    await pending;
    assert.equal(instance.resource, replacement);
    assert.equal(instance.items[0].material.albedoTexture, null);
    instance.destroy();
    assert.equal(replacement.activeLinks, 0);
});

class TestRenderer extends Renderer {
    constructor() { super('test'); }
    override polyListFactory(polyList: PolyList): PolyListRenderer {
        return polyList.renderer ?? new PolyListRenderer(this, polyList);
    }
    override materialFactory(material: Material): MaterialRenderer { return new MaterialRenderer(this, material); }
    override pipelineFactory(): Pipeline {
        return new class extends Pipeline {
            override create(): void {}
            override activate(): void {}
        }(this);
    }
}

test('render passes and picking distinguish shared geometry and use the instance node for gizmos', () => {
    const cache = new DrawableCache();
    const resource = makeResource(cache, 'triangle');
    const a = new DrawableInstance(resource);
    const b = new DrawableInstance(resource);
    a.items[0].visible = true;
    a.items[0].transform = Mat4.MakeTranslation(3, 0, 0);
    b.items[0].visible = true;

    const root = new Node('Parent');
    root.addComponent(new Transform(Mat4.MakeScale(2, 2, 2)));
    const nodes = [a, b].map((component, i) => {
        const node = new Node(String(i));
        node.addComponent(new Transform(Mat4.MakeTranslation(i + 1, 0, 0)));
        node.addComponent(new GizmoComponent());
        node.addComponent(component);
        root.addChild(node);
        return node;
    });
    assert.equal(AABoundingBox.FromNode(nodes[0]).min.x, 8);
    assert.equal(AABoundingBox.FromNode(nodes[0]).max.x, 10);

    const renderer = new TestRenderer();
    const queue = new RenderQueue(renderer);
    const passes: { geometry: PolyList; transform: Mat4; selection: SelectionState | null }[] = [];
    const shader = new class extends Shader {
        override setup(geometry: PolyListRenderer, _material: MaterialRenderer, transform: Mat4,
            _view: Mat4, _projection: Mat4, selection: SelectionState | null): void {
            passes.push({ geometry: geometry.polyList, transform, selection });
        }
    }(renderer);
    queue.enableQueue(RenderLayer.OPAQUE_DEFAULT, shader);
    queue.enableQueue(RenderLayer.SELECTION_DEFAULT, shader);
    const visitor = new SelectionIdAssignVisitor();
    root.accept(visitor);
    for (const [i, component] of [a, b].entries()) {
        component.bindRenderer(renderer);
        component.draw(queue, Transform.GetWorldMatrix(nodes[i]));
    }
    queue.draw(RenderLayer.OPAQUE_DEFAULT);
    queue.draw(RenderLayer.SELECTION_DEFAULT);
    assert.equal(passes.length, 4);
    assert.equal(passes[0].geometry, passes[1].geometry);
    assert.equal(passes[0].transform.translation.x, 8);
    assert.equal(passes[1].transform.translation.x, 4);
    const hits = passes.slice(2).map(pass =>
        visitor.findElement(Uint8Array.from(pass.selection!.colorCode, value => Math.round(value * 255)))!);
    assert.deepEqual(hits.map(hit => hit.drawable), [a, b]);
    const selection = new SelectionManager(renderer);
    selection.selection.push(hits[0]);
    const gizmos = new GizmoManager(renderer, selection);
    assert.equal(gizmos.resolveTargetNode(), nodes[0]);
    nodes[0].transform!.matrix.translate(1, 0, 0);
    assert.equal(AABoundingBox.FromNode(nodes[0]).min.x, 10);
    assert.equal(AABoundingBox.FromNode(nodes[1]).min.x, 4);

    nodes[0].destroy();
    assert.equal(gizmos.resolveTargetNode(), null);
    assert.equal(cache.remove('triangle'), false);
    assert.equal(b.valid, true);
    nodes[1].destroy();
    assert.equal(cache.remove('triangle'), true);
});
