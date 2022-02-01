#!/bin/sh

./clean.hs

cd bg2e-tools
npm ci
npm run build
cd ..

cd bg2e-math
npm ci
npm run build
cd ..

cd bg2e-base
npm ci
npm run build
cd ..

