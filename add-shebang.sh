#!/bin/sh

# Adding the shebang avoids JS syntax error when running cli.cjs from CLI using package.json#bin field

# Define the shebang line
SHEBANG="#!/usr/bin/env node"

# Add the shebang line to the specified file
echo "$SHEBANG" | cat - ./dist/cli.cjs > temp && mv temp ./dist/cli.cjs

echo "✅ Shebang line added to dist/cli.cjs"
