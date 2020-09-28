#!/bin/bash
set -euo pipefail

# Remove monorepo package references
sed -i '/"@microsoft\/sds": "*"/d' packages/*/package.json

# Update the monorepo root
npm install --ignore-scripts
npm audit fix

# Update each package
lerna exec -- npm install --ignore-scripts
lerna exec npm audit fix

# Readd monorepo package references
sed -i 's/\("dependencies": {\)/\1\n    "@microsoft\/sds": "*",/' packages/cli/package.json
sed -i 's/\("dependencies": {\)/\1\n    "@microsoft\/sds": "*",/' packages/laboratory/package.json
sed -i 's/\("dependencies": {\)/\1\n    "@microsoft\/sds": "*",/' packages/worker/package.json

# Validate
npm install
lerna exec npm rebuild || true
npm run test
