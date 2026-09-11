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

import Vec from '../math/Vec';
import Mat4 from '../math/Mat4';

export default class Joint {
    protected _transform: Mat4;

    static Factory(linkData?: any): Joint | null {
        if (!linkData || !linkData.type) { 
            return null;
        }
        let result: Joint | null = null;
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

    get transform(): Mat4 { return this._transform; }
    set transform(t: Mat4) { this._transform.assign(t); }

    applyTransform(matrix: Mat4): void {

    }

    calculateTransform(): void {

    }

    deserialize(linkData: any): void {

    }
}

export const LinkTransformOrder = {
    TRANSLATE_ROTATE: 1,
    ROTATE_TRANSLATE: 0
};

export class LinkJoint extends Joint {
    private _offset: Vec;
    private _eulerRotation: Vec;
    private _transformOrder: number;

    constructor() {
        super();
        this._offset = new Vec(0, 0, 0);
        this._eulerRotation = new Vec(0, 0, 0);
        this._transformOrder = LinkTransformOrder.TRANSLATE_ROTATE;
    }

    get offset(): Vec { return this._offset; }
    set offset(o: Vec | number[]) { this._offset = new Vec(o); this.calculateTransform(); }

    get eulerRotation(): Vec { return this._eulerRotation; }
    set eulerRotation(e: Vec | number[]) { this._eulerRotation = new Vec(e); this.calculateTransform(); }

    get yaw(): number { return this._eulerRotation.x; }
    get pitch(): number { return this._eulerRotation.y; }
    get roll(): number { return this._eulerRotation.z; }

    set yaw(y: number) { this._eulerRotation.x = y; this.calculateTransform(); }
    set pitch(p: number) { this._eulerRotation.y = p; this.calculateTransform(); }
    set roll(r: number) { this._eulerRotation.z = r; this.calculateTransform(); }

    get transformOrder(): number { return this._transformOrder; }
    set transformOrder(t: number) { this._transformOrder = t; this.calculateTransform(); }

    applyTransform(matrix: Mat4): void {
        this.appendTransform(matrix, this.transform);
    }

    private appendTransform(dst: Mat4, transform: Mat4): void {
        dst.assign(Mat4.Mult(dst, transform));
    }

    multTransform(dst: Mat4): void {
        const offset = this.offset;
        const translation = Mat4.MakeTranslation(offset.x, offset.y, offset.z);
        switch (this.transformOrder) {
        case LinkTransformOrder.TRANSLATE_ROTATE:
            this.appendTransform(dst, translation);
            this.multRotation(dst);
            break;
        case LinkTransformOrder.ROTATE_TRANSLATE:
            this.multRotation(dst);
            this.appendTransform(dst, translation);
            break;
        }
    }

    multRotation(dst: Mat4): void {
        this.appendTransform(dst, Mat4.MakeRotation(this.eulerRotation.z, 0, 0, 1));
        this.appendTransform(dst, Mat4.MakeRotation(this.eulerRotation.y, 0, 1, 0));
        this.appendTransform(dst, Mat4.MakeRotation(this.eulerRotation.x, 1, 0, 0));
    }

    calculateTransform(): void {
        this.transform.identity();
        this.multTransform(this.transform);
    }

    clone(): LinkJoint {
        const other = new LinkJoint();
        other.assign(this);
        return other;
    }

    assign(other: LinkJoint): void {
        this._offset = new Vec(other._offset);
        this._eulerRotation = new Vec(other._eulerRotation);
        this._transformOrder = other._transformOrder;
        this.calculateTransform();
    }

    serialize(sceneData: any): void {
        sceneData.type = 'LinkJoint';
        sceneData.offset = Array.from(this._offset);
        sceneData.yaw = this.yaw;
        sceneData.pitch = this.pitch;
        sceneData.roll = this.roll;
        sceneData.transformOrder = this.transformOrder;
    }

    deserialize(sceneData: any): void {
        if (sceneData.offset && sceneData.offset.length >= 3) {
            this._offset = new Vec(sceneData.offset);
        }
        this._eulerRotation = new Vec(
            sceneData.yaw || 0,
            sceneData.pitch || 0,
            sceneData.roll || 0
        );
        // `order` was used by bg2e 1.4. Prefer the current property when both
        // are present, but continue accepting old assets.
        this._transformOrder = sceneData.transformOrder
            ?? sceneData.order
            ?? LinkTransformOrder.TRANSLATE_ROTATE;
        this.calculateTransform();
    }
}
