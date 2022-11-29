
export const BlendEquation = {
    ADD: 1,
    SUBTRACT: 2,
    REVERSE_SUBTRACT: 3
};

export const BlendFunction = {
    NULL: 0,
    ZERO: 1,
    ONE: 2,
    SRC_COLOR: 3,
    ONE_MINUS_SRC_COLOR: 4,
    DST_COLOR: 5,
    ONE_MINUS_DST_COLOR: 6,
    SRC_ALPHA: 7,
    ONE_MINUS_SRC_ALPHA: 8,
    DST_ALPHA: 9,
    ONE_MINUS_DST_ALPHA: 10
}

export default class Pipeline {
    constructor(renderer) {
        this._renderer = renderer;

        // Initialize default blend state
        this.setBlendState({});
    }

    get renderer() {
        return this._renderer;
    }

    setBlendState({
        enabled = false,
        blendEquation = BlendEquation.ADD,
        blendFuncSrc = BlendFunction.ONE,
        blendFuncDst = BlendFunction.ZERO,
        blendFuncSrcAlpha = BlendFunction.NULL,
        blendFuncDstAlpha = BlendFunction.NULL
    }) {
        this._blendState = {
            enabled,
            blendEquation,
            blendFuncSrc,
            blendFuncDst,
            blendFuncSrcAlpha,
            blendFuncDstAlpha
        }
    }

    get blendState() {
        return this._blendState;
    }

    create() {
        throw new Exception("Pipeline.create(): calling base class method.");
    }

    activate() {
        throw new Exception("Pipeline.activate(): calling base class method.");
    }
}