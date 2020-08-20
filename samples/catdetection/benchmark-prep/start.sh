#!/bin/bash
set -euo pipefail

# Download a cat picture
curl -L https://placekitten.com/1024/768 -o /out/image.jpg
