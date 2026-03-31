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

import EventBase from "./EventBase";

export enum SpecialKey {
    BACKSPACE = "Backspace",
    TAB = "Tab",
    ENTER = "Enter",
    SHIFT = "Shift",
    SHIFT_LEFT = "ShiftLeft",
    SHIFT_RIGHT = "ShiftRight",
    CTRL = "Control",
    CTRL_LEFT = "ControlLeft",
    CTRL_RIGHT = "ControlRight",
    ALT = "Alt",
    ALT_LEFT = "AltLeft",
    ALT_RIGHT = "AltRight",
    PAUSE = "Pause",
    CAPS_LOCK = "CapsLock",
    ESCAPE = "Escape",
    PAGE_UP = "PageUp",
    PAGEDOWN = "PageDown",
    END = "End",
    HOME = "Home",
    LEFT_ARROW = "ArrowLeft",
    UP_ARROW = "ArrowUp",
    RIGHT_ARROW = "ArrowRight",
    DOWN_ARROW = "ArrowDown",
    INSERT = "Insert",
    DELETE = "Delete",
    SPACE = "Space"
}

export const createKeyboardEvent = (evt: any): KeyboardEvent => {
    const code = (SpecialKey as any)[evt.code] != null ? evt.keyCode : evt.code;
    return new KeyboardEvent(code, evt);
}

export default class KeyboardEvent extends EventBase {
    key: string;
    event: any;

    static IsSpecialKey(event: any): boolean {
        return (SpecialKey as any)[event.code] != null;
    }
    
    constructor(key: string, event: any) {
        super();
        this.key = key;
        this.event = event;
    }
    
    get isSpecialKey(): boolean {
        return KeyboardEvent.IsSpecialKey(this.event);
    }
}
