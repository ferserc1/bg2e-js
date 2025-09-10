import BasicDiffuseColorShader from "./BasicDiffuseColorShader";
import BasicPBRLightShader from "./BasicPBRLightShader";
import DebugRenderShader from "./DebugRenderShader";
import DepthRenderShader from "./DepthRenderShader";
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