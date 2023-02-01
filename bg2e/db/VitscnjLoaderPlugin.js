import Resource, { removeFileName, ResourceType } from "../tools/Resource";
import LoaderPlugin from "./LoaderPlugin";
import Node from "../scene/Node";
import { deserializeComponent } from "../scene/Component";
import Bg2LoaderPlugin from "./Bg2LoaderPlugin";

const deserializeNode = async (nodeData, loader) => {
    nodeData.children = nodeData.children || [];
    nodeData.components = nodeData.components || [];

    const node = new Node(nodeData.name);
    node.enabled = nodeData.enabled !== undefined ? nodeData.enabled : true;
    node.steady = nodeData.steady !== undefined ? nodeData.steady : false;

    for (const componentData of nodeData.components) {
        try {
            const component = await deserializeComponent(componentData, loader);
            node.addComponent(component);
        }
        catch (err) {
            console.warn(`Deserialization of node with name "${node.name}": ${err.message}`);
        }
    }

    for (const childData of nodeData.children) {
        const child = await deserializeNode(childData, loader);
        node.addChild(child);
    }

    return node;
}

export default class VitscnjLoaderPlugin extends LoaderPlugin {
    constructor({ bg2ioPath = null }) {
        super();

        this._bg2ioPath = bg2ioPath;
    }

    get supportedExtensions() { return ["vitscnj"]; }

    get resourceTypes() {
        return [
            ResourceType.Node
        ];
    }

    async load(path,resourceType,loader) {
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

    get dependencies() {
        return [new Bg2LoaderPlugin({ bg2ioPath: this._bg2ioPath })];
    }
}