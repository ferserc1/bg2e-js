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
