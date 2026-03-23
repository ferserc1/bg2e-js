import type { PluginOption } from "vite";

export interface CopyBg2eAssetsOptions {
    nodeModulesPath?: string;
    dstSubdir?: string;
}

export declare function copyBg2eAssets(options?: CopyBg2eAssetsOptions): PluginOption;
