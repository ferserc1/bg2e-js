import assert from 'node:assert/strict';
import test from 'node:test';
import type Canvas from '../src/app/Canvas';
import Bg2LoaderPlugin from '../src/db/Bg2LoaderPlugin';
import Loader, { registerLoaderPlugin } from '../src/db/Loader';
import VitscnjLoaderPlugin from '../src/db/VitscnjLoaderPlugin';
import Mat4 from '../src/math/Mat4';
import Node from '../src/scene/Node';
import { isSubmeshMatrix } from '../src/scene/SceneData';
import { registerComponents } from '../src/scene/index';
import { ResourceType } from '../src/tools/Resource';

const identity = Array.from(Mat4.MakeIdentity());
const uv0 = [0.125, 0.25, 0.875, 0.25, 0.125, 0.75];
const uv1 = [0.125, 0.75, 0.875, 0.75, 0.125, 0.25];

function polyList(name: string, matName: string, texCoord1: number[] = []) {
    return {
        name, matName, visible: false,
        vertex: [0, 0, 0, 1, 0, 0, 0, 1, 0], normal: [0, 0, 1, 0, 0, 1, 0, 0, 1],
        index: [0, 1, 2], texCoord0: uv0, texCoord1, texCoord2: []
    };
}

test('scene headers share validation and malformed descendants do not stop import', async t => {
    const loader = new Loader({} as Canvas);
    registerComponents();
    registerLoaderPlugin(new VitscnjLoaderPlugin());
    let document: unknown;
    t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify(document)));
    const warn = t.mock.method(console, 'warn', () => {});
    const translated = [...identity];
    translated[12] = 4;
    translated[13] = -2;
    const malformedMatrix = [...identity];
    malformedMatrix[7] = '0' as any;
    const scene = [{
        name: 'Owner', enabled: false, steady: true,
        components: [null, { type: [] }, { type: 'Transform', priority: 0xffffffff, transformMatrix: translated }],
        children: [42, [], { name: 'Child', enabled: 'false', components: [
            { type: 'Transform', priority: 0x100000000, transformMatrix: malformedMatrix }
        ] }, { name: 'Array fields', components: false, children: {} }]
    }];

    for (const extension of ['json', 'vitscnj']) {
        for (const header of [{}, { fileType: 'bg2e::scene', version: { major: 100 } }]) {
            document = { ...header, scene };
            const root: Node = await loader.loadNode(`scene.${extension}?preview=preview.png#test`);
            assert.equal(root.name, 'Scene Root');
            const [owner] = root.children;
            assert.equal(owner.enabled, false);
            assert.equal(owner.steady, true);
            assert.equal(owner.transform!.priority, 0xffffffff);
            assert.deepEqual(Array.from(owner.transform!.matrix), translated);
            assert.deepEqual(owner.children.map(node => node.name), ['Child', 'Array fields']);
            const [child] = owner.children;
            assert.equal(child.enabled, true);
            assert.equal(child.transform!.priority, 0);
            assert.deepEqual(Array.from(child.transform!.matrix), identity);
        }
        for (const fileType of [null, 0, 'vwgl::scene']) {
            document = { fileType, scene };
            await assert.rejects(loader.loadNode(`scene.${extension}`), /document type/);
        }
        document = { scene: {} };
        await assert.rejects(loader.loadNode(`scene.${extension}`), /scene array/);
        document = { scene: [null] };
        await assert.rejects(loader.loadNode(`scene.${extension}`), /top-level scene node at index 0/);
    }
    assert.ok(warn.mock.calls.some(call => String(call.arguments[0]).includes('Skipping invalid child')));
    assert.ok(warn.mock.calls.some(call => String(call.arguments[0]).includes('Skipping component')));
});

test('submesh matrices must be finite, affine and invertible at the native threshold', () => {
    const scaled = (x: number, y = 1) => {
        const matrix = [...identity];
        matrix[0] = x;
        matrix[5] = y;
        return matrix;
    };
    const projective = [...identity];
    projective[11] = 1;
    assert.ok(isSubmeshMatrix(identity));
    assert.ok(isSubmeshMatrix(scaled(-1e-12)));
    assert.equal(isSubmeshMatrix(scaled(1e-13)), false);
    assert.equal(isSubmeshMatrix(scaled(0)), false);
    assert.equal(isSubmeshMatrix(scaled(1e200, 1e200)), false);
    assert.equal(isSubmeshMatrix(scaled(Infinity)), false);
    assert.equal(isSubmeshMatrix(projective), false);
});

test('concurrent scene imports resolve owners within their own scene directory', async t => {
    const loader = new Loader({} as Canvas);
    loader.currentPath = 'https://example.test/project/';
    const fixture = { materials: [{ name: 'Material' }], polyLists: [polyList('Mesh', 'Material')], components: [] };
    t.mock.method(loader.wasm, 'load', async () => ({ loadBg2FileAsJson: () => structuredClone(fixture) }));
    t.mock.method(console, 'warn', () => {});
    const modelPaths: string[] = [];
    let release!: () => void;
    const holdFirst = new Promise<void>(resolve => { release = resolve; });
    const documents = new Map([
        ['https://example.test/project/a/scene.json?download=/other/path', [{
            name: 'Legacy', components: [{ type: 'Drawable', name: '../shared.v1/seat.old?download=1#model', path: 7, priority: 7 }]
        }, { name: 'Empty', components: [{ type: 'Drawable', path: '', name: 'unused' }] }]],
        ['https://example.test/project/b/scene.vitscnj', [{
            name: 'Native', components: [{ type: 'Drawable', path: 'models/chair.bg2', resourceName: 'Editable' }]
        }, { name: 'Absolute', components: [{ type: 'Drawable', path: 'https://cdn.test/table.bg2', resourceName: 1 }] }]]
    ]);
    t.mock.method(globalThis, 'fetch', async (path: string) => {
        if (documents.has(path)) {
            if (path.includes('/a/')) await holdFirst;
            return new Response(JSON.stringify({ scene: documents.get(path) }));
        }
        modelPaths.push(path);
        return new Response(new Uint8Array(1));
    });

    const first = loader.loadNode('a/scene.json?download=/other/path');
    const second: Node = await loader.loadNode('b/scene.vitscnj');
    release();
    const other: Node = await first;
    assert.equal(loader.currentPath, 'https://example.test/project/');
    assert.deepEqual(modelPaths, [
        'https://example.test/project/b/models/chair.bg2',
        'https://cdn.test/table.bg2',
        'https://example.test/project/shared.v1/seat.bg2?download=1'
    ]);
    assert.deepEqual(second.children.map(node => node.drawable!.name), ['Editable', 'table']);
    assert.equal(other.children[0].drawable!.name, 'seat');
    assert.equal(other.children[0].drawable!.priority, 7);
    assert.equal(other.children[1].drawable, undefined);
});

test('BG2 material matches consume duplicate entries in order and preserve geometry metadata', async t => {
    const loader = new Loader({} as Canvas);
    const materials = [
        { name: 'Finish', class: 'PBRMaterial', groupName: 'First', visible: false },
        { name: 'finish', groupName: 'Lowercase' },
        { name: 'Finish', groupName: 'Second', visible: true }
    ];
    const polyLists = [
        polyList('Back', 'Finish'),
        polyList('Base', 'finish', uv1),
        polyList('Seat', 'Finish'),
        polyList('Arm', 'Finish')
    ];
    t.mock.method(loader.wasm, 'load', async () => ({
        loadBg2FileAsJson: () => structuredClone({ materials, polyLists, components: [] })
    }));
    const imported: string[] = [];
    const plugin = new Bg2LoaderPlugin({ materialImportCallback: material => {
        if (material.groupName === 'First') assert.equal(material.type, 'PBRMaterial');
        imported.push(material.groupName);
        return { ...material, name: 'Edited', groupName: material.groupName + '!' };
    } });
    const buffer = new ArrayBuffer(1);
    const meshes = await plugin.loadBuffer(buffer, 'bg2', [], ResourceType.PolyList, loader);
    assert.deepEqual(imported, ['First', 'Lowercase', 'Second']);
    assert.deepEqual(meshes.map((mesh: any) => mesh.name), ['Back', 'Base', 'Seat', 'Arm']);
    assert.deepEqual(meshes.map((mesh: any) => mesh.groupName), ['First!', 'Lowercase!', 'Second!', 'First!']);
    assert.deepEqual(meshes.map((mesh: any) => mesh.visible), [false, true, true, false]);
    assert.deepEqual(meshes[0].texCoord0, uv0);
    assert.deepEqual(meshes[0].texCoord1, uv0);
    assert.notEqual(meshes[0].texCoord1, meshes[0].texCoord0);
    assert.deepEqual(meshes[1].texCoord1, uv1);

    polyLists.push(polyList('Unknown', 'FINISH'));
    await assert.rejects(plugin.loadBuffer(buffer, 'bg2', [], ResourceType.PolyList, loader), /"Unknown".*"FINISH"/);
});
