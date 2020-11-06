#!/bin/bash

# Pre-compress all files so that this has not to be done on the fly by the web server.
find ./dist -type f -regex '\(.*\.css\|.*\.js\)' -exec gzip "{}" \;
# Enable extended pattern matching for following operations.
shopt -s extglob
# Remove unused font types.
rm -f ./dist/*.+(eot|ttf)
# Remove unused flag icons, but keep the used ones. Also remove all SVG fonts.
rm -f ./dist/!(de.*|gb.*).svg
