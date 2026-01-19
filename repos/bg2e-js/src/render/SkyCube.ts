import Material from "../base/Material";
import { createCube } from "../primitives";
import RenderState from "./RenderState";
import SkyCubeShader from "../shaders/SkyCubeShader";
import Mat4 from "../math/Mat4";
import { PolyListCullFace } from "../base/PolyList";
import type Renderer from "./Renderer";
import type Texture from "../base/Texture";
import type Shader from "./Shader";
import type PolyListRenderer from "./PolyListRenderer";

export interface UpdateRenderStateOptions {
    viewMatrix: Mat4;
    projectionMatrix?: Mat4 | null;
}

export default class SkyCube {
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

    set texture(texture: Texture) {
        if (!this._texture) {
            throw new Error("SkyCube: setting texture to an uninitialized sky cube. The texture setter is used to change the skyCube texture once created. Use the load() method instead.");
        }
        if (!this._material) {
            throw new Error("SkyCube: internal error, material is null when setting texture.");
        }
        this._texture = texture;
        this._material.albedoTexture = this._texture;
    }

    async load(cubemapTexture: Texture, Shader: (new (renderer: Renderer) => any) | null = null, shaderParams: any[] = []): Promise<void> {
        
        this._texture = cubemapTexture;

        this._material = new Material();
        this._material.albedoTexture = this._texture;

        this._shader = Shader ? new Shader(this.renderer) : new SkyCubeShader(this.renderer);
        await this._shader?.load();
    }

    updateRenderState({ viewMatrix, projectionMatrix = null }: UpdateRenderStateOptions): RenderState {
        const rotationMatrix = Mat4.GetRotation(viewMatrix);
        if (!this._renderState) {
            if (!this._material) {
                throw new Error("SkyCube: internal error, material is null when updating render state.");
            }

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
        throw new Error("SkyCube.draw(): Calling base implementation of SkyCube");
    }

    get polyListRenderer(): PolyListRenderer {
        if (!this._plistRenderer) {
            const cube = createCube(1,1,1);
            cube.cullFace = PolyListCullFace.FRONT;  // Draw back face
            this._plistRenderer = this.renderer.factory.polyList(cube);
        }
        return this._plistRenderer;
    }

    destroy(): void {
        this._shader?.destroy();
        this._texture?.destroy();
        this._plistRenderer?.destroy();
        this._material?.destroy();
        this._shader = null;
        this._texture = null;
        this._material = null;
        this._plistRenderer = null;
        this._renderState = null;
    }
}