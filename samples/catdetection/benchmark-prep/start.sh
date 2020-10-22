#!/bin/bash
set -euo pipefail

# Download a picture
curl -L $IMAGE_URL -o /out/image.jpg
