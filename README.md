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
