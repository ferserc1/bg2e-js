import Resource, { removeFileName, ResourceType } from "../tools/Resource";
import LoaderPlugin from "./LoaderPlugin";
import Node from "../scene/Node";
import { deserializeComponent } from "../scene/Component";
import Bg2LoaderPlugin, { type MaterialImportCallback } from "./Bg2LoaderPlugin";
import Loader from "./Loader";

interface NodeData {
    name: string;
    enabled?: boolean;
    steady?: boolean;
    children?: NodeData[];
    components?: any[];
}

const deserializeNode = async (nodeData: NodeData, loader: Loader): Promise<Node> => {
    nodeData.children = nodeData.children || [];
    nodeData.components = nodeData.components || [];

    const node = new Node(nodeData.name);
    node.enabled = nodeData.enabled !== undefined ? nodeData.enabled : true;
    node.steady = nodeData.steady !== undefined ? nodeData.steady : false;

    for (const componentData of nodeData.components) {
        try {
            const component = await deserializeComponent(componentData, loader);
            if (component) {
                node.addComponent(component);
            }
        }
        catch (err: any) {
            console.warn(`Deserialization of node with name "${node.name}": ${err.message}`);
        }
    }

    for (const childData of nodeData.children) {
        const child = await deserializeNode(childData, loader);
        node.addChild(child);
    }

    return node;
}

export const DrawableFormat = {
    LEGACY: 'vwglb',
    BG2: 'bg2'
} as const;

export type DrawableFormatValue = typeof DrawableFormat[keyof typeof DrawableFormat];

let g_prefDrawableFormat: DrawableFormatValue = DrawableFormat.BG2;
export default class VitscnjLoaderPlugin extends LoaderPlugin {
    private _bg2ioPath: string | null;
    private _materialImportCallback?: MaterialImportCallback;

    static PreferredDrawableFormat(): DrawableFormatValue {
        return g_prefDrawableFormat;
    }

    constructor({
        bg2ioPath,
        preferedDrawableFormat = DrawableFormat.BG2,
        materialImportCallback
    }: {
        bg2ioPath: string | null
        preferedDrawableFormat?: DrawableFormatValue
        materialImportCallback?: MaterialImportCallback
    } = { bg2ioPath: null }) {
        super();

        this._bg2ioPath = bg2ioPath;
        g_prefDrawableFormat = preferedDrawableFormat;
        this._materialImportCallback = materialImportCallback;
    }

    get supportedExtensions(): string[] { return ["vitscnj"]; }

    get resourceTypes(): ResourceType[] {
        return [
            ResourceType.Node
        ];
    }

    async load(path: string, resourceType: ResourceType, loader: Loader): Promise<Node> {
        if (resourceType !== ResourceType.Node) {
            throw new Error(`VitscnjLoaderPlugin.load() unexpected resource type received: ${resourceType}`);
        }

        const prevPath = loader.currentPath;
        loader.currentPath = removeFileName(path);

        const resource = new Resource();

        const root = new Node("Scene Root");

        const { scene } = await resource.load(path);
        for (const nodeData of scene) {
            const node = await deserializeNode(nodeData, loader);
            root.addChild(node);
        }

        loader.currentPath = prevPath;

        return root;
    }

    get dependencies(): LoaderPlugin[] {
        return [new Bg2LoaderPlugin({
            bg2ioPath: this._bg2ioPath,
            materialImportCallback: this._materialImportCallback
        })];
    }
}