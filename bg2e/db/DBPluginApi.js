import { getExtension, ResourceType } from '../tools/Resource';

export const PluginOperationType = {
    Read: "read",
    Write: "write"
};

export const createPluginDatabase = (operationType) => {
    return {
        operationType,
        plugins: {}
    }
}

export const registerPluginInDatabase = (pluginInstance, pluginDatabase) => {
    pluginInstance.resourceTypes.forEach(type => {
        pluginDatabase.plugins[type] = pluginDatabase.plugins[type] || [];
        pluginDatabase.plugins[type].push(pluginInstance);
    });
}

export const getPluginFromDatabase = (path, type, pluginDatabase) => {
    const ext = getExtension(path);
    const extCheck = new RegExp(ext, "i");
    const errMsg = `Could not find a plugin to ${pluginDatabase.operationType} file '${path}' of type '${type}'.`;

    const plugins = pluginDatabase.plugins[type];
    if (!plugins) {
        throw new Error(errMsg);
    }
    else {
        const plugin = plugins.find(p => {
            return p.supportedExtensions.find(e => extCheck.test(e)) !== null
        });
        if (!plugin) {
            throw new Error(errMsg);
        }
        return plugin;
    }
}

