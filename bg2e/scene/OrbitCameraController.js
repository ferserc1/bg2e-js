import Color from "../base/Color";
import Vec from "../math/Vec";
import { ProjectionStrategy, OrthographicProjectionStrategy } from "./Camera";
import Component from "./Component";
import { SpecialKey } from "../app/KeyboardEvent";
import MouseEvent, {
    leftMouseButton, 
    middleMouseButton, 
    rightMouseButton
} from "../app/MouseEvent";
import { degreesToRadians } from "../math/functions";

export const Action = {
    NONE: 0,
    ROTATE: 1,
    PAN: 2,
    ZOOM: 3
};

function getOrbitAction(cameraCtrl) {
    let left = leftMouseButton(),
        middle = middleMouseButton(),
        right = rightMouseButton();
            
    switch (true) {
        case left==cameraCtrl._rotateButtons.left &&
             middle==cameraCtrl._rotateButtons.middle &&
             right==cameraCtrl._rotateButtons.right:
             return Action.ROTATE;
        case left==cameraCtrl._panButtons.left &&
             middle==cameraCtrl._panButtons.middle &&
             right==cameraCtrl._panButtons.right:
             return Action.PAN;
        case left==cameraCtrl._zoomButtons.left &&
             middle==cameraCtrl._zoomButtons.middle &&
             right==cameraCtrl._zoomButtons.right:
             return Action.ZOOM;
    }
}
export default class OrbitCameraController extends Component {
    constructor() {
        super("OrbitCameraController");

        this._rotateButtons = { left:true, middle:false, right:false };
        this._panButtons = { left:false, middle:false, right:true };
        this._zoomButtons = { left:false, middle:true, right:false };
        
        this._rotation = new Vec([0, 0]);
        this._distance = 5;
        this._center = new Vec([0, 0, 0]);
        this._rotationSpeed = 0.2;
        this._forward = 0;
        this._left = 0;
        this._wheelSpeed = 1;
        this._minFocus = 2;

        this._minPitch = -85.0;
        this._maxPitch = 85.0;
        this._minDistance = 0.4;
        this._maxDistance = 24.0;
        
        this._maxX = 45;
        this._minX = -45;
        this._minY = -45;
        this._maxY = 45;
        this._maxZ = 45;
        this._minZ = -45;

        this._displacementSpeed = 0.1;

        this._enabled = true;

        // Non-serializable attributes
        this._keys = {};
        this._lastTouch = [];
    }

    clone() {
        const result = new OrbitCameraController();
        result.assign(this);
        return result;
    }

    assign(other) {
        this._rotateButtons.left = other._rotateButtons.left;
        this._rotateButtons.middle = other._rotateButtons.middle;
        this._rotateButtons.right = other._rotateButtons.right;
        
        this._panButtons.left = other._panButtons.left;
        this._panButtons.middle = other._panButtons.middle;
        this._panButtons.right = other._panButtons.right;
        
        this._zoomButtons.left = other._zoomButtons.left;
        this._zoomButtons.middle = other._zoomButtons.middle;
        this._zoomButtons.right = other._zoomButtons.right;

        this._rotation = new Vec(other.rotation);
        this._distance = other.distance;
        this._center = new Vec(other.center);
        this._rotationSpeed = other.rotationSpeed;
        this._forward = other.forward;
        this._left = other.left;
        this._wheelSpeed = other.wheelSpeed;
        this._minFocus = other.minCameraFocus;
        this._minPitch = other.minPitch;
        this._maxPitch = other.maxPitch;
        this._minDistance = other.minDistance;
        this._maxDistance = other.maxDistance;
        this._maxX = other.maxX;
        this._minX = other.minX;
        this._minY = other.minY;
        this._maxY = other.maxY;
        this._maxZ = other.maxZ;
        this._minZ = other.minZ;
        this._displacementSpeed = other.displacementSpeed;
        this._enabled = other.enabled;
    }

    get rotation() { return this._rotation; }
    set rotation(r) { this._rotation = r; }
    get distance() { return this._distance; }
    set distance(d) { this._distance = d; }
    get center() { return this._center; }
    set center(c) { this._center = c; }
    get rotationSpeed() { return this._rotationSpeed; }
    set rotationSpeed(rs) { this._rotationSpeed = rs; }
    get forward() { return this._forward; }
    set forward(f) { this._forward = f; }
    get left() { return this._left; }
    set left(l) { this._left = l; }
    get whellSpeed() { this._wheelSpeed; }
    set wheelSpeed(w) { this._wheelSpeed = w; }

    get viewWidth() { return this._viewWidth; }
    
    get minCameraFocus() { return this._minFocus; }
    set minCameraFocus(f) { this._minFocus = f; }
    get minPitch() { return this._minPitch; }
    set minPitch(p) { this._minPitch = p; }
    get maxPitch() { return this._maxPitch; }
    set maxPitch(p) { this._maxPitch = p; }
    get minDistance() { return this._minDistance; }
    set minDistance(d) { this._minDistance = d; }
    get maxDistance() { return this._maxDistance; }
    set maxDistance(d) { this._maxDistance = d; }

    get minX() { return this._minX; }
    get maxX() { return this._maxX; }
    get minY() { return this._minY; }
    get maxY() { return this._maxY; }
    get minZ() { return this._minZ; }
    get maxZ() { return this._maxZ; }

    set minX(val) { this._minX = val; }
    set maxX(val) { this._maxX = val; }
    set minY(val) { this._minY = val; }
    set maxY(val) { this._maxY = val; }
    set minZ(val) { this._minZ = val; }
    set maxZ(val) { this._maxZ = val; }

    get displacementSpeed() { return this._displacementSpeed; }
    set displacementSpeed(s) { this._displacementSpeed = s; }

    get enabled() { return this._enabled; }
    set enabled(e) { this._enabled = e; }

    setRotateButtons(left,middle,right) {
        this._rotateButtons = { left:left, middle:middle, right:right };
    }
    
    setPanButtons(left,middle,right) {
        this._panButtons = { left:left, middle:middle, right:right };
    }
    
    setZoomButtons(left,middle,right) {
        this._zoomButtons = { left:left, middle:middle, right:right };
    }

    async deserialize(sceneData,loader) {
        this._rotateButtons = sceneData.rotateButtons || this._rotateButtons;
        this._panButtons = sceneData.panButtons || this._panButtons;
        this._zoomButtons = sceneData.zoomButtons || this._zoomButtons;
        this._rotation = new Vec(sceneData.rotation) || this._rotation;
        this._distance = sceneData.distance!==undefined ? sceneData.distance : this._distance;
        this._center = new Vec(sceneData.center) || this._center;
        this._rotationSpeed = sceneData.rotationSpeed!==undefined ? sceneData.rotationSpeed : this._rotationSpeed;
        this._forward = sceneData.forward!==undefined ? sceneData.forward : this._forward;
        this._left = sceneData.left!==undefined ? sceneData.left : this._left;
        this._wheelSpeed = sceneData.wheelSpeed!==undefined ? sceneData.wheelSpeed : this._wheelSpeed;
        this._minFocus = sceneData.minFocus!==undefined ? sceneData.minFocus : this._minFocus;
        this._minPitch = sceneData.minPitch!==undefined ? sceneData.minPitch : this._minPitch;
        this._maxPitch = sceneData.maxPitch!==undefined ? sceneData.maxPitch : this._maxPitch;
        this._minDistance = sceneData.minDistance!==undefined ? sceneData.minDistance : this._minDistance;
        this._maxDistance = sceneData.maxDistance!==undefined ? sceneData.maxDistance : this._maxDistance;
        this._maxX = sceneData.maxX!==undefined ? sceneData.maxX : this._maxX;
        this._minX = sceneData.minX!==undefined ? sceneData.minX : this._minX;
        this._minY = sceneData.minY!==undefined ? sceneData.minY : this._minY;
        this._maxY = sceneData.maxY!==undefined ? sceneData.maxY : this._maxY;
        this._maxZ = sceneData.maxZ!==undefined ? sceneData.maxZ : this._maxZ;
        this._minZ = sceneData.minZ!==undefined ? sceneData.minZ : this._minZ;
        this._displacementSpeed = sceneData.displacementSpeed!==undefined ? sceneData.displacementSpeed : this._displacementSpeed;
        this._enabled = sceneData.enabled!==undefined ? sceneData.enabled : this._enabled;
    }

    async serialize(sceneData,writer) {
        super.serialize(sceneData,writer);
        sceneData.rotateButtons = this._rotateButtons;
        sceneData.panButtons = this._panButtons;
        sceneData.zoomButtons = this._zoomButtons;
        sceneData.rotation = this._rotation.toArray();
        sceneData.distance = this._distance;
        sceneData.center = this._center.toArray();
        sceneData.rotationSpeed = this._rotationSpeed;
        sceneData.forward = this._forward;
        sceneData.left = this._left;
        sceneData.wheelSpeed = this._wheelSpeed;
        sceneData.minFocus = this._minFocus;
        sceneData.minPitch = this._minPitch;
        sceneData.maxPitch = this._maxPitch;
        sceneData.minDistance = this._minDistance;
        sceneData.maxDistance = this._maxDistance;
        sceneData.maxX = this._maxX;
        sceneData.minX = this._minX;
        sceneData.minY = this._minY;
        sceneData.maxY = this._maxY;
        sceneData.maxZ = this._maxZ;
        sceneData.minZ = this._minZ;
        sceneData.displacementSpeed = this._displacementSpeed;
        sceneData.enabled = this._enabled;
    }

    willUpdate(delta) {
        let orthoStrategy = this.camera && this.camera.projectionStrategy instanceof OrthographicProjectionStrategy ?
            this.camera.projectionStrategy : null;
        
        if (this.transform && this.enabled) {
            let forward = this.transform.matrix.forwardVector;
            let left = this.transform.matrix.leftVector;
            forward.scale(this._forward);
            left.scale(this._left);
            this._center = Vec.Add(Vec.Add(this._center, forward), left);
            
            let pitch = this._rotation.x>this._minPitch ? this._rotation.x:this._minPitch;
            pitch = pitch<this._maxPitch ? pitch : this._maxPitch;
            this._rotation.x = pitch;

            this._distance = this._distance>this._minDistance ? this._distance:this._minDistance;
            this._distance = this._distance<this._maxDistance ? this._distance:this._maxDistance;

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

            if (this._center.x<this._minX) this._center.x = this._minX;
            else if (this._center.x>this._maxX) this._center.x = this._maxX;

            if (this._center.y<this._minY) this._center.y = this._minY;
            else if (this._center.y>this._maxY) this._center.y = this._maxY;

            if (this._center.z<this._minZ) this._center.z = this._minZ;
            else if (this._center.z>this._maxZ) this._center.z = this._maxZ;

            
            this.transform.matrix.identity();

            if (orthoStrategy) {
                orthoStrategy.viewWidth = this._viewWidth;
            }
            else {
                this.transform.matrix.translate(0,0,this._distance);
            }
            this.transform.matrix.rotate(degreesToRadians(pitch), -1,0,0)
                        .rotate(degreesToRadians(this._rotation.y), 0,1,0)
                        .translate(this._center);
        }

    }

    // TODO; Update the following code to the v2.0 API
    mouseDown(evt) {
        if (!this.enabled) return;
        this._mouseButtonPressed = true;
        this._lastPos = new Vec(evt.x,evt.y);
    }

    mouseUp(evt) {
        this._mouseButtonPressed = false;
    }
    
    mouseDrag(evt) {
        if (this.transform && this._lastPos && this.enabled) {
            let delta = new Vec(this._lastPos.y - evt.y,
                                this._lastPos.x - evt.x);
            this._lastPos.set(evt.x,evt.y);
            let orthoStrategy = this.camera && this.camera.projectionStrategy instanceof OrthographicProjectionStrategy || false;

            switch (getOrbitAction(this)) {
                case Action.ROTATE:
                    delta.x = delta.x * -1;
                    this._rotation = Vec.Add(this._rotation, delta.scale(0.5));
                    break;
                case Action.PAN:
                    let up = this.transform.matrix.upVector;
                    let left = this.transform.matrix.leftVector;
                    
                    if (orthoStrategy) {
                        up.scale(delta.x * -0.0005 * this._viewWidth);
                        left.scale(delta.y * -0.0005 * this._viewWidth);
                    }
                    else {
                        up.scale(delta.x * -0.001 * this._distance);
                        left.scale(delta.y * -0.001 * this._distance);
                    }
                    this._center = Vec.Add(Vec.Add(this._center, up), left);
                    break;
                case Action.ZOOM:
                    this._distance += delta.x * 0.01 * this._distance;
                    this._viewWidth += delta.x * 0.01 * this._viewWidth;
                    if (this._viewWidth<0.5) this._viewWidth = 0.5;
                    break;
            }				
        }
    }

    mouseWheel(evt) {
        if (!this.enabled) return;
        let mult = this._distance>0.01 ? this._distance:0.01;
        let wMult = this._viewWidth>1 ? this._viewWidth:1;
        this._distance += evt.delta * 0.001 * mult * this._wheelSpeed;
        this._viewWidth += evt.delta * 0.0001 * wMult * this._wheelSpeed;
        if (this._viewWidth<0.5) this._viewWidth = 0.5;
    }
    
    touchStart(evt) {
        if (!this.enabled) return;
        this._lastTouch = evt.touches;
    }
    
    touchMove(evt) {
        // TODO: Update this code to v2.0 API
        //if (this._lastTouch.length==evt.touches.length && this.transform && this.enabled) {
        //    if (this._lastTouch.length==1) {
        //        // Rotate
        //        let last = this._lastTouch[0];
        //        let t = evt.touches[0];
        //        let delta = new bg.Vec((last.y - t.y)  * -1.0, last.x - t.x);
        //        
        //        this._rotation = Vec.Add(this._rotation, delta.scale(0.5));
        //    }
        //    else if (this._lastTouch.length==2) {
        //        // Pan/zoom
        //        let l0 = this._lastTouch[0];
        //        let l1 = this._lastTouch[1];
        //        let t0 = null;
        //        let t1 = null;
        //        evt.touches.forEach((touch) => {
        //            if (touch.identifier==l0.identifier) {
        //                t0 = touch;
        //            }
        //            else if (touch.identifier==l1.identifier) {
        //                t1 = touch;
        //            }
        //        });
        //        let dist0 = Math.round((new Vec(l0.x,l0.y)).sub(new bg.Vector3(l1.x,l1.y)).magnitude());
        //        let dist1 = Math.round((new Vec(t0.x,t0.y)).sub(new bg.Vector3(t1.x,t1.y)).magnitude());
        //        let delta = new bg.Vector2(l0.y - t0.y, l1.x - t1.x);
        //        let up = this.transform.matrix.upVector;
        //        let left = this.transform.matrix.leftVector;
        //        
        //        up.scale(delta.x * -0.001 * this._distance);
        //        left.scale(delta.y * -0.001 * this._distance);
        //        this._center.add(up).add(left);
        //            
        //        this._distance += (dist0 - dist1) * 0.005 * this._distance;
        //    }
        //}
        //this._lastTouch = evt.touches;
    }

    keyDown(evt) {
        if (!this.enabled) return;
        this._keys[evt.key] = true;
    }

    keyUp(evt) {
        if (!this.enabled) return;
        this._keys[evt.key] = false;
    }
}
