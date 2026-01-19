import { createSphere } from "../primitives";
import SkySphereShader from "../shaders/SkySphereShader";
import RenderState from "./RenderState";
import Material from "../base/Material";
import Texture, { ProceduralTextureFunction, TextureFilter, TextureWrap } from "../base/Texture";
import Mat4 from "../math/Mat4";
import { PolyListCullFace, PolyListFrontFace } from "../base/PolyList";
import Color from "../base/Color";
import type Renderer from "./Renderer";
import type Shader from "./Shader";
import type PolyListRenderer from "./PolyListRenderer";

export interface UpdateRenderStateOptions {
    viewMatrix: Mat4;
    projectionMatrix?: Mat4 | null;
}

export default class SkySphere {
    protected _renderer: Renderer;
    protected _texture: Texture | null;
    protected _material: Material | null;
    protected _shader: Shader | null;
    protected _plistRenderer: PolyListRenderer | null;
    protected _renderState: RenderState | null;

    constructor(renderer: Renderer) {
        this._renderer = renderer;
        this._texture = null;
        this._material = null;
        this._shader = null;
        this._plistRenderer = null;
        this._renderState = null;
    }

    get renderer(): Renderer { return this._renderer; }

    async load(equirectangularTextureUrl: string | null, Shader: (new (renderer: Renderer) => any) | null = null): Promise<void> {
        this._texture = new Texture();
        if (equirectangularTextureUrl) {
            this._texture.fileName = equirectangularTextureUrl;
        }
        else {
            // Load black texture
            this._texture.magFilter = TextureFilter.NEAREST;
            this._texture.minFilter = TextureFilter.NEAREST;
            this._texture.wrapModeXY = TextureWrap.REPEAT;
            this._texture.proceduralFunction = ProceduralTextureFunction.PLAIN_COLOR;
            this._texture.proceduralParameters = Color.Black();
            this._texture.size = [2, 2];
        }
        await this._texture.loadImageData();

        this._material = new Material();
        this._material.albedoTexture = this._texture;

        this._shader = Shader ? new Shader(this.renderer) : new SkySphereShader(this.renderer);
        await this._shader?.load();
    }

    async setTexture(equirectangularTextureUrl: string): Promise<void> {
        if (!this._texture || !this._material) {
            throw new Error("SkySphere: setting texture to an uninitialized sky sphere. Use the load() method instead.");
        }
        this._texture.destroy();
        this._texture.fileName = equirectangularTextureUrl;
        await this._texture.loadImageData();

        this._material.albedoTexture = this._texture;
    }

    updateRenderState({ viewMatrix, projectionMatrix = null }: UpdateRenderStateOptions): RenderState {
        if (!this._material) {
            throw new Error("SkySphere: internal error, material is null when updating render state.");
        }
        const rotationMatrix = Mat4.GetRotation(viewMatrix);
        if (!this._renderState) {
            this._renderState = new RenderState({
                shader: this._shader,
                polyListRenderer: this.polyListRenderer,
                materialRenderer: this.renderer.factory.material(this._material),
                viewMatrix: rotationMatrix,
                projectionMatrix: projectionMatrix || Mat4.MakeIdentity()
            });
        }
        else {
            this._renderState.viewMatrix = rotationMatrix;
            if (projectionMatrix) {
                this._renderState.projectionMatrix = projectionMatrix;
            }
        }
        return this._renderState;
    }

    draw(): void {
        throw new Error("SkySphere.draw(): Calling base implementation of SkySphere");
    }

    get polyListRenderer(): PolyListRenderer {
        if (!this._plistRenderer) {
            const sphere = createSphere(3.5);
            sphere.cullFace = PolyListCullFace.FRONT;  // Draw back face
            this._plistRenderer = this.renderer.factory.polyList(sphere);
        }
        return this._plistRenderer;
    }

    destroy(): void {
        this._shader?.destroy();
        this._texture?.destroy();
        this._plistRenderer?.destroy();
        this._shader = null;
        this._texture = null;
        this._material?.destroy();
        this._material = null;
        this._plistRenderer = null;
        this._renderState = null;
    }
}