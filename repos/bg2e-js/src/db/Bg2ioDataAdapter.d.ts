/** Internal bg2io 1.0.7 data adapter; module initialization belongs to WasmResources. */
export default class Bg2ioDataAdapter {
    constructor(options: { instance: any; debug?: boolean });
    loadBg2FileAsJson(buffer: ArrayBuffer): {
        header: any;
        components: any[];
        materials: any[];
        joints: any;
        polyLists: any[];
    };
}
