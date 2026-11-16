import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.dirname(fileURLToPath(import.meta.url));
const result = spawnSync(process.env.EMXX || 'em++', [
    '-std=c++20', '-O2', '-fexceptions', '--bind', '-Itext/include', '-Itext/vendor',
    'text/Text.cpp', 'text/TextFont.cpp', 'text/TextRasterizer.cpp', 'text/bindings.cpp',
    '-sMODULARIZE=1', '-sEXPORT_ES6=1', '-sENVIRONMENT=web,node', '-sALLOW_MEMORY_GROWTH=1',
    '-sMAXIMUM_MEMORY=536870912', '-sFILESYSTEM=0', '-sDISABLE_EXCEPTION_CATCHING=0',
    '-o', 'assets/bg2text.js'
], { cwd: root, stdio: 'inherit' });
if (result.error) console.error('Install Emscripten and activate emsdk_env.sh, or set EMXX:', result.error.message);
process.exitCode = result.status ?? 1;
