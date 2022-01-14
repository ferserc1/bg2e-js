
import HTTPResourceProvider from "./HTTPResourceProvider";

let g_resourceProvider = new HTTPResourceProvider();

export const IMG_LOAD_EVENT_NAME = "bg2e:image-load";

export const emitImageLoadEvent = (img) => {
    const event = new CustomEvent(IMG_LOAD_EVENT_NAME, { image: img });
    document.dispatchEvent(event);
}

export const bindImageLoadEvent = (callback) => {
    return document.addEventListener(IMG_LOAD_EVENT_NAME, callback);
}

export const requireGlobal = (src) => {
    const s = document.createElement('script');
    s.src = src;
    s.type = "text/javascript";
    s.async = false;
    document.getElementsByTagName('head')[0].appendChild(s);
}

export default class Resource {
    static SetResourceProvider(provider) {
        g_resourceProvider = provider;
    }

    static GetResourceProvider() {
        return g_resourceProvider;
    }

    static GetExtension(url) {
        let match = /\.([a-z0-9-_]*)(\?.*)?(\#.*)?$/i.exec(url);
        return (match && match[1].toLowerCase()) || "";
    }
    
    static JoinUrl(url,path) {
        if (url.length==0) return path;
        if (path.length==0) return url;
        return /\/$/.test(url) ? url + path : url + "/" + path;
    }
    
    static IsFormat(url,formats) {
        return formats.find(function(fmt) {
                return fmt==this;
            },Resource.GetExtension(url))!=null;
    }
    
    static IsImage(url) {
        return Resource.IsFormat(url,["jpg","jpeg","gif","png"]);
    }
    
    static IsBinary(url,binaryFormats = ["vwglb","bg2"]) {
        return Resource.IsFormat(url,binaryFormats);
    }

    static IsVideo(url,videoFormats = ["mp4","m4v","ogg","ogv","m3u8","webm"]) {
        return Resource.IsFormat(url,videoFormats);
    }
    
    static LoadMultiple(urlArray,onProgress) {
        let progressFiles = {}

        let progressFunc = function(progress) {
            progressFiles[progress.file] = progress;
            let total = 0;
            let loaded = 0;
            for (let key in progressFiles) {
                let file = progressFiles[key];
                total += file.total;
                loaded += file.loaded;
            }
            if (onProgress) {
                onProgress({ fileList:urlArray, total:total, loaded:loaded });
            }
            else {
                console.log(`Loading ${ Object.keys(progressFiles).length } files: ${ loaded / total * 100}% completed`);
            }
        }

        let resources = [];
        urlArray.forEach(function(url) {
            resources.push(Resource.Load(url,progressFunc));
        });

        let resolvingPromises = resources.map(function(promise) {
            return new Promise(function(resolve) {
                let payload = new Array(2);
                promise.then(function(result) {
                    payload[0] = result;
                })
                .catch(function(error) {
                    payload[1] = error;
                })
                .then(function() {
                    resolve(payload);
                });
            });
        });

        let errors = [];
        let results = [];

        return Promise.all(resolvingPromises)
            .then(function(loadedData) {
                let result = {};
                urlArray.forEach(function(url,index) {
                    let pl = loadedData[index];
                    result[url] = pl[1] ? null : pl[0];
                });
                return result;
            });
    }
    
    static Load(url,onProgress) {
        let loader = null;
        switch (true) {
            case url.constructor===Array:
                loader = Resource.LoadMultiple;
                break;
            case Resource.IsImage(url):
                loader = Resource.LoadImage;
                break;
            case Resource.IsBinary(url):
                loader = Resource.LoadBinary;
                break;
            case Resource.IsVideo(url):
                loader = Resource.LoadVideo;
                break;
            case Resource.GetExtension(url)=='json':
                loader = Resource.LoadJson;
                break;
            default:
                loader = Resource.LoadText;
        }
        return loader(url,onProgress);
    }
    
    static LoadText(url,onProgress) {
        return new Promise(function(resolve,reject) {
            g_resourceProvider.getRequest(url,
                function(req) {
                    resolve(req.responseText);
                },
                function(error) {
                    reject(error);
                },onProgress).send();
        });
    }

    static LoadVideo(url,onProgress) {
        return new Promise(function(resolve,reject) {
            g_resourceProvider.loadVideo(
                url,
                (target) => {
                    resolve(target);
                    emitImageLoadEvent(target);
                },
                (err) => {
                    reject(err);
                }
            );
        });
    }
    
    static LoadBinary(url,onProgress) {
        return new Promise(function(resolve,reject) {
            var req = g_resourceProvider.getRequest(url,
                    function(req) {
                        resolve(req.response);
                    },
                    function(error) {
                        reject(error);
                    },onProgress);
            req.responseType = "arraybuffer";
            req.send();
        });
    }
    
    static LoadImage(url) {
        return new Promise(function(resolve,reject) {
            g_resourceProvider.loadImage(
                url,
                (target) => {
                    resolve(target);
                    emitImageLoadEvent(target);
                },
                (err) => {
                    reject(err);
                }
            );
        });
    }
    
    static LoadJson(url) {
        return new Promise(function(resolve,reject) {
            g_resourceProvider.getRequest(url,
                function(req) {
                    try {
                        resolve(JSON.parse(req.responseText));
                    }
                    catch(e) {
                        reject(new Error("Error parsing JSON data"));
                    }
                },
                function(error) {
                    reject(error);
                }).send();
        });
    }
}