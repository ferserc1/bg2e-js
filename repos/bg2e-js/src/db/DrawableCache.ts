import type Loader from "./Loader";
import type Drawable from "../scene/Drawable";
import type Material from "../base/Material";
import PolyList from "../base/PolyList";
import Mat4 from "../math/Mat4";
import type Renderer from "../render/Renderer";
import type PolyListRenderer from "../render/PolyListRenderer";
import { getExtension, jointUrl } from "../tools/Resource";

export interface DrawableAppearance {
    name: string;
    groupName: string;
    visible: boolean;
    transform: Mat4;
    material: Material;
}

export interface DrawableResourceLease {
    readonly resource: DrawableResource;
    /** Borrow shared geometry for rendering or queries. Treat it as read-only. */
    geometry(index: number): PolyList;
    bindGeometry(index: number, renderer: Renderer): PolyListRenderer;
    /** The caller owns the returned material and can edit its appearance. */
    createAppearance(index: number): DrawableAppearance;
    release(): void;
}

export interface DrawableResource {
    readonly key: string;
    readonly name: string;
    readonly submeshCount: number;
    readonly activeLinks: number;
    retain(): DrawableResourceLease;
}

type CachedSubmesh = DrawableAppearance & { geometry: PolyList };

class CacheEntry implements DrawableResource {
    readonly name: string;
    private submeshes: CachedSubmesh[];
    private links = 0;
    private disposed = false;

    constructor(readonly key: string, drawable: Drawable, copy: boolean) {
        this.name = drawable.name;
        this.submeshes = drawable.items.map(({ polyList, material, transform }) => {
            const geometry = copy ? new PolyList() : polyList;
            if (copy) geometry.assign(polyList);
            geometry.mainDrawable = undefined;
            return {
                geometry, name: polyList.name, groupName: polyList.groupName, visible: polyList.visible,
                transform: new Mat4(transform), material: copy ? material.clone() : material
            };
        });
    }

    get activeLinks(): number { return this.links; }
    get submeshCount(): number { return this.submeshes.length; }

    retain(): DrawableResourceLease {
        if (this.disposed) throw new Error(`Drawable resource '${this.key}' has been removed`);
        let active = true;
        this.links++;

        const submesh = (index: number): CachedSubmesh => {
            if (!active) throw new Error("Drawable resource lease has been released");
            const item = this.submeshes[index];
            if (!item) throw new RangeError(`Invalid submesh index ${index} for '${this.key}'`);
            return item;
        };

        return {
            resource: this,
            geometry: index => submesh(index).geometry,
            bindGeometry: (index, renderer) => {
                const geometry = submesh(index).geometry;
                if (geometry.renderer && geometry.renderer.renderer !== renderer) {
                    throw new Error("Shared drawable geometry is already bound to another renderer");
                }
                return renderer.factory.polyList(geometry);
            },
            createAppearance: index => {
                const { name, groupName, visible, transform, material } = submesh(index);
                return { name, groupName, visible, transform: new Mat4(transform), material: material.clone() };
            },
            release: () => {
                if (!active) return;
                active = false;
                this.links--;
            }
        };
    }

    dispose(): void {
        this.disposed = true;
        for (const { geometry, material } of this.submeshes) {
            geometry.destroy();
            material.destroy(true);
        }
        this.submeshes = [];
    }
}

function normalizeBg2Url(path: string, base: string): string {
    const scheme = /^[a-z][a-z\d+.-]*:/i;
    const documentBase = typeof document === "undefined" ? undefined : document.baseURI;
    const directory = base && jointUrl(base, "");
    if (documentBase || scheme.test(directory) || scheme.test(path)) {
        const url = scheme.test(path)
            ? new URL(path)
            : new URL(path, directory ? new URL(directory, documentBase) : documentBase);
        url.hash = "";
        return url.href;
    }

    // Keep relative paths usable for loaders running outside a browser.
    const resolved = (path.startsWith("/") || !directory ? path : directory + path).split("#", 1)[0];
    if (resolved.startsWith("//")) {
        return new URL("https:" + resolved).href.slice("https:".length);
    }
    const suffix = resolved.indexOf("?");
    const pathname = suffix === -1 ? resolved : resolved.slice(0, suffix);
    const rooted = pathname.startsWith("/");
    const segments: string[] = [];
    for (const part of pathname.split("/")) {
        if (!part || part === ".") continue;
        if (part !== "..") segments.push(part);
        else if (segments.length && segments[segments.length - 1] !== "..") segments.pop();
        else if (!rooted) segments.push(part);
    }
    return (rooted ? "/" : "") + segments.join("/") + (suffix === -1 ? "" : resolved.slice(suffix));
}

export default class DrawableCache {
    private entries = new Map<string, CacheEntry | Promise<DrawableResource>>();

    static bg2Key(path: string, base = ""): string {
        const key = normalizeBg2Url(path, base);
        if (getExtension(key).toLowerCase() !== "bg2") throw new Error(`Expected a .bg2 model path: '${path}'`);
        return key;
    }

    find(key: string): DrawableResource | undefined {
        const entry = this.entries.get(key);
        return entry instanceof CacheEntry ? entry : undefined;
    }

    add(key: string, drawable: Drawable): DrawableResource {
        if (!key.trim()) throw new Error("Drawable resource key cannot be empty");
        if (this.entries.has(key)) throw new Error(`Drawable resource '${key}' already exists or is loading`);
        if (!drawable.valid) throw new Error("A drawable resource requires a valid drawable");
        const entry = new CacheEntry(key, drawable, true);
        this.entries.set(key, entry);
        return entry;
    }

    loadBg2(path: string, loader: Loader): Promise<DrawableResource> {
        let key: string;
        try {
            key = DrawableCache.bg2Key(path, loader.currentPath);
        }
        catch (error) {
            return Promise.reject(error);
        }

        const existing = this.entries.get(key);
        if (existing) return existing instanceof CacheEntry ? Promise.resolve(existing) : existing;

        const request: Promise<DrawableResource> = Promise.resolve().then(async () => {
            if (this.entries.get(key) !== request) throw new Error(`Drawable load was removed: '${key}'`);
            const drawable: Drawable = await loader.withBasePath("").loadDrawable(key);
            const entry = new CacheEntry(key, drawable, false);
            if (this.entries.get(key) !== request) {
                entry.dispose();
                throw new Error(`Drawable load was removed: '${key}'`);
            }
            this.entries.set(key, entry);
            return entry;
        }).catch(error => {
            if (this.entries.get(key) === request) this.entries.delete(key);
            throw error;
        });
        this.entries.set(key, request);
        return request;
    }

    remove(key: string): boolean {
        const entry = this.entries.get(key);
        if (!entry || (entry instanceof CacheEntry && entry.activeLinks)) return false;
        this.entries.delete(key);
        if (entry instanceof CacheEntry) entry.dispose();
        return true;
    }

    clear(): boolean {
        for (const entry of this.entries.values()) {
            if (entry instanceof CacheEntry && entry.activeLinks) return false;
        }
        for (const key of this.entries.keys()) this.remove(key);
        return true;
    }
}
