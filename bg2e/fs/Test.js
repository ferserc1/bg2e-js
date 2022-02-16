import Bg2ioWrapper from 'bg2io/Bg2ioBrowser';

export default class Test {

    static async DoImportTest(wasmPath = null) {
        const params = wasmPath ? {wasmPath} : {}
        params.debug = true;
        const wrapper = await Bg2ioWrapper(params);
        console.log(wrapper);
    }
}

