
import { DrawMode, PolyListCullFace, PolyListFrontFace } from "../../base/PolyList";
import PolyListRenderer from "../PolyListRenderer";
import VertexBuffer, { BufferTarget } from "./VertexBuffer";

export default class WebGLPolyListRenderer extends PolyListRenderer {
    constructor(renderer,polyList) {
        super(renderer,polyList);
    }

    init() {
        this._vertexBuffer = null;
        this._indexBuffer = null;
        this._indexArrayFormat = null;
    }

    get valid() {
        return this._vertexBuffer !== null && this._indexArrayFormat !== null && this._indexBuffer !== null;
    }

    refresh() {
        const getVector = (items, current, stride) => items.length && (stride === 3 ?
            [items[current * stride], items[current * stride + 1], items[current * stride + 2]] :
            stride === 2 ? [items[current * stride], items[current * stride + 1]] || null :
            [items[current * stride], items[current * stride + 1], items[current * stride + 2], items[current * stride + 3]])

        const numElements = this.polyList.vertex.length / 3;
        const result = [];
        for (let i = 0; i < numElements; ++i) {
            const v = getVector(this.polyList.vertex, i, 3);
            const n = getVector(this.polyList.normal, i, 3);
            const t0 = getVector(this.polyList.texCoord0, i, 2);
            const t1 = getVector(this.polyList.texCoord1, i, 2);
            const t2 = getVector(this.polyList.texCoord2, i, 2);
            const c = getVector(this.polyList.color, i, 4);
            const t = getVector(this.polyList.tangent, i, 3);

            result.push(...v);
            if (n) {
                result.push(...n);
            }
            if (t0) {
                result.push(...t0);
            }
            if (t1) {
                result.push(...t1);
            }
            if (t2) {
                result.push(...t2);
            }
            if (c) {
                result.push(...c);
            }
            if (t) {
                result.push(...t);
            }
        }

        this._stride = 3;
        const vertex = 0;
        const normal = 3;
        let texCoord0 = 3;
        let texCoord1 = 3;
        let texCoord2 = 3;
        let color = 3;
        let tangent = 3;
        if (this.hasNormal) {
            this._stride += 3;
            texCoord0 += 3;
            texCoord1 += 3;
            texCoord2 += 3;
            color += 3;
            tangent += 3;
        }
        if (this.hasTexCoord0) {
            this._stride += 2;
            texCoord1 += 2;
            texCoord2 += 2;
            color += 2;
            tangent += 2;
        }
        if (this.hasTexCoord1) {
            this._stride += 2;
            texCoord2 += 2;
            color += 2;
            tangent += 2;
        }
        if (this.hasTexCoord2) {
            this._stride += 2;
            color += 2;
            tangent += 2;
        }
        if (this.hasColor) {
            this._stride += 4;
            tangent += 4;
        }
        if (this.hasTangent) {
            this._stride += 3;
        }

        this._offsets = { vertex, normal, texCoord0, texCoord1, texCoord2, color, tangent };
        this._vertexBuffer = VertexBuffer.CreateArrayBuffer(this.renderer.gl, new Float32Array(result));
        const indexArray = this.polyList.index.length < 65535 ? new Uint16Array(this.polyList.index) : new Uint32Array(this.polyList.index);
        this._indexBuffer = VertexBuffer.CreateElementArrayBuffer(this.renderer.gl, indexArray);
        this._indexArrayFormat = indexArray instanceof Uint16Array ? this.renderer.gl.UNSIGNED_SHORT : this.renderer.gl.UNSIGNED_INT;
    }

    get hasNormal() {
        return this._polyList.normal.length > 0;
    }

    get hasTexCoord0() {
        return this._polyList.texCoord0.length > 0;
    }

    get hasTexCoord1() {
        return this._polyList.texCoord1.length > 0;
    }

    get hasTexCoord2() {
        return this._polyList.texCoord2.length > 0;
    }

    get hasColor() {
        return this._polyList.color.length > 0;
    }

    get hasTangent() {
        return this._polyList.tangent.length > 0;
    }

    positionAttribParams(name) {
        return { name, stride: this._stride, size: 3, offset: 0, enable: true }
    }

    normalAttribParams(name) {
        return { name, stride: this._stride, size: 3, offset: this._offsets.normal, enable: true }
    }

    texCoord0AttribParams(name) {
        return { name, stride: this._stride, size: 2, offset: this._offsets.texCoord0, enable: true }
    }

    texCoord1AttribParams(name) {
        return { name, stride: this._stride, size: 2, offset: this._offsets.texCoord1, enable: true }
    }

    texCoord2AttribParams(name) {
        return { name, stride: this._stride, size: 2, offset: this._offsets.texCoord2, enable: true }
    }
    
    colorAttribParams(name) {
        return { name, stride: this._stride, size: 4, offset: this._offsets.color, enable: true }
    }

    tangentAttribParams(name) {
        return { name, stride: this._stride, size: 3, offset: this._offsets.tangent, enable: true }
    }

    bindBuffers() {
        this._vertexBuffer.bind(BufferTarget.ARRAY_BUFFER);
        this._indexBuffer.bind(BufferTarget.ELEMENT_ARRAY_BUFFER);        
    }
    
    draw() {
        const { gl, state } = this.renderer;

        state.cullFaceEnabled = this.polyList.enableCullFace;
        
        switch (this.polyList.frontFace) {
        case PolyListFrontFace.CCW:
            state.frontFace = state.CCW;
            break;
        case PolyListFrontFace.CW:
            state.frontFace = state.CW;
            break;
        }

        switch (this.polyList.cullFace) {
        case PolyListCullFace.BACK:
            state.cullFace = state.BACK;
            break;
        case PolyListCullFace.FRONT:
            state.cullFace = state.FRONT;
            break;
        case PolyListCullFace.FRONT_AND_BACK:
            state.cullFace = state.FRONT_AND_BACK;
            break;
        }


        
        let mode = 0;
        switch (this._polyList.drawMode) {
        case DrawMode.POINTS:
            mode = gl.POINTS;
            break;
        case DrawMode.TRIANGLES:
            mode = gl.TRIANGLES;
            break;
        case DrawMode.TRIANGLE_FAN:
            mode = gl.TRIANGLE_FAN
            break;
        case DrawMode.TRIANGLE_STRIP:
            mode = gl.TRIANGLE_STRIP;
            break;
        case DrawMode.LINES:
            mode = gl.LINES;
            break;
        case DrawMode.LINE_STRIP:
            mode = gl.LINE_STRIP;
            break;
        }

        gl.lineWidth(this.polyList.lineWidth);

        gl.drawElements(mode, this.polyList.index.length, this._indexArrayFormat, 0);
    }

    destroy() {
        VertexBuffer.Delete(this._vertexBuffer);
        VertexBuffer.Delete(this._indexBuffer);
    }
}
