import assert from 'node:assert/strict';
import test from 'node:test';
import Light, { LightType } from '../src/base/Light';
import { evaluateSolarLight } from '../src/base/SolarLight';
import Vec from '../src/math/Vec';
import Mat4 from '../src/math/Mat4';
import Node from '../src/scene/Node';
import Transform from '../src/scene/Transform';
import EnvironmentComponent from '../src/scene/EnvironmentComponent';
import LightComponent from '../src/scene/LightComponent';
import { deserializeComponent } from '../src/scene/Component';
import { registerComponents } from '../src/scene/index';
import Loader from '../src/db/Loader';

registerComponents();

function sun() {
    const light = new Light();
    light.type = LightType.SUN;
    light.color = [1, 1, 1];
    light.intensity = 1;
    return light;
}

test('native LightSource imports nested lightData and preserves zero/false and solar fields', async () => {
    const component = await deserializeComponent({ type: 'LightSource', lightData: {
        type: 'kTypeSun', color: [1, 0.8, 0.6, 1], intensity: 0, castShadows: false,
        sourceSize: 0, shadowSamples: 16, affectsReflections: false,
        solarSize: 2, solarDistanceMillionKm: 80
    } }, {} as Loader) as LightComponent;
    assert.equal(component.light.type, LightType.SUN);
    assert.equal(component.light.intensity, 0);
    assert.equal(component.light.castShadows, false);
    assert.equal(component.light.sourceSize, 0);
    assert.equal(component.light.affectsReflections, false);
    assert.deepEqual(Array.from(component.light.direction), [0, 0, 1]);
    const copy = component.clone();
    assert.equal(copy.light.solarSize, 2);
    assert.equal(copy.light.solarDistanceMillionKm, 80);
    const data: any = {};
    await component.serialize(data, null);
    const restored = new LightComponent();
    await restored.deserialize(data, null);
    assert.equal(restored.light.shadowSamples, 16);
    assert.equal(restored.light.intensity, 0);
    assert.equal(restored.light.solarSize, 2);
});

test('solar defaults, angular radius and distance scaling agree with native units', async () => {
    const light = sun();
    const normal = evaluateSolarLight(light, new Vec(0, -1, 0), false);
    assert.ok(Math.abs(normal.angularRadius * 180 / Math.PI - 0.26644) < 0.0001);
    light.solarDistanceMillionKm *= 2;
    const far = evaluateSolarLight(light, new Vec(0, -7, 0), false);
    assert.equal(far.intensity, 0.25);
    assert.deepEqual(Array.from(far.direction, v => v + 0), [0, 1, 0]);
    await light.deserialize({ type: 'kTypeSun', color: [1, 1, 1], intensity: 1 });
    assert.equal(light.solarSize, 1);
    assert.equal(light.solarDistanceMillionKm, 149.6);
    await light.deserialize({ type: 'unrecognized' });
    assert.equal(light.type, LightType.DISABLED);
});

test('terrestrial transmission warms the horizon and clips direct light without altering authored values', () => {
    const light = sun();
    const noon = evaluateSolarLight(light, new Vec(0, -1, 0));
    const horizon = evaluateSolarLight(light, new Vec(1, 0, 0));
    const night = evaluateSolarLight(light, new Vec(0, 1, 0));
    assert.equal(noon.visibility, 1);
    assert.equal(horizon.visibility, 0.5);
    assert.equal(night.intensity, 0);
    assert.ok(horizon.color[2] / horizon.color[0] < noon.color[2] / noon.color[0]);
    assert.equal(evaluateSolarLight(light, new Vec(0, 1, 0), false).intensity, 1);
    assert.equal(light.intensity, 1);
    assert.deepEqual(Array.from(light.color).slice(0, 3), [1, 1, 1]);
    assert.throws(() => { light.solarSize = NaN; });
    assert.throws(() => { light.solarDistanceMillionKm = 0; });
    assert.throws(() => evaluateSolarLight(light, new Vec(0, 0, 0)));
});

test('environment imports native colors/aliases, clears image, and resolves same-node world +Z sun', async () => {
    const environment = new EnvironmentComponent();
    await environment.deserialize({ environmentImage: 'sky.jpg', skyboxVisible: false, irradianceIntensity: 0,
        skyHorizonColor: [0.1, 0.2, 0.3, 1], skyboxBlur: 0.4 }, { currentPath: '/assets/' });
    assert.equal(environment.equirectangularTexture, '/assets/sky.jpg');
    assert.equal(environment.showSkybox, false);
    assert.equal(environment.irradianceIntensity, 0);
    assert.deepEqual(environment.clone().skyHorizonColor, [0.1, 0.2, 0.3]);
    const node = new Node('Sun and environment');
    const parent = new Node('Parent');
    parent.addChild(node);
    node.addComponent(environment);
    node.addComponent(new LightComponent(sun()));
    parent.addComponent(new Transform(Mat4.MakeRotation(Math.PI / 2, 1, 0, 0)));
    assert.equal(environment.solarState, null, 'image disables atmospheric association');
    await environment.deserialize({ equirectangularTexture: '' }, { currentPath: '/assets/' });
    assert.deepEqual(environment.skyHorizonColor, [0.55, 0.65, 0.8]);
    assert.ok(environment.solarState!.direction.y > 0.99);
    node.addComponent(new Transform(Mat4.MakeTranslation(4, 5, 6)));
    assert.ok(environment.solarState!.direction.y > 0.99, 'translation must not move sun');
    await assert.rejects(environment.deserialize({ groundColor: [2, 0, 0] }, {}));
});

test('shadow light selection tracks Sun type, enabled ancestors and castShadows changes', () => {
    const root = new Node();
    const node = new Node();
    const component = new LightComponent(sun());
    node.addComponent(component); root.addChild(node);
    assert.equal(LightComponent.GetMainDirectionalLight(root), component);
    component.light.castShadows = false;
    assert.equal(LightComponent.GetMainDirectionalLight(root), undefined);
    component.light.castShadows = true;
    node.enabled = false;
    assert.equal(LightComponent.GetMainDirectionalLight(root), undefined);
});

test('native scene loader imports Sun and environment without a sample-specific adapter', async t => {
    const { default: Resource, ResourceType } = await import('../src/tools/Resource');
    const { default: SceneLoader } = await import('../src/db/VitscnjLoaderPlugin');
    const document = { fileType: 'bg2e::scene', scene: [{ name: 'Native solar node', components: [
        { type: 'Transform', transformMatrix: Array.from(Mat4.MakeRotation(Math.PI / 2, 1, 0, 0)) },
        { type: 'LightSource', lightData: { type: 'kTypeSun', color: [1, 1, 1, 1], intensity: 1 } },
        { type: 'Environment', equirectangularTexture: '', skyboxVisible: false, skyboxBlur: 0.3,
            skyZenithColor: [0.1, 0.2, 0.3, 1] }
    ] }] };
    t.mock.method(Resource.prototype, 'load', async () => document);
    const loader = { currentPath: '/previous/' } as Loader;
    const plugin = new SceneLoader();
    const scene = await plugin.load('/scene/native.json', ResourceType.Node, loader);
    const lights = LightComponent.GetLights(scene);
    assert.equal(lights.length, 1);
    assert.equal(lights[0].light.type, LightType.SUN);
    assert.equal(lights[0].light.intensity, 1);
    const environment = lights[0].node.component('Environment') as EnvironmentComponent;
    assert.equal(environment.showSkybox, false);
    assert.ok(environment.solarState!.direction.y > 0.99);
    assert.equal(loader.currentPath, '/previous/');
    t.mock.method(Resource.prototype, 'load', async () => { throw new Error('load failed'); });
    await assert.rejects(plugin.load('/scene/broken.json', ResourceType.Node, loader));
    assert.equal(loader.currentPath, '/previous/');
});

test('shadow source angles retain native directional degrees and physical solar size', async () => {
    const { shadowSourceTangent } = await import('../src/render/ShadowRenderer');
    const light = sun();
    const solarTangent = shadowSourceTangent(light);
    light.sourceSize = 70;
    assert.equal(shadowSourceTangent(light), solarTangent, 'Sun ignores ordinary sourceSize');
    light.solarSize *= 2;
    assert.ok(shadowSourceTangent(light) > solarTangent * 1.99);
    light.type = LightType.DIRECTIONAL;
    light.sourceSize = 0.5;
    assert.ok(Math.abs(shadowSourceTangent(light) - Math.tan(Math.PI / 360)) < 1e-10);
    light.sourceSize = 0;
    assert.equal(shadowSourceTangent(light), 0);
});

test('PBR light updates preserve effective solar values and permit an IBL-only scene', async () => {
    const { default: PBRLightIBLShader } = await import('../src/shaders/PBRLightIBLShader');
    const shader = new PBRLightIBLShader({ typeId: 'WebGL' } as any);
    (shader as any)._programs[1] = {}; // This test inspects CPU extraction; GPU compilation has a separate fixture.
    const light = sun();
    shader.lightTransforms = [Mat4.MakeRotation(Math.PI / 2, 1, 0, 0)];
    shader.solarAtmosphereLight = light;
    shader.lights = [light];
    const noon = (shader as any)._lightIntensities[0];
    assert.equal(noon, 1);
    shader.lightTransforms = [Mat4.MakeRotation(-Math.PI / 2, 1, 0, 0)];
    shader.updateLight(light, 0);
    assert.equal((shader as any)._lightIntensities[0], 0);
    shader.solarAtmosphereLight = null;
    shader.updateLights([light]);
    assert.equal((shader as any)._lightIntensities[0], 1, 'HDR/unassociated sun is not horizon clipped');
    shader.lights = [];
    assert.equal((shader as any)._lightIntensities[0], 0);
});
