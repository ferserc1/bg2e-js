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

import { ResourceType } from "../tools/Resource.js";

export default class LoaderPlugin {
    // Returns an array of valid file extensions for this plugin
    //  example: ["obj","dae"]
    get supportedExtensions(): string[] {
        throw new Error("LoaderPlugin.supportedExtensions: attribute not implemented");
    }

    // Returns the resource types that the loader plugin can handle
    // example: [ ResourceType.PolyList, ResourceType.Scene ]
    get resourceTypes(): ResourceType[] {
        throw new Error("LoaderPlugin.resourceTypes: attribute not implemented");
    }

    // Returns the resource loaded with the path. The resource type must be one
    // of the specified in the resourceTypes attribute
    async load(path: string, type: ResourceType, loader: any): Promise<any> {
        throw new Error("LoaderPlugin.load(): method not implemented");
    }

    async loadBuffer(buffer: ArrayBuffer, format: string, dependencies: File[], type: ResourceType, loader: any): Promise<any> {
        throw new Error("LoaderPlugin.loadBuffer(): method not implemented");
    }

    // Returns an array of LoaderPlugin objects that are necessary for this plugin to work.
    get dependencies(): LoaderPlugin[] {
        return [];
    }

    async write(path: string, data: any, type: ResourceType, writer: any): Promise<any> {
        throw new Error("LoaderPlugin.write(): method not implemented");
    }
}
