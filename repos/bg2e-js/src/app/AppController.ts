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

import Bg2MouseEvent from "./Bg2MouseEvent";
import Bg2KeyboardEvent from "./Bg2KeyboardEvent";
import Bg2TouchEvent from "./Bg2TouchEvent";

export default class AppController {
    _mainLoop: any;

    constructor() {
        this._mainLoop = null;
    }

    get mainLoop(): any { return this._mainLoop; }
    set mainLoop(ml: any) { this._mainLoop = ml; }

    get canvas(): any { return this._mainLoop?.canvas; }

    get renderer(): any { return this._mainLoop?.canvas?.renderer; }

    get viewport(): { width: number; height: number; aspectRatio: number } { 
        return this.canvas?.viewport || { width: 0, height: 0, aspectRatio: 0 }; 
    }

    async init(): Promise<void> {}
    reshape(width: number, height: number): void {}
    async frame(delta: number): Promise<void> {}
    display(): void {}
    destroy(): void {}
    keyDown(evt: Bg2KeyboardEvent): void {}
    keyUp(evt: Bg2KeyboardEvent): void {}
    mouseUp(evt: Bg2MouseEvent): void {}
    mouseDown(evt: Bg2MouseEvent): void {}
    mouseMove(evt: Bg2MouseEvent): void {}
    mouseOut(evt: Bg2MouseEvent): void {}
    mouseDrag(evt: Bg2MouseEvent): void {}
    mouseWheel(evt: Bg2MouseEvent): void {}
    touchStart(evt: Bg2TouchEvent): void {}
    touchMove(evt: Bg2TouchEvent): void {}
    touchEnd(evt: Bg2TouchEvent): void {}
}
