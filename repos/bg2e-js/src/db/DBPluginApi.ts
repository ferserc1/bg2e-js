/*
 *    business grade graphic engine (bg2 engine)
 *    Copyright (C) 2024  Fernando Serrano Carpena
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU General Public License as published by
 *    the Free Software Foundation, either version 3 of the License, or
 *    (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU General Public License for more details.
 *
 *    You should have received a copy of the GNU General Public License
 *    along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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

