
import ResourceProvider, {
    beginVideoLoad,
    endVideoLoad,
    beginImageLoad,
    endImageLoad
} from "./ResourceProvider";

window.s_bg_utils_videoLoaders = window.s_bg_utils_videoLoaders || {};
window.s_bg_utils_videoLoaders["mp4"] = function(url,onSuccess,onFail) {
    const video = document.createElement('video');
    beginVideoLoad(video);
    video.crossOrigin = "";
    video.autoplay = true;
    video.setAttribute("playsinline",null);
    video.addEventListener('canplay',(evt) => {
        endVideoLoad(evt.target);
        onSuccess(evt.target);
    });
    video.addEventListener("error",(evt) => {
        onFail(new Error(`Error loading video: ${url}`));
    });
    video.addEventListener("abort",(evt) => {
        onFail(new Error(`Error loading video: ${url}`));
    });
    video.src = url;
}
window.s_bg_utils_videoLoaders["m4v"] = window.s_bg_utils_videoLoaders["mp4"];

export default class HTTPResourceProvider extends ResourceProvider {
    static AddVideoLoader(type,callback) {
        window.s_bg_utils_videoLoaders[type] = callback;
    }

    static GetVideoLoaderForType(type) {
        return window.s_bg_utils_videoLoaders[type];
    }

    static GetCompatibleVideoFormats() {
        return Object.keys(window.s_bg_utils_videoLoaders);
    }

    static IsVideoCompatible(videoUrl) {
        let ext = Resource.GetExtension(videoUrl);
        return bg.utils.HTTPResourceProvider.GetCompatibleVideoFormats().indexOf(ext)!=-1;
    }

    getRequest(url,onSuccess,onFail,onProgress) {
        var req = new XMLHttpRequest();
        if (!onProgress) {
            onProgress = function(progress) {
                console.log(`Loading ${ progress.file }: ${ progress.loaded / progress.total * 100 } %`);
            }
        }
        req.open("GET",url,true);
        req.addEventListener("load", function() {
            if (req.status===200) {
                onSuccess(req);
            }
            else {
                onFail(new Error(`Error receiving data: ${req.status}, url: ${url}`));
            }
        }, false);
        req.addEventListener("error", function() {
            onFail(new Error(`Cannot make AJAX request. Url: ${url}`));
        }, false);
        req.addEventListener("progress", function(evt) {
            onProgress({ file:url, loaded:evt.loaded, total:evt.total });
        }, false);
        return req;
    }

    loadImage(url,onSuccess,onFail) {
        var img = new Image();
        beginImageLoad(img);
        img.crossOrigin = "";
        img.addEventListener("load",function(event) {
            endImageLoad(event.target);
            onSuccess(event.target);
        });
        img.addEventListener("error",function(event) {
            onFail(new Error(`Error loading image: ${url}`));
        });
        img.addEventListener("abort",function(event) {
            onFail(new Error(`Image load aborted: ${url}`));
        });
        img.src = url + '?' + bg.utils.generateUUID();
    }

    loadVideo(url,onSuccess,onFail) {
        let ext = Resource.GetExtension(url);
        let loader = bg.utils.HTTPResourceProvider.GetVideoLoaderForType(ext);
        if (loader) {
            loader.apply(this,[url,onSuccess,onFail]);
        }
        else {
            onFail(new Error(`Could not find video loader for resource: ${ url }`));
        }
    }
}