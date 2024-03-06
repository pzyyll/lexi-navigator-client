#!/bin/bash

# Build the project
echo "Building the project"

npm install
node-gyp configure
node-gyp build