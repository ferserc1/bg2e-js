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

import { isNode, isBrowser } from "./processType";

export const base64ToArrayBuffer = async (base64: string) : Promise<Uint8Array> => {
    if (isBrowser() || isNode()) {
        return new Uint8Array(atob(base64).split('').map(c => c.charCodeAt(0)));
    }
    else {
        throw new Error("base64ToArrayBuffer: Unsupported platform. Valid platforms are NodeJS or Browser");
    }
}

