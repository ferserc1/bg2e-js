window.s_bg_utils_preventImageDump = window.s_bg_utils_preventImageDump || [];
window.s_bg_utils_preventVideoDump = window.s_bg_utils_preventVideoDump || [];

export const beginImageLoad = (img) => {
    window.s_bg_utils_preventImageDump.push(img);
}

export const endImageLoad = (img) => {
    const index = window.s_bg_utils_preventImageDump.indexOf(img);
    if (index !== -1) {
        window.s_bg_utils_preventImageDump.splice(index, 1);
    }
}

export const beginVideoLoad = (video) => {
    window.s_bg_utils_preventVideoDump.push(video);
}

export const endVideoLoad = (video) => {
    const index = window.s_bg_utils_preventVideoDump.indexOf(video);
    if (index !== -1) {
        window.s_bg_utils_preventVideoDump.splice(index, 1);
    }
}

export default class ResourceProvider {
    getRequest(url,onSuccess,onFail,onProgress) {}
    loadImage(url,onSucces,onFail) {}
    loadVideo(url,onSuccess,onFail) {}
}

