/*
 *    business grade graphic engine (bg2 engine)
 *    Copyright (C) 2024  Fernando Serrano Carpena
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU General Public License as published by
 *    the Free Software Foundation, either version 3 of the License, or
 *    (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU General Public License for more details.
 *
 *    You should have received a copy of the GNU General Public License
 *    along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { RenderLayer } from "../base/PolyList";
import { BlendFunction } from "../render/Pipeline";
import Color from "../base/Color";
import Material from "../base/Material";
import Mat4 from "../math/Mat4";
import Vec from "../math/Vec";
import Ray from "../math/Ray";
import Loader from "../db/Loader";
import Renderer from "../render/Renderer";
import RenderQueue from "../render/RenderQueue";
import Camera from "../scene/Camera";
import Node from "../scene/Node";
import Transform from "../scene/Transform";
import Drawable from "../scene/Drawable";
import { createCube } from "../primitives";
import Bg2MouseEvent from "../app/Bg2MouseEvent";
import SelectionManager from "./SelectionManager";
import GizmoActionLabel, { GizmoActionLabels } from "./GizmoActionLabel";
import GizmoShader from "../shaders/GizmoShader";
import GizmoDrawVisitor from "./GizmoDrawVisitor";
import GizmoPickBuffer from "./GizmoPickBuffer";

export type GizmoActionParams = {
    node: Node;
    transform: Transform;
    translation?: Vec; // Translate* — world-space delta for this frame
    axis?: Vec;         // Rotate* — world-space unit axis
    angle?: number;      // Rotate* — delta angle (radians) for this frame
    scale?: Vec;         // Scale* — per-axis multiplicative factor for this frame
};
export type GizmoActionCallback = (params: GizmoActionParams) => void;

interface ActiveDrag {
    node: Node;
    label: GizmoActionLabel;
    planePoint: Vec;
    planeNormal: Vec;
    axis?: Vec;
    localAxisIndex?: 0 | 1 | 2;
    referenceSize: number;
    previousPoint: Vec;
}

const worldMatrixOf = (node: Node | null | undefined): Mat4 => node ? Transform.GetWorldMatrix(node) : Mat4.MakeIdentity();

// Rotation-only inverse of a node's parent world matrix, used to convert a world-space
// direction into the node's parent local space (scale is intentionally ignored).
const inverseParentRotation = (node: Node): Mat4 => Mat4.GetInverted(Mat4.GetRotation(worldMatrixOf(node.parent)));

export default class GizmoManager {
    protected _renderer: Renderer;
    protected _selectionManager: SelectionManager;
    protected _sceneRoot: Node | null = null;
    protected _camera: Camera | null = null;
    protected _enabled: boolean = true;
    protected _transparency: number = 0.85;
    protected _fixedScreenSize: number = 0.15;
    protected _viewportSize: [number, number] = [1, 1];

    protected _gizmoDrawable: Drawable | null = null;
    protected _colorLabelMap: Record<string, GizmoActionLabel> = {};

    protected _shader: GizmoShader | null = null;
    protected _renderQueue: RenderQueue | null = null;
    protected _drawVisitor: GizmoDrawVisitor | null = null;
    protected _pickBuffer: GizmoPickBuffer | null = null;

    protected _actions: Record<GizmoActionLabel, GizmoActionCallback>;
    protected _activeDrag: ActiveDrag | null = null;

    constructor(renderer: Renderer, selectionManager: SelectionManager) {
        this._renderer = renderer;
        this._selectionManager = selectionManager;
        this._actions = this._createDefaultActions();
    }

    async init(): Promise<void> {
        const cube = createCube(1, 1, 1);
        cube.name = GizmoActionLabel.TranslateXZ;

        const material = new Material();
        material.albedo = new Color([0.16, 0.55, 1.0, 1.0]);
        material.isTransparent = true;

        const drawable = new Drawable("Gizmo");
        drawable.addPolyList(cube, material);
        this.setGizmoDrawable(drawable);

        this._shader = new GizmoShader(this._renderer);
        await this._shader.load();
        this._shader.alpha = this._transparency;

        this._renderQueue = new RenderQueue(this._renderer);
        this._renderQueue.enableQueue(RenderLayer.GIZMO_DEFAULT, this._shader);
        const queueItem = this._renderQueue.getQueue(RenderLayer.GIZMO_DEFAULT);
        if (queueItem) {
            const blendState = {
                enabled: true,
                blendFuncSrc: BlendFunction.SRC_ALPHA,
                blendFuncDst: BlendFunction.ONE_MINUS_SRC_ALPHA,
                blendFuncSrcAlpha: BlendFunction.ONE,
                blendFuncDstAlpha: BlendFunction.ONE_MINUS_SRC_ALPHA
            };
            queueItem.pipelines.cullBackFace.setBlendState(blendState);
            queueItem.pipelines.cullBackFace.create();
            queueItem.pipelines.cullFaceDisabled.setBlendState(blendState);
            queueItem.pipelines.cullFaceDisabled.create();
        }

        this._drawVisitor = new GizmoDrawVisitor(this, this._renderQueue);

        this._pickBuffer = new GizmoPickBuffer(this._renderer);
        await this._pickBuffer.init();
    }

    // Replaces the shared gizmo Drawable used for every gizmo in the scene. Every PolyList
    // whose name matches a GizmoActionLabel becomes interactive; the rest are drawn but ignored
    // by hit-testing.
    setGizmoDrawable(drawable: Drawable): void {
        this._colorLabelMap = {};
        let colorIndex = 1;
        drawable.items.forEach(({ polyList }) => {
            polyList.renderLayers = RenderLayer.GIZMO_DEFAULT | RenderLayer.GIZMO_PICK;
            // Always cull back faces regardless of the source material: loaded models whose
            // material JSON omits "cullFace" end up with enableCullFace falsy, which would
            // otherwise select RenderQueue's cullFaceDisabled pipeline for the gizmo.
            polyList.enableCullFace = true;
            const color = new Color([
                ((colorIndex) & 0xFF) / 255,
                ((colorIndex >> 8) & 0xFF) / 255,
                ((colorIndex >> 16) & 0xFF) / 255,
                1
            ]);
            colorIndex += 1;
            polyList.colorCode = color;
            if ((GizmoActionLabels as string[]).includes(polyList.name)) {
                const key = `${Math.round(color.r * 255)}_${Math.round(color.g * 255)}_${Math.round(color.b * 255)}`;
                this._colorLabelMap[key] = polyList.name as GizmoActionLabel;
            }
        });
        drawable.bindRenderer(this._renderer);
        this._gizmoDrawable = drawable;
    }

    get gizmoDrawable(): Drawable | null { return this._gizmoDrawable; }

    // Loads a Drawable from a model file (e.g. .bg2) and uses it as the shared gizmo,
    // exactly like setGizmoDrawable(). Model files are typically authored without their
    // PolyLists named after a GizmoActionLabel, so an optional labelMap can rename them
    // (keyed by the PolyList's original name) to make the loaded handles interactive.
    async loadGizmo(url: string, labelMap?: Partial<Record<string, GizmoActionLabel>>): Promise<void> {
        const loader = new Loader();
        const drawable = await loader.loadDrawable(url) as Drawable;
        if (labelMap) {
            drawable.items.forEach(({ polyList }) => {
                const label = labelMap[polyList.name];
                if (label) {
                    polyList.name = label;
                }
            });
        }
        this.setGizmoDrawable(drawable);
    }

    setAction(label: GizmoActionLabel, cb: GizmoActionCallback): void {
        this._actions[label] = cb;
    }

    get enabled(): boolean { return this._enabled; }
    set enabled(v: boolean) {
        this._enabled = v;
        if (!v) {
            this._activeDrag = null;
        }
    }
    enable(): void { this.enabled = true; }
    disable(): void { this.enabled = false; }

    get transparency(): number { return this._transparency; }
    set transparency(v: number) {
        this._transparency = v;
        if (this._shader) {
            this._shader.alpha = v;
        }
    }

    get fixedScreenSize(): number { return this._fixedScreenSize; }
    set fixedScreenSize(v: number) { this._fixedScreenSize = v; }

    set sceneRoot(root: Node | null) { this._sceneRoot = root; }
    get sceneRoot(): Node | null { return this._sceneRoot; }

    set camera(cam: Camera | null) { this._camera = cam; }
    get camera(): Camera | null {
        if (this._camera) {
            return this._camera;
        }
        if (!this._sceneRoot) {
            return null;
        }
        this._camera = Camera.GetMain(this._sceneRoot);
        return this._camera;
    }

    setViewportSize(w: number, h: number): void {
        this._viewportSize = [w, h];
        this._pickBuffer?.reshape(w, h);
    }

    // True from the moment a gizmo handle is hit on mouseDown until the following mouseUp.
    // SceneAppController uses this to avoid letting SelectionManager treat that same click
    // as a (de)selection click once the gizmo has claimed it.
    get isInteracting(): boolean {
        return this._activeDrag !== null;
    }

    // Resolves which node's gizmo must be shown: the last selected item when multi-selection
    // is enabled, or the single selected item otherwise — both reduce to "last in selection".
    // The node needs Transform and Gizmo components to be eligible. If it isn't, but its
    // immediate parent has both, the parent's gizmo is used instead (e.g. selecting a mesh
    // child of a group node still lets the group be manipulated).
    resolveTargetNode(): Node | null {
        const selection = this._selectionManager.selection;
        if (!selection.length) {
            return null;
        }
        const node = selection[selection.length - 1].drawable?.node;
        if (!node) {
            return null;
        }
        if (node.component("Transform") && node.component("Gizmo")) {
            return node;
        }
        const parent = node.parent;
        if (parent && parent.component("Transform") && parent.component("Gizmo")) {
            return parent;
        }
        return null;
    }

    // Computes the node's world matrix with its scale replaced by a fixed factor derived from
    // the view matrix, so the gizmo keeps a constant apparent size regardless of camera distance.
    computeGizmoMatrix(node: Node, viewMatrix: Mat4): Mat4 {
        const worldMatrix = Transform.GetWorldMatrix(node);
        const viewSpacePos = viewMatrix.multVector(worldMatrix.translation);
        const distance = Math.max(Math.abs(viewSpacePos.z), 1e-4);
        const scaleFactor = distance * this._fixedScreenSize;
        const gizmoMatrix = new Mat4(worldMatrix);
        gizmoMatrix.setScale(scaleFactor, scaleFactor, scaleFactor);
        return gizmoMatrix;
    }

    draw(sceneRoot: Node, camera: Camera): void {
        if (!this._enabled || !this._renderQueue || !this._drawVisitor || !this._gizmoDrawable) {
            return;
        }
        const targetNode = this.resolveTargetNode();
        this._drawVisitor.targetNode = targetNode;
        if (!targetNode) {
            return;
        }

        const viewMatrix = Mat4.GetInverted(Transform.GetWorldMatrix(camera.node));
        const projectionMatrix = camera.projectionMatrix;

        this._renderQueue.viewMatrix = viewMatrix;
        this._renderQueue.projectionMatrix = projectionMatrix;
        this._renderQueue.newFrame();
        this._drawVisitor.viewMatrix = viewMatrix;
        targetNode.accept(this._drawVisitor);

        this._renderer.frameBuffer.clearDepth();
        this._renderQueue.draw(RenderLayer.GIZMO_DEFAULT);
    }

    mouseDown(evt: Bg2MouseEvent): void {
        this._activeDrag = null;
        if (!this._enabled || !this._gizmoDrawable || !this._pickBuffer) {
            return;
        }
        const targetNode = this.resolveTargetNode();
        const camera = this.camera;
        if (!targetNode || !camera) {
            return;
        }

        const viewMatrix = Mat4.GetInverted(Transform.GetWorldMatrix(camera.node));
        const projectionMatrix = camera.projectionMatrix;
        const gizmoMatrix = this.computeGizmoMatrix(targetNode, viewMatrix);

        const pixelRatio = window.devicePixelRatio || 1;
        const pickedColor = this._pickBuffer.draw(
            this._gizmoDrawable, gizmoMatrix, viewMatrix, projectionMatrix,
            evt.x * pixelRatio, evt.y * pixelRatio
        );
        const label = pickedColor && this._colorLabelMap[`${pickedColor[0]}_${pickedColor[1]}_${pickedColor[2]}`];
        if (!label) {
            return;
        }

        this._beginDrag(targetNode, label, gizmoMatrix, viewMatrix, projectionMatrix, evt);
    }

    mouseDrag(evt: Bg2MouseEvent): void {
        this._updateDrag(evt);
    }

    mouseUp(evt: Bg2MouseEvent): void {
        this._activeDrag = null;
    }

    destroy(): void {
        this._pickBuffer?.destroy();
    }

    private _screenRay(evt: Bg2MouseEvent, viewMatrix: Mat4, projectionMatrix: Mat4): Ray {
        const pixelRatio = window.devicePixelRatio || 1;
        return Ray.FromScreenPoint(
            evt.x * pixelRatio, evt.y * pixelRatio,
            this._viewportSize[0], this._viewportSize[1],
            viewMatrix, projectionMatrix
        );
    }

    // Plane containing `axis`, oriented so its normal faces the camera as much as possible
    // (the component of the view direction perpendicular to the axis). This keeps the
    // ray-plane intersection numerically stable for single-axis translate/scale handles.
    private _facingPlaneNormal(axis: Vec, viewDirection: Vec): Vec {
        const projected = Vec.Sub(viewDirection, Vec.Mult(axis, Vec.Dot(viewDirection, axis)));
        if (Vec.Magnitude(projected) < 1e-6) {
            const fallback = Math.abs(axis.y) < 0.99 ? new Vec(0, 1, 0) : new Vec(1, 0, 0);
            return (Vec.Cross(axis, fallback) as Vec).normalize();
        }
        return projected.normalize();
    }

    private _signedAngle(u: Vec, v: Vec, axis: Vec): number {
        const un = Vec.Normalized(u);
        const vn = Vec.Normalized(v);
        const cross = Vec.Cross(un, vn) as Vec;
        return Math.atan2(Vec.Dot(cross, axis), Vec.Dot(un, vn));
    }

    private _beginDrag(node: Node, label: GizmoActionLabel, gizmoMatrix: Mat4, viewMatrix: Mat4, projectionMatrix: Mat4, evt: Bg2MouseEvent): void {
        const origin = gizmoMatrix.translation;
        const axisX = gizmoMatrix.rightVector;
        const axisY = gizmoMatrix.upVector;
        const axisZ = gizmoMatrix.forwardVector;
        const ray = this._screenRay(evt, viewMatrix, projectionMatrix);

        let normal: Vec;
        let axis: Vec | undefined;
        let localAxisIndex: 0 | 1 | 2 | undefined;

        switch (label) {
        case GizmoActionLabel.TranslateX:
            axis = axisX; localAxisIndex = 0; normal = this._facingPlaneNormal(axis, ray.direction); break;
        case GizmoActionLabel.TranslateY:
            axis = axisY; localAxisIndex = 1; normal = this._facingPlaneNormal(axis, ray.direction); break;
        case GizmoActionLabel.TranslateZ:
            axis = axisZ; localAxisIndex = 2; normal = this._facingPlaneNormal(axis, ray.direction); break;
        case GizmoActionLabel.TranslateXY:
            normal = axisZ; break;
        case GizmoActionLabel.TranslateXZ:
            normal = axisY; break;
        case GizmoActionLabel.TranslateYZ:
            normal = axisX; break;
        case GizmoActionLabel.RotateX:
            axis = axisX; normal = axisX; break;
        case GizmoActionLabel.RotateY:
            axis = axisY; normal = axisY; break;
        case GizmoActionLabel.RotateZ:
            axis = axisZ; normal = axisZ; break;
        case GizmoActionLabel.Scale:
            normal = ray.direction; break;
        case GizmoActionLabel.ScaleX:
            axis = axisX; localAxisIndex = 0; normal = this._facingPlaneNormal(axis, ray.direction); break;
        case GizmoActionLabel.ScaleY:
            axis = axisY; localAxisIndex = 1; normal = this._facingPlaneNormal(axis, ray.direction); break;
        case GizmoActionLabel.ScaleZ:
            axis = axisZ; localAxisIndex = 2; normal = this._facingPlaneNormal(axis, ray.direction); break;
        default:
            return;
        }

        const hit = ray.intersectPlane(origin, normal);
        if (!hit) {
            return;
        }

        const viewSpacePos = viewMatrix.multVector(origin);
        const referenceSize = Math.max(Math.abs(viewSpacePos.z) * this._fixedScreenSize, 1e-4);

        this._activeDrag = { node, label, planePoint: origin, planeNormal: normal, axis, localAxisIndex, referenceSize, previousPoint: hit };
    }

    private _updateDrag(evt: Bg2MouseEvent): void {
        const drag = this._activeDrag;
        const camera = this.camera;
        if (!drag || !camera) {
            return;
        }
        const transform = drag.node.component("Transform") as Transform | undefined;
        const action = this._actions[drag.label];
        if (!transform || !action) {
            return;
        }

        const viewMatrix = Mat4.GetInverted(Transform.GetWorldMatrix(camera.node));
        const projectionMatrix = camera.projectionMatrix;
        const ray = this._screenRay(evt, viewMatrix, projectionMatrix);
        const hit = ray.intersectPlane(drag.planePoint, drag.planeNormal);
        if (!hit) {
            return;
        }

        const isRotate = drag.label === GizmoActionLabel.RotateX || drag.label === GizmoActionLabel.RotateY || drag.label === GizmoActionLabel.RotateZ;
        const isScale = drag.label === GizmoActionLabel.Scale || drag.label === GizmoActionLabel.ScaleX ||
            drag.label === GizmoActionLabel.ScaleY || drag.label === GizmoActionLabel.ScaleZ;

        if (isRotate && drag.axis) {
            const prevVec = Vec.Sub(drag.previousPoint, drag.planePoint);
            const curVec = Vec.Sub(hit, drag.planePoint);
            if (Vec.Magnitude(prevVec) < 1e-6 || Vec.Magnitude(curVec) < 1e-6) {
                drag.previousPoint = hit;
                return;
            }
            const angle = this._signedAngle(prevVec, curVec, drag.axis);
            action({ node: drag.node, transform, axis: drag.axis, angle });
        }
        else if (isScale) {
            const delta = Vec.Sub(hit, drag.previousPoint);
            let dist: number;
            if (drag.axis) {
                dist = Vec.Dot(delta, drag.axis);
            }
            else {
                const toHit = Vec.Sub(hit, drag.planePoint);
                const toPrev = Vec.Sub(drag.previousPoint, drag.planePoint);
                dist = Vec.Magnitude(toHit) - Vec.Magnitude(toPrev);
            }
            const factor = 1 + dist / drag.referenceSize;
            const scale = new Vec(1, 1, 1);
            if (drag.localAxisIndex === 0) scale.x = factor;
            else if (drag.localAxisIndex === 1) scale.y = factor;
            else if (drag.localAxisIndex === 2) scale.z = factor;
            else { scale.x = factor; scale.y = factor; scale.z = factor; }
            action({ node: drag.node, transform, scale });
        }
        else {
            const delta = Vec.Sub(hit, drag.previousPoint);
            const translation = drag.axis ? Vec.Mult(drag.axis, Vec.Dot(delta, drag.axis)) : delta;
            action({ node: drag.node, transform, translation });
        }

        drag.previousPoint = hit;
    }

    private _createDefaultActions(): Record<GizmoActionLabel, GizmoActionCallback> {
        const translateAction: GizmoActionCallback = ({ node, transform, translation }) => {
            if (!translation) return;
            const localDelta = inverseParentRotation(node).multVector(translation.xyz).xyz;
            // A world-space delta only maps 1:1 onto the parent's local axes when the parent
            // is unscaled. inverseParentRotation() strips rotation but not scale, so undo the
            // parent's scale here too — otherwise dragging under a scaled ancestor moves the
            // node faster or slower than the mouse, proportionally to that scale.
            const parentScale = Mat4.GetScale(worldMatrixOf(node.parent));
            localDelta.x /= Math.max(parentScale.x, 1e-6);
            localDelta.y /= Math.max(parentScale.y, 1e-6);
            localDelta.z /= Math.max(parentScale.z, 1e-6);
            const m = transform.matrix;
            m.m30 += localDelta.x;
            m.m31 += localDelta.y;
            m.m32 += localDelta.z;
        };

        const rotateAction: GizmoActionCallback = ({ node, transform, axis, angle }) => {
            if (!axis || angle === undefined) return;
            const localAxis = inverseParentRotation(node).multVector(axis.xyz).xyz.normalize();
            const position = transform.matrix.translation;
            const rotated = Mat4.Mult(Mat4.MakeRotation(angle, localAxis.x, localAxis.y, localAxis.z), transform.matrix);
            rotated.setPosition(position);
            transform.matrix = rotated;
        };

        const scaleAction: GizmoActionCallback = ({ transform, scale }) => {
            if (!scale) return;
            transform.matrix = Mat4.Mult(transform.matrix, Mat4.MakeScale(scale));
        };

        return {
            [GizmoActionLabel.TranslateX]: translateAction,
            [GizmoActionLabel.TranslateY]: translateAction,
            [GizmoActionLabel.TranslateZ]: translateAction,
            [GizmoActionLabel.TranslateXY]: translateAction,
            [GizmoActionLabel.TranslateXZ]: translateAction,
            [GizmoActionLabel.TranslateYZ]: translateAction,
            [GizmoActionLabel.RotateX]: rotateAction,
            [GizmoActionLabel.RotateY]: rotateAction,
            [GizmoActionLabel.RotateZ]: rotateAction,
            [GizmoActionLabel.Scale]: scaleAction,
            [GizmoActionLabel.ScaleX]: scaleAction,
            [GizmoActionLabel.ScaleY]: scaleAction,
            [GizmoActionLabel.ScaleZ]: scaleAction
        };
    }
}
