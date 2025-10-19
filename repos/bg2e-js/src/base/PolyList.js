import Vec from "../math/Vec";
import Mat4 from "../math/Mat4";
import Color from "./Color";


export const BufferType = Object.freeze({
    VERTEX:		    1 << 0,
    NORMAL:		    1 << 1,
    TEX_COORD_0:	1 << 2,
    TEX_COORD_1:	1 << 3,
    TEX_COORD_2:	1 << 4,
    COLOR:		    1 << 5,
    TANGENT:	    1 << 6,
    INDEX:		    1 << 7
});

export const DrawMode = Object.freeze({
    POINTS: 0,
    TRIANGLES: 1,
    TRIANGLE_FAN: 2,
    TRIANGLE_STRIP: 3,
    LINES: 4,
    LINE_STRIP: 5
});

export const RenderLayer = Object.freeze({
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
    SELECTION_DEFAULT: 0x1 << 31,   // Layer 31 is the default layer for mouse pick selection

    ALL: 0xFFFFFFFF,

    AUTO: 0
});

// Process the default layer if RenderLayer is set to AUTO. To do it, you need
// the object material to know if the layer must be set to transparent or opaque
export const getLayers = (polyList,material) => {
    return polyList.renderLayers === RenderLayer.AUTO ?
        (material.isTransparent ? RenderLayer.TRANSPARENT_DEFAULT : RenderLayer.OPAQUE_DEFAULT) | RenderLayer.SELECTION_DEFAULT :
        (polyList.renderLayers);
}

export const PolyListFrontFace = Object.freeze({
    CW: 0,
    CCW: 1
});

export const PolyListCullFace = Object.freeze({
    FRONT: 0,
    BACK: 1,
    FRONT_AND_BACK: 2
});

function buildTangents(plist) {
    const result = [];

    const createVertex = (index) => {
        return {
            pos: new Vec(plist.vertex[index] * 3, plist.vertex[index + 1] * 3, plist.vertex[index + 2] * 3 ),
            uv: new Vec(plist.texCoord0[index] * 2, plist.texCoord0[index + 1] * 2 )
        }
    }

    const createUV = (v1, v2) => Vec.Sub(v1.uv, v2.uv);

    const calcR = (uv1, uv2) =>  1.0 / (uv1.x * uv2.y - uv1.y * uv2.x);

    if (plist.index.length % 3 === 0) {
        for (let i = 0; i < plist.index.length - 2; i += 3) {
            let v0 = createVertex(plist.index[i]);
            let v1 = createVertex(plist.index[i + 1]);
            let v2 = createVertex(plist.index[i + 2]);

            let edge1 = Vec.Sub(v1.pos, v0.pos);
            let edge2 = Vec.Sub(v2.pos, v1.pos);

            let uv1 = createUV(v1, v0);
            let uv2 = createUV(v2, v0);
            let r = calcR(uv1, uv2);

            if (!isFinite(r)) {
                v0.uv.x = v0.uv.x * 1.1;
                v0.uv.y = v0.uv.y * 0.94;
                uv1 = createUV(v1, v0);
                uv2 = createUV(v2, v0);
                r = calcR(uv1, uv2);
            }

            if (!isFinite(r)) {
                v2.uv.x = v2.uv.x * 1.3;
                v2.uv.y = v2.uv.y * 1.82;
                uv1 = createUV(v1, v0);
                uv2 = createUV(v2, v0);
                r = calcR(uv1, uv2);
            }

            const tangent = new Vec(
                ((edge1.x * uv2.y) - (edge2.x * uv1.y)) * r,
                ((edge1.y * uv2.y) - (edge2.y * uv1.y)) * r,
                ((edge1.z * uv2.y) - (edge2.z * uv1.y)) * r
            );
            tangent.normalize();
            
            result.push(tangent.x);
            result.push(tangent.y);
            result.push(tangent.z);
            
            result.push(tangent.x);
            result.push(tangent.y);
            result.push(tangent.z);
            
            result.push(tangent.x);
            result.push(tangent.y);
            result.push(tangent.z);
        }
    }
    else {
        for (let i=0; i<plist.vertex.length; i+=3) {
            result.push(0,0,1);
        }

        console.warn("Could not generate tangents: invalid type of faces found.");
    }

    plist._tangent = result;
}

export default class PolyList {
    constructor() {
        // The object will be rendered in the default layer for
        // transparent or opaque objects
        this._renderLayers = RenderLayer.AUTO;

        this._drawMode = DrawMode.TRIANGLES;
        this._lineWidth = 1.0;

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

        // Internal use: the following properties will not be serialized
        this._colorCode = Color.Black();
        this._selected = false;
        this._selectable = true;
    }

    clone() {
        const result = new PolyList();
        result.assign(this);
        result.name = this.name + " clone";
        return result;
    }

    assign(other) {
        this.drawMode = other.drawMode;
        this.lineWidth = other.lineWidth;
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
    get lineWidth() { return this._lineWidth; }
    set lineWidth(w) { this._lineWidth = w; }

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

    // Internal use: non serializable properties
    set colorCode(c) {
        this._colorCode = c;
    }

    get colorCode() {
        return this._colorCode;
    }

    set selected(s) {
        this._selected = s;
    }

    get isSelected() {
        return this._selected;
    }

    get isSelectable() {
        return this._selectable;
    }

    set selectable(s) {
        this._selectable = s;
    }

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
