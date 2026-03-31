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


import {
    Axis,
    PI,
    DEG_TO_RAD,
    RAD_TO_DEG,
    PI_2,
    PI_4,
    PI_8,
    TWO_PI,
    EPSILON,
    NumericArray,
    NumericArrayHighP,
    FLOAT_MAX
} from "./constants.js";

import {
    checkPowerOfTwo,
    checkZero,
    isZero,
    equals,
    degreesToRadians,
    radiansToDegrees,
    sin,
    cos,
    tan,
    cotan,
    atan,
    atan2,
    random,
    seededRandom,
    max,
    min,
    abs,
    sqrt,
    lerp,
    square
} from "./functions.js";

export default {
    Axis,
    PI,
    DEG_TO_RAD,
    RAD_TO_DEG,
    PI_2,
    PI_4,
    PI_8,
    TWO_PI,
    EPSILON,
    NumericArray,
    NumericArrayHighP,
    FLOAT_MAX,

    checkPowerOfTwo,
    checkZero,
    isZero,
    equals,
    degreesToRadians,
    radiansToDegrees,
    sin,
    cos,
    tan,
    cotan,
    atan,
    atan2,
    random,
    seededRandom,
    max,
    min,
    abs,
    sqrt,
    lerp,
    square
};
