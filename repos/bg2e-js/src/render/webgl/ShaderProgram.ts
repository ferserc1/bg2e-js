import Mat4 from "../../math/Mat4";
import Mat3 from "../../math/Mat3";
import { TextureTarget, TextureTargetName } from "../../base/Texture";
import type PolyListRenderer from "./PolyListRenderer";
import type TextureRenderer from "./TextureRenderer";
import Vec from "../../math/Vec";

export const ShaderType = {
    VERTEX: 0,
    FRAGMENT: 1
};

interface WebGLProgramWithExtras extends WebGLProgram {
    __shaderProgram__?: ShaderProgram;
    __id__?: symbol;
}

const g_programId = new WeakMap<WebGLProgram, symbol>();

function getProgramId(program: WebGLProgram): symbol {
    let id = g_programId.get(program);
    if (!id) {
        id = Symbol();
        g_programId.set(program, id);
    }
    return id;
}


export default class ShaderProgram {
    private _gl: WebGLRenderingContext;
    private _name: string;
    private _program: WebGLProgram | null;
    private _attribLocations: { [key: string]: number };
    private _uniformLocations: { [key: string]: WebGLUniformLocation | null };
    private _failed: boolean;
    
    protected destroy(): void {
        delete (this._program as WebGLProgramWithExtras).__shaderProgram__;
        this._gl.deleteProgram(this._program);
        this._program = null;
    }

    static Create(gl: WebGLRenderingContext, name: string, vertexCode: string | string[], fragmentCode: string | string[]): ShaderProgram {
        if (!vertexCode ||  !fragmentCode) {
            throw new Error("ShaderProgram.Create(): Invalid vertex or fragment code");
        }
        const result = new ShaderProgram(gl, name);
        if (!Array.isArray(vertexCode)) {
            vertexCode = [vertexCode];
        }
        if (!Array.isArray(fragmentCode)) {
            fragmentCode = [fragmentCode];
        }
        vertexCode.forEach(shaderCode => result.attachVertexSource(shaderCode));
        fragmentCode.forEach(shaderCode => result.attachFragmentSource(shaderCode));
        result.link();
        return result;
    }

    static GetShaderProgram(glProgram: WebGLProgram): ShaderProgram | null {
        return (glProgram as WebGLProgramWithExtras).__shaderProgram__ || null;
    }

    static Delete(shaderProgram: ShaderProgram): void {
        shaderProgram.destroy();
    }

    constructor(gl: WebGLRenderingContext, name: string = "") {
        this._gl = gl;
        this._name = name;
        this._program = gl.createProgram();
        (this._program as WebGLProgramWithExtras).__id__ = getProgramId(this._program);
        (this._program as WebGLProgramWithExtras).__shaderProgram__ = this;
        this._attribLocations = {};
        this._uniformLocations = {};
        this._failed = false;
    }

    get program(): WebGLProgram | null {
        return this._program;
    }

    get name(): string {
        return this._name;
    }

    attachSource(src: string, type: number): void {
        if (this._failed || !this._program) {
            return;
        }

        const gl = this._gl;
        if (type === ShaderType.VERTEX) {
            type = gl.VERTEX_SHADER;
        }
        else if (type === ShaderType.FRAGMENT) {
            type = gl.FRAGMENT_SHADER;
        }
        const shader = gl.createShader(type);
        if (!shader) return;
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            this._failed = true;
            const debugCode = src.split(/\r?\n/)
                .map((line,i) => `${i + 1} | ${line}`)
                .join('\n');
            throw new Error(`Error compiling shader: \n${gl.getShaderInfoLog(shader)} 
            ${debugCode}
            `);
        }
        gl.attachShader(this._program, shader);
    }

    attachVertexSource(src: string): void {
        this.attachSource(src, ShaderType.VERTEX);
    }

    attachFragmentSource(src: string): void {
        this.attachSource(src, ShaderType.FRAGMENT);
    }

    link(): void {
        if (this._failed || !this._program) {
            return;
        }
        const gl = this._gl;
        gl.linkProgram(this._program);
        if (!gl.getProgramParameter(this._program, gl.LINK_STATUS)) {
            throw new Error(`Error linking program: \n${gl.getProgramInfoLog(this._program)}`);
        }
    }

    useProgram(): void {
        this._gl.useProgram(this._program);
    }

    getAttribLocation(name: string): number {
        if (!this._program) return -1;
        this._attribLocations[name] = this._attribLocations[name] || this._gl.getAttribLocation(this._program, name);
        return this._attribLocations[name];
    }

    checkInvalidLocations(): boolean {
        let status = true;
        for (const name in this._attribLocations) {
            if (this._attribLocations[name] == -1) {
                console.warn(`Invalid attrib location for name '${name}'`);
                status = false;
            }
        }
        return status;
    }

    getUniformLocation(name: string): WebGLUniformLocation | null {
        if (!this._program) return null;
        this._uniformLocations[name] = this._gl.getUniformLocation(this._program, name);
        return this._uniformLocations[name];
    }

    vertexAttribPointer(name: string, size: number, format: number, normalize: boolean, stride: number, offset: number): void {
        const location = this.getAttribLocation(name);
        this._gl.vertexAttribPointer(location, size, format, normalize, stride, offset);
    }

    enableVertexAttribArray(name: string): void {
        const location = this.getAttribLocation(name);
        this._gl.enableVertexAttribArray(location);
    }

    positionAttribPointer({ name, stride, size = 3, offset = 0, enable = false, bytesPerElement = Float32Array.BYTES_PER_ELEMENT }: {
        name: string;
        stride: number;
        size?: number;
        offset?: number;
        enable?: boolean;
        bytesPerElement?: number;
    }): void {
        this.vertexAttribPointer(name, size, this._gl.FLOAT, false, stride * bytesPerElement, offset * bytesPerElement);
        if (enable) {
            this.enableVertexAttribArray(name);
        }
    }

    normalAttribPointer({ name, size = 3, stride, offset = 0, enable = false, bytesPerElement = Float32Array.BYTES_PER_ELEMENT }: {
        name: string;
        size?: number;
        stride: number;
        offset?: number;
        enable?: boolean;
        bytesPerElement?: number;
    }): void {
        this.vertexAttribPointer(name, size, this._gl.FLOAT, true, stride * bytesPerElement, offset * bytesPerElement);
        if (enable) {
            this.enableVertexAttribArray(name);
        }
    }

    tangentAttribPointer({ name, size = 3, stride, offset = 0, enable = false, bytesPerElement = Float32Array.BYTES_PER_ELEMENT }: {
        name: string;
        size?: number;
        stride: number;
        offset?: number;
        enable?: boolean;
        bytesPerElement?: number;
    }): void {
        this.vertexAttribPointer(name, size, this._gl.FLOAT, true, stride * bytesPerElement, offset * bytesPerElement);
        if (enable) {
            this.enableVertexAttribArray(name);
        }
    }

    texCoordAttribPointer({ name, stride, offset, enable = false, bytesPerElement = Float32Array.BYTES_PER_ELEMENT }: {
        name: string;
        stride: number;
        offset: number;
        enable?: boolean;
        bytesPerElement?: number;
    }): void {
        this.vertexAttribPointer(name, 2, this._gl.FLOAT, false, stride * bytesPerElement, offset * bytesPerElement);
        if (enable) {
            this.enableVertexAttribArray(name);
        }
    }

    colorAttribPointer({ name, size = 4, stride, offset = 0, enable = false, bytesPerElement = Float32Array.BYTES_PER_ELEMENT }: {
        name: string;
        size?: number;
        stride: number;
        offset?: number;
        enable?: boolean;
        bytesPerElement?: number;
    }): void {
        this.vertexAttribPointer(name, size, this._gl.FLOAT, false, stride * bytesPerElement, offset * bytesPerElement);
        if (enable) {
            this.enableVertexAttribArray(name);
        }
    }

    uniformMatrix2fv(name: string, transpose: boolean, value: Float32List): void {
        const location = this._uniformLocations[name] || this.getUniformLocation(name);
        this._gl.uniformMatrix2fv(location, transpose, value);
    }

    uniformMatrix3fv(name: string, transpose: boolean, value: Float32List): void {
        const location = this._uniformLocations[name] || this.getUniformLocation(name);
        this._gl.uniformMatrix3fv(location, transpose, value);
    }

    uniformMatrix4fv(name: string, transpose: boolean, value: Float32List): void {
        const location = this._uniformLocations[name] || this.getUniformLocation(name);
        this._gl.uniformMatrix4fv(location, transpose, value);
    }

    uniform1f(name: string, v0: number): void {
        const location = this._uniformLocations[name] || this.getUniformLocation(name);
        this._gl.uniform1f(location, v0);
    }

    uniform1fv(name: string, value: Float32List): void {
        const location = this._uniformLocations[name] || this.getUniformLocation(name);
        this._gl.uniform1fv(location, value);
    }

    uniform1i(name: string, v0: number): void {
        const location = this._uniformLocations[name] || this.getUniformLocation(name);
        this._gl.uniform1i(location, v0);
    }

    uniform1iv(name: string, value: Int32List): void {
        const location = this._uniformLocations[name] || this.getUniformLocation(name);
        this._gl.uniform1iv(location, value);
    }

    uniform2f(name: string, v0: number, v1: number): void {
        const location = this._uniformLocations[name] || this.getUniformLocation(name);
        this._gl.uniform2f(location, v0, v1);
    }

    uniform2fv(name: string, value: Float32List): void {
        const location = this._uniformLocations[name] || this.getUniformLocation(name);
        this._gl.uniform2fv(location, value);
    }

    uniform2i(name: string, v0: number, v1: number): void {
        const location = this._uniformLocations[name] || this.getUniformLocation(name);
        this._gl.uniform2i(location, v0, v1);
    }

    uniform2iv(name: string, value: Int32List): void {
        const location = this._uniformLocations[name] || this.getUniformLocation(name);
        this._gl.uniform2iv(location, value);
    }

    uniform3f(name: string, v0: number, v1: number, v2: number): void {
        const location = this._uniformLocations[name] || this.getUniformLocation(name);
        this._gl.uniform3f(location, v0, v1, v2);
    }

    uniform3fv(name: string, value: Float32List): void {
        const location = this._uniformLocations[name] || this.getUniformLocation(name);
        this._gl.uniform3fv(location, value);
    }

    uniform3i(name: string, v0: number, v1: number, v2: number): void {
        const location = this._uniformLocations[name] || this.getUniformLocation(name);
        this._gl.uniform3i(location, v0, v1, v2);
    }

    uniform3iv(name: string, value: Int32List): void {
        const location = this._uniformLocations[name] || this.getUniformLocation(name);
        this._gl.uniform3iv(location, value);
    }

    uniform4f(name: string, v0: number, v1: number, v2: number, v3: number): void {
        const location = this._uniformLocations[name] || this.getUniformLocation(name);
        this._gl.uniform4f(location, v0, v1, v2, v3);
    }

    uniform4fv(name: string, value: Float32List): void {
        const location = this._uniformLocations[name] || this.getUniformLocation(name);
        this._gl.uniform4fv(location, value);
    }

    uniform4i(name: string, v0: number, v1: number, v2: number, v3: number): void {
        const location = this._uniformLocations[name] || this.getUniformLocation(name);
        this._gl.uniform4i(location, v0, v1, v2, v3);
    }

    uniform4iv(name: string, value: Int32List): void {
        const location = this._uniformLocations[name] || this.getUniformLocation(name);
        this._gl.uniform4iv(location, value);
    }

    // Utility functions
    bindAttribs(polyListRenderer: PolyListRenderer, { 
        position, 
        normal = null, 
        tex0 = null, 
        tex1 = null, 
        tex2 = null, 
        color = null, 
        tangent = null
    }: {
        position: string;
        normal?: string | null;
        tex0?: string | null;
        tex1?: string | null;
        tex2?: string | null;
        color?: string | null;
        tangent?: string | null;
    }): void {
        this.positionAttribPointer(polyListRenderer.positionAttribParams(position));
        if (normal) {
            this.normalAttribPointer(polyListRenderer.normalAttribParams(normal));
        }
        if (tex0) {
            this.texCoordAttribPointer(polyListRenderer.texCoord0AttribParams(tex0));
        }
        if (tex1) {
            this.texCoordAttribPointer(polyListRenderer.texCoord1AttribParams(tex1));
        }
        if (tex2) {
            this.texCoordAttribPointer(polyListRenderer.texCoord2AttribParams(tex2));
        }
        if (tangent) {
            this.tangentAttribPointer(polyListRenderer.tangentAttribParams(tangent));
        }
        if (color) {
            this.colorAttribPointer(polyListRenderer.colorAttribParams(color));
        }
    }

    bindMatrix(uniformName: string, matrix: Mat4 | Mat3): void {
        if (matrix instanceof Mat4) {
            this.uniformMatrix4fv(uniformName, false, matrix);
        }
        else if (matrix instanceof Mat3) {
            this.uniformMatrix3fv(uniformName, false, matrix);
        }
    }

    bindVector(uniformName: string, vec: Vec | number[]): void {
        switch (vec.length) {
        case 2:
            this.uniform2fv(uniformName, vec);
            break;
        case 3:
            this.uniform3fv(uniformName, vec);
            break;
        case 4:
            this.uniform4fv(uniformName, vec);
            break;
        default:
            throw new Error("ShaderProgram.bindVector(): invalid vector size");
        }
    }

    bindTexture(uniformName: string, textureRenderer: TextureRenderer, textureUnit: number): void {
        const gl = this._gl;
        const webglTexture = textureRenderer.getApiObject();
        
        gl.activeTexture(gl.TEXTURE0 + textureUnit);
        switch (textureRenderer.texture.target) {
        case TextureTarget.TEXTURE_2D:
            gl.bindTexture(gl.TEXTURE_2D, webglTexture);
            break;
        case TextureTarget.CUBE_MAP:
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, webglTexture);
            break;
        }
        this.uniform1i(uniformName, textureUnit);
    }

    validate(): void {
        if (!this._program) return;
        const gl = this._gl;
        gl.validateProgram(this._program);
        if (!gl.getProgramParameter(this._program, gl.VALIDATE_STATUS)) {
            throw new Error(`Error validating program:\n${gl.getProgramInfoLog(this._program)}`);
        }
    }
}
