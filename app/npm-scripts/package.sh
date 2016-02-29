#!/bin/bash
WINDOWS="--platform=win32 --version-string.ProductVersion=$npm_package_version --version-string.FileVersion=$npm_package_version --version-string.FileDescription=$npm_package_name --version-string.ProductName=$npm_package_name --version-string.OriginalFilename=$npm_package_name"
OSX="--platform=darwin --build-version=$npm_package_version --app-version=$npm_package_version"
# default windows
CURRENT=$WINDOWS
if [ $1 == "osx" ]; then
    CURRENT=$OSX
fi
electron-packager . $CURRENT --arch=x64 --prune=true --overwrite=true --asar=true --out=build --ignore=.*-spec.js --ignore=.*-spec.ts --ignore=docs/* --ignore=npm-scripts
