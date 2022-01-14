

import Engine from "../utils/Engine";
//import Extensions from "./Extensions";
//import TextureImpl from "./TextureImpl";
//import PipelineImpl from "./PipelineImpl";
//import PolyListImpl from "./PolyListImpl";
//import ShaderImpl from "./ShaderImpl";
//import ColorRenderSurfaceImpl from "./ColorRenderSurfaceImpl";
//import TextureRenderSurfaceImpl from "./TextureRenderSurfaceImpl";
//import ShaderSourceImpl from "./ShaderSourceImpl";
//import CubemapCaptureImpl from "./CubemapCaptureImpl";


// TODO: Import shader library elements

export const WEBGL_1_STRING = "webgl1";

export class WebGL1Engine extends Engine {
    constructor(context) {
        super(context);

        // Initialize webgl 1 extensions
        //Extensions.Get(context);

        //this._engineId = WEBGL_1_STRING;
        //this._texture = new TextureImpl(context);
        //this._pipeline = new PipelineImpl(context);
        //this._polyList = new PolyListImpl(context);
        //this._shader = new ShaderImpl(context);
        //this._colorBuffer = new ColorRenderSurfaceImpl(context);
        //this._textureBuffer = new TextureRenderSurfaceImpl(context);
        //this._shaderSource = new ShaderSourceImpl();
        //this._cubemapCapture = new CubemapCaptureImpl();

        this._shaderLibrary.inputs = {
            // TODO: add shader library inputs 

        }

        this._shaderLibrary.functions = {
            // TODO: add shader library outputs
        }
    }
}