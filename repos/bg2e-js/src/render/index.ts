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

import Environment from "./Environment";
import FrameBuffer from "./FrameBuffer";
import MaterialRenderer from "./MaterialRenderer";
import Pipeline, {
    BlendEquation,
    BlendFunction
} from "./Pipeline";
import PolyListRenderer from "./PolyListRenderer";
import RenderBuffer, {
    RenderBufferType,
    RenderBufferTypeName,
    CubeMapFace
} from "./RenderBuffer";
import Renderer, {
    EngineFeatures
} from "./Renderer";
import RenderQueue from "./RenderQueue";
import RenderState from "./RenderState";
import SceneAppController from "./SceneAppController";
import SceneRenderer, {
    FrameVisitor,
    BindRendererVisitor,
    InitVisitor,
    EventCallbackVisitor
} from "./SceneRenderer";
import Shader from "./Shader";
import ShadowRenderer from "./ShadowRenderer";
import SkyCube from "./SkyCube";
import SkySphere from "./SkySphere";
import TextureMergerRenderer from "./TextureMergerRenderer";
import TextureRenderer from "./TextureRenderer";

import { webgl } from "./webgl/index.js";
import WebGLRenderer from "../render/webgl/Renderer";

export default {
    Environment,
    FrameBuffer,
    MaterialRenderer,
    Pipeline,
    BlendEquation,
    BlendFunction,
    PolyListRenderer,
    RenderBuffer,
    RenderBufferType,
    RenderBufferTypeName,
    CubeMapFace,
    Renderer,
    EngineFeatures,
    RenderQueue,
    RenderState,
    SceneAppController,
    SceneRenderer,
    FrameVisitor,
    BindRendererVisitor,
    InitVisitor,
    EventCallbackVisitor,
    Shader,
    ShadowRenderer,
    SkyCube,
    SkySphere,
    TextureMergerRenderer,
    TextureRenderer,

    webgl,
    WebGLRenderer
}
