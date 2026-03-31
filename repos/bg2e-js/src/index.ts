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
import bgdebug from './debug/index';

export const app = bgapp;
export const base = bgbase;
export const db = bgdb;
export const debug = bgdebug;
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
