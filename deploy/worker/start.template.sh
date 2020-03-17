#!/bin/bash
set -euxo pipefail

# blobfuse: one-time
mkdir -p /mnt/blobfusetmp

# blobfuse: mount
mkdir -p /var/dct/runs

TAGS=$(curl -s 'http://169.254.169.254/metadata/instance/compute/tagsList?api-version=2019-08-15' -H 'Metadata: true')
export AZURE_STORAGE_ACCOUNT=$(echo $TAGS | jq -r '.[] | select(.name == "DCT_STORAGE_ACCOUNT") | .value')
export AZURE_STORAGE_AUTH_TYPE=MSI
CONTAINER=$(echo $TAGS | jq -r '.[] | select(.name == "DCT_CONTAINER") | .value')

blobfuse /var/dct/runs --container-name=$CONTAINER --tmp-path=/mnt/blobfusetmp

# run app container
docker run alpine /bin/sh -c 'echo hello world'
