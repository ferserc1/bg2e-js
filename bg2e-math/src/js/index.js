
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
} from "./constants";

import {
    checkPowerOfTwo,
    checkZero,
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
} from "./functions";

import vec from './Vector';

export const MathConst = {
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
};

export const MathFunc = {
    checkPowerOfTwo,
    checkZero,
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

export const Vector = vec.Vector;
export const VectorFunc = vec.VectorFunc;
