import Loader, { registerLoaderPlugin } from "bg2e/db/Loader.js";
import Writer, { registerWriterPlugin } from "bg2e/db/Writer.js";
import Bg2LoaderPlugin from "bg2e/db/Bg2LoaderPlugin.js";
import ObjWriterPlugin from "bg2e/db/ObjWriterPlugin.js";

registerLoaderPlugin(new Bg2LoaderPlugin({ bg2ioPath: "node_modules/bg2e/node_modules/bg2io/" }));

const loader = new Loader();
const drawable = await loader.loadDrawable("../resources/sphere.bg2");

console.log(drawable);

