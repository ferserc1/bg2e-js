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

import PolyList, { DrawMode } from "../base/PolyList";
import Mat4 from "../math/Mat4";
import Vec from "../math/Vec";

export default function arrow(length: number, arrowSize = 0.3, direction = new Vec(0, 0, 1), up = new Vec(0, 1, 0) ): PolyList {
    const polyList = new PolyList();
    direction.normalize();

    polyList.drawMode = DrawMode.LINES;

    const trx = Mat4.MakeRotationWithDirection(direction, up);

    const arrowVector = trx.multVector(new Vec(0, 0, -1));
    const arrowHeadDir1 = trx.multVector(new Vec( arrowSize, 0, -1 + arrowSize));
    const arrowHeadDir2 = trx.multVector(new Vec(-arrowSize, 0, -1 + arrowSize));


    polyList.vertex = [
        0, 0, 0,
        arrowVector.x * length, arrowVector.y * length, arrowVector.z * length,

        arrowVector.x * length, arrowVector.y * length, arrowVector.z * length,
        arrowHeadDir1.x * length, arrowHeadDir1.y * length, arrowHeadDir1.z * length,

        arrowVector.x * length, arrowVector.y * length, arrowVector.z * length,
        arrowHeadDir2.x * length, arrowHeadDir2.y * length, arrowHeadDir2.z * length
    ];

    polyList.normal = [
        0, 0, 1,
        0, 0, 1,

        0, 0, 1,
        0, 0, 1,

        0, 0, 1,
        0, 0, 1
    ];

    polyList.texCoord0 = [
        0, 0,
        0, 1,

        0, 0,
        0, 1,

        0, 0,
        0, 1
    ];

    polyList.index = [
        0, 1,
        2, 3,
        4, 5
    ];

    return polyList;
}