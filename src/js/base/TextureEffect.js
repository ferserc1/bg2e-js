import Engine from "../utils/Engine";
import Effect from "./Effect";
import ShaderLibrary from "./ShaderLibrary";
import ShaderSource from "./ShaderSource";
import PolyList from "./PolyList";
import { ShaderType } from "./Shader";

const lib = () => {
    return ShaderLibrary.Get();
}

export default class TextureEffect extends Effect {
    constructor(context) {
        super(context);

        this._frame = new PolyList(context);
        
        this._frame.vertex = [ 1, 1, 0, -1, 1, 0, -1,-1, 0,1,-1, 0 ];
        this._frame.texCoord0 = [ 1, 1, 0, 1, 0, 0, 1, 0 ];
        this._frame.index = [ 0, 1, 2,  2, 3, 0 ];
        
        this._frame.build();
        
        this.rebuildShaders();
    }

    rebuildShaders() {
        this.setupShaderSource([
            this.vertexShaderSource,
            this.fragmentShaderSource
        ]);
    }
    
    get vertexShaderSource() {
        if (!this._vertexShaderSource) {
            this._vertexShaderSource = new ShaderSource(ShaderType.VERTEX);
            this._vertexShaderSource.addParameter([
                lib().inputs.buffers.vertex,
                lib().inputs.buffers.tex0,
                { name:"fsTexCoord", dataType:"vec2", role:"out" }
            ]);
            
            if (Engine.Get().id=="webgl1") {
                this._vertexShaderSource.setMainBody(`
                gl_Position = vec4(inVertex,1.0);
                fsTexCoord = inTex0;`);
            }
        }
        return this._vertexShaderSource;
    }
    
    get fragmentShaderSource() {
        if (!this._fragmentShaderSource) {
            this._fragmentShaderSource = new ShaderSource(ShaderType.FRAGMENT);
            this._fragmentShaderSource.addParameter(
                { name:"fsTexCoord", dataType:"vec2", role:"in" }
            );
            
            if (Engine.Get().id=="webgl1") {
                this._fragmentShaderSource.setMainBody(`
                gl_FragColor = vec4(0.0,0.0,0.0,1.0);`);
            }
        }
        return this._fragmentShaderSource;
    }
    
    //setupVars() {
    // this._surface contains the surface passed to drawSurface
    //}

    drawSurface(surface) {
        this.setActive();
        this._surface = surface;
        this.bindPolyList(this._frame);
        this._frame.draw();
        this.unbind();
        this.clearActive();
    }    
}
