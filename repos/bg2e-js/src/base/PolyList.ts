/*
 *    business grade graphic engine (bg2 engine)
 *    Copyright (C) 2024  Fernando Serrano Carpena
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU General Public License as published by
 *    the Free Software Foundation, either version 3 of the License, or
 *    (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU General Public License for more details.
 *
 *    You should have received a copy of the GNU General Public License
 *    along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import Vec from "../math/Vec";
import Mat4 from "../math/Mat4";
import Color from "./Color";
import Material from "./Material";
import Drawable from "../scene/Drawable";

export enum BufferType {
    VERTEX		    = 1 << 0,
    NORMAL		    = 1 << 1,
    TEX_COORD_0	= 1 << 2,
    TEX_COORD_1	= 1 << 3,
    TEX_COORD_2	= 1 << 4,
    COLOR		    = 1 << 5,
    TANGENT	    = 1 << 6,
    INDEX		    = 1 << 7
}

export enum DrawMode {
    POINTS = 0,
    TRIANGLES = 1,
    TRIANGLE_FAN = 2,
    TRIANGLE_STRIP = 3,
    LINES = 4,
    LINE_STRIP = 5
}

export enum RenderLayer {
    LAYER_0  = 0x1 << 0,
    OPAQUE_DEFAULT = 0x1 << 0,   // layer 0 is the default layer for opaque objects
    LAYER_1  = 0x1 << 1,
    LAYER_2  = 0x1 << 2,
    LAYER_3  = 0x1 << 3,
    LAYER_4  = 0x1 << 4,
    LAYER_5  = 0x1 << 5,
    LAYER_6  = 0x1 << 6,
    LAYER_7  = 0x1 << 7,
    LAYER_8  = 0x1 << 8,
    LAYER_9  = 0x1 << 9,
    LAYER_10 = 0x1 << 10,
    LAYER_11 = 0x1 << 11,
    LAYER_12 = 0x1 << 12,
    LAYER_13 = 0x1 << 13,
    LAYER_14 = 0x1 << 14,
    LAYER_15 = 0x1 << 15,
    TRANSPARENT_DEFAULT = 0x1 << 15, // Layer 15 is the default layer for transparent objects
    LAYER_16 = 0x1 << 16,
    GIZMO_DEFAULT = 0x1 << 16, // Layer 16 is the default layer for gizmo overlay drawing
    LAYER_17 = 0x1 << 17,
    GIZMO_PICK = 0x1 << 17,    // Layer 17 is used for gizmo handle color-picking (mouse hit-test)
    LAYER_18 = 0x1 << 18,
    LAYER_19 = 0x1 << 19,
    LAYER_20 = 0x1 << 20,
    LAYER_21 = 0x1 << 21,
    LAYER_22 = 0x1 << 22,
    LAYER_23 = 0x1 << 23,
    LAYER_24 = 0x1 << 24,
    LAYER_25 = 0x1 << 25,
    LAYER_26 = 0x1 << 26,
    LAYER_27 = 0x1 << 27,
    LAYER_28 = 0x1 << 28,
    LAYER_29 = 0x1 << 29,
    LAYER_30 = 0x1 << 30,
    LAYER_31 = 0x1 << 31,
    SELECTION_DEFAULT = 0x1 << 31,   // Layer 31 is the default layer for mouse pick selection

    ALL = 0xFFFFFFFF,

    AUTO = 0
}

// Process the default layer if RenderLayer is set to AUTO. To do it, you need
// the object material to know if the layer must be set to transparent or opaque
export const getLayers = (polyList: PolyList, material: Material): number => {
    return polyList.renderLayers === RenderLayer.AUTO ?
        (material.isTransparent ? RenderLayer.TRANSPARENT_DEFAULT : RenderLayer.OPAQUE_DEFAULT) | RenderLayer.SELECTION_DEFAULT :
        (polyList.renderLayers);
}

export enum PolyListFrontFace {
    CW = 0,
    CCW = 1
}

export enum PolyListCullFace {
    FRONT = 0,
    BACK = 1,
    FRONT_AND_BACK = 2
}

interface Vertex {
    pos: Vec;
    uv: Vec;
}

function buildTangents(plist: PolyList): void {
    const count = plist.vertex.length / 3;
    const sums = new Float64Array(count * 3);
    const bitangents = new Float64Array(count * 3);
    for (let i = 0; i + 2 < plist.index.length; i += 3) {
        const ids = plist.index.slice(i, i + 3);
        const [a, b, c] = ids;
        const du1 = plist.texCoord0[b * 2] - plist.texCoord0[a * 2];
        const dv1 = plist.texCoord0[b * 2 + 1] - plist.texCoord0[a * 2 + 1];
        const du2 = plist.texCoord0[c * 2] - plist.texCoord0[a * 2];
        const dv2 = plist.texCoord0[c * 2 + 1] - plist.texCoord0[a * 2 + 1];
        const det = du1 * dv2 - dv1 * du2;
        if (!Number.isFinite(det) || Math.abs(det) < 1e-12) continue;
        for (let axis = 0; axis < 3; ++axis) {
            const edge1 = plist.vertex[b * 3 + axis] - plist.vertex[a * 3 + axis];
            const edge2 = plist.vertex[c * 3 + axis] - plist.vertex[a * 3 + axis];
            for (const id of ids) {
                sums[id * 3 + axis] += (edge1 * dv2 - edge2 * dv1) / det;
                bitangents[id * 3 + axis] += (edge2 * du1 - edge1 * du2) / det;
            }
        }
    }
    const result: number[] = [], signs: number[] = [];
    for (let i = 0; i < count; ++i) {
        const n = [plist.normal[i * 3] || 0, plist.normal[i * 3 + 1] || 0, plist.normal[i * 3 + 2] || 0];
        const nl = Math.hypot(...n) || 1;
        for (let k = 0; k < 3; ++k) n[k] /= nl;
        let t = Array.from(sums.slice(i * 3, i * 3 + 3));
        const dot = t.reduce((v, x, k) => v + x * n[k], 0);
        t = t.map((x, k) => x - n[k] * dot);
        if (Math.hypot(...t) < 1e-10) {
            // Stable orthogonal frame for missing or degenerate UVs.
            t = Math.abs(n[2]) < 0.9 ? [-n[1], n[0], 0] : [0, -n[2], n[1]];
            if (Math.hypot(...t) < 1e-10) t = [1, 0, 0];
        }
        const length = Math.hypot(...t);
        t = t.map(x => x / length);
        const cross = [n[1]*t[2]-n[2]*t[1], n[2]*t[0]-n[0]*t[2], n[0]*t[1]-n[1]*t[0]];
        signs.push(cross.reduce((v, x, k) => v + x * bitangents[i * 3 + k], 0) < 0 ? -1 : 1);
        result.push(...t);
    }
    (plist as any)._tangent = result;
    (plist as any)._tangentSigns = signs;
}
export default class PolyList {
    private _renderLayers: number;
    private _drawMode: DrawMode;
    private _lineWidth: number;
    private _name: string;
    private _groupName: string;
    private _visible: boolean;
    private _visibleToShadows: boolean;
    private _cullFace: PolyListCullFace;
    private _frontFace: PolyListFrontFace;
    private _enableCullFace: boolean;
    private _vertex: number[];
    private _normal: number[];
    private _texCoord0: number[];
    private _texCoord1: number[];
    private _texCoord2: number[];
    private _color: number[];
    private _index: number[];
    private _tangent?: number[];
    private _tangentSigns: number[] = [];
    get tangentSigns(): number[] { this.tangent; return this._tangentSigns; }
    private _colorCode: Color;
    private _selected: boolean;
    private _selectable: boolean;
    private _renderer?: any;

    private _mainDrawable?: Drawable;

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

    clone(): PolyList {
        const result = new PolyList();
        result.assign(this);
        result.name = this.name + " clone";
        return result;
    }

    assign(other: PolyList): void {
        this.drawMode = other.drawMode;
        this.lineWidth = other.lineWidth;
        this.name = other.name;
        this.groupName = other.groupName;
        this.visible = other.visible;
        this.visibleToShadows = other.visibleToShadows;
        this.cullFace = other.cullFace;
        this.frontFace = other.frontFace;
        this.enableCullFace = other.enableCullFace;
        this.renderLayers = other.renderLayers;
        this.selectable = other.isSelectable;
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
    get renderLayers(): number { return this._renderLayers; }
    set renderLayers(layers: number) { this._renderLayers = layers; }
    enableLayer(layer: number): void { this._renderLayers = this._renderLayers | layer; }
    disableLayer(layer: number): void { this._renderLayers = this._renderLayers & ~layer; }

    set cullFace(v: PolyListCullFace) { this._cullFace = v; }
    get cullFace(): PolyListCullFace { return this._cullFace; }
    set frontFace(v: PolyListFrontFace) { this._frontFace = v; }
    get frontFace(): PolyListFrontFace { return this._frontFace; }
    set enableCullFace(v: boolean) { this._enableCullFace = v; }
    get enableCullFace(): boolean { return this._enableCullFace; }

    get drawMode(): DrawMode { return this._drawMode; }
    set drawMode(m: DrawMode) { this._drawMode = m; }
    get lineWidth(): number { return this._lineWidth; }
    set lineWidth(w: number) { this._lineWidth = w; }

    get name(): string { return this._name; }
    set name(v: string) { this._name = v; }
    get groupName(): string { return this._groupName; }
    set groupName(v: string) { this._groupName = v; }
    get visible(): boolean { return this._visible; }
    set visible(v: boolean) { this._visible = v; }
    get visibleToShadows(): boolean { return this._visibleToShadows; }
    set visibleToShadows(v: boolean) { this._visibleToShadows = v; }

    get vertex(): number[] { return this._vertex; }
    set vertex(v: number[]) { this._vertex = v; this._tangent = undefined; }
    get normal(): number[] { return this._normal; }
    set normal(v: number[]) { this._normal = v; this._tangent = undefined; }
    get texCoord0(): number[] { return this._texCoord0; }
    set texCoord0(v: number[]) { this._texCoord0 = v; this._tangent = undefined; }
    get texCoord1(): number[] { return this._texCoord1; }
    set texCoord1(v: number[]) { this._texCoord1 = v; }
    get texCoord2(): number[] { return this._texCoord2; }
    set texCoord2(v: number[]) { this._texCoord2 = v; }
    get color(): number[] { return this._color; }
    set color(v: number[]) { this._color = v; }
    get index(): number[] { return this._index; }
    set index(v: number[]) { this._index = v; this._tangent = undefined; }

    // Internal use: non serializable properties
    set colorCode(c: Color) {
        this._colorCode = c;
    }

    get colorCode(): Color {
        return this._colorCode;
    }

    set selected(s: boolean) {
        this._selected = s;
    }

    get isSelected(): boolean {
        return this._selected;
    }

    get isSelectable(): boolean {
        return this._selectable;
    }

    set selectable(s: boolean) {
        this._selectable = s;
    }

    // The mainDrawable is a reference to the las Drawable object that contains this polyList. Note that
    // in some circunstances a polyList can be shared by several Drawable objects, but the mainDrawable
    // will be the last one that was assigned.
    get mainDrawable(): Drawable | undefined {
        return this._mainDrawable;
    }

    set mainDrawable(d: Drawable | undefined) {
        this._mainDrawable = d;
    }

    // The this._renderer variable is initialized by the polyListRenderer factory
    get renderer(): any {
        return this._renderer
    }

    rebuildTangents(): void {
        buildTangents(this);
    }

    get tangent(): number[] | undefined {
        if (!this.validTangents) {
            buildTangents(this);
        }
        return this._tangent;
    }

    get validTangents(): boolean {
        return this._tangent !== undefined &&
            this._tangent.length === this._vertex.length &&
            this._tangent.length / 3 === this._texCoord0.length / 2;
    }

    destroy(): void {
        if (this.renderer) {
            this.renderer.destroy();
        }
    }

    static ApplyTransform(plist: PolyList, trx: Mat4): void {
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
