import PolyList, { DrawMode } from "../base/PolyList";

export default function plane(w: number, d: number): PolyList {
    const plist = new PolyList();
    const w2 = w / 2;
    const d2 = d / 2;
    plist.vertex = [
        -w2, 0, -d2,
         w2, 0, -d2,
         w2, 0,  d2,
        -w2, 0,  d2
    ];
    plist.normal = [
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0
    ];
    plist.texCoord0 = [
        0, 1,
        1, 1,
        1, 0,
        0, 0
    ];
    plist.index = [
        0, 3, 2,
        2, 1, 0
    ];
    plist.drawMode = DrawMode.TRIANGLES;
    return plist;
}
