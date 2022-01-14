

import Resource from "../utils/Resource";

export class LoaderPlugin {            
    acceptType(url,data) { return false; }

    async load(context,url,data) {
        return new Error("Not implemented");
    }
    
}

window.s_bg_base_loaderPlugins = window.s_bg_base_loaderPlugins || [];

function loadUrl(context,url,onProgress = null,extraData = null) {
    return new Promise((accept,reject) => {
        Resource.Load(url,onProgress)
            .then(function(data) {
                return Loader.LoadData(context,url,data,extraData);
            })
            
            .then((result,extendedData) => {
                accept(result,extendedData);
            })
            
            .catch(function(err) {
                reject(err);
            });
    });
}

function loadUrlArray(context,url,onProgress = null,extraData = null) {
    return new Promise((accept,reject) => {
        Resource.LoadMultiple(url,onProgress)
            .then((result) => {
                let promises = [];

                for (let itemUrl in result) {
                    let data = result[itemUrl];
                    promises.push(loadData(context,itemUrl,data,extraData));
                }

                return Promise.all(promises);
            })
            .then((loadedResults) => {
                let resolvedData = {}
                url.forEach((itemUrl,index) => {
                    resolvedData[itemUrl] = loadedResults[index];
                })
                accept(resolvedData);
            })
            .catch((err) => {
                reject(err);
            })
    })
}

function loadData(context,url,data,extraData = null) {
    return new Promise((accept,reject) => {
        let selectedPlugin = null;
        s_loaderPlugins.some((plugin) => {
            if (plugin.acceptType(url,data)) {
                selectedPlugin = plugin;
                return true;
            }
        })
        
        if (selectedPlugin) {
            if (!extraData) {
                extraData = {};
            }
            accept(selectedPlugin.load(context,url,data,extraData));
        }
        else {
            return reject(new Error("No suitable plugin found for load " + url));
        }
    });
}

export default class Loader {
    static RegisterPlugin(p) { window.s_bg_base_loaderPlugins.push(p); }
    
    static Load(context,url,onProgress = null,extraData = null) {
        if (Array.isArray(url)) {
            return loadUrlArray(context,url,onProgress,extraData);
        }
        else {
            return loadUrl(context,url,onProgress,extraData);
        }
    }
    
    static LoadData(context,url,data,extraData = null) {
        return loadData(context,url,data,extraData);
    }
}
