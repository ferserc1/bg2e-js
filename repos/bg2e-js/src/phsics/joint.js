import Vec from '../math/Vec';
import Mat4 from '../math/Mat4';

export default class Joint {
    static Factory(linkData) {
        let result = null;
        switch (linkData.type) {
        case 'LinkJoint':
            result = new LinkJoint();
            result.deserialize(linkData);
            break;
        }
        return result;
    }

    constructor() {
        this._transform = Mat4.MakeIdentity();
    }

    get transform() { return this._transform; }
    set transform(t) { this._transform.assign(t); }

    applyTransform(matrix) {

    }

    calculateTransform() {

    }
}

export const LinkTransformOrder = {
    TRANSLATE_ROTATE: 1,
    ROTATE_TRANSLATE: 0
};

export class LinkJoint extends Joint {
    constructor() {
        super();
        this._offset = new Vec(0, 0, 0);
        this._eulerRotation = new Vec(0, 0, 0);
        this._transformOrder = LinkTransformOrder.TRANSLATE_ROTATE;
    }

    get offset() { return this._offset; }
    set offset(o) { this._offset = new Vec(o); this.calculateTransform(); }

    get eulerRotation() { return this._eulerRotation; }
    set eulerRotation(e) { this._eulerRotation = new Vec(e); this.calculateTransform(); }

    get yaw() { return this._eulerRotation.x; }
    get pitch() { return this._eulerRotation.y; }
    get roll() { return this._eulerRotation.z; }

    set yaw(y) { this._eulerRotation.x = y; this.calculateTransform(); }
    set pitch(p) { this._eulerRotation.y = p; this.calculateTransform(); }
    set roll(r) { this._eulerRotation.z = r; this.calculateTransform(); }

    get transformOrder() { return this._transformOrder; }
    set transformOrder(t) { this._transformOrder = t; this.calculateTransform(); }

    applyTransform(matrix) {
        matrix.mult(this.transform);
    }

    multTransform(dst) {
        const offset = this.offset;
        switch (this.transformOrder) {
        case LinkTransformOrder.TRANSLATE_ROTATE:
            dst.translate(offset.x, offset.y, offset.z);
            this.multRotation(dst);
            break;
        case LinkTransformOrder.ROTATE_TRANSLATE:
            this.multRotation(dst);
            dst.translate(offset.x, offset.y, offset.z);
            break;
        }
    }

    multRotation(dst) {
        dst .rotate(this.eulerRotation.z, 0, 0, 1)
            .rotate(this.eulerRotation.y, 0, 1, 0)
            .rotate(this.eulerRotation.x, 1, 0, 0);
    }

    calculateTransform() {
        this.transform.identity();
        this.multTransform(this.transform);
    }

    clone() {
        const other = new LinkJoint();
        other.assign(this);
        return other;
    }

    assign(other) {
        this._offset = new Vec(other._offset);
        this._eulerRotation = new Vec(other._eulerRotation);
        this._transformOrder = other._transformOrder;
        this.calculateTransform();
    }

    serialize(sceneData) {
        if (sceneData.offset && sceneData.offset.length >= 3) {
            this._offset = new Vec(sceneData.offset);
        }
        this._eulerRotation = new Vec(
            sceneData.yaw || 0,
            sceneData.pitch || 0,
            sceneData.roll || 0
        );
        this._transformOrder = sceneData.order !== undefined ? sceneData.order : LinkTransformOrder.TRANSLATE_ROTATE;
    }

    deserialize(sceneData) {
        sceneData.type = 'LinkJoint';
        sceneData.offset = Array.from(this._offset);
        sceneData.yaw = this.yaw;
        sceneData.pitch = this.pitch;
        sceneData.roll = this.roll;
        sceneData.order = this.transformOrder;
    }
}
