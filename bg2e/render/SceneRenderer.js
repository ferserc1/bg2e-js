import { BlendFunction } from "./Pipeline";


export default class SceneRenderer {
    constructor(renderer) {
        this._renderer = renderer;
    }

    get renderer() {
        return this._renderer;
    }

    async init() {
        this._opaquePipeline = this.renderer.factory.pipeline();
        this._opaquePipeline.setBlendState({ enabled: false });
        this._opaquePipeline.create();

        this._transparentPipeline = this.renderer.factory.pipeline();
        this._transparentPipeline.setBlendState({
            enabled: true,
            blendFuncSrc: BlendFunction.SRC_ALPHA,
            blendFuncDst: BlendFunction.ONE_MINUS_SRC_ALPHA,
            blendFuncSrcAlpha: BlendFunction.ONE,
            blendFuncDstAlpha: BlendFunction.ONE_MINUS_SRC_ALPHA
        });
        this._transparentPipeline.create();
    }

    set environment(env) {
        this._environment = env;
    }

    get environment() {
        return this._environment;
    }
    
    frame(sceneRoot,delta) {

    }

    draw() {

    }

    destroy() {

    }
}