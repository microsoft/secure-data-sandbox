#!/bin/bash
set -euo pipefail

# service discovery via DNS
SETTINGS=$(dig @168.63.129.16 +short laboratory.environment.private txt)

# blobfuse: one-time setup
mkdir -p /mnt/blobfusetmp

# blobfuse: mount runs container
mkdir -p /var/dct/runs

export AZURE_STORAGE_ACCOUNT=$(grep -Po 'storageAccount=\K[^"]*' <<< $SETTINGS)
export AZURE_STORAGE_AUTH_TYPE=MSI
CONTAINER=$(grep -Po 'runsContainer=\K[^"]*' <<< $SETTINGS)

blobfuse /var/dct/runs --container-name=$CONTAINER --tmp-path=/mnt/blobfusetmp

# pull latest worker
AAD_ACCESS_TOKEN=$(curl -s -H 'Metadata: true' 'http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https://management.azure.com/' | jq -r '.access_token')
CLAIMS=$(echo $AAD_ACCESS_TOKEN | cut -d '.' -f 2)
TENANT=$(echo $CLAIMS | base64 -d | jq -r '.iss | capture("https://(.*)/(?<tenant>.*)/").tenant')

REGISTRY=$(grep -Po 'registry=\K\K[^"]*' <<< $SETTINGS)
ACR_REFRESH_TOKEN=$(curl -s -X POST -H 'Content-Type: application/x-www-form-urlencoded' -d "grant_type=access_token&service=$REGISTRY&tenant=$TENANT&access_token=$AAD_ACCESS_TOKEN" https://$REGISTRY/oauth2/exchange | jq -r '.refresh_token')
docker login -u 00000000-0000-0000-0000-000000000000 -p $ACR_REFRESH_TOKEN $REGISTRY

# If the pull was unsuccessful (not yet provisioned, network blip, etc), wait a bit and keep trying
while ! docker pull $REGISTRY/worker; do
  sleep 10
done

# run worker app
QUEUE_ENDPOINT=$(grep -Po 'runsQueueEndpoint=\K[^"]*' <<< $SETTINGS)
docker container rm worker --force || true
docker container run -d --name worker --restart always -v /var/run/docker.sock:/var/run/docker.sock -e QUEUE_MODE=azure -e QUEUE_ENDPOINT=$QUEUE_ENDPOINT $REGISTRY/worker
