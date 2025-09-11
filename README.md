# Business Grade Graphic Engine - JavaScript API

## About

This library is the WebGL/JavaScript counterpart of the bg2 engine C++ API. This library provides an API to
load scenes and models created with the bg2 Composer tool.

This project is currently a draft, and the authors recommends not to use it because it may be unstable.

More info at the main [bg2 engine website](http://www.bg2engine.com)

## Structure

The repository contains directories with bg2 engine base packages, which can be compiled independently to generate npm packages. But it is also possible to use this same repository as uncompiled source code, e.g. for Electron applications.

## License

bg2e is distributed under a MIT license: you can use it for free, for any purpose, in all the universe (and also in other parallel universes, if they exists), with only two conditions: you can't claim that this work is yours (for example, fork this repository and change my name by yours), and you use this library as is (you can't sue me if this software does something wrong). You can see the full license [here](LICENSE.md)

## Note about distribution

Bg2 engine uses the bg2io library for loading native 3D models. It is a library generated from the native C language version, which uses WebAssembly. This library is loaded asynchronously when you need to use it, and therefore you need to distribute it together with the compiled bg2 engine code in your final application. You can import the JavaScript files from the library in the normal way, as ES6 modules, and use Webpack, Rollup or any other building system to distribute your application, but in addition to that you will have to add a file copy phase to distribute the `bg2io.js` and `bg2io.wasm` files. Below you can see an example of a Rollup configuration file (you can see it in the `examples` directory)

**Example: using rollup:**

```js
import { nodeResolve } from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';

export default [
    {
        input: './example.js',

        watch: {
            include: './**',
            cleanScreen: false
        },

        output: {
            file: './dist/example.js',
            format: 'es',
            sourcemap: 'inline'
        },

        plugins: [
            nodeResolve(),
            copy({
                targets:[
                    // WASM bg2 file loader
                    { src: 'node_modules/bg2e/node_modules/bg2io/bg2io.js', dest: './dist/' },
                    { src: 'node_modules/bg2e/node_modules/bg2io/bg2io.wasm', dest: './dist/' }
                ]
            })
        ]
    }
];

```

**Example: using vite:**

`vite.config.js``

```js
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// Default path in node_modules when bg2e is installed as a package
// bg2io is a dependency of bg2e, so it is inside bg2e/node_modules
const bg2ioPath = './node_modules/bg2io/';

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: `${bg2ioPath}/bg2io.js`,
          dest: 'dist'
        },
        {
          src: `${bg2ioPath}/bg2io.wasm`,
          dest: 'dist'
        },

        // Copy other resources, like models and textures...
        {
            src: "../resources/**",
            dest: "resources"
        }
      ]
    })
  ]
});
```

## Run examples

The monorepo uses turborepo to manage the packages. Simply install the dependencies and run the examples using the following npm scripts:

```bash
$ npm install
$ APP=<example_name> npm run dev:app
```

Where `<example_name>` is the name of the example you want to run:

- `00_math`
- `01_tools`
- `02_load_model_basic`
- `03_base`
- `04_scene_load_0`
- `05_ap`
- `06_present_texture`
- `07_webgl`
- `08_merge_textures`
- `10_render_state_basic`
- `11_webgl_shader_utils`
- `12_render_to_texture`
- `13_render_to_cubemap`
- `14_sky_sphere`
- `15_sky_cube`
- `16_env_renderer`
- `17_pbr_basic`
- `18_pbr_ibl`
- `19_render_queue`
- `20_scene_renderer`
- `21_scene_app_controller`
- `22_scene_load_1`
- `23_selection`
- `24_canvas_texture`
- `25_debug`
