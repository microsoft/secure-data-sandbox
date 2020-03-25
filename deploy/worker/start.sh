#!/bin/bash
set -euxo pipefail

# blobfuse: one-time
mkdir -p /mnt/blobfusetmp

# blobfuse: mount
mkdir -p /var/dct/runs

SETTINGS=$(dig +short laboratory.environment.private txt)
export AZURE_STORAGE_ACCOUNT=$(grep -Po 'storageAccount=\K\w+' <<< $SETTINGS)
export AZURE_STORAGE_AUTH_TYPE=MSI
CONTAINER=$(grep -Po 'runsContainer=\K\w+' <<< $SETTINGS)

blobfuse /var/dct/runs --container-name=$CONTAINER --tmp-path=/mnt/blobfusetmp

# run app container
docker run alpine /bin/sh -c 'echo hello world'
