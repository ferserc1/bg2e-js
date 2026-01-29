import { db, scene } from "bg2e-js";

const {
	Loader,
	VitscnjLoaderPlugin,
	registerLoaderPlugin
} = db;

const {
	registerComponents,
	DrawableComponent
} = scene;

// TODO: by now, the scene loading without a valid canvas does not work. This example don't work by now because of that.
// We need to fix that in the future.

// bg2ioPath is the path from the html file to the distribution files of the bg2io library, if
// this path is different from the compiled js file (generated from this file, in this case, 
// using Rollup)
registerLoaderPlugin(new VitscnjLoaderPlugin({ bg2ioPath: "dist/" }));

registerComponents();

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
