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

import FrameBuffer from './FrameBuffer.js';
import MaterialRenderer from './MaterialRenderer.js';
import Pipeline from './Pipeline.js';
import PolyListRenderer from './PolyListRenderer.js';
import RenderBuffer from './RenderBuffer.js';
import SceneRenderer from './SceneRenderer.js';
import ShaderProgram, { ShaderType } from './ShaderProgram.js';
import ShadowRenderer from './ShadowRenderer.js';
import SkyCube from './SkyCube.js';
import SkySphere from './SkySphere.js';
import State from './State.js';
import TextureRenderer from './TextureRenderer.js';
import VertexBuffer, {
    BufferTarget,
    BufferUsage
} from './VertexBuffer.js';

export const webgl = {
    FrameBuffer,
    MaterialRenderer,
    Pipeline,
    PolyListRenderer,
    RenderBuffer,
    SceneRenderer,
    ShaderProgram,
    ShaderType,
    ShadowRenderer,
    SkyCube,
    SkySphere,
    State,
    TextureRenderer,
    VertexBuffer,
    BufferTarget,
    BufferUsage
};
