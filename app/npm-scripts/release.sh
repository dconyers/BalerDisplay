#!/bin/bash
if [ $1 ]; then
    NEWVERSION=$1
    echo $NEWVERSION
    if [[ $npm_package_version != *"-"* ]] && [ $NEWVERSION == "prerelease" ]; then
        # we need to add "dev" to the prerelease pattern
        NEWVERSION=$npm_package_version-dev.0
        echo "replaced with $NEWVERSION"
    fi
    echo "calling with $NEWVERSION"
    npm version $NEWVERSION -m "Build %s" && npm run build && npm run package && npm run installer
else
    echo "missing semver parameter. should call npm run build:release -- <semver label>"
fi
