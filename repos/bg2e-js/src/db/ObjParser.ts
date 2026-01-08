
import PolyList from "../base/PolyList";

interface PointData {
    vertex: [number, number, number];
    normal: [number, number, number] | null;
    tex: [number, number] | null;
}

function parseM(this: ObjParser, line: string): void {
    // mtllib
    let res = /mtllib\s+(.*)/.exec(line);
    if (res) {
        this._mtlLib = res[1];
    }
}

function parseG(this: ObjParser, line: string): void {
    // g
    let res = /g\s+(.*)/.exec(line);
    if (res) {
        this._currentPlist.name = res[1];
    }
}

function parseU(this: ObjParser, line: string): void {
    // usemtl
    let res = /usemtl\s+(.*)/.exec(line);
    if (res) {
        (this._currentPlist as any)._matName = res[1];
        if (this._currentPlist.name=="") {
            this._currentPlist.name = res[1];
        }
    }
}

function parseS(this: ObjParser, line: string): void {
    // s
    let res = /s\s+(.*)/.exec(line);
    if (res) {
        // TODO: Do something with smoothing groups
    }
}

function addPoint(this: ObjParser, pointData: PointData): void {
    this._currentPlist.vertex.push(pointData.vertex[0],pointData.vertex[1],pointData.vertex[2]);
    if (pointData.normal) {
        this._currentPlist.normal.push(pointData.normal[0],pointData.normal[1],pointData.normal[2]);
    }
    if (pointData.tex) {
        this._currentPlist.texCoord0.push(pointData.tex[0],pointData.tex[1]);
    }
    this._currentPlist.index.push(this._currentPlist.index.length);
}

function isValid(point: PointData): boolean {
    return !!(point && point.vertex && point.tex && point.normal);
}

function addPolygon(this: ObjParser, polygonData: PointData[]): void {
    let currentVertex = 0;
    let sides = polygonData.length;
    if (sides<3) return;
    while (currentVertex<sides) {
        let i0 = currentVertex;
        let i1 = currentVertex + 1;
        let i2 = currentVertex + 2;
        if (i2==sides) {
            i2 = 0;
        }
        else if (i1==sides) {
            i1 = 0;
            i2 = 2;
        }

        let p0 = polygonData[i0];
        let p1 = polygonData[i1];
        let p2 = polygonData[i2];

        if (isValid(p0) && isValid(p1) && isValid(p2)) {
            addPoint.apply(this,[p0]);
            addPoint.apply(this,[p1]);
            addPoint.apply(this,[p2]);
        }
        else {
            console.warn("Invalid point data found loading OBJ file");
        }
        currentVertex+=3;
    }
}

function parseF(this: ObjParser, line: string): void {
    // f
    this._addPlist = true;
    let res: RegExpExecArray | null = /f\s+(.*)/.exec(line);
    if (res) {
        let params = res[1];
        let vtnRE = /([\d\-]+)\/([\d\-]*)\/([\d\-]*)/g;
        if (params.indexOf('/')==-1) {
            let vRE = /([\d\-]+)/g;
        }
        let polygon: PointData[] = [];
        while ( (res=vtnRE.exec(params)) ) {
            let iV: number = Number(res[1]);
            let iN: number | null = res[3] ? Number(res[3]):null;
            let iT: number | null = res[2] ? Number(res[2]):null;
            iV = iV<0 ? this._vertexArray.length + iV : iV - 1;
            iN = iN !== null ? (iN<0 ? this._normalArray.length + iN : iN - 1) : null;
            iT = iT !== null ? (iT<0 ? this._texCoordArray.length + iT : iT - 1) : null;

            let v: [number, number, number] = this._vertexArray[iV];
            let n: [number, number, number] | null = iN!==null ? this._normalArray[iN] : null;
            let t: [number, number] | null = iT!==null ? this._texCoordArray[iT] : null;
            polygon.push({
                vertex:v,
                normal:n,
                tex:t
            });
        }
        addPolygon.apply(this,[polygon]);
    }
}

function parseO(this: ObjParser, line: string): void {
    // o
    let res = /s\s+(.*)/.exec(line);
    if (res && this._currentPlist.name=="") {
        this._currentPlist.name = res[1];
    }
}

function checkAddPlist(this: ObjParser): void {
    if (this._addPlist) {
        if (this._currentPlist) {
            this._plistArray.push(this._currentPlist);
        }
        this._currentPlist = new PolyList();
        this._addPlist = false;
    }
}

function loadObjData(this: ObjParser): void {
    let lines = this._textData.split('\n');
    let multiLine = "";
    lines.forEach(line => {
        line = line.trim();

        // This section controls the break line character \
        // to concatenate this new line with the next one
        if (multiLine) {
            line = multiLine + line;
        }
        if (line[line.length - 1] === '\\') {
            line = line.substring(0,line.length - 1);
            multiLine += line;
            return;
        }
        else {
            multiLine = "";
        }

        // First optimization: parse the first character and string length
        if (line.length>1 && line[0] !== '#') {
            // Second optimization: parse by the first character
            switch (line[0]) {
            case 'v':
                let res: RegExpExecArray | null = /v\s+([\d\.\-e]+)\s+([\d\.\-e]+)\s+([\d\.\-e]+)/.exec(line);
                if (res) {
                    this._vertexArray.push(
                        [ Number(res[1]), Number(res[2]), Number(res[3]) ]
                    );
                }
                else if ( (res = /vn\s+([\d\.\-e]+)\s+([\d\.\-e]+)\s+([\d\.\-e]+)/.exec(line)) ) {
                    this._normalArray.push(
                        [ Number(res[1]), Number(res[2]), Number(res[3]) ]
                    );
                }
                else if ( (res = /vt\s+([\d\.\-e]+)\s+([\d\.\-e]+)/.exec(line)) ) {
                    this._texCoordArray.push(
                        [ Number(res[1]), Number(res[2]) ]
                    );
                }
                else {
                    console.warn("Error parsing line " + line);
                }
                break;
            case 'm':
                checkAddPlist.apply(this);
                parseM.apply(this,[line]);
                break;
            case 'g':
                checkAddPlist.apply(this);
                parseG.apply(this,[line]);
                break;
            case 'u':
                checkAddPlist.apply(this);
                parseU.apply(this,[line]);
                break;
            case 's':
                parseS.apply(this,[line]);
                break;
            case 'f':
                parseF.apply(this,[line]);
                break;
            case 'o':
                checkAddPlist.apply(this);
                parseO.apply(this,[line]);
                break;
            }
        }
    });

    if (this._currentPlist && this._addPlist) {
        this._plistArray.push(this._currentPlist);
    }
}

export default class ObjParser {
    public _textData: string;
    public _plistArray: PolyList[];
    public _vertexArray: [number, number, number][];
    public _normalArray: [number, number, number][];
    public _texCoordArray: [number, number][];
    public _mtlLib: string;
    public _addPlist: boolean;
    public _currentPlist: PolyList;

    constructor(objText: string) {
        this._textData = objText;

        this._plistArray = [];

        this._vertexArray = [];
        this._normalArray = [];
        this._texCoordArray = [];

        this._mtlLib = "";

        this._addPlist = true;
        this._currentPlist = new PolyList();

        loadObjData.apply(this);
    }


    get polyListArray(): PolyList[] {
        return this._plistArray;
    }
}
