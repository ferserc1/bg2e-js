
import { LoaderPlugin } from "./Loader";

export default class VideoTextureLoaderPlugin extends LoaderPlugin {
    acceptType(url,data) {
        return bg.utils.Resource.IsVideo(url);
    }

    load(context,url,video) {
        return new Promise((accept,reject) => {
            if (video) {
                let texture = new bg.base.Texture(context);
                texture.create();
                texture.bind();
                texture.setVideo(video);
                texture.fileName = url;
                accept(texture);
            }
            else {
                reject(new Error("Error loading video texture data"));
            }
        });
    }
}