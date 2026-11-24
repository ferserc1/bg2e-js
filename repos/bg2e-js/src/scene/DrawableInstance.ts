import Color from "../base/Color";
import type PolyList from "../base/PolyList";
import type { DrawableAppearance, DrawableResource, DrawableResourceLease } from "../db/DrawableCache";
import type Loader from "../db/Loader";
import Mat4 from "../math/Mat4";
import type Renderer from "../render/Renderer";
import type RenderQueue from "../render/RenderQueue";
import type { SelectionState } from "../render/RenderState";
import Component from "./Component";
import type Node from "./Node";
import { isJsonObject, isSubmeshMatrix } from "./SceneData";

export interface DrawableInstanceItem extends DrawableAppearance {
    readonly polyList: PolyList;
    readonly material: DrawableAppearance["material"];
}

type PreparedItem = Omit<DrawableInstanceItem, "material"> & {
    material: DrawableAppearance["material"];
    selection: SelectionState;
};
type Binding = { lease: DrawableResourceLease; items: PreparedItem[] };
type Reference = { path: unknown; submeshes: unknown; loader: Loader; nodeName?: string };

function disposeBinding(binding: Binding): void {
    try {
        for (const item of binding.items) item.material.destroy(true);
    }
    finally {
        binding.lease.release();
    }
}

function prepareBinding(resource: DrawableResource, source?: readonly DrawableInstanceItem[]): Binding {
    const binding: Binding = { lease: resource.retain(), items: [] };
    try {
        for (let index = 0; index < resource.submeshCount; index++) {
            const polyList = binding.lease.geometry(index);
            const previous = source?.[index];
            const appearance = previous ? {
                name: previous.name, groupName: previous.groupName, visible: previous.visible,
                transform: new Mat4(previous.transform), material: previous.material.clone()
            } : binding.lease.createAppearance(index);
            binding.items.push({ ...appearance, polyList, selection: { colorCode: Color.Black(), selected: false } });
        }
        return binding;
    }
    catch (error) {
        disposeBinding(binding);
        throw error;
    }
}

export default class DrawableInstance extends Component {
    private binding?: Binding;
    private pendingLease?: DrawableResourceLease;
    private reference?: Reference;
    private revision = 0;
    private _loadError?: unknown;
    private _selectable = true;

    constructor(resource?: DrawableResource) {
        super("DrawableInstance");
        if (resource) this.bindResource(resource);
    }

    get resource(): DrawableResource | undefined { return this.binding?.lease.resource; }
    get name(): string { return this.node?.name ?? this.resource?.name ?? this.path ?? ""; }
    get items(): readonly DrawableInstanceItem[] { return this.binding?.items ?? []; }
    get valid(): boolean { return this.items.length > 0; }
    get path(): string | undefined { return typeof this.reference?.path === "string" ? this.reference.path : undefined; }
    get loadError(): unknown { return this._loadError; }

    bindResource(resource: DrawableResource): void {
        const binding = prepareBinding(resource);
        this.releaseResource();
        this.binding = binding;
        this.changed();
    }

    releaseResource(): void {
        this.reference = undefined;
        this._loadError = undefined;
        this.resetBinding();
    }

    private resetBinding(): number {
        this.revision++;
        this.pendingLease?.release();
        this.pendingLease = undefined;
        const previous = this.binding;
        this.binding = undefined;
        if (previous) disposeBinding(previous);
        this.changed();
        return this.revision;
    }

    private changed(): void {
        if (this.node) {
            this.node.setSceneChanged();
            this.node.postRedisplayFrames = Math.max(1, this.node.postRedisplayFrames);
        }
    }

    override async deserialize(data: Record<string, unknown>, loader: Loader, node?: Node): Promise<void> {
        const revision = ++this.revision;
        await super.deserialize(data, loader);
        if (revision !== this.revision) return;
        this.reference = {
            path: data.path, submeshes: data.submeshes,
            loader: loader.withBasePath(loader.currentPath), nodeName: node?.name
        };
        await this.retryResources();
    }

    async retryResources(): Promise<boolean> {
        const reference = this.reference;
        if (!reference) return this.valid;
        const revision = this.resetBinding();
        this._loadError = undefined;
        let staged: Binding | undefined;
        try {
            const { path, loader } = reference;
            if (typeof path !== "string" || !path) throw new Error("Expected a nonempty BG2 path");
            if (!loader.drawableCache) throw new Error("Scene drawable cache unavailable");
            const resource = await loader.drawableCache.loadBg2(path, loader);
            if (revision !== this.revision) return false;
            if (!resource.submeshCount) throw new Error("BG2 resource has no submeshes");
            staged = prepareBinding(resource);
            this.pendingLease = staged.lease;
            await this.applySubmeshes(staged.items, reference, revision);
            if (revision !== this.revision) return false;
            this.binding = staged;
            this.pendingLease = undefined;
            staged = undefined;
            this.changed();
            return true;
        }
        catch (error) {
            if (revision === this.revision) {
                this._loadError = error;
                console.warn(this.diagnostic(reference, "Resource preparation failed"), error);
            }
            return false;
        }
        finally {
            if (staged) {
                if (this.pendingLease === staged.lease) this.pendingLease = undefined;
                disposeBinding(staged);
            }
        }
    }

    private diagnostic(reference: Reference, message: string): string {
        const nodeName = this.node?.name ?? reference.nodeName ?? "";
        const path = typeof reference.path === "string" ? reference.path : "<invalid>";
        return `DrawableInstance on node "${nodeName}" (${path}): ${message}`;
    }

    private async applySubmeshes(items: PreparedItem[], reference: Reference, revision: number): Promise<void> {
        const records = reference.submeshes;
        const warn = (message: string) => console.warn(this.diagnostic(reference, message));
        if (records === undefined) return;
        if (!Array.isArray(records)) {
            warn("Expected submeshes to be an array");
            return;
        }
        if (records.length !== items.length) {
            warn(`Expected ${items.length} submeshes but found ${records.length}`);
        }

        for (let index = 0; index < Math.min(items.length, records.length); index++) {
            if (revision !== this.revision) return;
            const record: unknown = records[index];
            if (!isJsonObject(record)) {
                warn(`Ignoring invalid submesh at index ${index}`);
                continue;
            }
            const item = items[index];
            for (const key of ["name", "groupName"] as const) {
                if (typeof record[key] === "string") item[key] = record[key];
                else if (key in record) warn(`Invalid ${key} for submesh ${index}`);
            }
            if (typeof record.visible === "boolean") item.visible = record.visible;
            else if ("visible" in record) warn(`Invalid visible for submesh ${index}`);
            if (isSubmeshMatrix(record.transform)) item.transform = new Mat4(record.transform);
            else if ("transform" in record) warn(`Invalid transform for submesh ${index}`);
            if (isJsonObject(record.material)) {
                try {
                    const material = await item.material.withOverrides(record.material, reference.loader.currentPath);
                    item.material.destroy(true);
                    item.material = material;
                }
                catch (error) {
                    throw new Error(`Submesh ${index} material could not be prepared: ${error instanceof Error ? error.message : error}`);
                }
            }
            else if ("material" in record) warn(`Invalid material for submesh ${index}`);
        }
    }

    override clone(): DrawableInstance {
        const copy = new DrawableInstance();
        copy.assign(this);
        return copy;
    }

    override assign(other: DrawableInstance): void {
        if (other === this) return;
        const reference = other.reference && { ...other.reference, submeshes: structuredClone(other.reference.submeshes) };
        const binding = other.resource && prepareBinding(other.resource, other.items);
        this.releaseResource();
        this.reference = reference;
        this.binding = binding;
        this.priority = other.priority;
        this._selectable = other.selectable;
        this._loadError = other.loadError;
        this.changed();
    }

    override destroy(): void {
        this.releaseResource();
        this._renderer = null;
    }

    override addedToNode(node: Node): void {
        if (node.bindedRenderer) this.bindRenderer(node.bindedRenderer);
    }

    get selectable(): boolean { return this._selectable; }
    set selectable(value: boolean) {
        this._selectable = value;
        if (!value) this.clearSelection();
    }

    makeSelectable(selectable = true): void { this.selectable = selectable; }

    isSelectable(index: number): boolean {
        return this.selectable && !!this.items[index]?.polyList.isSelectable;
    }

    setColorCode(index: number, colorCode: Color): void {
        const item = this.binding?.items[index];
        if (item) item.selection.colorCode = colorCode;
    }

    setSelected(index: number, selected: boolean): void {
        const item = this.binding?.items[index];
        if (item) item.selection.selected = selected && this.isSelectable(index);
    }

    isSelected(index: number): boolean { return this.binding?.items[index]?.selection.selected ?? false; }
    selectAll(): void { this.items.forEach((_, index) => this.setSelected(index, true)); }
    clearSelection(): void { this.items.forEach((_, index) => this.setSelected(index, false)); }

    draw(queue: RenderQueue, nodeWorld: Mat4): void {
        const renderer = this.renderer;
        if (!this.binding || !renderer) return;
        const { lease, items } = this.binding;
        items.forEach((item, index) => {
            queue.addPolyList(
                lease.bindGeometry(index, renderer), renderer.factory.material(item.material),
                Mat4.Mult(nodeWorld, item.transform), {
                    ...item.selection, selectable: this.isSelectable(index)
                }, item.visible
            );
        });
    }
}
