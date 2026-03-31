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


export default class MatrixStrategy {
    private _target: Mat4 | null;

    constructor(target: Mat4 | null = null) {
        if (target !== null && !(target instanceof Mat4)) {
            throw Error("MatrixStrategy: invalid target object. Target object must be of type bg.math.Mat4");
        }
        this._target = target;
    }

    get target() {
        return this._target;
    }

    set target(t) {
        this._target = t;
    }

    apply() {
        throw Error("MatrixStrategy.apply(): method not implemented");
    }
}
