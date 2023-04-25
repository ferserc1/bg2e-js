
import Vec from '../math/Vec';
import Mat4 from '../math/Mat4';
import Color from './Color';

export const LightType = Object.freeze({
    DIRECTIONAL: 4,
    SPOT: 1,
    POINT: 5,
    DISABLED: 10
});

export default class Light {
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
        
        this._projection = Mat4.MakeOrtho(-10,10,-10,10,0.5,300.0);
    }
    
    clone() {
        const newLight = new Light();
        newLight.assign(this);
        return newLight;
    }
    
    assign(other) {
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
    set enabled(v) { this._enabled = v; }
    
    get type() { return this._type; }
    set type(t) { this._type = t; }
    
    get direction() { return this._direction; }
    set direction(d) { this._direction = d; }

    get position() { return this._position; }
    set position(p) { this._position = p; }
    
    get color() { return this._color; }
    set color(c) {
        if (c.length === 3) {
            this._color = new Vec([c[0], c[1], c[2], 1]);
        }
        else if (c.length === 4) {
            this._color = new Vec(c);
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

    async deserialize(sceneData) {
        switch (sceneData.lightType) {
        case 'kTypeDirectional':
        case LightType.DIRECTIONAL:
            this._type = LightType.DIRECTIONAL;
            // Use the predefined shadow bias for directional lights
            //this._shadowBias = sceneData.shadowBias;
            break;
        case 'kTypeSpot':
        case LightType.SPOT:
            this._type = LightType.SPOT;
            this._shadowBias = sceneData.shadowBias;
            break;
        case 'kTypePoint':
        case LightType.POINT:
            this._type = LightType.POINT;
            break;
        default:
            this._type = LightType.DIRECTIONAL;
        }

        const defaultIntensity = () => this._type === LightType.DIRECTIONAL ? 10 : 200;

        this._position = sceneData.position || new Vec(0,0,0);
        this._direction = sceneData.direction || new Vec(0, 0, -1);

        if (sceneData.diffuse) {
            this._color = new Color(sceneData.diffuse);
            this._intensity = (sceneData.intensity || 1) * defaultIntensity();
        }
        else if (sceneData.color) {
            this._color = new Color(sceneData.color);
            this._intensity = sceneData.intensity || defaultIntensity();
        }
        
        this._spotCutoff = sceneData.spotCutoff || 20;
        this._spotExponent = sceneData.spotExponent || 30;
        this._shadowStrength = sceneData.shadowStrength || 1;
        if (sceneData.projection) {
            this._projection = new Mat4(sceneData.projection);
        }
        this._castShadows = sceneData.castShadows !== undefined ? sceneData.castShadows : true;
    }

    async serialize(sceneData) {
        const lightTypes = [];
        lightTypes[LightType.DIRECTIONAL] = "kTypeDirectional";
        lightTypes[LightType.SPOT] = "kTypeSpot";
        lightTypes[LightType.POINT] = "kTypePoint";
        sceneData.lightType = lightTypes[this._type];
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
