import LoaderPlugin from './LoaderPlugin';
import Resource, { getFileName, removeExtension, removeFileName, ResourceType } from './../tools/Resource';
import ObjParser from './ObjParser';
import Drawable from '../scene/Drawable';
import Material from '../base/Material';
import PolyList from '../base/PolyList';
import Loader from './Loader';

const buildDrawable = (polyListArray: PolyList[], mtlData: any, filePath: string): Drawable => {
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
    private _resource: Resource;

    constructor() {
        super();
        this._resource = new Resource();
    }

    get supportedExtensions(): string[] { return ['obj']; }

    get resourceTypes(): ResourceType[] {
        return [
            ResourceType.PolyList,
            ResourceType.Drawable
        ];
    }

    async load(path: string, resourceType: ResourceType | string, loader: Loader): Promise<PolyList[] | Drawable> {
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