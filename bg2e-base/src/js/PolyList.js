import { Vec, Mat4 } from "bg2e-math";


export const BufferType = {
    VERTEX:		    1 << 0,
    NORMAL:		    1 << 1,
    TEX_COORD_0:	1 << 2,
    TEX_COORD_1:	1 << 3,
    TEX_COORD_2:	1 << 4,
    COLOR:		    1 << 5,
    TANGENT:	    1 << 6,
    INDEX:		    1 << 7
};

export const DrawMode = {
    TRIANGLES: null,
    TRIANGLE_FAN: null,
    TRIANGLE_STRIP: null,
    LINES: null,
    LINE_STRIP: null
};

function buildTangents(plist) {
    if (!plist.texCoord0 || !plist.vertex) return;

    plist._tangent = [];
    
    const result = [];
    const generatedIndexes = {};
    let invalidUV = false;

    if (plist.index.length%3==0) {
        // Triangles
        for (let i=0; i<plist.index.length - 2; i+=3) {
            const v0i = plist.index[i] * 3;
            const v1i = plist.index[i + 1] * 3;
            const v2i = plist.index[i + 2] * 3;
            
            const t0i = plist.index[i] * 2;
            const t1i = plist.index[i + 1] * 2;
            const t2i = plist.index[i + 2] * 2;
            
            const v0 = new Vec(plist.vertex[v0i], plist.vertex[v0i + 1], plist.vertex[v0i + 2]);
            const v1 = new Vec(plist.vertex[v1i], plist.vertex[v1i + 1], plist.vertex[v1i + 2]);
            const v2 = new Vec(plist.vertex[v2i], plist.vertex[v2i + 1], plist.vertex[v2i + 2]);
            
            const t0 = new Vec(plist.texCoord0[t0i], plist.texCoord0[t0i + 1]);
            const t1 = new Vec(plist.texCoord0[t1i], plist.texCoord0[t1i + 1]);
            const t2 = new Vec(plist.texCoord0[t2i], plist.texCoord0[t2i + 1]);
            
            const edge1 = Vec.Sub(v1, v0);
            const edge2 = Vec.Sub(v2, v0);
            
            const deltaU1 = t1.x - t0.x;
            const deltaV1 = t1.y - t0.y;
            const deltaU2 = t2.x - t0.x;
            const deltaV2 = t2.y - t0.y;
            
            const den = (deltaU1 * deltaV2 - deltaU2 * deltaV1);
            let tangent = null;
            if (den==0) {
                const n = plist.normal.length === plist.vertex.length ?
                    new Vec(plist.normal[v0i], plist.normal[v0i + 1], plist.normal[v0i + 2]) :
                    new Vec(1, 0, 0);

                invalidUV = true;
                tangent = new Vec(n.y, n.z, n.x);
            }
            else {
                const f = 1 / den;
            
                tangent = new Vec(f * (deltaV2 * edge1.x - deltaV1 * edge2.x),
                                  f * (deltaV2 * edge1.y - deltaV1 * edge2.y),
                                  f * (deltaV2 * edge1.z - deltaV1 * edge2.z));
                tangent.normalize();
            }
            
            if (generatedIndexes[v0i]===undefined) {
                result.push(tangent.x);
                result.push(tangent.y);
                result.push(tangent.z);
                generatedIndexes[v0i] = tangent;
            }
            
            if (generatedIndexes[v1i]===undefined) {
                result.push(tangent.x);
                result.push(tangent.y);
                result.push(tangent.z);
                generatedIndexes[v1i] = tangent;
            }
            
            if (generatedIndexes[v2i]===undefined) {
                result.push(tangent.x);
                result.push(tangent.y);
                result.push(tangent.z);
                generatedIndexes[v2i] = tangent;
            }
        }
    }
    else {	// other draw modes: lines, line_strip
        for (let i=0; i<plist.vertex.length; i+=3) {
            result.push(0,0,1);
        }
    }

    if (invalidUV) {
        console.warn(`Invalid UV texture coords found in PolyList '${ plist.name }'. Some objects may present artifacts in the lighting, and not display textures properly.`)
    }

    plist._tangent = result;
}

export default class PolyList {
    constructor() {
        this._drawMode = DrawMode.TRIANGLES;

        this._name = "";
        this._groupName = "";
        this._visible = true;
        this._visibleToShadows = true;

        this._vertex = [];
        this._normal = [];
        this._texCoord0 = [];
        this._texCoord1 = [];
        this._texCoord2 = [];
        this._color = [];
        this._index = [];
    }

    clone() {
        const result = new PolyList();
        result.assign(this);
        result.name = this.name + " clone";
        return result;
    }

    assign(other) {
        this.drawMode = other.drawMode; 
        this.name = other.name;
        this.groupName = other.groupName;
        this.visible = other.visible;
        this.visibleToShadows = other.visibleToSh
        this.vertex = [...other.vertex];
        this.normal = [...other.normal];
        this.texCoord0 = [...other.texCoord0];
        this.texCoord1 = [...other.texCoord1];
        this.texCoord2 = [...other.texCoord2];
        this.color = [...other.color];
        this.index = [...other.index];
        this.rebuildTangents();
    }

    get drawMode() { return this._drawMode; }
    set drawMode(m) { this._drawMode = m; }

    get name() { return this._name; }
    set name(v) { this._name = v; }
    get groupName() { return this._groupName; }
    set groupName(v) { this._groupName = v; }
    get visible() { return this._visible; }
    set visible(v) { this._visible = v; }
    get visibleToShadows() { return this._visibleToShadows; }
    set visibleToShadows(v) { this._visibleToShadows = v; }

    get vertex() { return this._vertex; }
    set vertex(v) { this._vertex = v; }
    get normal() { return this._normal; }
    set normal(v) { this._normal = v; }
    get texCoord0() { return this._texCoord0; }
    set texCoord0(v) { this._texCoord0 = v; }
    get texCoord1() { return this._texCoord1; }
    set texCoord1(v) { this._texCoord1 = v; }
    get texCoord2() { return this._texCoord2; }
    set texCoord2(v) { this._texCoord2 = v; }
    get color() { return this._color; }
    set color(v) { this._color = v; }
    get index() { return this._index; }
    set index(v) { this._index = v; }

    rebuildTangents() {
        buildTangents(this);
    }

    get tangent() {
        if (!this.validTangents) {
            buildTangents(this);
        }
        return this._tangent;
    }

    get validTangents() {
        return this._tangent &&
            this._tangent.length === this._vertex.length &&
            this._tangent.length / 3 === this._texCoord0.length / 3;
    }

    static ApplyTransform(plist, trx) {
        const transform = new Mat4(trx);
        const rotation = new Mat4(trx.mat3);

        if (plist.normal.length > 0 && plist.normal.length != plist.vertex.length) {
            throw new Error(`Unexpected number of normal coordinates found in polyList '${ plist.name }'`);
        }

        for (let i = 0; i < plist.vertex.length - 2; i += 3) {
            const vertex = new Vec(plist.vertex[i], plist.vertex[i+1], plist.vertex[i+2], 1.0);
            vertex = transform.multVector(vertex);
            plist.vertex[i] = vertex.x;
            plist.vertex[i + 1] = vertex.y;
            plist.vertex[i + 2] = vertex.z;
    
            if (plist.normal.length) {
                const normal = new Vec(plist.normal[i], plist.normal[i+1], plist.normal[i+2], 1.0);
                normal = rotation.multVector(normal);
                plist.normal[i] = normal.x;
                plist.normal[i + 1] = normal.y;
                plist.normal[i + 2] = normal.z;
            }
        }
    }
}
