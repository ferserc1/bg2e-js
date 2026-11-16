# Editable text tutorial

Run from the monorepo root:

```sh
npm run dev:text
```

Or build with `npm --prefix samples/36_text run build` and serve the resulting
`dist/` directory. The build helper supplies the committed WASM artifacts, so no
Emscripten setup or WASM URL configuration is necessary to run this example.

This adapts bg2e-native's `doc/tutorials/text/README.md`: the same canonical Didact
Gothic file, Hello World, 1024×256 logical paragraph, 2048×512 bitmap, margins 24,
font height 160, centered alignment and world height 1.4. The text faces upward
above a gray 10×8 floor, with a directional glyph shadow. The browser example
places the text at (0,2.2,0) and views it from (0,8,4.5), aiming at (0,1.1,1.1)
to show the text more frontally and center the text/shadow pair in the viewport.
The TypeScript renderer uses its existing shadow maps and default procedural
environment rather than native deferred/ray-query rendering.

## 1. Declare the font on the scene root

The example builds the scene through the SDK API; it does not load a scene file.
All SDK imports use `bg2e-js/ts/...`, resolving the local workspace package.

```ts
registerLoaderPlugin(new TextFontLoaderPlugin());
const loader = new Loader();
const root = new Node('Text tutorial');
const fontDirectory = `${import.meta.env.BASE_URL}fonts/didact-gothic`;
const fonts = new TextFontComponent();
fonts.setDeclarations([{
    identifier: 'tutorial',
    path: `${fontDirectory}/DidactGothic-Regular.ttf`,
    faceIndex: 0,
    notices: [`${fontDirectory}/OFL.txt`, `${fontDirectory}/README.md`]
}]);
root.addComponent(fonts);
```

The identifier belongs to the scene, not to the operating system. The component
holds the declarations; actual loading is performed at the preparation boundary
in step 3. The Loader supplies the WASM location automatically.

## 2. Create the text component, node and transform

```ts
const text = new TextComponent();
text.text.setParameters({
    content: 'Hello World',
    fontIdentifier: 'tutorial',
    fontSize: 160,
    paragraphSize: { width: 1024, height: 256 },
    bitmapResolution: { width: 2048, height: 512 },
    margins: { left: 24, top: 24, right: 24, bottom: 24 },
    alignment: 'center',
    verticalAlignment: 'center'
});
text.setHeight(1.4);
text.material.albedo = new Color([.07, .28, .8, 1]);
text.material.metalness = 0;
text.material.roughness = .9;
text.material.unlit = false;
text.material.alphaCutoff = .1;

const textNode = new Node('Editable text');
textNode.addComponent(new Transform(
    Mat4.MakeRotation(-Math.PI / 2, 1, 0, 0).setPosition(0, 2.2, 0)
));
textNode.addComponent(text);
root.addChild(textNode);
```

TextComponent owns the quad and generated texture. Its default double-sided
quad faces local +Z; the rotation points the readable front upward above the
floor. Set the position after rotating: in this SDK, `rotate()` rotates an
existing translation too, which would otherwise put the text in the floor plane.
Logical layout, bitmap sampling and world height remain independent. The camera's
focus distance matches its target, keeping the shadow-map coverage centered on
the same part of the scene.

## 3. Load fonts and prepare the text

After creating the camera, floor and directional light, prepare the complete tree:

```ts
await prepareTextResources(root, loader);
return root;
```

This loads the declared font, resolves `tutorial` and generates the text mask
before the renderer binds the scene. Retain the loader while using the scene.
The complete implementation, including package imports, is in
[`src/main.ts`](src/main.ts).

The textarea changes `text.text.content` and requests a frame; SceneRenderer
prepares the changed mask before its next traversal. Empty content removes text
and shadow; the retry button explicitly reloads font resources.

The original fixed paragraph box is retained, so long/multiline content may clip.
Changing bitmap resolution alone does not create more layout room. Font and
provenance/license files are included in `public/fonts/didact-gothic/`.

The native paragraph/raster code and pinned stb version are used directly through
WASM. No Canvas font rasterization or system-font fallback is involved.
