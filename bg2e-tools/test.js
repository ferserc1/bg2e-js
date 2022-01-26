import { generateMD5, generateUUID } from "./src/js/crypto.js";
import UserAgent from "./src/js/UserAgent.js";
import Resource, { 
    isFormat, 
    addImageFormats, 
    addVideoFormats,
    addBinaryFormats,
    getValidImageFormats,
    getValidVideoFormats,
    getValidBinaryFormats
} from "./src/js/Resource.js";

console.log(generateMD5("Hello, World!"));
console.log(generateUUID());
console.log(generateMD5("Hola Mundo!"));
console.log(generateMD5("Hello, World!"));

const userAgent = new UserAgent();
console.log(userAgent.browser);
console.log(userAgent.system);

console.log(isFormat("http://www.pepe.com/image.jpg",["jpg","jpeg","tif","png"]));

window.isFormat = isFormat;

const resource = new Resource();
const data = await resource.load("../resources/data-load.json");
console.log(data);
const text = await resource.load("../resources/test-data.txt");
console.log(text);
try {
    const notFound = await resource.load("pepe.txt");

}
catch (e) {
    console.log("Exception catched: " + e.message);
}

const binaryFile = await resource.load("../resources/sphere.bg2");
console.log(binaryFile);

addImageFormats("bmp");
addImageFormats(["tga","tiff"]);
console.log(getValidImageFormats());

console.log(getValidVideoFormats());
addVideoFormats("m3u8");
console.log(getValidVideoFormats());


console.log(getValidBinaryFormats());
addBinaryFormats(["dat","fbx"]);
console.log(getValidBinaryFormats());

const testImage = await resource.load("../resources/logo.png");
console.log(testImage);
const imgContainer = document.createElement("div");
imgContainer.appendChild(testImage);
document.body.appendChild(imgContainer);



