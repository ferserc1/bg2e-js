
# bg2-tools

## Miscellaneous

**`generateMD5(inputString)`**: Create a MD5 hash from the input string.

**`generateUUID()`**: Create a random unique univeral identifier string.

```js
import { generateMD5, generateUUID } from 'bg2e/tools/crypto';
...
console.log(generateMD5("Hello World!"));
console.log(generateUUID());
```

## `UserAgent` class

Provides information about the browser's user agent.

```js
import { UserAgent } from 'bg2e/tools/UserAgent';

const userAgent = new UserAgent();
console.log("System:");
console.log(userAgent.system);
console.log("Browser");
console.log(userAgent.browser);
```

**Output:**

```other
System:
{
    Android: false
    Linux: false
    OSName: "OS X"
    Windows: false
    iOS: false
    iPad: false
    iPhone: false
    iPodTouch: false
    OSX: true
    Version: {
        major: 10    
        minor: 15    
        revision: 0    
        stringValue: "10.15.0"
    }
}
Browser:
{
    Chrome: false
    Edge: false
    Explorer: false
    Firefox: true
    IsMobileVersion: false
    Name: "Firefox"
    Opera: false
    Safari: false
    Vendor: "Mozilla Foundation"
    Version: {
        major: 96
        minor: 0
        revision: 0
        versionString: "96.0"
    }
}
```

You can set a custom user agent string in the `UserAgent` class constructor:

```js
...
const myCustomUserAgentString = myGetUserCustomUserAgentString();
const customUA = new UserAgent(myCustomUserAgentString);
```

## Resource load

The `Resource` class provides a method to load resources that are compatible with bg2 engine. For example, bg2 engine can load specific types of images, 3d files and video formats. Using the `Resource` class, you can ensure that the resources that you are loading are compatible with the graphic engine.

The `Resource` class is integrated with other graphic engine tools, such as the 3D model and scene loading utilities. Normally you will not use the `Resource` class directly, but use other higher level tools, but the `Resource` API can be used to support other types of formats through plugins.

```js
import {
    Resource, 
    getValidImageFormats,
    getValidVideoFormats,
    getValidBinaryFormats
} from "bg2e/tools/Resource";
...
const resource = new Resource();

const myImageUrl = getMyImageUrl();
const img = await resource.load(myImageUrl);
document.body.appendChild(img);

...
console.log("Valid image formats: ", getValidImageFormats());
console.log("Valid video formats: ", getValidVideoFormats());
console.log("Valid binary formats: ", getValidBinaryFormats());
```

The return value of the `load()` function will depend on the format of the loaded resource. The file extension in the URL is used to determine the format. Currently it is not possible to determine the format using the mime type.

Depending on the format of the file, the return value will be:

- For images (formats returned by the `getValidImageFormats()` function): javascript `Image` class, which is equivalent to an `<img>` DOM element.
- For videos (formats returned by the `getValidVideoFormats()` function): `<video>` DOM element.
- For binary files (formats returned by the `getValidBinaryFormats()` function): in this case a JavaScript ArrayBuffer object is returned.
- All other cases: an attempt is made to parse the response as JSON:
    * If JSON parsing fails, a string is returned (it is assumed that the response is not JSON).
    * If JSON parsing works, the object generated from the JSON is returned.


