import { build } from 'vite';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const directory = dirname(fileURLToPath(import.meta.url));
const files = (await readdir(directory)).filter(name => name.endsWith('.test.ts'));
const outDir = await mkdtemp(join(tmpdir(), 'bg2e-tests-'));
try {
    await build({
        configFile: false,
        logLevel: 'error',
        ssr: { noExternal: true },
        build: {
            ssr: true, outDir, emptyOutDir: true,
            rollupOptions: {
                input: Object.fromEntries(files.map(name => [name.replace('.ts', ''), join(directory, name)])),
                output: { entryFileNames: '[name].mjs' }
            }
        }
    });
    const result = spawnSync(process.execPath, ['--test', ...files.map(name => join(outDir, name.replace('.ts', '.mjs')))], { stdio: 'inherit' });
    process.exitCode = result.status ?? 1;
} finally {
    await rm(outDir, { recursive: true, force: true });
}
