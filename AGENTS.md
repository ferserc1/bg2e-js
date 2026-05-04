# BG2E-JS — Agent Instructions

## Monorepo layout

- **`repos/bg2e-js/`** — Core library. Built with Vite to `dist/bg2e-js.js`. Run: `npm run build`
- **`samples/<N>_<name>/`** — Vite-based example apps. Run: `npm run dev:<name>` (e.g. `dev:app`, `dev:react`)
- **`doc/`** — Module-level docs (app, base, db, math, physics, render, tools)

## Key facts

- **Workspaces:** npm workspaces (`repos/*`, `samples/*`). No turbo despite `.turbo/` cache dir.
- **Build:** Root `npm run build` delegates to `repos/bg2e-js`. Samples have their own `vite dev|build` scripts.
- **GLSL:** Both core library and samples treat `.glsl` as text via Vite optimizeDeps.
- **bg2io WASM:** The engine depends on `bg2io` (WASM-based model loader). Samples use `vite-plugin-static-copy` to copy `bg2io.js` and `bg2io.wasm` into the dist folder. Production bundlers must also copy these files — see README for Rollup/Vite config examples.
- **No test/lint infrastructure yet.** Only `@types/node` as a dev dependency.
