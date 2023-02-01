import Loader, { registerLoaderPlugin } from "bg2e/db/Loader";
import VitscnjLoaderPlugin from "bg2e/db/VitscnjLoaderPlugin";
import { registerComponents } from "bg2e/scene";
import Drawable from "bg2e/scene/Drawable";


// bg2ioPath is the path from the html file to the distribution files of the bg2io library, if
// this path is different from the compiled js file (generated from this file, in this case, 
// using Rollup)
registerLoaderPlugin(new VitscnjLoaderPlugin({ bg2ioPath: "dist/" }));

registerComponents();

const loader = new Loader();

const drawable = await loader.loadDrawable("../resources/cubes.bg2");
if (drawable instanceof Drawable) {
    console.log(`Drawable node loaded: ${ drawable.name }`);
    console.log(drawable);
}


const prefab = await loader.loadNode("../resources/cubes.bg2");
console.log(prefab);


const scene = await loader.loadNode("../resources/test-scene/test-scene.vitscnj");
console.log(scene);
