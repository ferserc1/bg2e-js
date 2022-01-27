
export const LightType = {
    DIRECTIONAL: 4,
    SPOT: 1,
    POINT: 5,
    DISABLED: 10
};

export const SpecularType = {
    PHONG: 0,
    BLINN: 1
};

export default class Light {
    constructor() {
        this._enabled = true;
        
        this._type = LightType.DIRECTIONAL;
        
        this._direction = new bg.Vector3(0,0,-1);
        
        this._ambient = new bg.Color(0.2,0.2,0.2,1);
        this._diffuse = new bg.Color(0.9,0.9,0.9,1);
        this._specular = bg.Color.White();
        this._attenuation = new bg.Vector3(1,0.5,0.1);
        this._spotCutoff = 20;
        this._spotExponent = 30;
        this._shadowStrength = 0.7;
        this._cutoffDistance = -1;
        this._castShadows = true;
        this._shadowBias = 0.00002;
        this._specularType = bg.base.SpecularType.PHONG;
        this._intensity = 1;
        
        this._projection = bg.Matrix4.Ortho(-10,10,-10,10,0.5,300.0);
    }
    
    // If context is null, it will be used the same context as this light
    clone(context) {
        let newLight = new bg.base.Light(context || this.context);
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
        this._attenuation.assign(other._attenuation);
        this.spotCutoff = other.spotCutoff;
        this.spotExponent = other.spotExponent;
        this.shadowStrength = other.shadowStrength;
        this.cutoffDistance = other.cutoffDistance;
        this.castShadows = other.castShadows;
        this.shadowBias = other.shadowBias;
        this.specularType = other.specularType;
        this.intensity = other.intensity;
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
    get specularType() { return this._specularType; }
    set specularType(s) { this._specularType = s; }
    get intensity() { return this._intensity; }
    set intensity(i) { this._intensity = i; }
    
    // Attenuation is deprecated in PBR lighting model
    get attenuationVector() { return this._attenuation; }
    get constantAttenuation() { return this._attenuation.x; }
    get linearAttenuation() { return this._attenuation.y; }
    get quadraticAttenuation() { return this._attenuation.z; }
    set attenuationVector(a) { this._attenuation = a; }
    set constantAttenuation(a) { this._attenuation.x = a; }
    set linearAttenuation(a) { this._attenuation.y = a; }
    set quadraticAttenuation(a) { this._attenuation.z = a; }
    
    get cutoffDistance() { return this._cutoffDistance; }
    set cutoffDistance(c) { this._cutoffDistance = c; }
    
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

    deserialize(sceneData) {
        switch (sceneData.lightType) {
        case 'kTypeDirectional':
            this._type = bg.base.LightType.DIRECTIONAL;
            // Use the predefined shadow bias for directional lights
            //this._shadowBias = sceneData.shadowBias;
            break;
        case 'kTypeSpot':
            this._type = bg.base.LightType.SPOT;
            this._shadowBias = sceneData.shadowBias;
            break;
        case 'kTypePoint':
            this._type = bg.base.LightType.POINT;
            break;
        }
        
        this._ambient = new bg.Color(sceneData.ambient);
        this._diffuse = new bg.Color(sceneData.diffuse);
        this._specular = new bg.Color(sceneData.specular);
        this._spotCutoff = sceneData.spotCutoff || 20;
        this._spotExponent = sceneData.spotExponent || 30;
        this._shadowStrength = sceneData.shadowStrength;
        this._cutoffDistance = sceneData.cutoffDistance;
        this._projection = new bg.Matrix4(sceneData.projection);
        this._castShadows = sceneData.castShadows;
        this._specularType = sceneData.specularType=="BLINN" ? bg.base.SpecularType.BLINN : bg.base.SpecularType.PHONG;

        this._intensity = sceneData.intensity || 1;

        // Deprecated: not used in PBR lighting model
        this._attenuation = new bg.Vector3(
            sceneData.constantAtt,
            sceneData.linearAtt,
            sceneData.expAtt
            );
    }

    serialize(sceneData) {
        let lightTypes = [];
        lightTypes[bg.base.LightType.DIRECTIONAL] = "kTypeDirectional";
        lightTypes[bg.base.LightType.SPOT] = "kTypeSpot";
        lightTypes[bg.base.LightType.POINT] = "kTypePoint";
        sceneData.lightType = lightTypes[this._type];
        sceneData.ambient = this._ambient.toArray();
        sceneData.diffuse = this._diffuse.toArray();
        sceneData.specular = this._specular.toArray();
        sceneData.intensity = 1;
        sceneData.spotCutoff = this._spotCutoff || 20;
        sceneData.spotExponent = this._spotExponent || 30;
        sceneData.shadowStrength = this._shadowStrength;
        sceneData.cutoffDistance = this._cutoffDistance;
        sceneData.projection = this._projection.toArray();
        sceneData.castShadows = this._castShadows;
        sceneData.shadowBias = this._shadowBias || 0.0029;
        sceneData.specularType = this.specularType==bg.base.SpecularType.BLINN ? "BLINN" : "PHONG";
        sceneData.intensity = this.intensity || 1;

        // Deprecated: not used in PBR lighting model
        sceneData.constantAtt = this._attenuation.x;
        sceneData.linearAtt = this._attenuation.y;
        sceneData.expAtt = this._attenuation.z;
    }
}