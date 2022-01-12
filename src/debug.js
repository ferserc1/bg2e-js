
import bg from "./index";

console.log(bg.utils.version);
console.log(bg.utils.setupRequestAnimFrame);
if (bg.utils.isBigEndian()) {
    console.log("Is big endian");
}
else {
    console.log("Is little endian");
}

console.log(bg.utils.userAgent.browser);

window.bg = bg;