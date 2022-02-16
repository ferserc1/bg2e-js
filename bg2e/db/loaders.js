import Bg2ioWrapper from 'bg2io/Bg2ioBrowser';
import { getExtension } from '../tools/Resource';

export const ResourceType = {
    PolyList: 'PolyList',
    Scene: 'Scene',
    Texture: 'Texture',
    Material: 'Material'
};

const g_plugins = {};


export const registerLoaderPlugin = (pluginInstance) => {
    pluginInstance.resourceTypes.forEach(type => {
        g_plugins[type] = g_plugins[type] || [];
        g_plugins[type].push(pluginInstance);
    });
}

export const getLoaderPlugin = (path, type) => {
    const ext = getExtension(path);
    const extCheck = new RegExp(ext,"i");
    
    const plugins = g_plugins[type];
    if (!plugins) {
        throw new Error(`Could not find a plugin to load '${ext}' file of type '${type}' `);
    }
    else {
        const plugin = plugins.find(p => {
            return p.supportedExtensions.find(e => extCheck.test(e)) !== null
        });
        if (!plugin) {
            throw new Error(`Could not find a plugin to load '${ext}' file of type '${type}' `);
        }
        return plugin;
    }
}

export const loadPolyList = async path => {

}

export default class Test {

    static async DoImportTest(wasmPath = null) {
        const params = wasmPath ? {wasmPath} : {}
        params.debug = true;
        const wrapper = await Bg2ioWrapper(params);
        console.log(wrapper);
    }
}

