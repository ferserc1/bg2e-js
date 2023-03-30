import Vec from "../math/Vec";
import Mat4 from "../math/Mat4";


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
    POINTS: 0,
    TRIANGLES: 1,
    TRIANGLE_FAN: 2,
    TRIANGLE_STRIP: 3,
    LINES: 4,
    LINE_STRIP: 5
};

export const RenderLayer = {
    LAYER_0:  0x1 << 0,
    OPAQUE_DEFAULT: 0x1 << 0,   // layer 0 is the default layer for opaque objects
    LAYER_1:  0x1 << 1,
    LAYER_2:  0x1 << 2,
    LAYER_3:  0x1 << 3,
    LAYER_4:  0x1 << 4,
    LAYER_5:  0x1 << 5,
    LAYER_6:  0x1 << 6,
    LAYER_7:  0x1 << 7,
    LAYER_8:  0x1 << 8,
    LAYER_9:  0x1 << 9,
    LAYER_10: 0x1 << 10,
    LAYER_11: 0x1 << 11,
    LAYER_12: 0x1 << 12,
    LAYER_13: 0x1 << 13,
    LAYER_14: 0x1 << 14,
    LAYER_15: 0x1 << 15,
    TRANSPARENT_DEFAULT: 0x1 << 15, // Layer 15 is the default layer for transparent objects
    LAYER_16: 0x1 << 16,
    LAYER_17: 0x1 << 17,
    LAYER_18: 0x1 << 18,
    LAYER_19: 0x1 << 19,
    LAYER_20: 0x1 << 20,
    LAYER_21: 0x1 << 21,
    LAYER_22: 0x1 << 22,
    LAYER_23: 0x1 << 23,
    LAYER_24: 0x1 << 24,
    LAYER_25: 0x1 << 25,
    LAYER_26: 0x1 << 26,
    LAYER_27: 0x1 << 27,
    LAYER_28: 0x1 << 28,
    LAYER_29: 0x1 << 29,
    LAYER_30: 0x1 << 30,
    LAYER_31: 0x1 << 31,

    ALL: 0xFFFFFFFF,

    AUTO: 0
};

export const PolyListFrontFace = {
    CW: 0,
    CCW: 1
};

export const PolyListCullFace = {
    FRONT: 0,
    BACK: 1,
    FRONT_AND_BACK: 2
};

function buildTangents(plist) {
    plist._tangent = [];

    if (!plist.texCoord0 || !plist.texCoord0.length || !plist.vertex || !plist.vertex.length) return;

    
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
        // The object will be rendered in the default layer for
        // transparent or opaque objects
        this._renderLayers = RenderLayer.AUTO;

        this._drawMode = DrawMode.TRIANGLES;

        this._name = "";
        this._groupName = "";
        this._visible = true;
        this._visibleToShadows = true;

        this._cullFace = PolyListCullFace.BACK;
        this._frontFace = PolyListFrontFace.CCW;
        this._enableCullFace = true;

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

    // render layers aren't serialized/deserialized, they are used only by the graphics engine
    get renderLayers() { return this._renderLayers; }
    set renderLayers(layers) { this._renderLayers = layers; }
    enableLayer(layer) { this._renderLayers = this._renderLayers | layer; }
    disableLayer(layer) { this._renderLayers = this._renderLayers & ~layer; }

    set cullFace(v) { this._cullFace = v; }
    get cullFace() { return this._cullFace; }
    set frontFace(v) { this._frontFace = v; }
    get frontFace() { return this._frontFace; }
    set enableCullFace(v) { this._enableCullFace = v; }
    get enableCullFace() { return this._enableCullFace; }

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

    // The this._renderer variable is initialized by the polyListRenderer factory
    get renderer() {
        return this._renderer
    }

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
            this._tangent.length / 3 === this._texCoord0.length / 2;
    }

    destroy() {
        if (this.renderer) {
            this.renderer.destroy();
        }
    }

    static ApplyTransform(plist, trx) {
        const transform = new Mat4(trx);
        const rotation = new Mat4(trx.mat3);

        if (plist.normal.length > 0 && plist.normal.length != plist.vertex.length) {
            throw new Error(`Unexpected number of normal coordinates found in polyList '${ plist.name }'`);
        }

        for (let i = 0; i < plist.vertex.length - 2; i += 3) {
            let vertex = new Vec(plist.vertex[i], plist.vertex[i+1], plist.vertex[i+2], 1.0);
            vertex = transform.multVector(vertex);
            plist.vertex[i] = vertex.x;
            plist.vertex[i + 1] = vertex.y;
            plist.vertex[i + 2] = vertex.z;
    
            if (plist.normal.length) {
                let normal = new Vec(plist.normal[i], plist.normal[i+1], plist.normal[i+2], 1.0);
                normal = rotation.multVector(normal);
                plist.normal[i] = normal.x;
                plist.normal[i + 1] = normal.y;
                plist.normal[i + 2] = normal.z;
            }
        }
    }
}
