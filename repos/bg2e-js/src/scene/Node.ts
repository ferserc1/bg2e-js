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

import Mat4 from '../math/Mat4';
import ComponentMap from './ComponentMap';
import Component from './Component';
import Renderer from '../render/Renderer';
import Camera from './Camera';
import Transform from './Transform';
import Drawable from './Drawable';
import Instance from './Instance';
import LightComponent from './LightComponent';

// Position of a child in the children list. It can be specified as:
// - An integer index: the final index the child will occupy. Negative values
//   count from the end of the list, -1 being the last position.
// - The strings 'first' or 'last'
// - { before: Node } or { after: Node } to place the child relative to a sibling
export type ChildPosition = number | 'first' | 'last' | { before: Node } | { after: Node };

export function bindRenderer(node: Node, renderer: Renderer): void {
    (node as any)._bindedRenderer = renderer;
    node.components.forEach(comp => {
        comp.bindRenderer(renderer);
    });
}

export async function init(node: Node): Promise<void> {
    for (const i in node.components.array) {
        const comp = node.components.array[i];
        if (!(comp as any)._initialized) {
            await comp.init();
            (comp as any)._initialized = true;
        }
    }
    (node as any)._sceneChanged = false;
}

export default class Node {
    private _name: string;
    private _enabled: boolean;
    private _steady: boolean;
    private _components: ComponentMap;
    private _parent: Node | null;
    private _children: Node[];
    private _bindedRenderer?: Renderer;
    private _sceneChanged: boolean = false;

    private _postRedisplayFrames: number = 0;

    constructor(name: string = "") {
        this._name = name;
        this._enabled = true;
        this._steady = false;

        this._components = new ComponentMap(this);

        this._parent = null;
        this._children = [];
    }

    get name(): string { return this._name; }
    set name(n: string) { this._name = n; }

    get enabled(): boolean { return this._enabled; }
    set enabled(e: boolean) { this._enabled = e; }

    get steady(): boolean { return this._steady; }
    set steady(s: boolean) { this._steady = s; }

    get components(): ComponentMap { return this._components; }

    // The renderer bound to this node, if the node is part of an initialized scene.
    // It is used by components that need to bind the renderer to resources that are not
    // part of the scene graph when they are added to an already initialized node
    // (see Instance.addedToNode).
    get bindedRenderer(): Renderer | undefined { return this._bindedRenderer; }

    get parent(): Node | null { return this._parent; }
    get children(): Node[] { return this._children; }

    clone(cloneChildren: boolean = false): Node {
        const newNode = new Node();
        newNode.assign(this, cloneChildren);
        return newNode;
    }

    assign(other: Node, cloneChildren: boolean = false): void {
        this._name = other.name + "-copy";
        this._enabled = other.enabled;
        this._steady = other.steady;
        this._components.assign(other._components);
        if (cloneChildren) {
            this._children = [];
            other._children.forEach(c => {
                this._children.push(c.clone(cloneChildren));
            });
        }
    }

    destroy(): void {
        this._components.empty();
        this.emptyChildren();
    }

    async deserialize(sceneData: any, loader: any): Promise<void> {
        throw new Error("Node.deserialize() not implemented");
    }

    async serialize(sceneData: any, writer: any): Promise<void> {
        throw new Error("Node.serialice() not implemented");
    }

    addComponent(component: Component): Component {
        this.components.add(component);
        this.setSceneChanged();
        return component;
    }

    component(typeId: string): Component | undefined {
        return this.components.find(typeId);
    }

    removeComponent(component: Component | string): void {
        this.components.remove(component);
        this.setSceneChanged();
    }

    addedToNode(node: Node): void {
        // Override in subclasses if needed
    }

    removedFromNode(node: Node): void {
        // Override in subclasses if needed
    }

    // This attribute returns true if a node or component
    // has been added or removed to this node or any child node
    get sceneChanged(): boolean {
        return this._sceneChanged;
    }

    setSceneChanged(): void {
        this._sceneChanged = true;
        if (this._parent) {
            this._parent.setSceneChanged();
        }
    }

    // Adds the specified node to the children list at the given position
    // (defaults to the end of the list). Returns the final index of the node.
    addChild(node: Node, position: ChildPosition = 'last'): number {
        if (!node) {
            throw new Error(`Node.addChild() - the specified node is null.`);
        }
        const wasChild = node._parent === this;
        const oldIndex = wasChild ? this._children.indexOf(node) : -1;
        if (wasChild && oldIndex === -1) {
            console.warn(`Scene inconsistency found adding node '${node.name}' to node '${this.name}'. The parent node is valid, but the child is not present in the children array.`);
        }

        // The position is resolved before any mutation, as resolving it can throw
        const newIndex = this.resolveChildPosition(node, position, "Node.addChild()");

        if (wasChild) {
            // Reinsertion: the parent does not change, so removeChild() is bypassed
            // to avoid firing removedFromNode/addedToNode and flagging the scene
            // as changed unless the position effectively changes
            if (oldIndex !== -1) {
                this._children.splice(oldIndex, 1);
            }
        }
        else if (node._parent) {
            node._parent.removeChild(node);
        }

        node._parent = this;
        this._children.splice(newIndex, 0, node);

        if (!wasChild) {
            node.addedToNode(this);
        }

        // If this node has been binded to a renderer, we need to bind
        // the same renderer to any node that is added as child
        if (this._bindedRenderer) {
            bindRenderer(node, this._bindedRenderer);
        }

        if (!wasChild || oldIndex === -1 || newIndex !== oldIndex) {
            this.setSceneChanged();
        }

        return newIndex;
    }

    // Adds the specified node to the start of the children list
    addChildFirst(node: Node): number {
        return this.addChild(node, 'first');
    }

    removeChild(node: Node): void {
        if (node._parent === this) {
            node._parent = null;
            node.removedFromNode(this);
            const index = this._children.indexOf(node);
            if (index !== -1) {
                this._children.splice(index, 1);
                this.setSceneChanged();
            }
            else {
                console.warn(`Scene inconsistency found removing node '${ node.name }' from node '${ this.name }'. The parent node is valid, but the child is not present in the children array.`);
            }
        }
        else {
            throw new Error(`Node.removeChild() - the specified node is not a child of this node.`);
        }
    }

    emptyChildren(): void {
        this._children.forEach(ch => {
            ch._parent = null;
            ch.removedFromNode(this);
        });
        this._children = [];
        this.setSceneChanged();
    }

    // Moves the specified child to the given position in the children list.
    // Returns the new index of the child.
    moveChild(node: Node, position: ChildPosition): number {
        if (!node) {
            throw new Error(`Node.moveChild() - the specified node is null.`);
        }
        if (node._parent !== this) {
            throw new Error(`Node.moveChild() - the specified node is not a child of this node.`);
        }
        const oldIndex = this._children.indexOf(node);
        if (oldIndex === -1) {
            console.warn(`Scene inconsistency found moving node '${node.name}' in node '${this.name}'. The parent node is valid, but the child is not present in the children array.`);
        }

        // The position is resolved before any mutation, as resolving it can throw
        const newIndex = this.resolveChildPosition(node, position, "Node.moveChild()");

        if (newIndex !== oldIndex) {
            if (oldIndex !== -1) {
                this._children.splice(oldIndex, 1);
            }
            this._children.splice(newIndex, 0, node);
            this.setSceneChanged();
        }

        return newIndex;
    }

    // Moves the specified child to the start of the children list
    moveChildFirst(node: Node): number {
        return this.moveChild(node, 'first');
    }

    // Moves the specified child to the end of the children list
    moveChildLast(node: Node): number {
        return this.moveChild(node, 'last');
    }

    // Shifts the specified child by the given number of positions in the
    // children list. Positive deltas move the child towards the end of the
    // list, negative deltas towards the start. The resulting position is
    // clamped to the valid range. Returns the new index of the child.
    shiftChild(node: Node, delta: number): number {
        if (!node) {
            throw new Error(`Node.shiftChild() - the specified node is null.`);
        }
        if (node._parent !== this) {
            throw new Error(`Node.shiftChild() - the specified node is not a child of this node.`);
        }
        if (!Number.isInteger(delta)) {
            throw new Error(`Node.shiftChild() - the specified delta must be a finite integer.`);
        }
        const currentIndex = this._children.indexOf(node);
        if (currentIndex === -1) {
            console.warn(`Scene inconsistency found shifting node '${node.name}' in node '${this.name}'. The parent node is valid, but the child is not present in the children array.`);
            return -1;
        }
        let targetIndex = currentIndex + delta;
        if (targetIndex < 0) {
            targetIndex = 0;
        }
        else if (targetIndex > this._children.length - 1) {
            targetIndex = this._children.length - 1;
        }
        if (targetIndex !== currentIndex) {
            this._children.splice(currentIndex, 1);
            this._children.splice(targetIndex, 0, node);
            this.setSceneChanged();
        }
        return targetIndex;
    }

    // Moves the specified child one position towards the start of the children list
    moveChildUp(node: Node): number {
        return this.shiftChild(node, -1);
    }

    // Moves the specified child one position towards the end of the children list
    moveChildDown(node: Node): number {
        return this.shiftChild(node, 1);
    }

    // Returns the index of the specified child in the children list, or -1 if it is not a child
    indexOfChild(node: Node): number {
        return this._children.indexOf(node);
    }

    // Resolves a ChildPosition to the final index the child will occupy in the
    // children list. The position is resolved against the list as the child is not
    // counted in it, so for a child already present in the list (moveChild) the list
    // is taken as it would be after removing the child. Out-of-range numeric positions
    // are clamped to the first or last position; unresolvable positions throw an error.
    private resolveChildPosition(node: Node, position: ChildPosition, method: string): number {
        const currentIndex = this._children.indexOf(node);
        const length = this._children.length - (currentIndex >= 0 ? 1 : 0);
        if (typeof position === 'number') {
            if (!Number.isInteger(position)) {
                throw new Error(`${method} - the specified position must be an integer.`);
            }
            let index = position < 0 ? length + 1 + position : position;
            if (index < 0 || index > length) {
                index = index < 0 ? 0 : length;
                console.warn(`${method} - the specified position ${position} is out of range for this children list, clamped to position ${index}.`);
            }
            return index;
        }
        if (position === 'first') {
            return 0;
        }
        if (position === 'last') {
            return length;
        }
        if (position !== null && typeof position === 'object') {
            const before = 'before' in position;
            const reference = before ? position.before : position.after;
            if (reference === node) {
                throw new Error(`${method} - the reference node is the node being inserted or moved.`);
            }
            let referenceIndex = this._children.indexOf(reference);
            if (referenceIndex === -1) {
                const name = reference?.name ?? String(reference);
                throw new Error(`${method} - the reference node '${name}' is not a child of this node.`);
            }
            if (currentIndex >= 0 && referenceIndex > currentIndex) {
                referenceIndex--;
            }
            return before ? referenceIndex : referenceIndex + 1;
        }
        throw new Error(`${method} - invalid position. Expected an integer index, 'first', 'last', or { before: Node } / { after: Node }.`);
    }

    haveChild(node: Node): boolean {
        return this._children.indexOf(node) !== -1;
    }

    isAncientOf(node: Node): boolean {
        const isNodeAncient = (node: Node | null, ancient: Node): boolean => {
            if (!node || !ancient) {
                return false;
            }
            else if (node._parent === ancient) {
                return true;
            }
            else {
                return isNodeAncient(node._parent, ancient);
            }
        }
        return isNodeAncient(this, node);
    }

    // Visitor functions
    accept(nodeVisitor: any): void {
        if (!nodeVisitor.ignoreDisabled || this.enabled) {
            nodeVisitor.visit(this);
            this._children.forEach(ch => ch.accept(nodeVisitor));
            nodeVisitor.didVisit(this);
        }
    }

    acceptReverse(nodeVisitor: any): void {
        if (!nodeVisitor.ignoreDisabled || this.enabled) {
            if (this._parent) {
                this._parent.acceptReverse(nodeVisitor);
            }
            nodeVisitor.visit(this);
        }
    }

    async asyncAccept(nodeVisitor: any): Promise<void> {
        if (!nodeVisitor.ignoreDisabled || this.enabled) {
            await nodeVisitor.asyncVisit(this);
            for (const ch in this._children) {
                await this._children[ch].asyncAccept(nodeVisitor);
            }
        }
    }

    // Used by components to require a redraw of the scene for a certain number of frames.
    // This is needed, for example, when a component changes the material of a drawable,
    // so the change is reflected inmediately in the screen, or when a component generates
    // an animation that needs to be updated for a certain number of frames.
    get postRedisplayFrames(): number {
        return this._postRedisplayFrames;
    }

    set postRedisplayFrames(frames: number) {
        this._postRedisplayFrames = frames;
    }
    
    // Most usual components
    get transform(): Transform | undefined {
        return this.component("Transform") as Transform;
    }

    get lightComponent(): LightComponent | undefined {
        return this.component("Light") as LightComponent;
    }

    get drawable(): Drawable | undefined {
        return this.component("Drawable") as Drawable;
    }

    get instance(): Instance | undefined {
        return this.component("Instance") as Instance;
    }

    get camera(): Camera | undefined {
        return this.component("Camera") as Camera;
    }

    frame(delta: number, modelMatrix: Mat4, renderQueue: any): void {
        const willUpdateComponents: Component[] = [];
        const updateComponents: Component[] = [];
        const drawComponents: Component[] = [];
        this._components.forEach(comp => {
            if (comp.requireWillUpdate) {
                willUpdateComponents.push(comp);
            }
            if (comp.requireUpdate) {
                updateComponents.push(comp);
            }
            if (comp.requireDraw) {
                drawComponents.push(comp);
            }
        });

        willUpdateComponents.forEach(comp => (comp as any).willUpdate(delta));
        updateComponents.forEach(comp => (comp as any).update(delta, modelMatrix));
        drawComponents.forEach(comp => (comp as any).draw(renderQueue, modelMatrix));
    }

    keyDown(evt: any): void {
        this._components.forEach(comp => {
            comp.keyDown(evt);
        });
    }
    keyUp(evt: any): void {
        this._components.forEach(comp => {
            comp.keyUp(evt);
        });
    }
    mouseUp(evt: any): void {
        this._components.forEach(comp => {
            comp.mouseUp(evt);
        });
    }
    mouseDown(evt: any): void {
        this._components.forEach(comp => {
            comp.mouseDown(evt);
        });
    }
    mouseMove(evt: any): void {
        this._components.forEach(comp => {
            comp.mouseMove(evt);
        });
    }
    mouseOut(evt: any): void {
        this._components.forEach(comp => {
            comp.mouseOut(evt);
        });
    }
    mouseDrag(evt: any): void {
        this._components.forEach(comp => {
            comp.mouseDrag(evt);
        });
    }
    mouseWheel(evt: any): void {
        this._components.forEach(comp => {
            comp.mouseWheel(evt);
        });
    }
    touchStart(evt: any): void {
        this._components.forEach(comp => {
            comp.touchStart(evt);
        });
    }
    touchMove(evt: any): void {
        this._components.forEach(comp => {
            comp.touchMove(evt);
        });
    }
    touchEnd(evt: any): void {
        this._components.forEach(comp => {
            comp.touchEnd(evt);
        });
    }
}
