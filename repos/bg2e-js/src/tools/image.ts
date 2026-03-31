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

import { generateMD5 } from '../tools/crypto';

export const imageToBase64 = (image: HTMLImageElement, format = 'image/jpeg') => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.height = image.naturalHeight;
    canvas.width = image.naturalWidth;
    if (ctx === null) {
        throw new Error('Could not get canvas 2D context');
    }
    ctx.drawImage(image, 0, 0);
    return canvas.toDataURL(format);
}

export const generateImageHash = (image: HTMLImageElement) => {
    const base64 = imageToBase64(image);
    return generateMD5(base64);
}
