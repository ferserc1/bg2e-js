import assert from 'node:assert/strict';
import test from 'node:test';
import cube from '../src/primitives/cube';
import PolyList from '../src/base/PolyList';

function checkFrame(mesh: PolyList) {
    assert.equal(mesh.tangent!.length, mesh.vertex.length);
    for (let i = 0; i < mesh.vertex.length / 3; ++i) {
        const t = mesh.tangent!.slice(i * 3, i * 3 + 3);
        const n = mesh.normal.slice(i * 3, i * 3 + 3);
        assert.ok(t.every(Number.isFinite));
        assert.ok(Math.abs(Math.hypot(...t) - 1) < 1e-6);
        assert.ok(Math.abs(t.reduce((v, x, k) => v + x * n[k], 0)) < 1e-6);
        assert.ok(Math.abs(mesh.tangentSigns[i]) === 1);
    }
}

test('procedural cube has six planar faces and finite tangent frames', () => {
    const mesh = cube(1, 1, 1);
    assert.equal(mesh.vertex.length / 3, 36);
    const faces = new Set<string>();
    for (let i = 0; i < 36; i += 6) {
        const normal = mesh.normal.slice(i * 3, i * 3 + 3);
        faces.add(normal.join(','));
        for (let j = i; j < i + 6; ++j) assert.deepEqual(mesh.normal.slice(j * 3, j * 3 + 3), normal);
    }
    assert.equal(faces.size, 6);
    checkFrame(mesh);
});

test('indexed triangles share vertex tangents, mirrored UVs preserve handedness, degenerate UVs remain finite', () => {
    const mesh = new PolyList();
    mesh.vertex = [0,0,0, 1,0,0, 0,1,0, 1,1,0];
    mesh.normal = [0,0,1, 0,0,1, 0,0,1, 0,0,1];
    mesh.index = [0,1,2, 2,1,3];
    mesh.texCoord0 = [0,0, 1,0, 0,1, 1,1];
    checkFrame(mesh);
    assert.deepEqual(mesh.tangentSigns, [1,1,1,1]);
    for (let i = 0; i < 4; ++i) assert.deepEqual(mesh.tangent!.slice(i*3,i*3+3), [1,0,0]);
    mesh.texCoord0 = [1,0, 0,0, 1,1, 0,1];
    mesh.rebuildTangents();
    checkFrame(mesh);
    assert.deepEqual(mesh.tangentSigns, [-1,-1,-1,-1]);
    mesh.texCoord0 = Array(8).fill(0);
    mesh.rebuildTangents();
    checkFrame(mesh);
});
