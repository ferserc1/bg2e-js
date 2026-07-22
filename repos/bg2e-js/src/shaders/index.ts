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

import BasicDiffuseColorShader from "./BasicDiffuseColorShader";
import BasicPBRLightShader from "./BasicPBRLightShader";
import DebugRenderShader from "./DebugRenderShader";
import DepthRenderShader from "./DepthRenderShader";
import GizmoShader from "./GizmoShader";
import IrradianceMapCubeShader from "./IrradianceMapCubeShader";
import PBRLightIBLShader from "./PBRLightIBLShader";
import PickSelectionShader from "./PickSelectionShader";
import PresentDebugFramebufferShader from "./PresentDebugFramebufferShader";
import PresentTextureShader from "./PresentTextureShader";
import SelectionHighlightShader from "./SelectionHighlightShader";
import ShaderFunction from "./ShaderFunction";
import SkyCubeShader from "./SkyCubeShader";
import SkySphereShader from "./SkySphereShader";
import SpecularMapCubeShader from "./SpecularMapCubeShader";
import TextureMergerShader from "./TextureMergerShader";
import * as webgl_shader_lib from "./webgl_shader_lib";

export default {
    BasicDiffuseColorShader,
    BasicPBRLightShader,
    DebugRenderShader,
    DepthRenderShader,
    GizmoShader,
    IrradianceMapCubeShader,
    PBRLightIBLShader,
    PickSelectionShader,
    PresentDebugFramebufferShader,
    PresentTextureShader,
    SelectionHighlightShader,
    ShaderFunction,
    SkyCubeShader,
    SkySphereShader,
    SpecularMapCubeShader,
    TextureMergerShader,
    shaderLib: {
        webgl: webgl_shader_lib
    }
}