import Canvas from '../src/app/Canvas';
import Light, { LightType } from '../src/base/Light';
import Material, { getMaterialAppearance } from '../src/base/Material';
import DrawableCache from '../src/db/DrawableCache';
import Drawable from '../src/scene/Drawable';
import PolyList from '../src/base/PolyList';
import { TextureFilter, TextureWrap } from '../src/base/Texture';
import Vec from '../src/math/Vec';
import RenderState from '../src/render/RenderState';
import WebGLMaterialRenderer from '../src/render/webgl/MaterialRenderer';
import WebGLRenderer from '../src/render/webgl/Renderer';
import WebGLTextureRenderer from '../src/render/webgl/TextureRenderer';
import BasicPBRLightShader from '../src/shaders/BasicPBRLightShader';
import PBRLightIBLShader from '../src/shaders/PBRLightIBLShader';

const output = document.getElementById('result')!;
output.textContent = '';

function check(value: unknown, message: string): asserts value {
    if (!value) throw new Error(message);
    output.textContent += `PASS ${message}\n`;
}

try {
    const renderer = new WebGLRenderer();
    const element = document.getElementById('canvas') as HTMLCanvasElement;
    const canvas = new Canvas(element, renderer);
    await canvas.init();
    const gl = renderer.gl;
    const source = 'material-channels.png';
    const pathname = new URL(`./fixtures/${source}`, document.baseURI).href;
    const base = new URL('.', pathname).href;
    const response = await fetch(pathname);
    if (!response.ok) throw new Error(`PNG fixture returned HTTP ${response.status} at ${pathname}`);
    const bytes = await response.arrayBuffer();
    if (!bytes.byteLength) throw new Error('The PNG fixture returned no bytes');
    const file = new File([bytes], source, { type: 'image/png' });
    const data = {
        isUnlit: false, unlit: true, alphaCutoff: 0, visible: false, doubleSided: true,
        albedoTexture: source, albedoTextureSettings: { mag: 1, u: 2 },
        normalTexture: source,
        metalnessTexture: source, metalnessChannel: 1, metalnessInvert: true,
        roughnessTexture: source, roughnessChannel: 2, roughnessInvert: true, roughnessUV: 1,
        lightEmissionTexture: source, lightEmissionChannel: 0, lightEmissionInvert: true,
        ambientOcclussion: source, ambientOcclussionSettings: { color: 1, mipmaps: false }
    };
    const original = new Material(canvas);
    await original.deserialize(data, base);
    check(original.albedoTexture?.imageData, 'Decoded the material image by URL');
    const dropped = new Material(canvas);
    await dropped.deserializeWithDependencies(data, [file]);
    check(dropped.albedoTexture?.imageData, 'Decoded the same image as a dropped file');
    for (const material of [original, dropped]) {
        const appearance = getMaterialAppearance(material);
        check(material.unlit === false && material.alphaCutoff === 0 && !appearance.visible && appearance.cullFace === false,
            `Native flags and zero cutoff from ${material === original ? 'model URL' : 'dropped files'}`);
    }
    check(original.albedoTexture!.fileName === pathname && dropped.albedoTexture!.imageFile === file,
        'URL and dependency sources resolve to their own image');

    const variant = await original.withOverrides({
        visible: true, isUnlit: true, roughnessTexture: null, roughnessUV: 3,
        normalTexture: pathname, albedoTextureSettings: { mag: 0, u: 12 },
        metalnessChannel: '2', indirectTextureMode: 'bakedGI',
        ambientOcclussionSettings: { color: 1 }
    }, base);
    check(variant.normalTexture!.fileName === pathname && variant.normalTexture !== original.normalTexture &&
        variant.normalTexture!.imageData === original.normalTexture!.imageData &&
        variant.roughnessTexture === null && variant.roughnessUV === 1 && variant.metalnessChannel === 1,
        'Overlay inherits controls, clears one slot and replaces another with shared image data');
    check(variant.albedoTexture!.wrapModeX === TextureWrap.CLAMP && variant.albedoTexture!.magFilter === TextureFilter.LINEAR &&
        original.albedoTexture!.magFilter === TextureFilter.NEAREST && original.roughnessTexture !== null,
        'Sampler edits are isolated');
    const reset = await original.withOverrides({ albedoTexture: source, indirectTextureMode: 'bakedGI' }, base);
    check(reset.albedoTexture!.wrapModeX === TextureWrap.REPEAT && reset.albedoTexture!.magFilter === TextureFilter.LINEAR &&
        !reset.ambientOcclussion!.linearData && variant.ambientOcclussion!.linearData &&
        !variant.ambientOcclussion!.mipmapRequired, 'Replacement uses fresh settings and baked mode is resolved before AO settings');

    const packed = renderer.factory.material(original) as WebGLMaterialRenderer;
    packed.mergeTextures();
    const packedTexture = renderer.factory.texture(packed.metalnessRoughnessEmissionHeightTexture) as WebGLTextureRenderer;
    const bakedTexture = renderer.factory.texture(variant.ambientOcclussion!) as WebGLTextureRenderer;
    const framebuffer = gl.createFramebuffer();
    const pixel = new Uint8Array(4);
    function readTexture(texture: WebGLTextureRenderer): void {
        const apiObject = texture.getApiObject();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, apiObject, 0);
        const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status !== gl.FRAMEBUFFER_COMPLETE) throw new Error(`Readback framebuffer status: 0x${status.toString(16)}`);
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
        const error = gl.getError();
        if (error !== gl.NO_ERROR) throw new Error(`WebGL error during texture packing or readback: 0x${error.toString(16)}`);
    }
    readTexture(packedTexture);
    check([127, 63, 191].every((channel, index) => Math.abs(channel - pixel[index]) <= 3),
        `Packing inverts the selected G, B and R channels (${pixel.join(', ')})`);
    readTexture(bakedTexture);
    check([64, 128, 192].every((channel, index) => Math.abs(channel - pixel[index]) <= 3),
        'Baked GI upload preserves all three color channels');
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.deleteFramebuffer(framebuffer);

    const triangle = new PolyList();
    triangle.vertex = [-1, -1, 0, 0, 1, 0, 1, -1, 0];
    triangle.normal = [0, 0, 1, 0, 0, 1, 0, 0, 1];
    triangle.texCoord0 = triangle.texCoord1 = [0, 0, 0.5, 1, 1, 0];
    triangle.index = [0, 1, 2]; // Back-facing with CCW front faces.
    const geometry = renderer.factory.polyList(triangle);
    const material = new Material(canvas);
    await material.deserialize({ albedo: [1, 0, 0, 0.25], isUnlit: true, doubleSided: true, alphaCutoff: 0 }, base);
    const renderMaterial = renderer.factory.material(material);
    const light = new Light();
    light.type = LightType.DISABLED;
    const basic = new BasicPBRLightShader(renderer);
    await basic.load();
    basic.cameraPosition = new Vec(0, 0, 5);
    basic.lights = [light];
    const environment = renderer.factory.environment();
    await environment.load({
        environmentMapSize: [16, 16], irradianceMapSize: [4, 4],
        skyZenithColor: [0, 0, 0], skyHorizonColor: [0, 0, 0], groundColor: [0, 0, 0]
    });
    environment.updateMaps();
    const ibl = new PBRLightIBLShader(renderer);
    await ibl.load();
    ibl.environment = environment;
    ibl.cameraPosition = new Vec(0, 0, 5);
    ibl.lights = [light];
    const draw = (shader: BasicPBRLightShader | PBRLightIBLShader) => {
        gl.viewport(0, 0, element.width, element.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        new RenderState({ shader, materialRenderer: renderMaterial, polyListRenderer: geometry }).draw();
        gl.readPixels(element.width / 2, element.height / 2, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
        return pixel[3] > 0 ? pixel[0] : 0;
    };
    const basicUnlit = draw(basic);
    const iblUnlit = draw(ibl);
    check(basicUnlit > 180 && iblUnlit > 180,
        `Both PBR shaders draw unlit back faces with zero cutoff (Basic: ${basicUnlit}, IBL: ${iblUnlit})`);
    await material.deserialize({ isUnlit: false, unlit: true, doubleSided: true, alphaCutoff: 0 }, base);
    const basicLit = draw(basic);
    const iblLit = draw(ibl);
    check(basicLit < 100 && iblLit < 100,
        `Both PBR shaders return to lighting when isUnlit is false (Basic: ${basicLit}, IBL: ${iblLit})`);
    await material.deserialize({ isUnlit: true, doubleSided: false, alphaCutoff: 0 }, base);
    check(draw(basic) === 0, 'Single-sided back faces are culled');
    await material.deserialize({ visible: false, doubleSided: true, alphaCutoff: 0 }, base);
    check(triangle.visible && draw(basic) === 0, 'Material visibility is independent of submesh visibility');
    await material.deserialize({ visible: true, doubleSided: true, alphaCutoff: 0.5 }, base);
    check(draw(basic) === 0, 'Cutoff above the authored alpha discards the fragment');

    const cache = new DrawableCache();
    const sourceDrawable = new Drawable('Triangle');
    sourceDrawable.addPolyList(triangle, original);
    const resource = cache.add('triangle', sourceDrawable);
    const lease = resource.retain();
    const sharedGeometry = lease.bindGeometry(0, renderer) as import('../src/render/webgl/PolyListRenderer').default;
    const owner = new Drawable();
    owner.bindResource(resource);
    owner.bindRenderer(renderer);
    const ownedRenderer = owner.items[0].materialRenderer as WebGLMaterialRenderer;
    ownedRenderer.mergeTextures();
    const ownedPackedTexture = renderer.factory.texture(ownedRenderer.metalnessRoughnessEmissionHeightTexture) as WebGLTextureRenderer;
    const ownedTextureId = ownedPackedTexture.getApiObject();
    check(gl.isTexture(ownedTextureId) && !cache.remove('triangle'), 'Cache refuses to remove linked WebGL geometry');
    owner.destroy();
    check(!gl.isTexture(ownedTextureId) && sharedGeometry.valid,
        'Destroying the owner releases its packed texture and keeps the shared geometry');
    lease.release();
    check(cache.remove('triangle') && !sharedGeometry.valid, 'Unloading the unlinked resource releases its shared vertex buffers');

    check(gl.getError() === gl.NO_ERROR, 'WebGL completed without errors');
    output.textContent += 'ALL MATERIAL CHECKS PASSED';
}
catch (error) {
    output.textContent += `FAIL ${error instanceof Error ? error.message : String(error)}`;
    if (error instanceof Error && error.stack) output.textContent += `\n${error.stack}`;
}
