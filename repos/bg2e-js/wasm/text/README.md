# Native paragraph engine for the TypeScript SDK

`Text.cpp`, `TextFont.cpp`, `TextRasterizer.cpp`, the corresponding headers and
`TextUtf8.hpp` were adapted from bg2e-native on 2026-11-16. Their original GPL
notices are retained. The rasterizer and UTF-8 algorithm are unchanged; the
adaptations remove JSON/file I/O from the build, accept font bytes from memory,
and replace engine logging with stderr. `bindings.cpp` is the browser boundary.
The module contains no graphics or scene dependencies.

stb_truetype 1.26 is independently vendored under its MIT option; see
`vendor/README.md` and `vendor/LICENSE.txt`. Font licensing is separate.

## Build

Activate Emscripten **4.0.21**, then run from the repository root:

```sh
npm run build:wasm
```

Alternatively set `EMXX` to an `em++` executable in an activated SDK environment.
The build emits `wasm/assets/bg2text.js` and `bg2text.wasm`. Both artifacts are
committed and included in the npm package: SDK consumers do not need Emscripten.
There is no download during the ordinary SDK build.

## Ownership and execution

The Loader owns immutable font resources; `dispose()` closes their native handles.
Cache eviction/reload retains old snapshots until loader disposal. Do not dispose
an owning loader while its scene is rendering. Faces are opened lazily and native
results are copied to JavaScript before their vectors are destroyed. Calls are
synchronous after initialization; paragraph changes are coalesced at scene-frame
preparation, never generated again for an unchanged text. No worker or shared
memory requirement is introduced.

Keep future native changes synchronized, especially `Text` normalization, the
layout algorithm and the pinned stb revision. Updating only stb is insufficient
to preserve line breaks. This source snapshot is self-contained; it does not read
an adjacent bg2e-native checkout during builds.

## Native reference

`tests/fixtures/text-native-reference.cpp` produces the tutorial reference pixels:

```sh
cd repos/bg2e-js
clang++ -std=c++20 -O2 -Iwasm/text/include -Iwasm/text/vendor \
  wasm/text/Text.cpp wasm/text/TextFont.cpp wasm/text/TextRasterizer.cpp \
  tests/fixtures/text-native-reference.cpp -o /tmp/bg2e-text-reference
/tmp/bg2e-text-reference \
  ../../samples/36_text/public/fonts/didact-gothic/DidactGothic-Regular.ttf \
  /tmp/bg2e-text-reference.rgba
```

The checked-in gzip fixture was generated with Apple clang on ARM64. Native and
WASM floating-point arithmetic can differ slightly: the test allows one coverage
unit at fewer than twenty bytes in the entire 2048×512 RGBA image. The initial
comparison differed at two alpha pixels, each by one unit.
