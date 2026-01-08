import { getExtension, ResourceType } from '../tools/Resource';

export enum PluginOperationType {
    Read = "read",
    Write = "write"
}

export interface DBPlugin {
    resourceTypes: ResourceType[];
    supportedExtensions: string[];
    dependencies?: DBPlugin[];
}

export interface PluginDatabase {
    operationType: PluginOperationType | string;
    plugins: {
        [key: string]: DBPlugin[];
    };
}

export const createPluginDatabase = (operationType: PluginOperationType | string): PluginDatabase => {
    return {
        operationType,
        plugins: {}
    }
}

export const registerPluginInDatabase = (pluginInstance: DBPlugin, pluginDatabase: PluginDatabase): void => {
    pluginInstance.resourceTypes.forEach(type => {
        pluginDatabase.plugins[type] = pluginDatabase.plugins[type] || [];
        pluginDatabase.plugins[type].push(pluginInstance);
    });
}

export const getPluginFromDatabase = function(path: string, type: ResourceType | string, pluginDatabase: PluginDatabase): DBPlugin {
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

