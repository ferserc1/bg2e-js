import Component from './Component';
import OrbitCameraController, { Action, getOrbitAction } from './OrbitCameraController';
import MouseEvent, {
    leftMouseButton,
    middleMouseButton,
    rightMouseButton
} from '../app/MouseEvent';
import { SpecialKey } from '../app/KeyboardEvent';
import { degreesToRadians, lerp } from '../math/functions';
import Vec from '../math/Vec';
import { OrthographicProjectionStrategy } from './Camera';
import Mat4 from '../math/Mat4';


export default class SmoothOrbitCameraController extends OrbitCameraController {
    constructor() {
        super("SmoothOrbitCameraController");
        this._smoothFactor = 0.009;
        this._action = Action.NONE;
    }

    clone() {
        const result = new SmoothOrbitCameraController();
        result.asign(this);
        return result;
    }

    assign(other) {
        super.assign(other);
    }

    willUpdate(delta) {
        if (this.transform && this.enabled) {
            let orthoStrategy = this.camera && this.camera.projectionStrategy instanceof OrthographicProjectionStrategy ?
            this.camera.projectionStrategy : null;

            if (this._mouseButtonPressed) {
                let displacement = new Vec([0,0,0]);
                if (this._keys[SpecialKey.UP_ARROW]) {
                    displacement = Vec.Add(displacement, this.transform.matrix.backwardVector);
                }
                if (this._keys[SpecialKey.DOWN_ARROW]) {
                    displacement = Vec.Add(displacement, this.transform.matrix.forwardVector);
                }
                if (this._keys[SpecialKey.LEFT_ARROW]) {
                    displacement = Vec.Add(displacement, this.transform.matrix.leftVector);
                }
                if (this._keys[SpecialKey.RIGHT_ARROW]) {
                    displacement = Vec.Add(displacement, this.transform.matrix.rightVector);
                }
                displacement.scale(this._displacementSpeed);
                this._center = Vec.Add(this._center, displacement);
            }

            this._center0 = this._center0 ?? Mat4.GetPosition(this.transform.matrix);
            this._distance0 = this._distance0 ?? Vec.Distance(this._center0, this._center);
            this._center0 = Vec.Lerp(this._center0, this._center, delta * this._smoothFactor);
            this._distance0 = lerp(this._distance0, this._distance, delta * this._smoothFactor * 2);
            this._pitch0 = this._pitch0 ?? this._rotation.x;
            this._yaw0 = this._yaw0 ?? this._rotation.y;

            this._pitch0 = lerp(this._pitch0, this._rotation.x, delta * this._smoothFactor);
            this._yaw0 = lerp(this._yaw0, this._rotation.y, delta * this._smoothFactor);

            
            this.transform.matrix.identity();
            if (orthoStrategy) {
                orthoStrategy.viewWidth = this._viewWidth;
            }
            else {
                this.transform.matrix.translate(0, 0, this._distance0);
                if (this.camera) {
                    // Update the camera focus distance to optimize the shadow map rendering
                    this.camera.focusDistance = this._distance0;
                }
            }
            this.transform.matrix.rotate(degreesToRadians(-this._pitch0), 1, 0, 0)
                .rotate(degreesToRadians(this._yaw0), 0, 1, 0)
                .translate(this._center0);
            
        }
    }
}