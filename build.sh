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

