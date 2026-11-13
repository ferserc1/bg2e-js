/*
 *    business grade graphic engine (bg2 engine)
 *    Copyright (C) 2024  Fernando Serrano Carpena
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU General Public License as published by
 *    the Free Software Foundation, either version 3 of the License, or
 *    (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU General Public License for more details.
 *
 *    You should have received a copy of the GNU General Public License
 *    along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import Vec from '../math/Vec';
import Component from "./Component";
import Light, { LightType } from "../base/Light";
import FindNodeVisitor from "./FindNodeVisitor";
import Node from "./Node";


export default class LightComponent extends Component {
    static GetLights(sceneRoot: Node): LightComponent[] {
        const visitor = new FindNodeVisitor();
        visitor.hasComponents('Light');
        sceneRoot.accept(visitor);
        return visitor.result.map(n => n.lightComponent!);
    }

    static GetFirstShadowCastingLight(sceneRoot: Node): LightComponent | undefined {
        return this.GetLights(sceneRoot).find(l => l.light.enabled && l.light.castShadows &&
            [LightType.DIRECTIONAL, LightType.SUN, LightType.SPOT].includes(l.light.type));
    }

    static GetMainDirectionalLight(sceneRoot: Node): LightComponent | undefined {
        return this.GetLights(sceneRoot).find(l => l.light.enabled && l.light.castShadows &&
            [LightType.DIRECTIONAL, LightType.SUN].includes(l.light.type)) ?? this.GetFirstShadowCastingLight(sceneRoot);
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
        const data = sceneData.lightData;
        if (data) {
            this._light.intensity = data.intensity ?? 1;
            this._light.color = data.color ?? [1, 1, 1];
        }
        await this._light.deserialize(data ?? sceneData);
        if (data) this._light.direction = new Vec(data.direction ?? [0, 0, 1]);
    }

    async serialize(sceneData: any, writer: any): Promise<void> {
        await super.serialize(sceneData,writer);
        await this._light.serialize(sceneData);
        const native: any = {};
        await this._light.serialize(native);
        native.type = native.lightType;
        delete native.lightType;
        sceneData.lightData = native;
        sceneData.type = "LightSource";
    }

    draw(renderQueue: any, modelMatrix: any): void {
        renderQueue.addLight(this.light, modelMatrix);
    }
}