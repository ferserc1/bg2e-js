import Component from "./Component";
import Light, { LightType } from "../base/Light";
import FindNodeVisitor from "./FindNodeVisitor";
import Node from "./Node";


export default class LightComponent extends Component {
    static GetLights(sceneRoot: Node): LightComponent[] {
        if (sceneRoot.sceneChanged || !(sceneRoot as any).__lights) {
            (sceneRoot as any).__lights = [];
            let findLights = new FindNodeVisitor();
            findLights.hasComponents(["Light"]);
            sceneRoot.accept(findLights);
            (sceneRoot as any).__lights = findLights.result.map(n => n.lightComponent);
        }
        return (sceneRoot as any).__lights;
    }

    static GetFirstShadowCastingLight(sceneRoot: Node): LightComponent | undefined {
        if (sceneRoot.sceneChanged || !(sceneRoot as any).__mainDirectionalLight) {
            (sceneRoot as any).__mainDirectionalLight = LightComponent.GetLights(sceneRoot)
                .find(l => l.light.type === LightType.DIRECTIONAL || l.light.type === LightType.SPOT);
        }
        return (sceneRoot as any).__mainDirectionalLight;
    }

    static GetMainDirectionalLight(sceneRoot: Node): LightComponent | undefined {
        if (sceneRoot.sceneChanged || !(sceneRoot as any).__mainDirectionalLight) {
            (sceneRoot as any).__mainDirectionalLight = LightComponent.GetLights(sceneRoot)
                .find(l => l.light.type === LightType.DIRECTIONAL);
        }
        return (sceneRoot as any).__mainDirectionalLight || LightComponent.GetFirstShadowCastingLight(sceneRoot);
    }

    _light: Light;

    constructor(light: Light | null = null) {
        super("Light");

        this._light = light || new Light();
    }

    get light(): Light { return this._light; }
    set light(l: Light) { this._light = l; }

    set depthTexture(t: any) {
        this._light.depthTexture = t;
    }

    get depthTexture(): any {
        return this._light.depthTexture;
    }

    set viewMatrix(vm: any) {
        this._light.viewMatrix = vm;
    }

    get viewMatrix(): any {
        return this._light.viewMatrix;
    }

    clone(): LightComponent {
        const result = new LightComponent();
        result.assign(this);
        return result;
    }

    assign(other: LightComponent): void {
        this._light = other._light.clone();
    }

    setProperties({
        enabled,
        type,
        lightType,  // alias of type
        direction,
        position,
        color,
        spotCutoff,
        spotExponent,
        shadowStrength,
        castShadows,
        shadowBias,
        intensity,
        projection 
    }: {
        enabled?: boolean;
        type?: LightType;
        lightType?: LightType;
        direction?: any;
        position?: any;
        color?: any;
        spotCutoff?: number;
        spotExponent?: number;
        shadowStrength?: number;
        castShadows?: boolean;
        shadowBias?: number;
        intensity?: number;
        projection?: any;
    }): void {
        if (enabled !== undefined) {
            this.light.enabled = enabled;
        }
        if (type !== undefined) {
            this.light.type = type;
        }
        if (lightType !== undefined) {
            this.light.type = lightType;
        }
        if (direction !== undefined) {
            this.light.direction = direction;
        }
        if (position !== undefined) {
            this.light.position = position;
        }
        if (color !== undefined) {
            this.light.color = color;
        }
        if (spotCutoff !== undefined) {
            this.light.spotCutoff = spotCutoff;
        }
        if (spotExponent !== undefined) {
            this.light.spotExponent = spotExponent;
        }
        if (shadowStrength !== undefined) {
            this.light.shadowStrength = shadowStrength;
        }
        if (castShadows !== undefined) {
            this.light.castShadows = castShadows;
        }
        if (shadowBias !== undefined) {
            this.light.shadowBias = shadowBias;
        }
        if (intensity !== undefined) {
            this.light.intensity = intensity;
        }
        if (projection !== undefined) {
            this.light.projection = projection;
        }
    }

    async deserialize(sceneData: any, loader: any): Promise<void> {
        await this._light.deserialize(sceneData);
    }

    async serialize(sceneData: any, writer: any): Promise<void> {
        await super.serialize(sceneData,writer);
        await this._light.serialize(sceneData);
        throw new Error("LightComponent.serialize() not implemented");
    }

    draw(renderQueue: any, modelMatrix: any): void {
        renderQueue.addLight(this.light, modelMatrix);
    }
}