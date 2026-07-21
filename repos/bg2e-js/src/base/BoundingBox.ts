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

import Vec from "../math/Vec";
import Mat4 from "../math/Mat4";
import PolyList from "./PolyList";

export default class BoundingBox {
    private _min: Vec;
    private _max: Vec;

    constructor();
    constructor(polyList: PolyList);
    constructor(polyLists: PolyList[]);
    constructor(input?: PolyList | PolyList[]) {
        this._min = new Vec(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
        this._max = new Vec(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);

        if (input instanceof PolyList) {
            this.expandByPolyList(input);
        }
        else if (Array.isArray(input)) {
            input.forEach(pl => this.expandByPolyList(pl));
        }
    }

    get min(): Vec { return new Vec(this._min); }
    get max(): Vec { return new Vec(this._max); }

    get center(): Vec {
        return Vec.Add(this._min, this._max).scale(0.5);
    }

    get size(): Vec {
        return Vec.Sub(this._max, this._min);
    }

    get halfSize(): Vec {
        return this.size.scale(0.5);
    }

    get corners(): Vec[] {
        const min = this._min;
        const max = this._max;
        return [
            new Vec(min.x, min.y, min.z),
            new Vec(max.x, min.y, min.z),
            new Vec(min.x, max.y, min.z),
            new Vec(max.x, max.y, min.z),
            new Vec(min.x, min.y, max.z),
            new Vec(max.x, min.y, max.z),
            new Vec(min.x, max.y, max.z),
            new Vec(max.x, max.y, max.z)
        ];
    }

    get valid(): boolean {
        return this._min.x <= this._max.x &&
               this._min.y <= this._max.y &&
               this._min.z <= this._max.z;
    }

    expandByPoint(point: Vec | ArrayLike<number>): void {
        const px = point[0];
        const py = point[1];
        const pz = point[2];

        if (px < this._min.x) this._min.x = px;
        if (py < this._min.y) this._min.y = py;
        if (pz < this._min.z) this._min.z = pz;

        if (px > this._max.x) this._max.x = px;
        if (py > this._max.y) this._max.y = py;
        if (pz > this._max.z) this._max.z = pz;
    }

    expandByPolyList(plist: PolyList): void {
        const vertex = plist.vertex;
        for (let i = 0; i < vertex.length - 2; i += 3) {
            this.expandByPoint([vertex[i], vertex[i + 1], vertex[i + 2]]);
        }
    }

    expandByBoundingBox(other: BoundingBox): void {
        if (!other.valid) return;

        if (other._min.x < this._min.x) this._min.x = other._min.x;
        if (other._min.y < this._min.y) this._min.y = other._min.y;
        if (other._min.z < this._min.z) this._min.z = other._min.z;

        if (other._max.x > this._max.x) this._max.x = other._max.x;
        if (other._max.y > this._max.y) this._max.y = other._max.y;
        if (other._max.z > this._max.z) this._max.z = other._max.z;
    }

    containsPoint(point: Vec | ArrayLike<number>): boolean {
        const px = point[0];
        const py = point[1];
        const pz = point[2];

        return px >= this._min.x && px <= this._max.x &&
               py >= this._min.y && py <= this._max.y &&
               pz >= this._min.z && pz <= this._max.z;
    }

    intersectsWith(other: BoundingBox): boolean {
        return this._min.x <= other._max.x && this._max.x >= other._min.x &&
               this._min.y <= other._max.y && this._max.y >= other._min.y &&
               this._min.z <= other._max.z && this._max.z >= other._min.z;
    }

    clone(): BoundingBox {
        const result = new BoundingBox();
        result._min = new Vec(this._min);
        result._max = new Vec(this._max);
        return result;
    }

    transform(matrix: Mat4): BoundingBox {
        const result = new BoundingBox();
        const corners = this.corners;
        corners.forEach(corner => {
            const transformed = matrix.multVector(corner);
            result.expandByPoint(transformed);
        });
        return result;
    }

    static FromPolyList(plist: PolyList): BoundingBox {
        return new BoundingBox(plist);
    }

    static FromPolyLists(plists: PolyList[]): BoundingBox {
        return new BoundingBox(plists);
    }
}
