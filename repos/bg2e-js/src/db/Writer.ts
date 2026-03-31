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

import { ResourceType } from '../tools/Resource';
import { 
    PluginOperationType,
    createPluginDatabase, 
    registerPluginInDatabase, 
    getPluginFromDatabase 
} from './DBPluginApi';
import LoaderPlugin from './LoaderPlugin';
import PolyList from '../base/PolyList';
import Texture from '../base/Texture';

const g_writePluginDatabase = createPluginDatabase(PluginOperationType.Write);

export const registerWriterPlugin = (pluginInstance: LoaderPlugin): void => {
    registerPluginInDatabase(pluginInstance, g_writePluginDatabase);
}

export const getWriterPlugin = (path: string, type: ResourceType): LoaderPlugin => {
    return getPluginFromDatabase(path, type, g_writePluginDatabase);
}

export default class Writer {
    constructor() {

    }

    async writeResource(path: string, data: any, type: ResourceType): Promise<any> {
        const plugin = getWriterPlugin(path, type);
        const result = await plugin.write(path, data, type, this);
        return result;
    }

    async writePolyList(path: string, data: PolyList | PolyList[]): Promise<any> {
        return await this.writeResource(path, data, ResourceType.PolyList);
    }

    async writeDrawable(path: string, data: any): Promise<any> {
        return await this.writeResource(path, data, ResourceType.Drawable);
    }

    async writeNode(path: string, data: any): Promise<any> {
        return await this.writeResource(path, data, ResourceType.Node);
    }

    async writeTexture(path: string, data: Texture): Promise<any> {
        return await this.writeResource(path, data, ResourceType.Texture);
    }

    async writeMaterial(path: string, data: any): Promise<any> {
        return await this.writeResource(path, data, ResourceType.Material);
    }
}
