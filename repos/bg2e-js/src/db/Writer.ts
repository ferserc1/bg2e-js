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
