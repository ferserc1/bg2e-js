import Mat4 from "../../math/Mat4";
import Mat3 from "../../math/Mat3";
import { TextureTarget, TextureTargetName } from "../../base/Texture";

export const ShaderType = {
    VERTEX: 0,
    FRAGMENT: 1
};

function destroy() {
    delete this._program.__shaderProgram__;
    this._gl.deleteProgram(this._program);
    this._program = null;
}

export default class ShaderProgram {
    static Create(gl,name,vertexCode,fragmentCode) {
        if (!vertexCode ||  !fragmentCode) {
            throw new Error("ShaderProgram.Create(): Invalid vertex or fragment code");
        }
        const result = new ShaderProgram(gl,name);
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

    static GetShaderProgram(glProgram) {
        return glProgram.__shaderProgram__;
    }

    static Delete(shaderProgram) {
        destroy.apply(shaderProgram);
    }

    constructor(gl, name = "") {
        this._gl = gl;
        this._name = name;
        this._program = gl.createProgram();
        this._program.__id__ = Symbol(this._program);
        this._program.__shaderProgram__ = this;
        this._attribLocations = {};
        this._uniformLocations = {};
        this._failed = false;
    }

    get program() {
        return this._program;
    }

    get name() {
        return this._name;
    }

    attachSource(src,type) {
        if (this._failed) {
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

    attachVertexSource(src) {
        this.attachSource(src, ShaderType.VERTEX);
    }

    attachFragmentSource(src) {
        this.attachSource(src, ShaderType.FRAGMENT);
    }

    link() {
        if (this._failed) {
            return false;
        }
        const gl = this._gl;
        gl.linkProgram(this._program);
        if (!gl.getProgramParameter(this._program, gl.LINK_STATUS)) {
            throw new Error(`Error linking program: \n${gl.getProgramInfoLog(this._program)}`);
        }
    }

    useProgram() {
        this._gl.useProgram(this._program);
    }

    getAttribLocation(name) {
        this._attribLocations[name] = this._attribLocations[name] || this._gl.getAttribLocation(this._program, name);
        return this._attribLocations[name];
    }

    checkInvalidLocations() {
        let status = true;
        for (const name in this._attribLocations) {
            if (this._attribLocations[name] == -1) {
                console.warn(`Invalid attrib location for name '${name}'`);
                status = false;
            }
        }
        return status;
    }

    getUniformLocation(name) {
        this._uniformLocations[name] = this._gl.getUniformLocation(this._program, name);
        return this._uniformLocations[name];
    }

    vertexAttribPointer(name,size,format,normalize,stride,offset) {
        const location = this.getAttribLocation(name);
        this._gl.vertexAttribPointer(location, size, format, normalize, stride, offset);
    }

    enableVertexAttribArray(name) {
        const location = this.getAttribLocation(name);
        this._gl.enableVertexAttribArray(location);
    }

    positionAttribPointer({ name, stride, size = 3, offset = 0, enable = false, bytesPerElement = Float32Array.BYTES_PER_ELEMENT }) {
        this.vertexAttribPointer(name, size, this._gl.FLOAT, false, stride * bytesPerElement, offset * bytesPerElement);
        if (enable) {
            this.enableVertexAttribArray(name);
        }
    }

    normalAttribPointer({ name, size = 3, stride, offset = 0, enable = false, bytesPerElement = Float32Array.BYTES_PER_ELEMENT }) {
        this.vertexAttribPointer(name, size, this._gl.FLOAT, true, stride * bytesPerElement, offset * bytesPerElement);
        if (enable) {
            this.enableVertexAttribArray(name);
        }
    }

    tangentAttribPointer({ name, size = 3, stride, offset = 0, enable = false, bytesPerElement = Float32Array.BYTES_PER_ELEMENT }) {
        this.vertexAttribPointer(name, size, this._gl.FLOAT, true, stride * bytesPerElement, offset * bytesPerElement);
        if (enable) {
            this.enableVertexAttribArray(name);
        }
    }

    texCoordAttribPointer({ name, stride, offset, enable = false, bytesPerElement = Float32Array.BYTES_PER_ELEMENT }) {
        this.vertexAttribPointer(name, 2, this._gl.FLOAT, false, stride * bytesPerElement, offset * bytesPerElement);
        if (enable) {
            this.enableVertexAttribArray(name);
        }
    }

    colorAttribPointer({ name, size = 4, stride, offset = 0, enable = false, bytesPerElement = Float32Array.BYTES_PER_ELEMENT }) {
        this.vertexAttribPointer(name, size, this._gl.FLOAT, false, stride * bytesPerElement, offset * bytesPerElement);
        if (enable) {
            this.enableVertexAttribArray(name);
        }
    }

    uniformMatrix2fv(name, transpose, value) {
        const location = this._uniformLocations[name] || this.getUniformLocation(name);
        this._gl.uniformMatrix2fv(location, transpose, value);
    }

    uniformMatrix3fv(name, transpose, value) {
        const location = this._uniformLocations[name] || this.getUniformLocation(name);
        this._gl.uniformMatrix3fv(location, transpose, value);
    }

    uniformMatrix4fv(name, transpose, value) {
        const location = this._uniformLocations[name] || this.getUniformLocation(name);
        this._gl.uniformMatrix4fv(location, transpose, value);
    }

    uniform1f(name, v0) {
        const location = this._uniformLocations[name] || this.getUniformLocation(name);
        this._gl.uniform1f(location, v0);
    }

    uniform1fv(name, value) {
        const location = this._uniformLocations[name] || this.getUniformLocation(name);
        this._gl.uniform1fv(location, value);
    }

    uniform1i(name, v0) {
        const location = this._uniformLocations[name] || this.getUniformLocation(name);
        this._gl.uniform1i(location, v0);
    }

    uniform1iv(name, value) {
        const location = this._uniformLocations[name] || this.getUniformLocation(name);
        this._gl.uniform1iv(location, value);
    }

    uniform2f(name, v0, v1) {
        const location = this._uniformLocations[name] || this.getUniformLocation(name);
        this._gl.uniform2f(location, v0, v1);
    }

    uniform2fv(name, value) {
        const location = this._uniformLocations[name] || this.getUniformLocation(name);
        this._gl.uniform2fv(location, value);
    }

    uniform2i(name, v0, v1) {
        const location = this._uniformLocations[name] || this.getUniformLocation(name);
        this._gl.uniform2i(location, v0, v1);
    }

    uniform2iv(name, value) {
        const location = this._uniformLocations[name] || this.getUniformLocation(name);
        this._gl.uniform2iv(location, value);
    }

    uniform3f(name, v0, v1, v2) {
        const location = this._uniformLocations[name] || this.getUniformLocation(name);
        this._gl.uniform3f(location, v0, v1, v2);
    }

    uniform3fv(name, value) {
        const location = this._uniformLocations[name] || this.getUniformLocation(name);
        this._gl.uniform3fv(location, value);
    }

    uniform3i(name, v0, v1, v2) {
        const location = this._uniformLocations[name] || this.getUniformLocation(name);
        this._gl.uniform3i(location, v0, v1, v2);
    }

    uniform3iv(name, value) {
        const location = this._uniformLocations[name] || this.getUniformLocation(name);
        this._gl.uniform3iv(location, value);
    }

    uniform4f(name, v0, v1, v2, v3) {
        const location = this._uniformLocations[name] || this.getUniformLocation(name);
        this._gl.uniform4f(location, v0, v1, v2, v3);
    }

    uniform4fv(name, value) {
        const location = this._uniformLocations[name] || this.getUniformLocation(name);
        this._gl.uniform4fv(location, value);
    }

    uniform4i(name, v0, v1, v2, v3) {
        const location = this._uniformLocations[name] || this.getUniformLocation(name);
        this._gl.uniform4i(location, v0, v1, v2, v3);
    }

    uniform4iv(name, value) {
        const location = this._uniformLocations[name] || this.getUniformLocation(name);
        this._gl.uniform4iv(location, value);
    }

    // Utility functions
    bindAttribs(polyListRenderer, { 
        position, 
        normal = null, 
        tex0 = null, 
        tex1 = null, 
        tex2 = null, 
        color = null, 
        tangent = null
    }) {
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
            this.texCoordAttribPointer(polyListRenderer.texCoord2AttribParams(tex1));
        }
        if (tangent) {
            this.tangentAttribPointer(polyListRenderer.tangentAttribParams(tangent));
        }
        if (color) {
            this.colorAttribPointer(polyListRenderer.colorAttribParams(color));
        }
    }

    bindMatrix(uniformName, matrix) {
        if (matrix instanceof Mat4) {
            this.uniformMatrix4fv(uniformName, false, matrix);
        }
        else if (matrix instanceof Mat3) {
            this.uniformMatrix3fv(uniformName, false, matrix);
        }
    }

    bindVector(uniformName, vec) {
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

    bindTexture(uniformName, textureRenderer, textureUnit) {
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

    validate() {
        gl.validateProgram(this._program);
        if (!gl.getProgramParameter(this._program, gl.VALIDATE_STATUS)) {
            throw new Error(`Error validating program:\n${gl.getProgramInfoLog(this._program)}`);
        }
    }
}
