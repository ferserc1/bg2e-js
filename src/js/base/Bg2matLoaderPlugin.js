import { LoaderPlugin } from "./Loader";
import Resource from "../utils/Resource";
import Material from "./Material";

export default class Bg2matLoaderPlugin extends LoaderPlugin {
    acceptType(url,data) {
        return Resource.GetExtension(url)=="bg2mat";
    }

    load(context,url,data) {
        return new Promise((resolve,reject) => {
            if (data) {
                try {
                    if (typeof(data)=="string") {
                        data = JSON.parse(data);
                    }
                    let promises = [];
                    let basePath = url.substring(0,url.lastIndexOf('/')+1);

                    data.forEach((matData) => {
                        promises.push(Material.FromMaterialDefinition(context,matData,basePath));
                    });

                    Promise.all(promises)
                        .then((result) => {
                            resolve(result);
                        });
                }
                catch(e) {
                    reject(e);
                }
            }
            else {
                reject(new Error("Error loading material. Data is null."));
            }
        });
    }
}