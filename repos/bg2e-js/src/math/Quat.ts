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

import Vec from "./Vec";

export default class Quat extends Vec {
    constructor();
    constructor(quat: ArrayLike<number>);
    constructor(matrix3: ArrayLike<number>);
    constructor(matrix4: ArrayLike<number>);
    constructor(alpha: number, x: number, y: number, z: number);
    constructor(a?: number | ArrayLike<number>, b?: number, c?: number, d?: number) {
        super(0,0,0,0);

        if (a === undefined) {
            this.setValue(0, 0, 0, 0);
        }
        else if (b === undefined) {
            if (typeof a === 'object' && a.length === 4) {
                this.assign(a);
            }
            else if (typeof a === 'object' && a.length === 9) {
                this.initWithMatrix3(a);
            }
            else if (typeof a === 'object' && a.length === 16) {
                this.initWithMatrix4(a);
            }
            else {
                throw new Error("Invalid parameter initializing Quaternion");
            }
        }
        else if (typeof a === 'number' && b !== undefined && c !== undefined && d !== undefined) {
            this.initWithValues(a, b, c, d);
        }
        else {
            throw new Error("Invalid parameters initializing Quaternion");
        }
    }

    initWithMatrix3(m: ArrayLike<number>): void {
        const w = Math.sqrt(1 + m[0] + m[4] + m[8]) / 2;
        const w4 = 4 * w;
        
        this[0] = (m[7] - m[5]) / w;
        this[1] = (m[2] - m[6]) / w4;
        this[2] = (m[3] - m[1]) / w4;
        this[3] = w;
    }

    initWithMatrix4(m: ArrayLike<number>): void {
        const w = Math.sqrt(1 + m[0] + m[5] + m[10]) / 2;
        const w4 = 4 * w;
        
        this[0] = (m[9] - m[6]) / w;
        this[1] = (m[2] - m[8]) / w4;
        this[2] = (m[4] - m[1]) / w4;
        this[3] = w;
    }

    initWithValues(alpha: number, x: number, y: number, z: number): this {
        this[0] = x * Math.sin( alpha / 2 );
        this[1] = y * Math.sin( alpha / 2 );
        this[2] = z * Math.sin( alpha / 2 );
        this[3] = Math.cos( alpha / 2 );
        return this;
    }
}

