import LoaderPlugin from './LoaderPlugin';
import Resource, { getFileName, removeExtension, removeFileName, ResourceType } from './../tools/Resource';
import ObjParser from './ObjParser';
import Drawable from '../scene/Drawable';
import Material from '../base/Material';

const buildDrawable = (polyListArray,mtlData,filePath) => {
    const name = removeExtension(getFileName(filePath));
    const drawable = new Drawable(name);

    polyListArray.forEach(plist => {
        // TODO: set mtl data
        const mat = new Material();
        drawable.addPolyList(plist,mat);
    });

    return drawable;
}

export default class ObjLoaderPlugin extends LoaderPlugin {
    constructor() {
        super();
        this._resource = new Resource();
    }

    get supportedExtensions() { return ['obj']; }

    get resourceTypes() {
        return [
            ResourceType.PolyList,
            ResourceType.Drawable
        ];
    }

    async load(path,resourceType,loader) {
        const objText = await this._resource.load(path);
        const parser = new ObjParser(objText);

        // TODO: load material from mtl file
        // const relativePath = removeFileName(filePath);

        switch (resourceType) {
        case ResourceType.PolyList:
            return parser.polyListArray;
        case ResourceType.Drawable:
            return buildDrawable(parser.polyListArray, null, path);
        default:
            throw new Error(`ObjLoaderPlugin.load() unexpected resource type received: ${resourceType}`);
        }
    }
}