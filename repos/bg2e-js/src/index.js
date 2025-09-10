import bg2math from './math/index';
import Mat3 from './math/Mat3';
import Mat4 from './math/Mat4';
import Vec from './math/Vec';
import Quat from './math/Quat';
import MatrixStrategy from './math/MatrixStrategy';
import bg2tools from './tools/index';
import bgdb from './db/index';
import bgbase from './base/index';
import bgscene from './scene/index';
import bgapp from './app/index';
import bgrender from './render/index';
import * as bgprimitives from './primitives/index';
import bgshaders from './shaders/index';

export const app = bgapp;
export const base = bgbase;
export const db = bgdb;
export const math = {
    ...bg2math,
    Mat3,
    Mat4,
    Vec,
    Quat,
    MatrixStrategy
};
export const render = bgrender;
export const scene = bgscene;
export const tools = bg2tools;
export const primitives = bgprimitives;
export const shaders = bgshaders;
