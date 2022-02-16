
import { getExtension } from '../tools/Resource';

export const ResourceType = {
    PolyList: 'PolyList',   // Returns a mesh or a list of meshes
    Drawable: 'Drawable',
    Node: 'Node',
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
    const plugin = getLoaderPlugin(path, ResourceType.PolyList);
    return await plugin.load(path, ResourceType.PolyList);
}

export const loadDrawable = async path => {
    const plugin = getLoaderPlugin(path, ResourceType.Drawable);
    return await plugin.load(path, ResourceType.Drawable);
}

export const loadNode = async path => {
    const plugin = getLoaderPlugin(path, ResourceType.Node);
    return await plugin.load(path, ResourceType.Node);
}



