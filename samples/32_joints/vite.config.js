import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { copyBg2eAssets } from 'bg2e-js/ts/bg2e-vite.js';

export default defineConfig({
  plugins: [
    copyBg2eAssets({ nodeModulesPath: "../../node_modules" }),
    viteStaticCopy({
      targets: [
        {
            src: "../resources/**",
            dest: "resources"
        }
      ]
    })
  ],
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".glsl": "text",
      },
    },
  },
  assetsInclude: ["**/*.glsl"]

});
