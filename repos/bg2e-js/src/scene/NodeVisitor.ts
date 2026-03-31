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

import Node
 from "./Node";
export default class NodeVisitor {
    private _ignoreDisabled: boolean;

    constructor() {
        this._ignoreDisabled = true;
    }

    get ignoreDisabled() { return this._ignoreDisabled; }
    set ignoreDisabled(i) { this._ignoreDisabled = i; }

    visit(node: Node) {}
    didVisit(node: Node) {}
}
