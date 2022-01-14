
import Engine from "../utils/Engine";

let s_shaderLibrary = null;
	
function defineAll(obj) {
    Reflect.defineProperty(obj,"all", {
        get() {
            if (!this._all) {
                this._all = [];
                for (let key in obj) {
                    if (typeof(obj[key])=="object" && obj[key].name) {
                        this._all.push(obj[key]);
                    }
                }
            }
            return this._all;
        }
    });
}

export default class ShaderLibrary {
    static Get() {
        if (!s_shaderLibrary) {
            s_shaderLibrary = new ShaderLibrary();
        }
        return s_shaderLibrary;
    }
    
    constructor() {
        let library = Engine.Get().shaderLibrary;
        
        for (let key in library) {
            this[key] = library[key];
        }
        
        defineAll(this.inputs.matrix);
        Object.defineProperty(this.inputs.matrix,"modelViewProjection",{
            get() {
                return [
                    this.model,
                    this.view,
                    this.projection
                ]
            }
        });
        defineAll(this.inputs.material);
        defineAll(this.inputs.lighting);
        defineAll(this.inputs.lightingForward);
        defineAll(this.inputs.shadows);
        defineAll(this.inputs.colorCorrection);
        defineAll(this.functions.materials);
        defineAll(this.functions.colorCorrection);
        defineAll(this.functions.lighting);
        defineAll(this.functions.utils);

        // PBR materials
        for (let key in this.inputs.pbr) {
            defineAll(this.inputs.pbr[key]);
        }
        for (let key in this.functions.pbr) {
            defineAll(this.functions.pbr[key]);
        }
    }
}
