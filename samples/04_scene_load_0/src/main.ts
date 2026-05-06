import { db, scene } from "bg2e-js";
import Canvas from "bg2e-js/ts/app/Canvas.ts";
import Loader, { registerLoaderPlugin } from "bg2e-js/ts/db/Loader.ts";
import VitscnjLoaderPlugin from "bg2e-js/ts/db/VitscnjLoaderPlugin.ts";
import { registerComponents } from "bg2e-js/ts/scene/index.ts";
import DrawableComponent from "bg2e-js/ts/scene/Drawable.ts";
import WebGLRenderer from "bg2e-js/ts/render/webgl/Renderer.ts";

// TODO: by now, the scene loading without a valid canvas does not work. This example don't work by now because of that.
// We need to fix that in the future.

// bg2ioPath is the path from the html file to the distribution files of the bg2io library, if
// this path is different from the compiled js file (generated from this file, in this case, 
// using Rollup)
registerLoaderPlugin(new VitscnjLoaderPlugin({ bg2ioPath: "bg2io/" }));

registerComponents();

// The canvas is mandatory to use the Loader API, but in this example we won't use it to render anything, so we can just create it without adding it to the document
const canvasElem = document.getElementById("mainCanvas") as HTMLCanvasElement;
const canvas = new Canvas(canvasElem, new WebGLRenderer);
await canvas.init();

const loader = new Loader();

try {
	
	const drawable = await loader.loadDrawable("./resources/cubes.bg2");
	if (drawable instanceof DrawableComponent) {
		console.log(`Drawable node loaded: ${ drawable.name }`);
		console.log(drawable);
	}
	
	
	const prefab = await loader.loadNode("./resources/cubes.bg2");
	console.log(prefab);
	
	
	const sceneRoot = await loader.loadNode("./resources/test-scene/test-scene.vitscnj");
	console.log(sceneRoot);
}
catch (err) {
	console.error(err);
}
