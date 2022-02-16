import { registerLoaderPlugin, loadPolyList } from "bg2e/db/loaders";
import Bg2LoaderPlugin from "bg2e/db/Bg2LoaderPlugin";

// bg2ioPath is the path from the html file to the distribution files of the bg2io library, if
// this path is different from the compiled js file (generated from this file, in this case, 
// using Rollup)
registerLoaderPlugin(new Bg2LoaderPlugin({ bg2ioPath: "dist/" }));

const plist = await loadPolyList("../resources/sphere.bg2");

plist.forEach(pl => {
    console.log(pl.tangent);
});

console.log(plist);
