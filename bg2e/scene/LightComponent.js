import Component from "./Component";
import Light, { LightType } from "../base/Light";
import Vec from "../math/Vec";

export default class LightComponent extends Component {
    constructor(light = null) {
        super("Light");

        this._light = light || new Light();
    }

    get light() { return this._light; }
    set light(l) { this._light = l; }

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