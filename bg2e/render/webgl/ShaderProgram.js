
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
    }

    get program() {
        return this._program;
    }

    get name() {
        return this._name;
    }

    attachSource(src,type) {
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
            throw new Error(`Error compiling shader: \n${gl.getShaderInfoLog(shader)}`);
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
        const gl = this._gl;
        gl.linkProgram(this._program);
        if (!gl.getProgramParameter(this._program, gl.LINK_STATUS)) {
            throw new Error(`Error linking program: \n${gl.getProgramInfoLog(this._program)}`);
        }

        gl.validateProgram(this._program);
        if (!gl.getProgramParameter(this._program, gl.VALIDATE_STATUS)) {
            throw new Error(`Error validating program:\n${gl.getProgramInfoLog(program)}`);
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
        const location = this._attribLocations[name] || this.getAttribLocation(name);
        this._gl.vertexAttribPointer(location, size, format, normalize, stride, offset);
    }

    enableVertexAttribArray(name) {
        const location = this._attribLocations[name] || this.getAttribLocation(name);
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
}
