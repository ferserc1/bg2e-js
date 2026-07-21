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

import Vec from "../math/Vec";
import Mat4 from "../math/Mat4";
import PolyList from "../base/PolyList";
import BoundingBox from "../base/BoundingBox";
import Drawable from "./Drawable";
import Node from "./Node";
import Transform from "./Transform";

export default class AABoundingBox {
    private _localBox: BoundingBox;
    private _worldBox: BoundingBox;
    private _node?: Node;

    constructor();
    constructor(polyList: PolyList);
    constructor(polyLists: PolyList[]);
    constructor(drawable: Drawable);
    constructor(node: Node);
    constructor(input?: PolyList | PolyList[] | Drawable | Node) {
        this._localBox = new BoundingBox();
        this._worldBox = new BoundingBox();

        if (input instanceof Node) {
            this._node = input;
            this.update();
        }
        else if (input instanceof Drawable) {
            const polyLists = input.items.map(item => item.polyList);
            this._localBox = BoundingBox.FromPolyLists(polyLists);
            this._worldBox = this._localBox.clone();
        }
        else if (input instanceof PolyList) {
            this._localBox = BoundingBox.FromPolyList(input);
            this._worldBox = this._localBox.clone();
        }
        else if (Array.isArray(input)) {
            this._localBox = BoundingBox.FromPolyLists(input);
            this._worldBox = this._localBox.clone();
        }
    }

    get min(): Vec { return this._worldBox.min; }
    get max(): Vec { return this._worldBox.max; }
    get center(): Vec { return this._worldBox.center; }
    get size(): Vec { return this._worldBox.size; }
    get halfSize(): Vec { return this._worldBox.halfSize; }
    get corners(): Vec[] { return this._worldBox.corners; }

    get localBox(): BoundingBox { return this._localBox.clone(); }
    get worldBox(): BoundingBox { return this._worldBox.clone(); }

    get valid(): boolean { return this._worldBox.valid; }

    get node(): Node | undefined { return this._node; }

    update(): void {
        if (!this._node) return;

        const drawable = this._node.drawable;
        if (drawable) {
            const polyLists = drawable.items.map(item => item.polyList);
            this._localBox = BoundingBox.FromPolyLists(polyLists);

            const worldMatrix = Transform.GetWorldMatrix(this._node);
            this._worldBox = this._localBox.transform(worldMatrix);
        }
        else {
            this._localBox = new BoundingBox();
            this._worldBox = new BoundingBox();
        }
    }

    static FromPolyList(plist: PolyList): AABoundingBox {
        return new AABoundingBox(plist);
    }

    static FromPolyLists(plists: PolyList[]): AABoundingBox {
        return new AABoundingBox(plists);
    }

    static FromDrawable(drawable: Drawable): AABoundingBox {
        return new AABoundingBox(drawable);
    }

    static FromNode(node: Node): AABoundingBox {
        return new AABoundingBox(node);
    }

    static FromScene(root: Node): AABoundingBox {
        const box = new AABoundingBox();
        const collectPolyLists = (node: Node, lists: PolyList[]): void => {
            const drawable = node.drawable;
            if (drawable) {
                drawable.items.forEach(item => lists.push(item.polyList));
            }
            node.children.forEach(child => collectPolyLists(child, lists));
        };

        const polyLists: PolyList[] = [];
        collectPolyLists(root, polyLists);

        if (polyLists.length > 0) {
            box._localBox = BoundingBox.FromPolyLists(polyLists);
            const worldMatrix = Transform.GetWorldMatrix(root);
            box._worldBox = box._localBox.transform(worldMatrix);
        }

        return box;
    }
}
