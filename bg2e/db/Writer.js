import { ResourceType } from '../tools/Resource';
import { 
    PluginOperationType,
    createPluginDatabase, 
    registerPluginInDatabase, 
    getPluginFromDatabase 
} from './DBPluginApi';

const g_writePluginDatabase = createPluginDatabase(PluginOperationType.Write);

export const registerWriterPlugin = (pluginInstance) => {
    registerPluginInDatabase(pluginInstance, g_writePluginDatabase);
}

export const getWriterPlugin = (path, type) => {
    return getPluginFromDatabase(path, type, g_writePluginDatabase);
}

export default class Writer {
    constructor() {

    }

    async writeResource(path, data, type) {
        const plugin = getWriterPlugin(path, type);
        const result = await plugin.write(path, data, type, this);
        return result;
    }

    async writePolyList(path, data) {
        return await this.writeResource(path, data, ResourceType.PolyList);
    }

    async writeDrawable(path, data) {
        return await this.writeResource(path, data, ResourceType.Drawable);
    }

    async writeNode(path, data) {
        return await this.writeResource(path, data, ResourceType.Node);
    }

    async writeTexture(path, data) {
        return await this.writeResource(path, data, ResourceType.Texture);
    }

    async writeMaterial(path, data) {
        return await this.writeResource(path, data, ResourceType.Material);
    }
}
