#!/bin/bash
set -euo pipefail

if [[ -z "$API_KEY" || -z "$SERVICE_ENDPOINT" ]]; then
  echo "You must set the following environment variables: [API_KEY, SERVICE_ENDPOINT]"
  exit 1
fi

if [ ! -f "/in/image.jpg" ]; then
  echo "File not found: There must be an image located at: /in/image.jpg"
  exit 1
fi

# Capture the raw response
curl -X POST \
  -H "Ocp-Apim-Subscription-Key: $API_KEY" \
  -H 'Content-Type: application/octet-stream' \
  --data-binary @/in/image.jpg \
  "${SERVICE_ENDPOINT}vision/v3.0/analyze?visualFeatures=Categories" > /out/raw.json

# Parse the generated output to produce a description in the proper format
cat /out/raw.json | jq -r '.categories[0].name | sub("animal_"; "")' > /out/prediction.txt
