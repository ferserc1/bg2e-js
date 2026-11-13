import Canvas from '../src/app/Canvas';
import WebGLRenderer from '../src/render/webgl/Renderer';
import Light, { LightType } from '../src/base/Light';
import Material from '../src/base/Material';
import { evaluateSolarLight } from '../src/base/SolarLight';
import Vec from '../src/math/Vec';
import Mat4 from '../src/math/Mat4';
import Node from '../src/scene/Node';
import Transform from '../src/scene/Transform';
import Camera from '../src/scene/Camera';
import Drawable from '../src/scene/Drawable';
import LightComponent from '../src/scene/LightComponent';
import EnvironmentComponent from '../src/scene/EnvironmentComponent';
import { createCube } from '../src/primitives';

const output = document.getElementById('result')!;
const messages: string[] = [];
const check = (condition: boolean, message: string) => {
    if (!condition) throw new Error(message);
    messages.push(`PASS ${message}`); output.textContent = messages.join('\n');
};
try {
    const renderer = new WebGLRenderer();
    const canvas = new Canvas(document.getElementById('canvas') as HTMLCanvasElement, renderer);
    await canvas.init();
    renderer.state.depthTestEnabled = true;
    const gl = renderer.gl;
    const readError = gl.getError.bind(gl);
    for (const key of Object.getOwnPropertyNames(WebGLRenderingContext.prototype)) {
        const method = (gl as any)[key];
        if (typeof method !== 'function' || key === 'getError' || key === 'constructor') continue;
        (gl as any)[key] = (...args: any[]) => {
            const result = method.apply(gl, args);
            const error = readError();
            if (error) throw new Error(`WebGL ${key}: ${error} in ${renderer.state.shaderProgram?.name}`);
            return result;
        };
    }
    const glOK = () => {
        const error = gl.getError();
        if (error !== gl.NO_ERROR) throw new Error(`WebGL error ${error}`);
        return true;
    };
    const environment = renderer.factory.environment();
    const light = new Light(); light.type = LightType.SUN; light.color = [1, 1, 1]; light.intensity = 1;
    await environment.load({ environmentMapSize: [32, 32], irradianceMapSize: [4, 4],
        solar: evaluateSolarLight(light, new Vec(0, -1, 0)) });
    environment.updateMaps();
    check(glOK(), 'Procedural HDR sky and IBL render without GL errors');
    const source = environment.backgroundMap!;
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    const texture = (renderer.factory.texture(source) as any).getApiObject();
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, texture, 0);
    const pixel = new Float32Array(4);
    gl.readPixels(16, 16, 1, 1, gl.RGBA, gl.FLOAT, pixel);
    check(Math.abs(pixel[0] - 0.04) < 0.002, 'Generated ground retains native linear RGB');
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.deleteFramebuffer(framebuffer);
    const publishedMap = environment.environmentMap;
    try { await environment.load({ environmentMapSize: [3, 3] }); } catch { /* intentional invalid request */ }
    check(environment.environmentMap === publishedMap, 'Failed environment generation preserves published maps');
    const hdr = renderer.factory.environment();
    await hdr.load({ textureUrl: './fixtures/linear.hdr', environmentMapSize: [32, 32], irradianceMapSize: [4, 4] });
    const hdrFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, hdrFramebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        (renderer.factory.texture(hdr.environmentMap!) as any).getApiObject(), 0);
    gl.readPixels(16, 16, 1, 1, gl.RGBA, gl.FLOAT, pixel);
    check(Math.abs(pixel[0] - 2) < 0.01 && Math.abs(pixel[1] - 1) < 0.01 && glOK(),
        'Radiance HDR retains values above one without gamma decoding');
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.deleteFramebuffer(hdrFramebuffer);
    hdr.destroy();
    // Regression: an isolated solar disk must become a smooth rough reflection,
    // rather than a few high-energy Hammersley samples stamped across the cube.
    const solarProbe = renderer.factory.environment();
    await solarProbe.load({ environmentMapSize: [128, 128], irradianceMapSize: [4, 4],
        skyHorizonColor: [0, 0, 0], skyZenithColor: [0, 0, 0], groundColor: [0, 0, 0],
        solar: evaluateSolarLight(light, new Vec(-0.35, -0.87, -0.35)) });
    const probeFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, probeFramebuffer);
    const probeTexture = (renderer.factory.texture(solarProbe.environmentMap!) as any).getApiObject();
    const peakAt = (level: number) => {
        const size = 128 / Math.pow(2, level);
        const pixels = new Float32Array(size * size * 4);
        let peak = 0;
        for (let face = 0; face < 6; ++face) {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X + face, probeTexture, level);
            gl.readPixels(0, 0, size, size, gl.RGBA, gl.FLOAT, pixels);
            for (let i = 0; i < pixels.length; i += 4) {
                if (!Number.isFinite(pixels[i])) throw new Error('Nonfinite solar prefilter');
                peak = Math.max(peak, pixels[i]);
            }
        }
        return peak;
    };
    const sharpPeak = peakAt(0);
    const roughPeak = peakAt(solarProbe.maxSpecularLod);
    check(sharpPeak > 100, `Solar HDR radiance is retained (peak ${sharpPeak.toFixed(2)})`);
    check(roughPeak > 0.01 && roughPeak < 2, `Rough solar reflection has no isolated fireflies (peak ${roughPeak.toFixed(3)})`);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.deleteFramebuffer(probeFramebuffer);
    solarProbe.destroy();
    const root = new Node('GPU test');
    const solarNode = new Node('Sun');
    solarNode.addComponent(new Transform(Mat4.MakeRotation(Math.PI / 3, 1, 0, 0)));
    solarNode.addComponent(new LightComponent(light));
    const envComponent = new EnvironmentComponent();
    envComponent.cubemapSize = 32; envComponent.irradianceMapSize = 4;
    solarNode.addComponent(envComponent); root.addChild(solarNode);
    const cameraNode = new Node('Camera'); const camera = new Camera();
    cameraNode.addComponent(camera); cameraNode.addComponent(new Transform(Mat4.MakeTranslation(0, 1, 5)));
    root.addChild(cameraNode);
    const object = new Node('Cube'); const drawable = new Drawable();
    drawable.addPolyList(createCube(1, 1, 1), new Material()); object.addComponent(drawable); root.addChild(object);
    const scene = renderer.factory.scene();
    await scene.init({ shadowMapSize: 128, softShadows: true });
    await scene.setEnvironment(environment);
    await scene.bindRenderer(root);
    scene.resize(root, 640, 400);
    await scene.frame(root, 0); scene.draw();
    check(glOK(), 'PBR Sun, analytic disk and PCSS compile and render');
    const oldMap = scene.environment!.environmentMap;
    solarNode.transform!.matrix.rotate(0.1, 0, 1, 0);
    await scene.frame(root, 0); scene.draw();
    check(scene.environment!.environmentMap !== oldMap && glOK(), 'Solar rotation regenerates maps and renders');
    envComponent.skyboxBlur = 0.5;
    await scene.frame(root, 0); scene.draw();
    check(glOK(), 'Blurred sky uses prefiltered solar map');
    solarNode.enabled = false;
    await scene.frame(root, 0); scene.draw();
    check(scene.environment === environment && glOK(), 'Disabled active environment restores fallback');
    output.textContent += '\nALL GPU CHECKS PASSED';
} catch (error) {
    output.textContent += `\nFAIL ${error instanceof Error ? error.stack : error}`;
}
