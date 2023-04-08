import Mat4 from "../math/Mat4";
import Vec from "../math/Vec";
import Component from "./Component";
import MatrixStrategy from "../math/MatrixStrategy";
import { radiansToDegrees } from "../math/functions";
import NodeVisitor from "./NodeVisitor";

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

    set near(v) { this._near = v; this.apply(); }
    get near() { return this._near; }
    set far(v) { this._far = v; this.apply(); }
    get far() { return this._far; }
    set viewport(v) { this._viewport = v; this.apply(); }
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

export class PerspectiveProjectionStrategy extends ProjectionStrategy {
    constructor(target) {
        super(target);
        this._fov = 60;
    }

    set fov(f) { this._fov = f; this.apply(); }
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

export class OpticalProjectionStrategy extends ProjectionStrategy {
    constructor(target) {
        super(target);
        this._focalLength = 50;
        this._frameSize = 35;
    }

    set focalLength(v) { this._focalLength; this.apply(); }
    get focalLength() { return this._focalLength; }
    set frameSize(v) { this._frameSize; this.apply(); }
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

export class OrthographicProjectionStrategy extends ProjectionStrategy {
    constructor(target) {
        super(target);
        this._viewWidth = 100;
    }

    set viewWidth(v) { this._viewWidth = v; this.apply(); }
    get viewWidth() { return this._viewWidth; }

    clone() {
        const other = new OrthographicProjectionStrategy(this._target);
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
        jsonData.type = "OrthographicProjectionStrategy";
        jsonData.viewWidth = this.viewWidth;
        super.serialize(jsonData);
    }

    deserialize(jsonData) {
        this.viewWidth = jsonData.viewWidth || this.viewWidth;
        super.deserialize(jsonData);
    }
}

class SetMainCameraVisitor extends NodeVisitor {
    constructor(mainCamera) {
        super();
        if (!mainCamera instanceof Camera) {
            throw Error("Set main camera: invalid parameter. The object is not an instance of Camera class.")
        }
        this._mainCamera = mainCamera;
    }

    visit(node) {
        const cam = node.camera;
        if (cam && cam === this._mainCamera) {
            cam._isMain = true;
        }
        else if (cam && cam !== this._mainCamera) {
            cam._isMain = false;
        }
    }
}

class GetMainCameraVisitor extends NodeVisitor {
    constructor() {
        super();
        this._mainCamera;
        this._firstCameraFound;
    }

    get mainCamera() {
        return this._mainCamera;
    }

    get firstCameraFound() {
        return this._firstCameraFound;
    }

    clear() {
        this._mainCamera = null;
        this._firstCameraFound = null;
    }

    visit(node) {
        // Note: The _isMain flag is set in Cmaer.SetMain() function
        if (node.camera && node.camera.isMain) {
            node.camera._isMain = false;
            if (this._mainCamera) {
                console.warn("More than one main cameras found in the scene");
            }
            this._mainCamera = node.camera;
        }
        else if (node.camera && !this._firstCameraFound) {
            node.camera._isMain = false;
            this._firstCameraFound = node.camera;
        }
    }
}

export default class Camera extends Component {
    static SetMain(sceneRoot,camera) {
        if (!sceneRoot instanceof Node || sceneRoot.parent !== null) {
            throw Error("Camera.setMain(): invalid parameter. Object is not a scene root");
        }
        const visitor = new SetMainCameraVisitor(camera);
        sceneRoot.accept(visitor);
        sceneRoot.__mainCamera__ = camera;
    }

    static GetMain(sceneRoot) {
        if (!sceneRoot.__mainCamera__) {
            const visitor = new GetMainCameraVisitor();
            sceneRoot.accept(visitor);
            sceneRoot.__mainCamera__ = visitor.result || visitor.firstCameraFound;
            if (sceneRoot.__mainCamera__) {
                sceneRoot.__mainCamera__._isMain = true;
            }
        }
        return sceneRoot.__mainCamera__;
    }

    setMain(sceneRoot) {
        Camera.SetMain(sceneRoot,this);
    }

    constructor() {
        super("Camera");

        this._projectionStrategy = null;
        this._isMain = false;

        this._projectionMatrix = Mat4.MakePerspective(45.0, 1, 0.1, 100.0);
        this._viewport = new Vec(0, 0, 512, 512);
    }

    clone() {
        const other = new Camera();
        other.assign(this);
        return other;
    }

    assign(other) {
        other._projectionStrategy = this._projectionStrategy?.clone() || null;
        // This attribute cannot be assigned, because there can only be one main camera.
        other._isMain = false;
        other._projectionMatrix = new Mat4(this._projectionMatrix);
        other._viewport = new Vec(this._viewport);
    }

    get isMain() {
        return this._isMain;
    }

    get projectionMatrix() {
        return this._projectionMatrix;
    }

    set projectionMatrix(p) {
        this._projectionStrategy = null;
        this._projectionMatrix = p;
    }

    get viewport() {
        return this._viewport;
    }

    set viewport(vp) {
        this._viewport = vp;
    }

    get projectionStrategy() {
        return this._projectionStrategy;
    }

    set projectionStrategy(ps) {
        this._projectionStrategy = ps;
        this._projectionStrategy.target = this._projectionMatrix;
    }

    // This function regenerate the projection matrix with the new
    // aspect ratio, if the projectionStrategy is set.
    resize(width,height) {
        this._viewport = new Vec([0, 0, width, height]);
        if (this._projectionStrategy) {
            this._projectionStrategy.viewport = this._viewport;
            this._projectionStrategy.apply();
        }
    }

    async deserialize(sceneData,loader) {
        sceneData.isMain = sceneData.isMain || false;
        if (sceneData.projectionMethod) {
            this.projectionStrategy = ProjectionStrategy.Factory(sceneData.projectionMethod || {});
        }
    }

    async serialize(sceneData,writer) {
        super.serialize(sceneData,writer);
        sceneData.isMain = this._isMain;
        if (this.projectionStrategy) {
            const projMethod = {};
            sceneData.projectionMethod = projMethod;
            this.projectionStrategy.serialize(projMethod);
        }
    }
}

