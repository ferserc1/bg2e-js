import colorCorrection from "./color_correction.glsl?raw";
import constants from "./constants.glsl?raw";
import normalMap from "./normal_map.glsl?raw";
import pbr from "./pbr.glsl?raw";
import uniforms from "./uniforms.glsl?raw";

import ShaderFunction, {
    generateShaderLibrary,
    extractConstants,
    processConstants,
    type ConstantDefinition,
    type DependencyItem
} from "../ShaderFunction";

let g_constants: ConstantDefinition[] | null = null;

export function getConstants() {
    if (!g_constants) {
        // Extract constants all the GLSL files
        g_constants = [
            ...extractConstants(constants),
            ...extractConstants(colorCorrection),
            ...extractConstants(normalMap),
            ...extractConstants(pbr),
            ...extractConstants(uniforms)
        ];
    }
    return g_constants;
}

let g_colorCorrectionFunctions: DependencyItem[] | null = null;
export function getColorCorrectionFunctions() {
    if (!g_colorCorrectionFunctions) {
        g_colorCorrectionFunctions = generateShaderLibrary(colorCorrection);
    }

    return g_colorCorrectionFunctions;
}

let g_normalMapFunctions: DependencyItem[] | null = null;
export function getNormalMapFunctions() {
    if (!g_normalMapFunctions) {
        g_normalMapFunctions = generateShaderLibrary(normalMap);
    }

    return g_normalMapFunctions;
}

let g_pbrFunctions: DependencyItem[] | null = null;
export function getPBRFunctions() {
    if (!g_pbrFunctions) {
        g_pbrFunctions = generateShaderLibrary(pbr);
    }

    return g_pbrFunctions;
}

let g_uniformsFunctions: DependencyItem[] | null = null;
export function getUniformsFunctions() {
    if (!g_uniformsFunctions) {
        g_uniformsFunctions = generateShaderLibrary(uniforms);
    }

    return g_uniformsFunctions;
}

export function replaceConstants(shaderCode: string): string {
    const constants = getConstants();
    return processConstants(shaderCode, constants);
}
