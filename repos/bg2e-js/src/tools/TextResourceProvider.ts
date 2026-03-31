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

import ResourceProvider from './ResourceProvider';

export default class TextResourceProvider extends ResourceProvider {
    async load(url: string): Promise<any> {
        const response = await fetch(url);
        if (response.ok) {
            const textData = await response.text();
            try {
                const objectData = JSON.parse(textData);
                return objectData;
            }
            catch (e) {
                return textData;
            }
        }
        else {
            throw new Error(`Resource not found at '${ url }'`);
        }
    }

    async write(url: string, data: any): Promise<void> {
        throw new Error('TextResourceProvider.write not implemented.');
    }
}
