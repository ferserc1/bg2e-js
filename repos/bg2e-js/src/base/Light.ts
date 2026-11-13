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
import Mat4 from '../math/Mat4';
import Color from './Color';
import Texture from './Texture';

export enum LightType {
    DIRECTIONAL = 4,
    SPOT = 1,
    POINT = 5,
    SUN = 6,
    DISABLED = 10
}

export default class Light {
    sourceSize = 0.5;
    shadowSamples = 8;
    affectsReflections = true;
    spotAngle = 22;
    private _solarSize = 1;
    private _solarDistanceMillionKm = 149.6;
    get solarSize() { return this._solarSize; }
    set solarSize(value: number) {
        if (!Number.isFinite(value) || value <= 0) throw new Error('solarSize must be finite and positive');
        this._solarSize = value;
    }
    get solarDistanceMillionKm() { return this._solarDistanceMillionKm; }
    set solarDistanceMillionKm(value: number) {
        if (!Number.isFinite(value) || value <= 0) throw new Error('solarDistanceMillionKm must be finite and positive');
        this._solarDistanceMillionKm = value;
    }
    _enabled: boolean;
    _type: LightType;
    _direction: Vec;
    _position: Vec;
    _color: Color;
    _intensity: number;
    _spotCutoff: number;
    _spotExponent: number;
    _shadowStrength: number;
    _castShadows: boolean;
    _shadowBias: number;
    _projection: Mat4;
    _depthTexture: Texture | null;
    _viewMatrix?: Mat4;

    constructor() {
        this._enabled = true;
        
        this._type = LightType.DIRECTIONAL;
        
        this._direction = new Vec(0,0,-1);
        this._position = new Vec(0,0,0);
        
        this._color = new Color({ rgb: 0.9 });
        this._intensity = 20;
        this._spotCutoff = 20;
        this._spotExponent = 30;
        this._shadowStrength = 0.7;
        this._castShadows = true;
        this._shadowBias = 0.00002;
        
        this._projection = Mat4.MakeOrtho(-10,10,-10,10,0.1,500.0);

        // Internal engine use. This attribute will not be serialized
        this._depthTexture = null;
    }
    
    clone() {
        const newLight = new Light();
        newLight.assign(this);
        return newLight;
    }
    
    assign(other: Light) {
        this.sourceSize = other.sourceSize;
        this.shadowSamples = other.shadowSamples;
        this.affectsReflections = other.affectsReflections;
        this.spotAngle = other.spotAngle;
        this.solarSize = other.solarSize;
        this.solarDistanceMillionKm = other.solarDistanceMillionKm;
        this.enabled = other.enabled;
        this.type = other.type;
        this.direction.assign(other.direction);
        this.position.assign(other.position);
        this.color.assign(other.color);
        this.spotCutoff = other.spotCutoff;
        this.spotExponent = other.spotExponent;
        this.shadowStrength = other.shadowStrength;
        this.castShadows = other.castShadows;
        this.shadowBias = other.shadowBias;
        this.intensity = other.intensity;
        this.projection.assign(other.projection);
    }
    
    get enabled() { return this._enabled; }
    set enabled(v: boolean) { this._enabled = v; }
    
    get type() { return this._type; }
    set type(t: LightType) { this._type = t; }
    
    get direction() { return this._direction; }
    set direction(d: Vec) { this._direction = d; }

    get position() { return this._position; }
    set position(p: Vec) { this._position = p; }
    
    get color() : Color { return this._color; }
    set color(c: Color | number[]) {
        if (c.length === 3) {
            this._color = new Color([c[0], c[1], c[2], 1]);
        }
        else if (c.length === 4) {
            this._color = new Color(c);
        }
        else {
            throw new Error(`Invalid light color assignment. Parameter must be a three or four component array.`);
        }
    }
    get intensity() { return this._intensity; }
    set intensity(i) { this._intensity = i; }
    
    get spotCutoff() { return this._spotCutoff; }
    set spotCutoff(c) { this._spotCutoff = c; }
    get spotExponent() { return this._spotExponent; }
    set spotExponent(e) { this._spotExponent = e; }
    
    get shadowStrength() { return this._shadowStrength; }
    set shadowStrength(s) { this._shadowStrength = s; }
    get castShadows() { return this._castShadows; }
    set castShadows(s) { this._castShadows = s; }
    get shadowBias() { return this._shadowBias; }
    set shadowBias(s) { this._shadowBias = s; }
    
    get projection() { return this._projection; }
    set projection(p) { this._projection = p; }

    get depthTexture(): Texture | null {
        return this._depthTexture;
    }

    set depthTexture(t: Texture | null) {
        this._depthTexture = t;
    }

    get viewMatrix() {
        return this._viewMatrix;
    }

    set viewMatrix(m) {
        this._viewMatrix = m;
    }

    async deserialize(sceneData: any) {
        if (!sceneData || typeof sceneData !== 'object' || Array.isArray(sceneData)) return;
        switch (sceneData.lightType ?? sceneData.type) {
        case 'kTypeDirectional':
        case LightType.DIRECTIONAL:
            this._type = LightType.DIRECTIONAL;
            // Use the predefined shadow bias for directional lights
            //this._shadowBias = sceneData.shadowBias ?? this._shadowBias;
            break;
        case 'kTypeSun':
        case LightType.SUN:
            this._type = LightType.SUN;
            break;
        case 'kTypeSpot':
        case LightType.SPOT:
            this._type = LightType.SPOT;
            this._shadowBias = sceneData.shadowBias ?? this._shadowBias;
            break;
        case 'kTypePoint':
        case LightType.POINT:
            this._type = LightType.POINT;
            break;
        default:
            if (sceneData.lightType !== undefined || sceneData.type !== undefined) this._type = LightType.DISABLED;
        }

        const defaultIntensity = () => (this._type === LightType.DIRECTIONAL || this._type === LightType.SUN) ? 1 : 20;

        this._position = new Vec(sceneData.position ?? [0,0,0]);
        this._direction = new Vec(sceneData.direction ?? [0, 0, this.type === LightType.SUN ? 1 : -1]);

        if (sceneData.diffuse) {
            this._color = new Color(sceneData.diffuse);
            this._intensity = (sceneData.intensity ?? 1) * defaultIntensity();
        }
        else if (sceneData.color) {
            this._color = new Color(sceneData.color);
            this._intensity = sceneData.intensity ?? defaultIntensity();
        }
        
        if (!sceneData.diffuse) this._intensity = sceneData.intensity ?? this._intensity;
        this.solarSize = sceneData.solarSize ?? 1;
        this.solarDistanceMillionKm = sceneData.solarDistanceMillionKm ?? 149.6;
        this.sourceSize = sceneData.sourceSize ?? 0.5;
        this.shadowSamples = sceneData.shadowSamples ?? 8;
        this.affectsReflections = sceneData.affectsReflections ?? true;
        this.spotAngle = sceneData.spotAngle ?? 22;
        this._shadowBias = sceneData.shadowBias ?? this._shadowBias;
        this._spotCutoff = sceneData.spotCutoff ?? 20;
        this._spotExponent = sceneData.spotExponent || 30;
        this._shadowStrength = sceneData.shadowStrength ?? 1;
        if (sceneData.projection) {
            this._projection = new Mat4(sceneData.projection);
        }
        this._castShadows = sceneData.castShadows !== undefined ? sceneData.castShadows : true;
    }

    async serialize(sceneData: any) {
        const lightTypes = [];
        lightTypes[LightType.DIRECTIONAL] = "kTypeDirectional";
        lightTypes[LightType.SPOT] = "kTypeSpot";
        lightTypes[LightType.POINT] = "kTypePoint";
        lightTypes[LightType.SUN] = "kTypeSun";
        lightTypes[LightType.DISABLED] = "kTypeDisabled";
        sceneData.lightType = lightTypes[this._type];
        sceneData.solarSize = this.solarSize;
        sceneData.solarDistanceMillionKm = this.solarDistanceMillionKm;
        sceneData.sourceSize = this.sourceSize;
        sceneData.shadowSamples = this.shadowSamples;
        sceneData.affectsReflections = this.affectsReflections;
        sceneData.spotAngle = this.spotAngle;
        sceneData.position = this._position;
        sceneData.direction = this._direction;
        sceneData.color = this._color;
        sceneData.intensity = this._intensity;
        sceneData.spotCutoff = this._spotCutoff || 20;
        sceneData.spotExponent = this._spotExponent || 30;
        sceneData.shadowStrength = this._shadowStrength;
        sceneData.projection = this._projection;
        sceneData.castShadows = this._castShadows;
        sceneData.shadowBias = this._shadowBias || 0.0029;
    }
}
