# Editable scene text

The SDK reads native `TextFonts` and `Text` JSON components. Fonts are loaded by
`TextFontLoaderPlugin` through `ResourceType.TextFont`; supported extensions are
TTF, OTF, TTC and OTC to the extent supported by the native stb backend. WOFF and
WOFF2 are not supported. Rendering uses the pinned native stb_truetype and native
paragraph layout compiled to WASM, not browser font fallback or Canvas text.

## Loading

```ts
registerComponents();
registerLoaderPlugin(new VitscnjLoaderPlugin());
const loader = new Loader(canvas);
const root = await loader.loadNode('/scenes/example.json');
```

The scene loader prepares all declarations before text realization, regardless of
node order. Identifiers are scene-wide; duplicates across collections disable the
identifier. Relative font and notice URLs resolve against the scene document.
The main scene renderer also prepares text before binding and each frame, so
programmatic edits and declarations added later are supported.

For a programmatic scene, register `new TextFontLoaderPlugin()` and call
`await prepareTextResources(root, loader)` before binding it. Custom render loops
must call this preparation boundary before drawing. `TextComponent.text.content`
is a CPU edit; request a frame with your main loop after changing it. Call
`reloadTextFonts(root)` to retry font failures and `text.retryResources()` to retry
a text realization failure. Failed fonts/text remain unavailable until an explicit
retry or a relevant change; other scene components remain usable.

`text.text.setParameters({...})` replaces paragraph parameters atomically. The
logical paragraph size controls wrapping; `bitmapResolution` controls sampling;
`setHeight()` and `setSize()` control world size. Text lies in local XY, with
readable front +Z and top-left UV origin. Default pivot is the center. Empty or
whitespace-only text contributes no draw or shadow calls.

The generated texture is white with alpha coverage. Use `text.material.albedo`
for color and the ordinary material properties for lighting. The default cutoff
is 0.1 and the quad is double-sided. Native `isUnlit`, `doubleSided` and albedo
sampling settings are imported. Clamp-to-border sampling maps to clamp-to-edge in
WebGL. The mask is recreated on load, never exported as a model or image.

Text and font components implement representation serialization; URL references
are retained. Complete scene asset packaging/copying is not implemented by these
components (the SDK's existing general scene writer is also incomplete). Preserve
font files and their license/provenance notices when distributing scenes.

Clones own independent paragraph, material and geometry data, sharing immutable
fonts through the scene registry. Keep the loader alive while using its fonts;
call `loader.dispose()` after releasing the scene. Cache-cleared font snapshots
remain owned until loader disposal.

## WASM deployment

```js
// vite.config.js
import { copyBg2eAssets } from 'bg2e-js/vite';
export default { plugins: [copyBg2eAssets()] };
```

This serves/copies bg2io and bg2text JavaScript/WASM to `bg2io/`, the backwards
compatible default folder, in development and production. No loader configuration
is needed for an application served from its root or a Vite base subdirectory.
Relative runtime defaults resolve against the document base URL; history-routed
applications should establish an HTML base URL or configure an absolute path.

```ts
const loader = new Loader(canvas, { wasmBaseUrl: '/assets/wasm/' });
// Or set loader.wasm.baseUrl before the first load.
```

Match a customized folder with `copyBg2eAssets({ dstSubdir: 'assets/wasm' })`.
Legacy `bg2ioPath` overrides still work. `bg2eWasmAssets()` exposes the artifact
manifest for other bundlers; extra modules can be passed as
`artifacts: [{name, source}]` to the Vite helper. Artifact names must be unique.
The build helper requires only the installed packages, not a root node_modules
layout override, though the existing `nodeModulesPath` option is preserved.

Future plugins initialize through:

```ts
await loader.wasm.load('feature', async resolve => {
    const { default: create } = await import(/* @vite-ignore */
        new URL(resolve('feature.js'), document.baseURI).href);
    return create({ locateFile: resolve });
});
```

Initialization promises are shared per loader/module/location. Legacy classic
script factories can use `loader.wasm.loadScriptFactory(file, globalSymbol)`.

## Limits

Matches the native simple left-to-right scalar layout, including kerning,
explicit line breaks, tab expansion, word/character wrap and clip/hide overflow.
There is no shaping/bidi, automatic font fallback, rich text or SDF/MSDF support.
Fonts must be trusted project assets; WASM isolation does not make stb a font
validator. Scene edits should run on the application thread, outside drawing.

See `samples/36_text`: `npm run dev:text`.
