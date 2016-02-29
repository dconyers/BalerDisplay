#!/bin/bash
echo "starting to create installer"
# we need to strip off the final period to meet nuget versioning rules
# this is only until nuget upgrades to semver 2.0
VERSION=$(echo $npm_package_version | sed 's/\(-[a-z]*\)\.\([^.]*\)$/\1\2/')
echo "new version for nuget: $VERSION"
electron-installer-squirrel-windows ./build/ExpertSystem-win32-x64 --debug --out=build/installer/ --description=ExpertSystem --authors=EnovationControls --appversion=$VERSION
# remove unused msi file
rm build/installer/*.msi
echo "installer creation complete!"
