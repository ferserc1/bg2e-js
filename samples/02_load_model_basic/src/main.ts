import { db } from "bg2e-js";
import Canvas from "bg2e-js/ts/app/Canvas.js";
import PolyList from "bg2e-js/ts/base/PolyList.ts";
import WebGLRenderer from "bg2e-js/ts/render/webgl/Renderer.js";

 const {
  Loader,
  registerLoaderPlugin,
  Bg2LoaderPlugin,
  ObjLoaderPlugin,
} = db;

registerLoaderPlugin(new Bg2LoaderPlugin({ bg2ioPath: "bg2io/" }));
registerLoaderPlugin(new ObjLoaderPlugin());

// The canvas is mandatory to use the Loader API, but in this example we won't use it to render anything, so we can just create it without adding it to the document
const canvasElem = document.getElementById("mainCanvas") as HTMLCanvasElement;
const canvas = new Canvas(canvasElem, new WebGLRenderer);
await canvas.init();

const loader = new Loader(canvas);

const plist: PolyList[] = await loader.loadPolyList("../resources/sphere.bg2");

plist.forEach(pl => {
    console.log(pl.tangent);
});

console.log(plist);

const drawable = await loader.loadDrawable("../resources/simple_cube.obj");
console.log(drawable)
