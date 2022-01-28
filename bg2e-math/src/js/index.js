
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

import VectorUtils from './Vector';

import Matrix3Utils from "./Matrix3";

import Matrix4Utils from './Matrix4';

export const math = {
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

export const Vec = VectorUtils.Vec;
export const Mat3 = Matrix3Utils.Mat3;
export const Mat4 = Matrix4Utils.Mat4;

