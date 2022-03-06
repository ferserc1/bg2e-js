
export const ShaderType = {
    VERTEX: 0,
    FRAGMENT: 1
};

export default class ShaderProgram {
    constructor(gl) {
        this._gl = gl;
        this._program = gl.createProgram();
    }

    get program() {
        return this._program;
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
            throw new Error(`Error compiling vertex: \n${gl.getShaderInfoLog(shader)}`);
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
        return this._gl.getAttribLocation(this._program, name);
    }

    getUniformLocation(name) {
        return this._gl.getUniformLocation(this._program, name);
    }
}
