import Mat4 from "../math/Mat4";
import Vec from "../math/Vec";
import Component from "./Component";
import MatrixStrategy from "../math/MatrixStrategy";
import { radiansToDegrees } from "../math/functions";
import NodeVisitor from "./NodeVisitor";
import Node from "./Node";

type ProjectionStrategyType = "PerspectiveProjectionMethod" | "OpticalProjectionMethod" | "OrthographicProjectionStrategy";

interface ProjectionStrategyBaseConfig {
    type?: ProjectionStrategyType;
    near?: number;
    far?: number;
    viewport?: number[] | Vec;
}

interface PerspectiveProjectionConfig extends ProjectionStrategyBaseConfig {
    type?: "PerspectiveProjectionMethod";
    fov?: number;
}

interface OpticalProjectionConfig extends ProjectionStrategyBaseConfig {
    type?: "OpticalProjectionMethod";
    frameSize?: number;
    focalLength?: number;
}

interface OrthographicProjectionConfig extends ProjectionStrategyBaseConfig {
    type?: "OrthographicProjectionStrategy";
    viewWidth?: number;
}

type ProjectionStrategyConfig =
    | PerspectiveProjectionConfig
    | OpticalProjectionConfig
    | OrthographicProjectionConfig
    | ProjectionStrategyBaseConfig;

interface CameraSceneData {
    focusDistance?: number;
    isMain?: boolean;
    projectionMethod?: ProjectionStrategyConfig;
    [key: string]: unknown;
}

export abstract class ProjectionStrategy extends MatrixStrategy {
    protected _near: number;
    protected _far: number;
    protected _viewport: Vec;

    static Factory(jsonData?: ProjectionStrategyConfig | null): ProjectionStrategy | null {
        if (!jsonData) {
            return null;
        }

        const create = (): ProjectionStrategy | null => {
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
        };

        const result = create();
        if (result) {
            result.deserialize(jsonData);
        }
        return result;
    }

    constructor(target: Mat4 | null = null) {
        super(target);

        this._near = 0.1;
        this._far = 1000.0;
        this._viewport = new Vec([0, 0, 512, 512]);
    }

    abstract clone(): ProjectionStrategy;

    assign(other: ProjectionStrategy): void {
        this.near = other.near;
        this.far = other.far;
        this.viewport = new Vec(other.viewport);
    }

    set near(v: number) { this._near = v; this.apply(); }
    get near(): number { return this._near; }
    set far(v: number) { this._far = v; this.apply(); }
    get far(): number { return this._far; }
    set viewport(v: Vec) { this._viewport = v; this.apply(); }
    get viewport(): Vec { return this._viewport; }

    get fov(): number { return 0; }

    serialize(jsonData: ProjectionStrategyConfig): void {
        jsonData.near = this.near;
        jsonData.far = this.far;
        jsonData.viewport = this.viewport;
    }

    deserialize(jsonData: ProjectionStrategyConfig = {}): void {
        this.near = jsonData.near ?? this.near;
        this.far = jsonData.far ?? this.far;
        if (Array.isArray(jsonData.viewport)) {
            this.viewport = new Vec(jsonData.viewport);
        }
        else if (jsonData.viewport instanceof Vec) {
            this.viewport = new Vec(jsonData.viewport);
        }
    }
}

export class PerspectiveProjectionStrategy extends ProjectionStrategy {
    private _fov: number;

    constructor(target: Mat4 | null = null) {
        super(target);
        this._fov = 60;
    }

    set fov(f: number) { this._fov = f; this.apply(); }
    get fov(): number { return this._fov; }

    clone(): PerspectiveProjectionStrategy {
        const other = new PerspectiveProjectionStrategy(this.target);
        other.assign(this);
        return other;
    }

    assign(other: PerspectiveProjectionStrategy): void {
        super.assign(other);
        this.fov = other.fov;
    }

    apply(): void {
        if (this.target) {
            this.target.perspective(this.fov, this.viewport.aspectRatio, this.near, this.far);
        }
    }

    serialize(jsonData: PerspectiveProjectionConfig): void {
        jsonData.type = "PerspectiveProjectionMethod";
        jsonData.fov = this.fov;
        super.serialize(jsonData);
    }

    deserialize(jsonData: PerspectiveProjectionConfig = {}): void {
        super.deserialize(jsonData);
        this.fov = jsonData.fov ?? this.fov;
    }
}

export class OpticalProjectionStrategy extends ProjectionStrategy {
    private _focalLength: number;
    private _frameSize: number;

    constructor(target: Mat4 | null = null) {
        super(target);
        this._focalLength = 50;
        this._frameSize = 35;
    }

    set focalLength(v: number) { this._focalLength = v; this.apply(); }
    get focalLength(): number { return this._focalLength; }
    set frameSize(v: number) { this._frameSize = v; this.apply(); }
    get frameSize(): number { return this._frameSize; }

    get fov(): number {
        return 2 * Math.atan((this.frameSize / 2.0) / this.focalLength);
    }

    clone(): OpticalProjectionStrategy {
        const other = new OpticalProjectionStrategy(this.target);
        other.assign(this);
        return other;
    }

    assign(other: OpticalProjectionStrategy): void {
        super.assign(other);
        this.focalLength = other.focalLength;
        this.frameSize = other.frameSize;
    }

    apply(): void {
        if (this.target) {
            const fov = radiansToDegrees(this.fov);
            this.target.perspective(fov, this.viewport.aspectRatio, this.near, this.far);
        }
    }

    serialize(jsonData: OpticalProjectionConfig): void {
        super.serialize(jsonData);
        jsonData.type = "OpticalProjectionMethod";
        jsonData.frameSize = this.frameSize;
        jsonData.focalLength = this.focalLength;
    }

    deserialize(jsonData: OpticalProjectionConfig = {}): void {
        super.deserialize(jsonData);
        this.frameSize = jsonData.frameSize ?? this.frameSize;
        this.focalLength = jsonData.focalLength ?? this.focalLength;
    }
}

export class OrthographicProjectionStrategy extends ProjectionStrategy {
    private _viewWidth: number;

    constructor(target: Mat4 | null = null) {
        super(target);
        this._viewWidth = 100;
    }

    set viewWidth(v: number) { this._viewWidth = v; this.apply(); }
    get viewWidth(): number { return this._viewWidth; }

    clone(): OrthographicProjectionStrategy {
        const other = new OrthographicProjectionStrategy(this.target);
        other.assign(this);
        return other;
    }

    asign(other: OrthographicProjectionStrategy): void {
        super.assign(other);
        this.viewWidth = other.viewWidth;
    }

    apply(): void {
        if (this.target) {
            const height = this.viewWidth / this.viewport.aspectRatio;
            const x = this.viewWidth / 2;
            const y = height / 2;
            this.target.ortho(-x, x, -y, y, -this._far, this._far);
        }
    }

    serialize(jsonData: OrthographicProjectionConfig): void {
        jsonData.type = "OrthographicProjectionStrategy";
        jsonData.viewWidth = this.viewWidth;
        super.serialize(jsonData);
    }

    deserialize(jsonData: OrthographicProjectionConfig = {}): void {
        this.viewWidth = jsonData.viewWidth ?? this.viewWidth;
        super.deserialize(jsonData);
    }
}

class SetMainCameraVisitor extends NodeVisitor {
    private readonly _mainCamera: Camera;

    constructor(mainCamera: Camera) {
        super();
        if (!mainCamera) {
            throw Error("Set main camera: invalid parameter. The camera paremeter is null.")
        }
        if (!(mainCamera instanceof Camera)) {
            throw Error("Set main camera: invalid parameter. The object is not an instance of Camera class.")
        }
        this._mainCamera = mainCamera;
    }

    visit(node: Node): void {
        const cam = node.camera;
        if (!(cam instanceof Camera)) {
            return;
        }
        cam._isMain = cam === this._mainCamera;
    }
}

class GetMainCameraVisitor extends NodeVisitor {
    private _mainCamera: Camera | null;
    private _firstCameraFound: Camera | null;

    constructor() {
        super();
        this._mainCamera = null;
        this._firstCameraFound = null;
    }

    get mainCamera(): Camera | null {
        return this._mainCamera;
    }

    get firstCameraFound(): Camera | null {
        return this._firstCameraFound;
    }

    clear(): void {
        this._mainCamera = null;
        this._firstCameraFound = null;
    }

    visit(node: Node): void {
        // Note: The _isMain flag is set in Camera.SetMain() function
        const cam = node.camera;
        if (!(cam instanceof Camera)) {
            return;
        }

        if (cam.isMain) {
            cam._isMain = false;
            if (this._mainCamera) {
                console.warn("More than one main cameras found in the scene");
            }
            this._mainCamera = cam;
        }
        else if (!this._firstCameraFound) {
            cam._isMain = false;
            this._firstCameraFound = cam;
        }
    }
}

export default class Camera extends Component {
    private _projectionStrategy: ProjectionStrategy | null;
    public _isMain: boolean;
    private _projectionMatrix: Mat4;
    private _viewport: Vec;
    private _focusDistance: number;

    static SetMain(sceneRoot: Node, camera: Camera): void {
        const isNode = sceneRoot instanceof Node;
        if (!isNode || sceneRoot.parent !== null) {
            throw Error("Camera.setMain(): invalid parameter. Object is not a scene root");
        }
        const visitor = new SetMainCameraVisitor(camera);
        sceneRoot.accept(visitor);
        const rootWithMain = sceneRoot as Node & { __mainCamera__?: Camera | null };
        rootWithMain.__mainCamera__ = camera;
    }

    static GetMain(sceneRoot: Node): Camera | null {
        const rootWithMain = sceneRoot as Node & { __mainCamera__?: Camera | null };
        if (!rootWithMain.__mainCamera__) {
            const visitor = new GetMainCameraVisitor();
            sceneRoot.accept(visitor);
            rootWithMain.__mainCamera__ = visitor.mainCamera || visitor.firstCameraFound || null;
            if (rootWithMain.__mainCamera__) {
                rootWithMain.__mainCamera__._isMain = true;
            }
        }
        return rootWithMain.__mainCamera__ ?? null;
    }

    setMain(sceneRoot: Node): void {
        Camera.SetMain(sceneRoot, this);
    }

    constructor() {
        super("Camera");

        this._projectionStrategy = null;
        this._isMain = false;

        this._projectionMatrix = Mat4.MakePerspective(45.0, 1, 0.1, 100.0);
        this._viewport = new Vec(0, 0, 512, 512);

        this._focusDistance = 5;
    }

    clone(): Camera {
        const other = new Camera();
        other.assign(this);
        return other;
    }

    assign(other: Camera): void {
        other._projectionStrategy = this._projectionStrategy?.clone() || null;
        // This attribute cannot be assigned, because there can only be one main camera.
        other._isMain = false;
        other._projectionMatrix = new Mat4(this._projectionMatrix);
        other._viewport = new Vec(this._viewport);
        other._focusDistance = this._focusDistance;
    }

    get isMain(): boolean {
        return this._isMain;
    }

    get projectionMatrix(): Mat4 {
        return this._projectionMatrix;
    }

    set projectionMatrix(p: Mat4) {
        this._projectionStrategy = null;
        this._projectionMatrix = p;
    }

    get viewport(): Vec {
        return this._viewport;
    }

    set viewport(vp: Vec) {
        this._viewport = vp;
    }

    get projectionStrategy(): ProjectionStrategy | null {
        return this._projectionStrategy;
    }

    set projectionStrategy(ps: ProjectionStrategy | null) {
        this._projectionStrategy = ps;
        if (this._projectionStrategy) {
            this._projectionStrategy.target = this._projectionMatrix;
            this._projectionStrategy.viewport = this._viewport;
            this._projectionStrategy.apply();
        }
    }

    get focusDistance(): number {
        return this._focusDistance;
    }

    set focusDistance(fd: number) {
        this._focusDistance = fd;
    }

    // This function regenerate the projection matrix with the new
    // aspect ratio, if the projectionStrategy is set.
    resize(width: number, height: number): void {
        this._viewport = new Vec([0, 0, width, height]);
        if (this._projectionStrategy) {
            this._projectionStrategy.viewport = this._viewport;
            this._projectionStrategy.apply();
        }
    }

    async deserialize(sceneData: CameraSceneData = {}, loader: unknown): Promise<void> {
        await super.deserialize(sceneData, loader);
        this.focusDistance = sceneData.focusDistance ?? this._focusDistance;
        if (sceneData.projectionMethod) {
            const strategy = ProjectionStrategy.Factory(sceneData.projectionMethod);
            if (strategy) {
                this.projectionStrategy = strategy;
            }
        }
    }

    async serialize(sceneData: CameraSceneData = {}, writer: unknown): Promise<void> {
        await super.serialize(sceneData, writer);
        sceneData.isMain = this._isMain;
        sceneData.focusDistance = this._focusDistance;
        if (this.projectionStrategy) {
            const projMethod: ProjectionStrategyConfig = {};
            this.projectionStrategy.serialize(projMethod);
            sceneData.projectionMethod = projMethod;
        }
    }
}

