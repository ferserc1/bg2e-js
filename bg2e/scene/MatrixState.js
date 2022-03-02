
import Mat4 from "../math/Mat4";

const pushMatrix = function(mat,stack,id) {
    stack.push(new Mat4(mat));
}

const popMatrix = function(mat,stack,id) {
    if (stack.length>0) {
        mat.assign(stack[stack.length - 1]);
        stack.splice(stack.length - 1, 1);
    }
    else {
        throw new Error(`Matrix stack underflow detected in ${id} matrix`)
    }
}

export default class MatrixState {
    constructor() {
        this._projection = Mat4.MakeIdentity();
        this._view = Mat4.MakeIdentity();
        this._model = Mat4.MakeIdentity();

        this._projMatrixStack = [];
        this._viewMatrixStack = [];
        this._modelMatrixStack = [];
    }

    get projection() { return this._projection; }
    get view() { return this._view; }
    get model() { return this._model; }

    pushProjection() { pushMatrix(this._projection, this._projMatrixStack, 'projection'); }
    popProjection() { popMatrix(this._projection, this._projMatrixStack, 'projection'); }
    pushView() { pushMatrix(this._view, this._viewMatrixStack, 'view'); }
    popView() { popMatrix(this._view, this._viewMatrixStack, 'view'); }
    pushModel() { pushMatrix(this._model, this._modelMatrixStack, 'model'); }
    popModel() { popMatrix(this._model, this._modelMatrixStack, 'model'); }
}
