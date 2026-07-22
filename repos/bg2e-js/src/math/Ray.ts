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

import Mat4 from "./Mat4";
import Vec from "./Vec";

export default class Ray {
    // x, y are screen coordinates with the origin at the top-left corner (same convention as
    // Bg2MouseEvent), and viewportWidth/viewportHeight are the size of the render viewport.
    static FromScreenPoint(x: number, y: number, viewportWidth: number, viewportHeight: number, viewMatrix: Mat4, projectionMatrix: Mat4): Ray {
        const ndcX = (x / viewportWidth) * 2.0 - 1.0;
        const ndcY = 1.0 - (y / viewportHeight) * 2.0;

        const invViewProjection = Mat4.GetInverted(Mat4.Mult(projectionMatrix, viewMatrix));

        const unproject = (ndcZ: number): Vec => {
            const clip = invViewProjection.multVector(new Vec(ndcX, ndcY, ndcZ, 1));
            return Vec.Div(clip.xyz, clip.w);
        };

        const near = unproject(-1);
        const far = unproject(1);
        const direction = Vec.Sub(far, near).normalize();
        return new Ray(near, direction);
    }

    origin: Vec;
    direction: Vec;

    constructor(origin: Vec, direction: Vec) {
        this.origin = new Vec(origin.xyz);
        this.direction = new Vec(direction.xyz);
    }

    // Intersects the ray with a plane defined by a point contained in the plane and its normal.
    // Returns null if the ray is parallel to the plane (or points away from it).
    intersectPlane(planePoint: Vec, planeNormal: Vec): Vec | null {
        const denom = Vec.Dot(this.direction, planeNormal);
        if (Math.abs(denom) < 1e-8) {
            return null;
        }
        const t = Vec.Dot(Vec.Sub(planePoint, this.origin), planeNormal) / denom;
        if (t < 0) {
            return null;
        }
        return Vec.Add(this.origin, Vec.Mult(this.direction, t));
    }
}
