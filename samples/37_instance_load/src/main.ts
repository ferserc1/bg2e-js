import { app, base, db, render, scene } from "bg2e-js/ts";
import type Canvas from "bg2e-js/ts/app/Canvas.ts";
import type Material from "bg2e-js/ts/base/Material.ts";
import { getMaterialAppearance } from "bg2e-js/ts/base/Material.ts";
import type Texture from "bg2e-js/ts/base/Texture.ts";
import type Loader from "bg2e-js/ts/db/Loader.ts";
import type Drawable from "bg2e-js/ts/scene/Drawable.ts";
import type DrawableInstance from "bg2e-js/ts/scene/DrawableInstance.ts";
import type Node from "bg2e-js/ts/scene/Node.ts";
import type WebGLMaterialRenderer from "bg2e-js/ts/render/webgl/MaterialRenderer.ts";
import type WebGLRenderer from "bg2e-js/ts/render/webgl/Renderer.ts";
import type WebGLTextureRenderer from "bg2e-js/ts/render/webgl/TextureRenderer.ts";

const referenceMode = new URLSearchParams(location.search).get("scene") === "reference";
const assets = new URL("./resources/instances/", document.baseURI);
const sceneUrl = new URL(referenceMode ? "reference/instances.json" : "instances.json", assets);
const cubeUrl = new URL("ae2589c9bc9a486f-2.bg2", assets).href;
const cubeMapName = "ae2589c9bc9a486f-3.png";
const floorUrl = new URL("ae2589c9bc9a486f-0.bg2", assets).href;
const log = document.getElementById("result")!;
const retryButton = document.getElementById("retry") as HTMLButtonElement;
const lightmapButton = document.getElementById("lightmaps") as HTMLButtonElement;

function check(condition: unknown, message: string): asserts condition {
    if (!condition) throw new Error(message);
    log.textContent += `PASS ${message}\n`;
}

function report(error: unknown): void {
    log.textContent += `FAIL ${error instanceof Error ? error.message : String(error)}\n`;
    console.error(error);
}

function collectNodes(root: Node): Node[] {
    return [root, ...root.children.flatMap(collectNodes)];
}

function hasBakedMap(material: Material): boolean {
    return material.indirectTextureMode === "bakedGI" && material.ambientOcclussionUV === 1 &&
        !!material.ambientOcclussion?.linearData && !!material.ambientOcclussion.imageData;
}

async function responseFor(url: string): Promise<Response> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
    return response;
}

class NativeSceneCheck extends render.SceneAppController {
    private readonly loader: Loader;
    private floor?: DrawableInstance;
    private firstFrame = true;
    private baked = true;
    private pausedMaps = new Map<Material, Texture>();

    constructor(canvas: Canvas) {
        super();
        this.loader = new db.Loader(canvas);
    }

    override get gizmoManagerEnabled(): boolean { return false; }

    override async registerLoaders(): Promise<void> {
        db.registerLoaderPlugin(new db.VitscnjLoaderPlugin());
    }

    override async loadScene(): Promise<Node> {
        if (!referenceMode) return this.loader.loadNode(sceneUrl.href);

        // Fail one real reference during import, then restore fetch so the retry can load it.
        const fetcher = window.fetch;
        let failed = false;
        window.fetch = (input, options) => {
            const url = input instanceof Request ? input.url : String(input);
            if (!failed && url === floorUrl) {
                failed = true;
                return Promise.resolve(new Response(null, { status: 404 }));
            }
            return fetcher.call(window, input, options);
        };
        try {
            return await this.loader.loadNode(sceneUrl.href);
        }
        finally {
            window.fetch = fetcher;
        }
    }

    override async loadDone(): Promise<void> {
        const root = this.sceneRoot!;
        const nodes = collectNodes(root);
        const instances = nodes.flatMap(({ drawableInstance }) => drawableInstance ?? []);
        const cubes = instances.filter(instance => instance.resource?.key === cubeUrl);
        const owners = nodes.map(node => node.component("Drawable") as Drawable | undefined)
            .filter((drawable): drawable is Drawable => drawable?.resource?.key === cubeUrl);
        check(cubes.length === 2 && owners.length === (referenceMode ? 2 : 1), "Both cube instances and the expected owners import");
        const [first, second] = cubes;
        check(first.items.length === 6 && second.items.length === 6 &&
            first.items.every((item, index) => item.polyList === second.items[index].polyList),
            "Cube instances share all six polygon lists");
        check(owners.every(owner => owner.resource === first.resource && owner.items[0].polyList !== first.items[0].polyList),
            "The owners use the same cache record and have editable geometry");
        if (owners.length === 2) {
            check(owners[0].items[0].material !== owners[1].items[0].material, "Repeated owners have separate materials");
        }
        check(first.items[0].material.albedo.g !== second.items[0].material.albedo.g &&
            cubes.every(instance => instance.items.every(item => item.material.alphaCutoff === 0 && hasBakedMap(item.material))),
            "Distinct material colors, explicit zero cutoff and decoded linear baked maps");
        const lightmapFiles = cubes.map(instance => instance.items[0].material.ambientOcclussion!.fileName);
        check(lightmapFiles[0] !== lightmapFiles[1] && owners.every(owner => hasBakedMap(owner.items[0].material)),
            "Cube owners and instances have their own baked lightmaps");
        check(scene.CameraComponent.GetMain(root) &&
            nodes.some(node => node.lightComponent?.light.type === base.LightType.SUN) &&
            nodes.some(node => node.component("Environment")),
            "Native camera, Sun and environment import");

        if (referenceMode) {
            this.floor = nodes.find(node => node.name === "Ownerless floor")?.drawableInstance;
            check(this.floor && !this.floor.valid && this.floor.loadError, "Failed ownerless floor is retained alongside valid cubes");
            const green = nodes.find(node => node.name === "Green instance")!.drawableInstance!;
            const face = green.items[0];
            const material = face.material;
            check(Math.abs(face.transform.translation.x - 0.13) < 1e-6 && !green.items[1].visible &&
                getMaterialAppearance(material).cullFace === false,
                "Reference save preserves submesh translation, visibility and double-sided state");
            check(material.metalnessTexture?.fileName === new URL("channels.png", sceneUrl).href &&
                owners[0].items[0].material.ambientOcclussion?.fileName === new URL(cubeMapName, assets).href,
                "Instance overrides and inherited textures resolve against different declaring directories");
            check(this.readInversion(material), "Packed green-channel inversion preserves top and bottom image orientation");
            const text = nodes.find(node => node.name === "Baked instances label")?.drawable;
            check(text instanceof scene.TextComponent && text.canRender, "Native text uses the exported font");
        }
        else {
            check(nodes.find(node => node.name === "Floor")?.drawable?.items.every(item => hasBakedMap(item.material)),
                "Complete export includes the baked floor");
            await this.checkDirectLoads();
        }

        this.selectionManager!.onSelectionChanged("native", selection => {
            const picked = selection[selection.length - 1];
            document.getElementById("selection")!.textContent = picked
                ? `Selected ${picked.drawable.node.name} · submesh ${picked.itemIndex}`
                : "Click a cube to inspect its selection.";
        });

        retryButton.hidden = !referenceMode;
        retryButton.addEventListener("click", () => { this.retryFloor().catch(report); });
        lightmapButton.disabled = false;
        lightmapButton.addEventListener("click", () => this.toggleLightmaps());
    }

    private async checkDirectLoads(): Promise<void> {
        const original: Drawable = await this.loader.loadDrawable(cubeUrl);
        const model = await (await responseFor(cubeUrl)).arrayBuffer();
        const image = await (await responseFor(new URL(cubeMapName, assets).href)).arrayBuffer();
        const dependencies = [new File([image], cubeMapName, { type: "image/png" })];
        const dropped: Drawable = await this.loader.loadDrawableBuffer(model, "bg2", dependencies);
        check(original.items.length === 6 && dropped.items.length === 6 &&
            dropped.items.every(item => hasBakedMap(item.material)),
            "Real BG2 loads directly and from a buffer with baked image dependencies");
        for (const { material } of [...original.items, ...dropped.items]) material.destroy(true);
    }

    private readInversion(material: Material): boolean {
        const renderer = this.renderer as WebGLRenderer;
        const gl = renderer.gl;
        const packed = renderer.factory.material(material) as WebGLMaterialRenderer;
        packed.mergeTextures();
        const texture = renderer.factory.texture(packed.metalnessRoughnessEmissionHeightTexture) as WebGLTextureRenderer;
        const handle = texture.getApiObject();
        const framebuffer = gl.createFramebuffer();
        const pixel = new Uint8Array(8);
        try {
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, handle, 0);
            if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
                throw new Error("Cannot read the packed texture");
            }
            gl.readPixels(0, 0, 1, 2, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
            return Math.abs(pixel[0] - 191) <= 3 && Math.abs(pixel[4] - 127) <= 3;
        }
        finally {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.deleteFramebuffer(framebuffer);
        }
    }

    private async retryFloor(): Promise<void> {
        retryButton.disabled = true;
        try {
            const floor = this.floor!;
            check(await floor.retryResources() && hasBakedMap(floor.items[0].material), "Ownerless floor recovers and inherits the BG2 lightmap");
            retryButton.hidden = true;
            if (!this.baked) this.disableLightmaps();
            this.mainLoop.postRedisplay();
        }
        finally {
            retryButton.disabled = false;
        }
    }

    private disableLightmaps(): void {
        for (const node of collectNodes(this.sceneRoot!)) {
            for (const { material } of [...(node.drawable?.items ?? []), ...(node.drawableInstance?.items ?? [])]) {
                if (hasBakedMap(material)) {
                    this.pausedMaps.set(material, material.ambientOcclussion!);
                    material.indirectTextureMode = "ao";
                    material.ambientOcclussion = null;
                }
            }
        }
    }

    private toggleLightmaps(): void {
        this.baked = !this.baked;
        if (this.baked) {
            for (const [material, texture] of this.pausedMaps) {
                material.indirectTextureMode = "bakedGI";
                material.ambientOcclussion = texture;
            }
            this.pausedMaps.clear();
        }
        else this.disableLightmaps();
        lightmapButton.textContent = `Baked lightmaps ${this.baked ? "on" : "off"}`;
        this.mainLoop.postRedisplay();
    }

    override display(): void {
        super.display();
        if (!this.firstFrame) return;
        this.firstFrame = false;
        const gl = (this.renderer as WebGLRenderer).gl;
        try {
            const error = gl.getError();
            check(error === gl.NO_ERROR, `Native scene renders with WebGL status 0x${error.toString(16)}`);
        }
        catch (error) { report(error); }
    }
}

window.addEventListener("load", async () => {
    document.getElementById("mode")!.textContent = referenceMode ? "C++ reference save" : "C++ complete export";
    document.getElementById("scene-note")!.hidden = !referenceMode;
    log.textContent = "";
    try {
        const canvas = new app.Canvas(document.getElementById("scene") as HTMLCanvasElement, new render.WebGLRenderer());
        const loop = new app.MainLoop(canvas, new NativeSceneCheck(canvas));
        loop.updateMode = app.FrameUpdate.MANUAL;
        await loop.run();
    }
    catch (error) { report(error); }
});
