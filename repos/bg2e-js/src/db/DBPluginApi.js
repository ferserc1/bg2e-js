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

export const getPluginFromDatabase = function(path, type, pluginDatabase) {
    const ext = getExtension(path);
    const extCheck = new RegExp(ext, "i");
    const errMsg = `Could not find a plugin to ${pluginDatabase.operationType} file '${path}' of type '${type}'.`;

    const plugins = pluginDatabase.plugins[type];
    if (!plugins) {
        throw new Error(errMsg);
    }
    else {
        for (const plugin of plugins) {
            if (plugin.supportedExtensions.find(e => extCheck.test(e))) {
                return plugin;
            }
        }
        throw new Error(errMsg);
    }
}

