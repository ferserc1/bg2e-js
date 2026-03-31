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
