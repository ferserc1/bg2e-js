import assert from 'node:assert/strict';
import test from 'node:test';
import Mat4 from '../src/math/Mat4';
import Vec from '../src/math/Vec';
import { directionalShadowView } from '../src/render/ShadowRenderer';

function close(actual: ArrayLike<number>, expected: number[]) {
    expected.forEach((value, i) => assert.ok(Math.abs(actual[i] - value) < 0.0001, `${actual[i]} != ${value}`));
}

test('native +Z sunlight illuminates the floor and shadow camera looks down the same rays', () => {
    // Native scene light rotation: local +Z points down towards the floor.
    const transform = new Mat4([
        0.70710677,0,-0.70710677,0,
        0.61237246,0.49999997,0.61237246,0,
        0.35355335,-0.86602545,0.35355335,0,
        0,5,0,1
    ]);
    const ray = Mat4.GetRotation(transform).multVector(new Vec(0,0,1)).xyz.normalize();
    assert.ok(-ray.y > 0.86, 'Up-facing floor must receive positive N dot L');
    const focus = new Vec(1,0,2);
    const view = directionalShadowView(focus, ray, 100);
    const eye = Mat4.GetPosition(Mat4.GetInverted(view));
    assert.ok(eye.y > focus.y, 'Sun shadow camera must be above the floor');
    close(view.multVector(focus), [0,0,-100,1]);
    close(view.multVector(Vec.Add(focus, ray)), [0,0,-101,1]);
});

test('shadow view supports legacy -Z and vertical ray directions', () => {
    const focus = new Vec(0,0,0);
    for (const ray of [new Vec(0,0,-1), new Vec(0,0,1), new Vec(0,-1,0)]) {
        const view = directionalShadowView(focus, ray, 100);
        assert.ok(Array.from(view).every(Number.isFinite));
        close(view.multVector(focus), [0,0,-100,1]);
        close(view.multVector(ray), [0,0,-101,1]);
    }
});
