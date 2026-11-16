import path from 'node:path';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

/** Artifact manifest, also usable by non-Vite bundlers. Extra modules use the same destination. */
export function bg2eWasmAssets({ nodeModulesPath, artifacts = [] } = {}) {
    const require = createRequire(import.meta.url);
    const bg2io = nodeModulesPath ? path.resolve(nodeModulesPath, 'bg2io') : path.dirname(require.resolve('bg2io/package.json'));
    const text = fileURLToPath(new URL('../wasm/assets/', import.meta.url));
    return [
        ...['bg2io.js', 'bg2io.wasm'].map(name => ({ name, source: path.join(bg2io, name) })),
        ...['bg2text.js', 'bg2text.wasm'].map(name => ({ name, source: path.join(text, name) })),
        ...artifacts
    ];
}

export function copyBg2eAssets({ nodeModulesPath, dstSubdir = 'bg2io', artifacts = [] } = {}) {
    const manifest = bg2eWasmAssets({ nodeModulesPath, artifacts });
    const names = new Set();
    for (const { name } of manifest) {
        if (names.has(name)) throw new Error(`Duplicate WASM artifact: ${name}`);
        names.add(name);
        if (!/^[A-Za-z0-9_.-]+$/.test(name)) throw new Error(`Invalid WASM artifact name: ${name}`);
    }
    return {
        name: 'copy-bg2e-assets',
        async writeBundle(options) {
            const destDir = path.resolve(options.dir || '', dstSubdir);
            await fs.mkdir(destDir, { recursive: true });
            await Promise.all(manifest.map(({ name, source }) => fs.copyFile(source, path.join(destDir, name))));
        },
        configureServer(server) {
            // Accept both the configured base and a URL already normalized by Vite.
            server.middlewares.use(async (req, res, next) => {
                const pathname = decodeURI((req.url || '').split('?')[0]);
                const prefix = `/${dstSubdir.replace(/^\/+|\/+$/g, '')}${dstSubdir ? '/' : ''}`;
                const base = server.config.base.startsWith('/') ? server.config.base.replace(/\/$/, '') : '';
                const artifact = manifest.find(({ name }) => pathname === `${prefix}${name}` || pathname === `${base}${prefix}${name}`);
                if (!artifact) return next();
                try {
                    const data = await fs.readFile(artifact.source);
                    res.setHeader('Content-Type', artifact.name.endsWith('.wasm') ? 'application/wasm' : 'application/javascript');
                    res.end(data);
                } catch (error) {
                    server.config.logger.error(`Unable to serve ${artifact.name}: ${error}`);
                    res.statusCode = 500; res.end('WASM artifact unavailable');
                }
            });
        }
    };
}
