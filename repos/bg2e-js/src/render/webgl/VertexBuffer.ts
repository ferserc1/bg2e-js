export enum BufferTarget {
    ARRAY_BUFFER = 0,
    ELEMENT_ARRAY_BUFFER = 1,

    // WebGL 2:
    COPY_READ_BUFFER = 2,
    COPY_WRITE_BUFFER = 3,
    TRANSFORM_FEEDBACK_BUFFER = 4,
    UNIFORM_BUFFER = 5,
    PIXEL_PACK_BUFFER = 6,
    PIXEL_UNPACK_BUFFER = 7
}

export enum BufferUsage {
    STATIC_DRAW = 0,
    DYNAMIC_DRAW = 1,
    STREAM_DRAW = 2,

    // WebGL 2:
    STATIC_READ = 3,
    DYNAMIC_READ = 4,
    STREAM_READ = 5,
    STATIC_COPY = 6,
    DYNAMIC_COPY = 7,
    STREAM_COPY = 8
}

const g_bufferTargetConversion: number[] = [];
const g_bufferUsageConversion: number[] = [];

const g_createdBuffers: { [key: number]: { [key: number]: VertexBuffer } } = {};

// DEBUG: assign an unique identifier to each buffer
let g_bg2e_id__: number = 0;

export default class VertexBuffer {

    private _gl: WebGLRenderingContext;
    private _buffer: WebGLBuffer | null;

    static Delete(buffer: VertexBuffer): void {
        if (!buffer._buffer || !buffer._gl) return;
        
        const gls = (buffer._gl as any)._bg2_id_;
        const buffer_id = (buffer._buffer as any)._bg2e_id_;
        
        if (g_createdBuffers[gls]?.[buffer_id]) {
            delete g_createdBuffers[gls][buffer_id];
        }
        buffer._gl.deleteBuffer(buffer._buffer);
        buffer._buffer = null;
    }

    static CreateArrayBuffer(gl: WebGLRenderingContext, data: ArrayBufferView, usage: BufferUsage = BufferUsage.STATIC_DRAW): VertexBuffer {
        const buffer = new VertexBuffer(gl);
        buffer.bind(BufferTarget.ARRAY_BUFFER);
        buffer.bufferData(BufferTarget.ARRAY_BUFFER, data, usage);
        return buffer;
    }

    static CreateElementArrayBuffer(gl: WebGLRenderingContext, data: ArrayBufferView, usage: BufferUsage = BufferUsage.STATIC_DRAW): VertexBuffer {
        const buffer = new VertexBuffer(gl);
        buffer.bind(BufferTarget.ELEMENT_ARRAY_BUFFER);
        buffer.bufferData(BufferTarget.ELEMENT_ARRAY_BUFFER, data, usage);
        return buffer;
    }
    
    static CurrentBuffer(gl: WebGLRenderingContext, target: BufferTarget): VertexBuffer | undefined {
        let glTarget: number;
        if (target === BufferTarget.ARRAY_BUFFER) {
            glTarget = gl.ARRAY_BUFFER_BINDING;
        }
        else if (target === BufferTarget.ELEMENT_ARRAY_BUFFER) {
            glTarget = gl.ELEMENT_ARRAY_BUFFER_BINDING;
        }
        else {
            return undefined;
        }
        
        const gls = (gl as any)._bg2_id_;
        g_createdBuffers[gls] = g_createdBuffers[gls] || {};
        const gl_buffer = gl.getParameter(glTarget) as WebGLBuffer & { _bg2e_id_: number };
        const buffer = g_createdBuffers[gls]?.[gl_buffer?._bg2e_id_];
        return buffer;
    }

    get id(): number | undefined {
        return (this._buffer as any)?._bg2e_id_;
    }

    constructor(gl: WebGLRenderingContext) {
        this._gl = gl;
        this._buffer = gl.createBuffer();
        
        (gl as any)._bg2_id_ = (gl as any)._bg2_id_ ?? ++g_bg2e_id__;
        (this._buffer as any)._bg2e_id_ = ++g_bg2e_id__;
        
        const gls = (gl as any)._bg2_id_;
        g_createdBuffers[gls] = g_createdBuffers[gls] || {};
        g_createdBuffers[gls][(this._buffer as any)._bg2e_id_] = this;

        if (g_bufferTargetConversion.length === 0) {
            g_bufferTargetConversion.push(gl.ARRAY_BUFFER);
            g_bufferTargetConversion.push(gl.ELEMENT_ARRAY_BUFFER);
        }

        if (g_bufferUsageConversion.length === 0) {
            g_bufferUsageConversion.push(gl.STATIC_DRAW);
            g_bufferUsageConversion.push(gl.DYNAMIC_DRAW);
            g_bufferUsageConversion.push(gl.STREAM_DRAW);
        }
    }

    get buffer(): WebGLBuffer | null {
        return this._buffer;
    }

    bind(target: BufferTarget): void {
        if (this._buffer) {
            this._gl.bindBuffer(g_bufferTargetConversion[target], this._buffer);
        }
    }

    bufferData(target: BufferTarget, size: number, usage: BufferUsage): void;
    bufferData(target: BufferTarget, data: ArrayBufferView | ArrayBuffer, usage: BufferUsage): void;
    bufferData(
        target: BufferTarget,
        dataOrSize: ArrayBufferView | ArrayBuffer | number,
        usage: BufferUsage
    ): void {
        this._gl.bufferData(
            g_bufferTargetConversion[target], 
            dataOrSize as any, 
            g_bufferUsageConversion[usage]
        );
    }
}
