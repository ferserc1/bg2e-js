import ResourceProvider from "./ResourceProvider";

const g_preventVideoDump: HTMLVideoElement[] = [];

const beginLoadVideo = (video: HTMLVideoElement): void => {
    if (g_preventVideoDump.indexOf(video) === -1) {
        g_preventVideoDump.push(video);
    }
};

const endLoadVideo = (video: HTMLVideoElement): void => {
    const i = g_preventVideoDump.indexOf(video);
    if (i !== -1) {
        g_preventVideoDump.splice(i, 1);
    }
}

const loadVideo = (url: string): Promise<HTMLVideoElement> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        beginLoadVideo(video);
        video.crossOrigin = "";
        video.autoplay = true;
        video.setAttribute("playsinline", "");
        video.addEventListener("canplay", evt => {
            endLoadVideo(evt.target as HTMLVideoElement);
            resolve(evt.target as HTMLVideoElement);
        });
        video.addEventListener("error", evt => {
            endLoadVideo(evt.target as HTMLVideoElement);
            reject(new Error(`Error loading video ${ url }`));
        });
        video.addEventListener("abort", evt => {
            endLoadVideo(evt.target as HTMLVideoElement);
            reject(new Error(`Video load aborted '${ url }'`));
        });
        video.src = url;
    });
}

export default class VideoResourceProvider extends ResourceProvider {
    async load(url: string): Promise<HTMLVideoElement> {
        const video = await loadVideo(url);
        return video;
    }

    async write(url: string, data: any): Promise<void> {
        throw new Error("VideoResourceProvider.write(): not supported");
    }
}
