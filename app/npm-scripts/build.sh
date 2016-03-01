#!/bin/sh
npm run clean
mkdir build
npm run tslint
npm run tsc
npm run build_addon
