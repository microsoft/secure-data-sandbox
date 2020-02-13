#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VSCODE_DIR="$(cd $SCRIPT_DIR/.. && pwd)"
REPO_DIR="$(cd $VSCODE_DIR/.. && pwd)"

# Combine all subproject VS Code extension recommendations and gather under the repo root
find $REPO_DIR -name 'extensions.json' \
  | xargs jq -s 'reduce .[] as $item ([]; . += $item.recommendations) | unique | sort | {recommendations: . }' \
  > "$VSCODE_DIR/extensions.json"
