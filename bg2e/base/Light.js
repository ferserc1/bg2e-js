
import Vec from '../math/Vec';
import Mat4 from '../math/Mat4';
import Color from './Color';

export const LightType = {
    DIRECTIONAL: 4,
    SPOT: 1,
    POINT: 5,
    DISABLED: 10
};

export default class Light {
    constructor() {
        this._enabled = true;
        
        this._type = LightType.DIRECTIONAL;
        
        this._direction = new Vec(0,0,-1);
        
        this._ambient = new Color({ r: 0.2, g: 0.2, b: 0.2 });
        this._diffuse = new Color({ rgb: 0.9 });
        this._specular = Color.White();
        this._spotCutoff = 20;
        this._spotExponent = 30;
        this._shadowStrength = 0.7;
        this._castShadows = true;
        this._shadowBias = 0.00002;
        this._intensity = 1;
        
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
        this.ambient.assign(other.ambient);
        this.diffuse.assign(other.diffuse);
        this.specular.assign(other.specular);
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
    
    get ambient() { return this._ambient; }
    set ambient(a) { this._ambient = a; }
    get diffuse() { return this._diffuse; }
    set diffuse(d) { this._diffuse = d; }
    get specular() { return this._specular; }
    set specular(s) { this._specular = s; }
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
            this._type = LightType.DIRECTIONAL;
            // Use the predefined shadow bias for directional lights
            //this._shadowBias = sceneData.shadowBias;
            break;
        case 'kTypeSpot':
            this._type = LightType.SPOT;
            this._shadowBias = sceneData.shadowBias;
            break;
        case 'kTypePoint':
            this._type = LightType.POINT;
            break;
        }
        
        this._ambient = new Color(sceneData.ambient);
        this._diffuse = new Color(sceneData.diffuse);
        this._specular = new Color(sceneData.specular);
        this._spotCutoff = sceneData.spotCutoff || 20;
        this._spotExponent = sceneData.spotExponent || 30;
        this._shadowStrength = sceneData.shadowStrength;
        this._projection = new Mat4(sceneData.projection);
        this._castShadows = sceneData.castShadows;
        this._intensity = sceneData.intensity || 1;
    }

    async serialize(sceneData) {
        const lightTypes = [];
        lightTypes[LightType.DIRECTIONAL] = "kTypeDirectional";
        lightTypes[LightType.SPOT] = "kTypeSpot";
        lightTypes[LightType.POINT] = "kTypePoint";
        sceneData.lightType = lightTypes[this._type];
        sceneData.ambient = this._ambient;
        sceneData.diffuse = this._diffuse;
        sceneData.specular = this._specular;
        sceneData.intensity = 1;
        sceneData.spotCutoff = this._spotCutoff || 20;
        sceneData.spotExponent = this._spotExponent || 30;
        sceneData.shadowStrength = this._shadowStrength;
        sceneData.projection = this._projection;
        sceneData.castShadows = this._castShadows;
        sceneData.shadowBias = this._shadowBias || 0.0029;
        sceneData.intensity = this.intensity || 1;
    }
}
