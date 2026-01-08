import { ResourceType } from '../tools/Resource';
import { 
    PluginOperationType,
    createPluginDatabase, 
    registerPluginInDatabase, 
    getPluginFromDatabase,
    DBPlugin,
    PluginDatabase
} from './DBPluginApi';
import PolyList from '../base/PolyList';
import Drawable from '../scene/Drawable';
import Node from '../scene/Node';
import Texture from '../base/Texture';
import Material from '../base/Material';

const g_writePluginDatabase: PluginDatabase = createPluginDatabase(PluginOperationType.Write);

export const registerWriterPlugin = (pluginInstance: DBPlugin): void => {
    registerPluginInDatabase(pluginInstance, g_writePluginDatabase);
}

export const getWriterPlugin = (path: string, type: ResourceType | string): DBPlugin => {
    return getPluginFromDatabase(path, type, g_writePluginDatabase);
}

export default class Writer {
    constructor() {

    }

    async writeResource(path: string, data: any, type: ResourceType | string): Promise<any> {
        const plugin = getWriterPlugin(path, type) as any;
        const result = await plugin.write(path, data, type, this);
        return result;
    }

    async writePolyList(path: string, data: PolyList): Promise<any> {
        return await this.writeResource(path, data, ResourceType.PolyList);
    }

    async writeDrawable(path: string, data: Drawable): Promise<any> {
        return await this.writeResource(path, data, ResourceType.Drawable);
    }

    async writeNode(path: string, data: Node): Promise<any> {
        return await this.writeResource(path, data, ResourceType.Node);
    }

    async writeTexture(path: string, data: Texture): Promise<any> {
        return await this.writeResource(path, data, ResourceType.Texture);
    }

    async writeMaterial(path: string, data: Material): Promise<any> {
        return await this.writeResource(path, data, ResourceType.Material);
    }
}
