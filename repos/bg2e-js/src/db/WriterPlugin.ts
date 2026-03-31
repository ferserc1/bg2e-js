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
import Writer from "./Writer";

export default class WriterPlugin {
    // Returns an array of valid file extensions for this plugin
    //  example: ['obj','dae']
    get supportedExtensions(): string[] {
        throw new Error("WriterPlugin.supportedExtensions: attribute not implemented");
    }

    // Returns the resource types that the loader plugin can handle
    // example: [ResourceType.PolyList, ResourceType.Drawable]
    get resourceTypes(): ResourceType[] {
        throw new Error("WriterPlugin.resourceTypes: attribute not implemented");
    }

    // Performs the write action to the specified path, using the specified data
    // and for the specified type.
    async write(path: string, data: any, type: ResourceType, writer: Writer): Promise<any> {
        throw new Error("WriterPlugin.write(): method not implemented");
    }
}
