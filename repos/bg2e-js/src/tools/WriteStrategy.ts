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


export default class WriteStrategy {
    async writeBytes(path: string, data: ArrayBuffer): Promise<void> {
        throw new Error("WriteStrategy: writeBytes() not implemented");
    }

    async writeImage(path: string, img: HTMLImageElement | ImageData): Promise<void> {
        throw new Error("WriteStrategy: writeImage() not implemented");
    }

    async writeText(path: string, data: string): Promise<void> {
        throw new Error("WriteStrategy: writeText() not implemented");
    }

    async writeJson(path: string, object: any): Promise<void> {
        throw new Error("WriteStrategy: writeJson() not implemented");
    }

    async copyFile(srcPath: string, dstPath: string): Promise<void> {
        throw new Error("WriteStrategy: copyFile() not implemented");
    }
}
