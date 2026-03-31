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

    polyListArray.forEach((plist: PolyList) => {
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

    async load(path: string, resourceType: ResourceType, loader: Loader): Promise<PolyList[] | Drawable> {
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