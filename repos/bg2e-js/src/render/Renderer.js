
import PresentTextureShader from "../shaders/PresentTextureShader";
import Material from "../base/Material";
import PolyList from "../base/PolyList";
import Environment from "./Environment";
import TextureMergerRenderer from "./TextureMergerRenderer";

export const EngineFeatures = {
    RENDER_TARGET_TEXTURES:         0x1 << 0,
    RENDER_TARGET_FLOAT:            0x1 << 1,
    RENDER_TARGET_DEPTH:            0x1 << 2
};

export default class Renderer {
    constructor(identifier) {
        this._identifier = identifier;
        this._frameBuffer = null;
    }

    get uniqueId() {
        throw new Error("Calling Renderer.uniqueId base implementation.");
    }

    get typeId() {
        throw new Error("Calling Renderer.typeId base implementation");
    }

    async init(canvas) {
        this._canvas = canvas;
    }

    get canvas() {
        return this._canvas;
    }

    get frameBuffer() {
        throw new Error("Calling Renderer.frameBuffer base implementation.");
    }

    set viewport(vp) {
        throw new Error("Calling Renderer.viewport setter base implementation.");
    }

    get viewport() {
        throw new Error("Calling Renderer.viewport getter base implementation.");
    }

    get presentTextureSurfaceRenderer() {
        if (!this._presentTextureSurface) {
            const plist = new PolyList();
            plist.vertex = [
                -1, -1, 0,
                 1, -1, 0,
                 1,  1, 0,
                -1,  1, 0
            ];
            plist.texCoord0 = [
                0, 0,
                1, 0,
                1, 1,
                0, 1
            ];
            plist.index = [
                0, 1, 2,
                2, 3, 0
            ];
            this._presentTextureSurface = this.factory.polyList(plist);
        }
        return this._presentTextureSurface;
    }

    async initPresentTextureShader() {
        if (!this._presentTextureShader) {
            this._presentTextureShader = new PresentTextureShader(this);
            this._presentTextureShader.load();
        }
        return this._presentTextureShader;
    }

    get presentTextureShader() {
        return this._presentTextureShader;
    }

    get presentTextureMaterialRenderer() {
        if (!this._presentTextureMaterial) {
            this._presentTextureMaterial = this.factory.material(new Material());
        }
        return this._presentTextureMaterial;
    }

    postReshape(width,height) {

    }

    postRedisplay() {

    }

    polyListFactory(plist) {
        throw new Error("Calling base implementation of Renderer.polyListFactory()");
    }

    materialFactory(material) {
        throw new Error("Calling base implementation of Renderer.materialFactory()");
    }

    textureFactory(texture) {
        throw new Error("Calling base implementation of Renderer.textureFactory()");
    }

    renderBufferFactory() {
        throw new Error("Calling base implementation of Renderer.renderBufferFactory()");
    }

    skySphereFactory() {
        throw new Error("Calling base implementation of Renderer.skySphereFactory()");
    }
    
    skyCubeFactory() {
        throw new Error("Calling base implementation of Renderer.skyCubeFactory()");
    }

    environmentFactory() {
        return new Environment(this);
    }

    textureMergerFactory() {
        return new TextureMergerRenderer(this);
    }

    pipelineFactory() {
        throw new Error("Calling base implementation of Renderer.pipelineFactory()");
    }

    sceneRendererFactory() {
        throw new Error("Calling base implementation of Renderer.sceneRendererFactory()");
    }

    shadowRendererFactory() {
        throw new Error("Calling base implementation of Renderer.shadowRendererFactory()");
    }

    get clearColor() {
        throw new Error("Calling base implementation of Renderer.clearColor getter.");
    }

    set clearColor(c) {
        throw new Error("Calling base implementation of Renderer.clearColor setter.");
    }

    get factory() {
        const renderer = this;
        return {
            polyList(plist) {
                return renderer.polyListFactory(plist);
            },
            material(material) {
                return renderer.materialFactory(material);
            },
            texture(texture) {
                return renderer.textureFactory(texture);
            },
            renderBuffer() {
                return renderer.renderBufferFactory();
            },
            skySphere() {
                return renderer.skySphereFactory();
            },
            skyCube() {
                return renderer.skyCubeFactory();
            },
            environment() {
                return renderer.environmentFactory();
            },
            textureMerger() {
                return renderer.textureMergerFactory();
            },
            pipeline() {
                return renderer.pipelineFactory();
            },
            scene() {
                return renderer.sceneRendererFactory();
            },
            shadowRenderer() {
                return renderer.shadowRendererFactory();
            }
        }
    }

    presentTexture(texture, { clearBuffers = true, shader = null, viewport = null } = {}) {
        
    }

    // Compatibility function
    supportsFeatures(feature) {
        return false;
    }

    getMaximumRenderTargets() {
        return 1;
    }
}
