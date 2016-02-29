#!/bin/bash
FILES="$(/usr/bin/find . -type f -name '*.ts' -not -path './node_modules/*' | sed 's:\(.*\)*: \1:' | tr -d '\n')"
./node_modules/.bin/tslint $FILES || true
