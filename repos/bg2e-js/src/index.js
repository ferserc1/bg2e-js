import bg2math from './math/index';
import Mat3 from './math/Mat3';
import Mat4 from './math/Mat4';
import Vec from './math/Vec';
import Quat from './math/Quat';
import MatrixStrategy from './math/MatrixStrategy';

export const math = {
    ...bg2math,
    Mat3,
    Mat4,
    Vec,
    Quat,
    MatrixStrategy
};
