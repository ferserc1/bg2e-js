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

export default function plane(w: number, d: number): PolyList {
    const plist = new PolyList();
    const w2 = w / 2;
    const d2 = d / 2;
    plist.vertex = [
        -w2, 0, -d2,
         w2, 0, -d2,
         w2, 0,  d2,
        -w2, 0,  d2
    ];
    plist.normal = [
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0
    ];
    plist.texCoord0 = [
        0, 1,
        1, 1,
        1, 0,
        0, 0
    ];
    plist.index = [
        0, 3, 2,
        2, 1, 0
    ];
    plist.drawMode = DrawMode.TRIANGLES;
    return plist;
}
