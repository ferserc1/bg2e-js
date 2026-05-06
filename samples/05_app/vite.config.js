import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { copyBg2eAssets } from 'bg2e-js/ts/bg2e-vite.js';

export default defineConfig({
  assetsInclude: ["**/*.glsl"],
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".glsl": "text",
      },
    },
  },
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
  ]
});
