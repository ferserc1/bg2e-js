import assert from 'node:assert/strict';
import test from 'node:test';
import DepthRenderShader from '../src/shaders/DepthRenderShader';
import Mat4 from '../src/math/Mat4';

test('depth setup does not run material packing inside the shadow framebuffer', () => {
    const renderer = { typeId: 'WebGL', state: {} };
    const shader = new DepthRenderShader(renderer as any);
    const bound: string[] = [];
    (shader as any)._program = {
        bindMatrix: (name: string) => bound.push(name),
        uniform1i() {}, bindVector() {}, uniform1f() {},
        positionAttribPointer() {}, texCoordAttribPointer() {}
    };
    const materialRenderer = {
        material: { albedoUV: 0, albedoScale: [1,1], alphaCutoff: 0.5 },
        mergeTextures() { assert.fail('Packing switches framebuffer during the depth pass'); },
        bindTexture() {}, bindColor() {}
    };
    const geometry = { positionAttribParams() {}, texCoord0AttribParams() {}, texCoord1AttribParams() {} };
    shader.setup(geometry as any, materialRenderer as any, Mat4.MakeIdentity(), Mat4.MakeIdentity(), Mat4.MakeIdentity());
    assert.deepEqual(bound, ['uModelMatrix', 'uViewMatrix', 'uProjMatrix']);
});
