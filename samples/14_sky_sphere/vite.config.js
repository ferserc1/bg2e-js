import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// Configured to be used in this workspace structure
const bg2ioPath = '../../node_modules/bg2io/';

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
        {
            src: "../resources/**",
            dest: "resources"
        }
      ]
    })
  ],
  assetsInclude: ["**/*.glsl"]

});
