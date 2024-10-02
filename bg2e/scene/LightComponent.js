import Component from "./Component";
import Light, { LightType } from "../base/Light";
import FindNodeVisitor from "./FindNodeVisitor";


export default class LightComponent extends Component {
    static GetLights(sceneRoot) {
        if (sceneRoot.sceneChanged || !sceneRoot.__lights) {
            sceneRoot.__lights = [];
            let findLights = new FindNodeVisitor();
            findLights.hasComponents(["Light"]);
            sceneRoot.accept(findLights);
            sceneRoot.__lights = findLights.result.map(n => n.lightComponent);
        }
        return sceneRoot.__lights;
    }

    static GetFirstShadowCastingLight(sceneRoot) {
        if (sceneRoot.sceneChanged || !sceneRoot.__mainDirectionalLight) {
            sceneRoot.__mainDirectionalLight = LightComponent.GetLights(sceneRoot)
                .find(l => l.light.type === LightType.DIRECTIONAL || l.light.type === LightType.SPOT);
        }
        return sceneRoot.__mainDirectionalLight;
    }

    static GetMainDirectionalLight(sceneRoot) {
        if (sceneRoot.sceneChanged || !sceneRoot.__mainDirectionalLight) {
            sceneRoot.__mainDirectionalLight = LightComponent.GetLights(sceneRoot)
                .find(l => l.light.type === LightType.DIRECTIONAL);
        }
        return sceneRoot.__mainDirectionalLight || LightComponent.GetFirstShadowCastingLight(sceneRoot);
    }

    constructor(light = null) {
        super("Light");

        this._light = light || new Light();
    }

    get light() { return this._light; }
    set light(l) { this._light = l; }

    set depthTexture(t) {
        this._light.depthTexture = t;
    }

    get depthTexture() {
        return this._light.depthTexture;
    }

    set viewMatrix(vm) {
        this._light.viewMatrix = vm;
    }

    get viewMatrix() {
        return this._light.viewMatrix;
    }
    
    set mvpMatrix(m) {
        this._light.mvpMatrix = m;
    }

    get mvpMatrix() {
        return this._light.mvpMatrix;
    }

    clone() {
        const result = new Light();
        result.assign(this);
        return result;
    }

    assign(other) {
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
    }) {
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

    async deserialize(sceneData,loader) {
        await this._light.deserialize(sceneData);
    }

    async serialize(sceneData,writer) {
        await super.serialize(sceneData,writer);
        await this._light.serialize(sceneData);
        throw new Error("LightComponent.serialize() not implemented");
    }

    draw(renderQueue,modelMatrix) {
        renderQueue.addLight(this.light, modelMatrix);
    }
}