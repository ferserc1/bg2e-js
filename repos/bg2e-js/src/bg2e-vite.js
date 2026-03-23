import path from "node:path";
import fs from "node:fs/promises";

export function copyBg2eAssets({
    nodeModulesPath = "./node_modules",
    dstSubdir = "bg2io"
} = {}) {
    const bg2ioPath = path.join(nodeModulesPath, "bg2io");
    
    return {
        name: 'copy-bg2e-assets',

        async writeBundle(options) {
            const baseSrcDir = path.resolve(bg2ioPath);
            const destDir = path.resolve(options.dir || "", dstSubdir);
            
            await fs.mkdir(destDir, { recursive: true });
            await fs.copyFile(
                path.join(baseSrcDir, 'bg2io.js'),
                path.join(destDir, 'bg2io.js')
            )

            await fs.copyFile(
                path.join(baseSrcDir, 'bg2io.wasm'),
                path.join(destDir, 'bg2io.wasm')
            )
        },

        async configureServer(server) {
            const dstDir = dstSubdir !== "" ? `/${dstSubdir}` : "";
            server.middlewares.use(`${dstDir}/bg2io.wasm`, async (req, res) => {
                const wasmPath = path.resolve(bg2ioPath, 'bg2io.wasm');
                try {
                    const wasmData = await fs.readFile(wasmPath);
                    res.setHeader('Content-Type', 'application/wasm');
                    res.end(wasmData);
                } catch (err) {
                    console.error(`Error serving bg2io.wasm:`, err);
                    res.statusCode = 500;
                    res.end('Internal Server Error');
                }
            });

            server.middlewares.use(`${dstDir}/bg2io.js`, async (req, res) => {
                const jsPath = path.resolve(bg2ioPath, 'bg2io.js');
                try {
                    const jsData = await fs.readFile(jsPath);
                    res.setHeader('Content-Type', 'application/javascript');
                    res.end(jsData);
                } catch (err) {
                    console.error(`Error serving bg2io.js:`, err);
                    res.statusCode = 500;
                    res.end('Internal Server Error');
                }
            });
        }
    }
}