import PolyList, { DrawMode } from "../base/PolyList";
import Mat4 from "../math/Mat4";
import Vec from "../math/Vec";

export default function arrow(length: number, arrowSize = 0.3, direction = new Vec(0, 0, 1), up = new Vec(0, 1, 0) ): PolyList {
    const polyList = new PolyList();
    direction.normalize();

    polyList.drawMode = DrawMode.LINES;

    const trx = Mat4.MakeRotationWithDirection(direction, up);

    const arrowVector = trx.multVector(new Vec(0, 0, -1));
    const arrowHeadDir1 = trx.multVector(new Vec( arrowSize, 0, -1 + arrowSize));
    const arrowHeadDir2 = trx.multVector(new Vec(-arrowSize, 0, -1 + arrowSize));


    polyList.vertex = [
        0, 0, 0,
        arrowVector.x * length, arrowVector.y * length, arrowVector.z * length,

        arrowVector.x * length, arrowVector.y * length, arrowVector.z * length,
        arrowHeadDir1.x * length, arrowHeadDir1.y * length, arrowHeadDir1.z * length,

        arrowVector.x * length, arrowVector.y * length, arrowVector.z * length,
        arrowHeadDir2.x * length, arrowHeadDir2.y * length, arrowHeadDir2.z * length
    ];

    polyList.normal = [
        0, 0, 1,
        0, 0, 1,

        0, 0, 1,
        0, 0, 1,

        0, 0, 1,
        0, 0, 1
    ];

    polyList.texCoord0 = [
        0, 0,
        0, 1,

        0, 0,
        0, 1,

        0, 0,
        0, 1
    ];

    polyList.index = [
        0, 1,
        2, 3,
        4, 5
    ];

    return polyList;
}