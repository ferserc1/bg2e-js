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

export enum Axis {
	NONE = 0,
	X = 1,
	Y = 2,
	Z = 3,
	W = 4
}

export namespace Axis {
	export function name(axis: Axis): string {
		switch (axis) {
		case Axis.NONE:
			return "NONE";
		case Axis.X:
			return "X";
		case Axis.Y:
			return "Y";
		case Axis.Z:
			return "Z";
		case Axis.W:
			return "W";
		default:
			return "UNKNOWN";
		}
	}
}

export const PI: number = 3.141592653589793;
export const DEG_TO_RAD: number = 0.01745329251994;
export const RAD_TO_DEG: number = 57.29577951308233;
export const PI_2: number = 1.5707963267948966;
export const PI_4: number = 0.785398163397448;
export const PI_8: number = 0.392699081698724;
export const TWO_PI: number = 6.283185307179586;
export const EPSILON: number = 0.0000001;

// Default array: 32 bits
export const NumericArray: Float32ArrayConstructor = Float32Array;
export const NumericArrayHighP: Float64ArrayConstructor = Float64Array;
export const FLOAT_MAX: number = 3.402823e38;

export const checkArray = (array: ArrayLike<any> | number, length: number): boolean => {
    if ((array as ArrayLike<any>).length >= length) {
        return true;
    }
    return false;
}