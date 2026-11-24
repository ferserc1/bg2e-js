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

import { removeFileName, ResourceType } from "../tools/Resource";
import TextResourceProvider from "../tools/TextResourceProvider";
import LoaderPlugin from "./LoaderPlugin";
import Node from "../scene/Node";
import { deserializeComponent } from "../scene/Component";
import { isJsonObject } from "../scene/SceneData";
import Bg2LoaderPlugin, { type MaterialImportCallback } from "./Bg2LoaderPlugin";
import Loader from "./Loader";

import TextFontLoaderPlugin from "./TextFontLoaderPlugin";
import { prepareTextResources } from "../scene/TextResources";

function readNodeArray(node: Record<string, unknown>, key: "children" | "components", name: string): unknown[] {
    const value = node[key];
    if (Array.isArray(value)) return value;
    if (value !== undefined) console.warn(`Ignoring invalid ${key} in node "${name}"`);
    return [];
}

const deserializeNode = async (nodeData: Record<string, unknown>, loader: Loader): Promise<Node> => {
    const node = new Node(typeof nodeData.name === "string" ? nodeData.name : undefined);
    if (typeof nodeData.enabled === "boolean") node.enabled = nodeData.enabled;
    if (typeof nodeData.steady === "boolean") node.steady = nodeData.steady;

    for (const [index, componentData] of readNodeArray(nodeData, "components", node.name).entries()) {
        try {
            const component = await deserializeComponent(componentData, loader, node);
            if (component) {
                const previous = node.component(component.typeId);
                node.addComponent(component);
                previous?.destroy();
            }
        }
        catch (error) {
            console.warn(`Skipping component at index ${index} in node "${node.name}":`, error);
        }
    }

    for (const [index, childData] of readNodeArray(nodeData, "children", node.name).entries()) {
        if (isJsonObject(childData)) {
            node.addChild(await deserializeNode(childData, loader));
        }
        else {
            console.warn(`Skipping invalid child at index ${index} in node "${node.name}"`);
        }
    }

    return node;
}

export default class VitscnjLoaderPlugin extends LoaderPlugin {
    private _bg2ioPath: string | null;
    private _materialImportCallback?: MaterialImportCallback;

    constructor({
        bg2ioPath = null,
        materialImportCallback
    }: {
        bg2ioPath?: string | null
        materialImportCallback?: MaterialImportCallback
    } = { }) {
        super();

        this._bg2ioPath = bg2ioPath;
        this._materialImportCallback = materialImportCallback;
    }

    get supportedExtensions(): string[] { return ["vitscnj", "json"]; }

    get resourceTypes(): ResourceType[] {
        return [
            ResourceType.Node
        ];
    }

    async load(path: string, resourceType: ResourceType, loader: Loader): Promise<Node> {
        if (resourceType !== ResourceType.Node) {
            throw new Error(`VitscnjLoaderPlugin.load() unexpected resource type received: ${resourceType}`);
        }

        const data: unknown = await new TextResourceProvider().load(path);
        if (!isJsonObject(data) || !Array.isArray(data.scene)) {
            throw new Error("Scene document requires an object containing a scene array");
        }
        if ("fileType" in data && data.fileType !== "bg2e::scene") {
            throw new Error("Unsupported scene document type");
        }
        const nodes = data.scene.map((nodeData: unknown, index: number) => {
            if (!isJsonObject(nodeData)) {
                throw new Error(`Invalid top-level scene node at index ${index}`);
            }
            return nodeData;
        });
        const sceneLoader = loader.withSceneBasePath(removeFileName(path));
        const root = new Node("Scene Root", sceneLoader.drawableCache);
        for (const nodeData of nodes) {
            root.addChild(await deserializeNode(nodeData, sceneLoader));
        }

        // Font declarations already include their scene directory.
        await prepareTextResources(root, loader.withBasePath(""));
        return root;
    }

    get dependencies(): LoaderPlugin[] {
        return [new TextFontLoaderPlugin(), new Bg2LoaderPlugin({
            bg2ioPath: this._bg2ioPath,
            materialImportCallback: this._materialImportCallback
        })];
    }
}
