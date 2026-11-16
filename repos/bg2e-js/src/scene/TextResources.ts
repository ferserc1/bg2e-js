import type Node from './Node';
import Loader from '../db/Loader';
import type TextFont from '../base/TextFont';
import type TextFontComponent from './TextFontComponent';
import type TextComponent from './TextComponent';
export interface ResolvedTextFont { font: TextFont; faceIndex: number; }
interface Registry {
    loader: Loader; signature: string; fonts: Map<string, ResolvedTextFont>;
    pending?: Promise<void>; version: number;
}
const registries = new WeakMap<Node, Registry>();
function nodes(root: Node): Node[] { return [root, ...root.children.flatMap(nodes)]; }
/** Font-first preparation. Also used by custom loops before binding/drawing a root. */
export async function prepareTextResources(root: Node, loader?: Loader): Promise<void> {
    const all = nodes(root);
    const collections = all.flatMap(n => n.components.array.filter(c => c.typeId === 'TextFonts')) as TextFontComponent[];
    const texts = all.flatMap(n => n.components.array.filter(c => c.typeId === 'Text')) as TextComponent[];
    if (!collections.length && !texts.length) return;
    let registry = registries.get(root);
    if (!registry) {
        registry = { loader: loader ?? new Loader(), signature: '', fonts: new Map(), version: 0 };
        registries.set(root, registry);
    }
    if (loader && registry.loader !== loader) { registry.loader = loader; registry.signature = ''; }
    if (registry.pending) await registry.pending;
    const declarations = collections.flatMap(c => c.declarations);
    const signature = JSON.stringify(declarations);
    if (signature !== registry.signature) {
        registry.signature = signature;
        registry.fonts.clear(); registry.version++;
        const duplicates = new Set(declarations.filter((f, i) => declarations.findIndex(other => other.identifier === f.identifier) !== i).map(f => f.identifier));
        for (const id of duplicates) console.warn(`Duplicate text font identifier disabled: ${id}`);
        const owner = registry;
        owner.pending = (async () => {
            for (const declaration of declarations) {
                if (duplicates.has(declaration.identifier)) continue;
                try {
                    const font = await owner.loader.loadTextFont(declaration.path);
                    owner.fonts.set(declaration.identifier, { font, faceIndex: declaration.faceIndex ?? 0 });
                } catch (error) { console.warn(`Text font unavailable: ${declaration.identifier}`, error); }
            }
        })();
        try { await owner.pending; } finally { owner.pending = undefined; }
    }
    for (const text of texts) text.prepareResources(registry.fonts.get(text.text.fontIdentifier), registry.version);
}
export async function reloadTextFonts(root: Node): Promise<void> {
    const registry = registries.get(root);
    if (registry) { if (registry.pending) await registry.pending; registry.signature = ''; registry.loader.clearTextFontCache(); }
    await prepareTextResources(root);
}
