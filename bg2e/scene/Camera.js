import Mat4 from "../math/Mat4";
import Component from "./Component";
import MatrixStrategy from "../math/MatrixStrategy";
import Vec from "../math/Vec";
import { radiansToDegrees } from "../math/functions";

export class ProjectionStrategy extends MatrixStrategy {
    static Factory(jsonData) {
        const create = () => {
            switch (jsonData?.type) {
            case "PerspectiveProjectionMethod":
                return new PerspectiveProjectionStrategy();
            case "OpticalProjectionMethod":
                return new OpticalProjectionStrategy();
            case "OrthographicProjectionStrategy":
                return new OrthographicProjectionStrategy();
            default:
                return null;
            }
        }

        const result = create();
        if (result) {
            result.deserialize(jsonData);
        }
        return result;
    }

    constructor(target) {
        super(target);

        this._near = 0.1;
        this._far = 100.0;
        this._viewport = new Vec([0, 0, 512, 512]);
    }

    clone() {
        throw Error("ProjectionStrategy.clone(): method not implemented by child class.");
    }

    assign(other) {
        this.near = other.near;
        this.far = other.far;
        this.viewport = new Vec(other.viewport);
    }

    set near(v) { this._near = v; }
    get near() { return this._near; }
    set far(v) { this._far = v; }
    get far() { return this._far; }
    set viewport(v) { this._viewport = v; }
    get viewport() { return this._viewport; }

    get fov() { return 0; }

    serialize(jsonData) {
        jsonData.near = this.near;
        jsonData.far = this.far;
        jsonData.viewport = this.viewport;
    }

    deserialize(jsonData) {
        this.near = jsonData.near || this.near;
        this.far = jsonData.far || this.far;
        this.viewport = Array.isArray(jsonData.viewport) ? new Vec(jsonData.viewport) : this.viewport;
    }
}

export class PerspectiveProjectionStrategy extends CameraProjectionStrategy {
    constructor(target) {
        super(target);
        this._fov = 60;
    }

    set fov(f) { this._fov = f; }
    get fov() { return this._fov; }

    clone() {
        const other = new PerspectiveProjectionStrategy(this._target);
        other.assign(this);
        return other;
    }

    assign(other) {
        super.assign(other);
        this.fov = other.fov;
    }

    apply() {
        if (this.target) {
            this.target.perspective(this.fov, this.viewport.aspectRatio, this.near, this.far);
        }
    }

    serialize(jsonData) {
        jsonData.type = "PerspectiveProjectionMethod";
        jsonData.fov = this.fov;
        super.serialize(jsonData);
    }

    deserialize(jsonData) {
        super.deserialize(jsonData);
        this.fov = jsonData.fov || this.fov;
    }
}

export class OpticalProjectionStrategy extends CameraProjectionStrategy {
    constructor(target) {
        super(target);
        this._focalLength = 50;
        this._frameSize = 35;
    }

    set focalLength(v) { this._focalLength; }
    get focalLength() { return this._focalLength; }
    set frameSize(v) { this._frameSize; }
    get frameSize() { return this._frameSize; }

    get fov() {
        return 2 * Math.atan(this.frameSize / (this.focalLength / 2));
    }

    clone() {
        const other = new OpticalProjectionStrategy(this._target);
        other.assign(this);
        return other;
    }

    assign(other) {
        super.assign(other);
        this.focalLength = other.focalLength;
        this.frameSize = other.frameSize;
    }

    apply() {
        if (this.target) {
            const fov = radiansToDegrees(this.fov);
            this.target.perspective(fov, this.viewport.aspectRatio, this.near, this.far);
        }
    }

    serialize(jsonData) {
        super.serialize(jsonData);
        jsonData.type = "OpticalProjectionMethod";
        jsonData.frameSize = this.frameSize;
        jsonData.focalLength = this.focalLength;
    }

    deserialize(jsonData) {
        super.deserialize(jsonData);
        this.frameSize = jsonData.frameSize || this.frameSize;
        this.focalLength = jsonData.focalLength || this.focalLength;
    }
}

export class OrtographicProjectionStrategy extends CameraProjectionStrategy {
    constructor(target) {
        super(target);
        this._viewWidth = 100;
    }

    set viewWidth(v) { this._viewWidth = v; }
    get viewWidth() { return this._viewWidth; }

    clone() {
        const other = new OrtographicProjectionStrategy(this._target);
        other.assign(this);
        return other;
    }

    asign(other) {
        super.assign(other);
        this.viewWidth = other.viewWidth;
    }

    apply() {
        if (this.target) {
            const height = this.viewWidth / this.viewport.aspectRatio;
            const x = this.viewWidth / 2;
            const y = height / 2;
            this.target.ortho(-x, x, -y, y, -this._far, this._far);
        }
    }

    serialize(jsonData) {
        jsonData.type = "OrtographicProjectionStrategy";
        jsonData.viewWidth = this.viewWidth;
        super.serialize(jsonData);
    }

    deserialize(jsonData) {
        this.viewWidth = jsonData.viewWidth || this.viewWidth;
        super.deserialize(jsonData);
    }
}

export default class Camera extends Component {
    constructor() {
        super("Camera");

        this._projectionMethod = null;
        this._isMain = false;

        this._projectionMatrix = Mat4.MakePerspective(45.0, 1, 0.1, 100.0);
    }

    clone() {

    }

    assign() {

    }

    async deserialize(sceneData,loader) {

    }

    async serialize(sceneData,writer) {

    }
}