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

import { getMouseEventOffset } from "./Canvas";
import EventBase from "./EventBase";

export enum MouseButton {
    LEFT = 0,
    MIDDLE = 1,
    RIGHT = 2,
    NONE = -1
}

export enum MouseButtonEventType {
    NONE = 0,
    UP = 1,
    DOWN = 2
}

export const createMouseEvent = (evt: any, mainLoop: any, buttonType: MouseButtonEventType): MouseEvent => {
    mainLoop.mouseStatus.pos = getMouseEventOffset(evt, mainLoop.canvas);
    if (buttonType !== MouseButtonEventType.NONE) {
        const buttonStatus = buttonType === MouseButtonEventType.DOWN;
        if (evt.button === MouseButton.LEFT) {
            mainLoop.mouseStatus.leftButton = buttonStatus;
        }
        else if (evt.button === MouseButton.MIDDLE) {
            mainLoop.mouseStatus.middleButton = buttonStatus;
        }
        else if (evt.button === MouseButton.RIGHT) {
            mainLoop.mouseStatus.rightButton = buttonStatus;
        }
    }

    return new MouseEvent(evt.button, mainLoop.mouseStatus.pos.x, mainLoop.mouseStatus.pos.y, 0, evt);
}

const g_mouseButtons: boolean[] = [false, false, false];
export const leftMouseButton = (): boolean => {
    return g_mouseButtons[0];
}

export const middleMouseButton = (): boolean => {
    return g_mouseButtons[1];
}

export const rightMouseButton = (): boolean => {
    return g_mouseButtons[2];
}

export const clearMouseButtons = (): void => {
    g_mouseButtons[0] = false;
    g_mouseButtons[1] = false;
    g_mouseButtons[2] = false;
}

export const setMouseButton = (event: any, status: boolean): void => {
    switch (event.button) {
    case MouseButton.LEFT:
        g_mouseButtons[0] = status;
        break;
    case MouseButton.MIDDLE:
        g_mouseButtons[1] = status;
        break;
    case MouseButton.RIGHT:
        g_mouseButtons[2] = status;
        break;
    }
}
export default class MouseEvent extends EventBase {
    button: MouseButton;
    x: number;
    y: number;
    delta: number;
    event: any;

    constructor(button: MouseButton = MouseButton.NONE, x: number = -1, y: number = -1, delta: number = 0, event: any = null) {
        super();
        this.button = button;
        this.x = x;
        this.y = y;
        this.delta = delta;
        this.event = event;
    }
}
