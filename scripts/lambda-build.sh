#!/bin/bash

set -e

echo "Writing {\"version\": \"$COMMIT_REF\"} to version.json"
echo "{\"version\": \"$COMMIT_REF\"}" > lambda/shared/version.json
echo "Building functions with netlify-cli..."
npx netlify-cli functions:build --src=lambda --functions=build/functions
echo "Prepare lambdas complete!"
