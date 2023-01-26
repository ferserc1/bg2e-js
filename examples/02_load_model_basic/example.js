import Loader, { registerLoaderPlugin } from "bg2e/db/Loader";
import Bg2LoaderPlugin from "bg2e/db/Bg2LoaderPlugin";
import ObjLoaderPlugin from "bg2e/db/ObjLoaderPlugin";

// bg2ioPath is the path from the html file to the distribution files of the bg2io library, if
// this path is different from the compiled js file (generated from this file, in this case, 
// using Rollup)
registerLoaderPlugin(new Bg2LoaderPlugin({ bg2ioPath: "dist/" }));
registerLoaderPlugin(new ObjLoaderPlugin());

const loader = new Loader();

const plist = await loader.loadPolyList("../resources/sphere.bg2");

plist.forEach(pl => {
    console.log(pl.tangent);
});

console.log(plist);

const drawable = await loader.loadDrawable("../resources/simple_cube.obj");
console.log(drawable)
