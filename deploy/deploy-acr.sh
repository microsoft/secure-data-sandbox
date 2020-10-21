#!/bin/bash
set -euo pipefail

RESOURCE_GROUP=${1:-sds}
DEPLOYMENT_NAME=${2:-azuredeploy}
TAG=${3:-latest}

# Versions
ARGO_VERSION="v2.11.0"

export DOCKER_BUILDKIT=1

OUTPUTS=$(az deployment group show -g $RESOURCE_GROUP -n $DEPLOYMENT_NAME --query properties.outputs -o json)
LOGIN_SERVER=$(echo $OUTPUTS | jq -r .infraAcrLoginServer.value)
az acr login -n $LOGIN_SERVER

# Import public images
az acr import -n $LOGIN_SERVER --source "docker.io/argoproj/argoexec:$ARGO_VERSION"
az acr import -n $LOGIN_SERVER --source "docker.io/argoproj/workflow-controller:$ARGO_VERSION"
az acr import -n $LOGIN_SERVER --source "docker.io/argoproj/argocli:$ARGO_VERSION"

# Push SDS images
LABORATORY_IMAGE="${LOGIN_SERVER}/sds-laboratory:${TAG}"
docker build --target laboratory -t $LABORATORY_IMAGE .
docker push $LABORATORY_IMAGE

WORKER_IMAGE="${LOGIN_SERVER}/sds-worker:${TAG}"
docker build --target worker -t $WORKER_IMAGE .
docker push $WORKER_IMAGE
