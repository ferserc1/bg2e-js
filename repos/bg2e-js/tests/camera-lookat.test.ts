import assert from 'node:assert/strict';
import test from 'node:test';
import Mat4 from '../src/math/Mat4';
import Vec from '../src/math/Vec';

test('pitched lookAt centers its target and preserves distances with a rigid camera basis', () => {
    const eye = new Vec(0, 8, 4.5), target = new Vec(0, 1.1, 1.1);
    const distance = Vec.Magnitude(Vec.Sub(eye, target));
    const view = Mat4.MakeLookAt(eye, target, new Vec(0, 1, 0));
    const targetInView = view.multVector(target);
    assert.ok(Math.abs(targetInView.x) < 1e-6);
    assert.ok(Math.abs(targetInView.y) < 1e-6);
    assert.ok(Math.abs(targetInView.z + distance) < 1e-6);
    for (const axis of [new Vec(1,0,0,0), new Vec(0,1,0,0), new Vec(0,0,1,0)]) {
        assert.ok(Math.abs(Vec.Magnitude(view.multVector(axis)) - 1) < 1e-6);
    }
    const world = Mat4.GetInverted(view);
    const position = Mat4.GetPosition(world);
    eye.forEach((value, i) => assert.ok(Math.abs(position[i] - value) < 1e-6));
    const forward = world.forwardVector;
    const focus = Vec.Sub(position, Vec.Mult(forward, distance));
    target.forEach((value, i) => assert.ok(Math.abs(focus[i] - value) < 1e-6));
});
