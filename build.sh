#!/bin/sh

./clean.sh

cd bg2e-tools
npm install
npm run build
cd ..

cd bg2e-math
npm install
npm run build
cd ..

cd bg2e-base
npm install
npm run build
cd ..

