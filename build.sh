#!/bin/sh

./clean.sh

cd examples/base
npm install
npm run build
cd -

cd examples/math
npm install
npm run build
cd -

cd examples/tools
npm install
npm run build
cd -

cd examples/db
npm install
npm run build
cd -

cd examples/process_detection
npm install
npm run build
cd -

cd examples/scene
npm install
npm run build
cd -

cd examples/app
npm install
npm run build
cd -

cd examples/webgl
npm install
npm run build
cd -

