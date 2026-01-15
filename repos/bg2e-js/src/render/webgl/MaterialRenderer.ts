import Texture, { TextureChannel, TextureTargetName } from "../../base/Texture";
import Material from "../../base/Material";
import type Renderer from "../Renderer";
import MaterialRenderer from "../MaterialRenderer";
import type TextureMergerRenderer from "../TextureMergerRenderer";
import type ShaderProgram from "./ShaderProgram";
import type WebGLTextureRenderer from "./TextureRenderer";
import { whiteTexture, createWhiteTexture, blackTexture, createBlackTexture } from "../../tools/TextureResourceDatabase";

export default class WebGLMaterialRenderer extends MaterialRenderer {
    private _whiteTexture: WebGLTextureRenderer;
    private _blackTexture: WebGLTextureRenderer;
    private _textureMerger: TextureMergerRenderer;

    static async InitResources(renderer: Renderer): Promise<void> {
        await createWhiteTexture(renderer);
        await createBlackTexture(renderer);
    }

    constructor(renderer: Renderer, material: Material) {
        super(renderer, material);
        if (material.renderer) {
            throw new Error("Duplicate material renderer set to material. Please, use the Renderer factory to get material renderer instance.");
        }
        (material as any)._renderer = this;

        this._whiteTexture = renderer.factory.texture(whiteTexture(renderer)) as WebGLTextureRenderer;
        this._blackTexture = renderer.factory.texture(blackTexture(renderer)) as WebGLTextureRenderer;
        this._textureMerger = renderer.factory.textureMerger();
    }

    mergeTextures(): void {
        if (this.material.dirty) {
            const getTexture = (att: string, fallbackTexture: WebGLTextureRenderer = this._whiteTexture): Texture => {
                if (this.material[att as keyof Material] instanceof Texture) {
                    return this.material[att as keyof Material] as Texture;
                }
                else {
                    return fallbackTexture.texture;
                }
            }

            this._textureMerger.setTexture(getTexture('metalnessTexture'), TextureChannel.R, TextureChannel.R + this.material.metalnessChannel);
            this._textureMerger.setTexture(getTexture('roughnessTexture'), TextureChannel.G, TextureChannel.R + this.material.roughnessChannel);
            this._textureMerger.setTexture(getTexture('lightEmission', this._blackTexture), TextureChannel.B, TextureChannel.R + this.material.lightEmissionChannel);
            this._textureMerger.setTexture(getTexture('ambientOcclussion'), TextureChannel.A, TextureChannel.R + this.material.ambientOcclussionChannel);
            this._textureMerger.update();
            this.material.dirty = false;
        }
    }

    get metalnessRoughnessHeightAOTexture(): Texture {
        return this._textureMerger.mergedTexture;
    }

    destroy(): void {
        console.log("Destroy material renderer");
        if (this.material) {
            (this.material as any)._renderer = null;
        }
    }

    // Bind the metalness, roughness, height and ambient occlussion combined texture
    bindMetalnessRoughnessHeightAOTexture(shaderProgram: ShaderProgram, uniformName: string, textureUnit: number): boolean {
        const textRenderer = this.renderer.factory.texture(this.metalnessRoughnessHeightAOTexture) as WebGLTextureRenderer;
        shaderProgram.bindTexture(uniformName, textRenderer, textureUnit);
        return true;
    }

    // Binds the property to the uniformName  uniform of the shader program, if the
    // material property ies a texture. If not, it binds the fallbackTexture. If the fallbackTexture
    // value is null, it binds a 2x2 px white texture
    bindTexture(shaderProgram: ShaderProgram, property: string, uniformName: string, textureUnit: number, fallbackTexture: Texture | null = null): boolean {
        if (this.material[property as keyof Material] instanceof Texture) {
            const renderer = this.getTextureRenderer(property) as WebGLTextureRenderer;
            shaderProgram.bindTexture(uniformName, renderer, textureUnit);
            return true;
        }
        else if (fallbackTexture instanceof Texture) {
            const renderer = this.getTextureRenderer(property) as WebGLTextureRenderer;
            shaderProgram.bindTexture(uniformName, renderer, textureUnit);
            return false;
        }
        else {
            shaderProgram.bindTexture(uniformName, this._whiteTexture, textureUnit);
            return false;
        }
    }

    // Bind the property to the uniformName uniform of the shader program, if the
    // material property is a color. If not, it binds the fallbackColor vector
    bindColor(shaderProgram: ShaderProgram, property: string, uniformName: string, fallbackColor: number[] = [1, 1, 1, 1]): void {
        if (this.material[property].length>=4) {
            shaderProgram.uniform4fv(uniformName, this.material[property]);
        }
        else {
            shaderProgram.uniform4fv(uniformName, fallbackColor);
        }
    }

    // Bind the property to the uniformName uniform of the shader program, if the
    // material property is a number. If not, it binds the fallbackValue value
    bindValue(shaderProgram: ShaderProgram, property: string, uniformName: string, fallbackValue: number = 1): void {
        if (typeof(this.material[property]) === "number") {
            shaderProgram.uniform1f(uniformName, this.material[property]);
        }
        else {
            shaderProgram.uniform1f(uniformName, fallbackValue);
        }
    }
}