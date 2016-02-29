#!/bin/sh
npm run clean
mkdir build
npm run tslint $1
npm run tsc
npm run coverage
