#!/bin/bash

DEFAULT_RESOURCES_BASE_PATH="/Applications/Fluxnova Modeler.app/Contents/MacOS/resources"
BASE_PATH="${1:-$DEFAULT_RESOURCES_BASE_PATH}"
PLUGIN_PATH="$BASE_PATH/plugins/code-editor-plugin"

rm -rf dist
rm -rf "$PLUGIN_PATH"
npm run build:dev

mkdir -p "$PLUGIN_PATH"
ln -sfn $(pwd)/dist "$PLUGIN_PATH/dist"
ln -sfn $(pwd)/index.js "$PLUGIN_PATH/index.js"