
export const BufferTarget = {
    ARRAY_BUFFER:               0,
    ELEMENT_ARRAY_BUFFER:       1,

    // WebGL 2:
    COPY_READ_BUFFER:           2,
    COPY_WRITE_BUFFER:          3,
    TRANSFORM_FEEDBACK_BUFFER:  4,
    UNIFORM_BUFFER:             5,
    PIXEL_PACK_BUFFER:          6,
    PIXEL_UNPACK_BUFFER:        7
};

export const BufferUsage = {
    STATIC_DRAW:    0,
    DYNAMIC_DRAW:   1,
    STREAM_DRAW:    2,

    // WebGL 2:
    STATIC_READ:    3,
    DYNAMIC_READ:   4,
    STREAM_READ:    5,
    STATIC_COPY:    6,
    DYNAMIC_COPY:   7,
    STREAM_COPY:    8
};

const g_bufferTargetConversion = [];
const g_bufferUsageConversion = [];

const g_createdBuffers = {};

export default class VertexBuffer {
    static Delete(buffer) {
        const gls = Symbol.for(buffer._gl);
        const buffer_s = Symbol.for(buffer._buffer);
        g_createdBuffers[gls] = g_createdBuffers[gls] || {};
        if (g_createdBuffers[gls][buffer_s]) {
            delete g_createdBuffers[gls][buffer_s];
        }
        buffer._gl.deleteBuffer(buffer._buffer);
        buffer._buffer = null;
    }

    static CreateArrayBuffer(gl,data,usage = BufferUsage.STATIC_DRAW) {
        const buffer = new VertexBuffer(gl);
        buffer.bind(BufferTarget.ARRAY_BUFFER);
        buffer.bufferData(BufferTarget.ARRAY_BUFFER, data, usage);
        return buffer;
    }

    static CreateElementArrayBuffer(gl,data,usage = BufferUsage.STATIC_DRAW) {
        const buffer = new VertexBuffer(gl);
        buffer.bind(BufferTarget.ELEMENT_ARRAY_BUFFER);
        buffer.bufferData(BufferTarget.ELEMENT_ARRAY_BUFFER, data, usage);
        return buffer;
    }

    static Unbind(gl, target) {
        gl.bindBuffer(g_bufferTargetConversion[target], 0);
    }

    static CurrentBuffer(gl, target) {
        if (target === BufferTarget.ARRAY_BUFFER) {
            target = gl.ARRAY_BUFFER_BINDING;
        }
        else if (target === BufferTarget.ELEMENT_ARRAY_BUFFER) {
            target = gl.ELEMENT_ARRAY_BUFFER_BINDING;
        }
        const gls = Symbol.for(gl);
        g_createdBuffers[gls] = g_createdBuffers[gls] || {}
        const gl_buffer = gl.getParameter(target);
        const buffer = g_createdBuffers[gls][Symbol.for(gl_buffer)];
        return buffer;
    }

    constructor(gl) {
        this._gl = gl;
        this._buffer = gl.createBuffer();
        const gls = Symbol.for(gl);
        g_createdBuffers[gls] = g_createdBuffers[gls] || {}
        g_createdBuffers[gls][Symbol.for(this._buffer)] = this;

        if (g_bufferTargetConversion.length === 0) {
            g_bufferTargetConversion.push(gl.ARRAY_BUFFER);
            g_bufferTargetConversion.push(gl.ELEMENT_ARRAY_BUFFER);
            g_bufferTargetConversion.push(gl.COPY_READ_BUFFER);
            g_bufferTargetConversion.push(gl.COPY_WRITE_BUFFER);
            g_bufferTargetConversion.push(gl.TRANSFORM_FEEDBACK_BUFFER);
            g_bufferTargetConversion.push(gl.UNIFORM_BUFFER);
            g_bufferTargetConversion.push(gl.PIXEL_PACK_BUFFER);
            g_bufferTargetConversion.push(gl.PIXEL_UNPACK_BUFFER);
        }

        if (g_bufferUsageConversion.length === 0) {
            g_bufferUsageConversion.push(gl.STATIC_DRAW);
            g_bufferUsageConversion.push(gl.DYNAMIC_DRAW);
            g_bufferUsageConversion.push(gl.STREAM_DRAW);
            g_bufferUsageConversion.push(gl.STATIC_READ);
            g_bufferUsageConversion.push(gl.DYNAMIC_READ);
            g_bufferUsageConversion.push(gl.STREAM_READ);
            g_bufferUsageConversion.push(gl.STATIC_COPY);
            g_bufferUsageConversion.push(gl.DYNAMIC_COPY);
            g_bufferUsageConversion.push(gl.STREAM_COPY);
        }
    }

    get buffer() {
        return this._buffer;
    }

    bind(target) {
        this._gl.bindBuffer(g_bufferTargetConversion[target], this._buffer);
    }

    bufferData(target, data, usage, srcOffset = null, length = null) {
        this._gl.bufferData(
            g_bufferTargetConversion[target], data, 
            g_bufferUsageConversion[usage], srcOffset, length);
    }
}
