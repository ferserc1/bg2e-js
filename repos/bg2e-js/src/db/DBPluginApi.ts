import { getExtension, ResourceType } from '../tools/Resource';
import LoaderPlugin from './LoaderPlugin';

export const PluginOperationType = {
    Read: "read",
    Write: "write"
} as const;

export type PluginOperationTypeValue = typeof PluginOperationType[keyof typeof PluginOperationType];

export interface PluginDatabase {
    operationType: PluginOperationTypeValue;
    plugins: Partial<Record<ResourceType, LoaderPlugin[]>>;
}

export const createPluginDatabase = (operationType: PluginOperationTypeValue): PluginDatabase => {
    return {
        operationType,
        plugins: {}
    }
}

export const registerPluginInDatabase = (pluginInstance: LoaderPlugin, pluginDatabase: PluginDatabase): void => {
    pluginInstance.resourceTypes.forEach(type => {
        pluginDatabase.plugins[type] = pluginDatabase.plugins[type] || [];
        pluginDatabase.plugins[type]!.push(pluginInstance);
    });
}

export const getPluginFromDatabase = function(path: string, type: ResourceType, pluginDatabase: PluginDatabase): LoaderPlugin {
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

