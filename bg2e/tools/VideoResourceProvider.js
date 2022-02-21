
import ResourceProvider from "./ResourceProvider.js";

const g_preventVideoDump = [];

const beginLoadVideo = (video) => {
    if (g_preventVideoDump.indexOf(video) === -1) {
        g_preventVideoDump.push(video);
    }
};

const endLoadVideo = (video) => {
    const i = g_preventVideoDump.indexOf(video);
    if (i !== -1) {
        g_preventVideoDump.splice(i, 1);
    }
}

const loadVideo = (url) => {
    return new Promise((resolve,reject) => {
        const video = document.createElement("video");
        beginLoadVideo(video);
        video.crossOrigin = "";
        video.autoplay = true;
        video.setAttribute("playsinline", null);
        video.addEventListener("canplay", evt => {
            endLoadVideo(evt.target);
            resolve(evt.target);
        });
        video.addEventListener("error", evt => {
            endLoadVideo(evt.target);
            reject(new Error(`Error loading video ${ url }`));
        });
        video.addEventListener("abort", evt => {
            endLoadVideo(evt.target);
            reject(new Error(`Video load aborted '${ url }'`));
        });
        video.src = url;
    });
}

export default class VideoResourceProvider extends ResourceProvider {
    async load(url) {
        const video = await loadVideo(url);
        return video;
    }

    async write(url,data) {
        throw new Error("VideoResourceProvider.write(): not supported");
    }
}
