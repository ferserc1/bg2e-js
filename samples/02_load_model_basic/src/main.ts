import { db } from "bg2e-js";
import PolyList from "bg2e-js/src/base/PolyList";

 const {
  Loader,
  registerLoaderPlugin,
  Bg2LoaderPlugin,
  ObjLoaderPlugin,
} = db;

// bg2ioPath is the path from the html file to the distribution files of the bg2io library, if
// this path is different from the compiled js file (generated from this file, in this case, 
// using Rollup)
registerLoaderPlugin(new Bg2LoaderPlugin({ bg2ioPath: "dist/" }));
registerLoaderPlugin(new ObjLoaderPlugin());

const loader = new Loader();

const plist: PolyList[] = await loader.loadPolyList("../resources/sphere.bg2");

plist.forEach(pl => {
    console.log(pl.tangent);
});

console.log(plist);

const drawable = await loader.loadDrawable("../resources/simple_cube.obj");
console.log(drawable)
