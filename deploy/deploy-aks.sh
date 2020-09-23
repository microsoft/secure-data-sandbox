#!/bin/bash
set -euo pipefail

RESOURCE_GROUP=${1:-sds}
DEPLOYMENT_NAME=${2:-azuredeploy}

if ! helm repo list | grep '^aad-pod-identity'; then
  helm repo add aad-pod-identity https://raw.githubusercontent.com/Azure/aad-pod-identity/master/charts
fi
helm upgrade --install aad-pod-identity aad-pod-identity/aad-pod-identity --namespace kube-system

OUTPUTS=$(az deployment group show -g $RESOURCE_GROUP -n $DEPLOYMENT_NAME --query properties.outputs -o json)
helm upgrade --install sds deploy/helm \
  --set 'worker.image=acanthamoeba/sds-worker' \
  --set "instrumentationKey=$(echo $OUTPUTS | jq -r .instrumentationKey.value)" \
  --set "worker.queueEndpoint=$(echo $OUTPUTS | jq -r .runsEndpoint.value)" \
  --set "identities.worker.resourceId=$(echo $OUTPUTS | jq -r .workerIdentityResourceId.value)" \
  --set "identities.worker.clientId=$(echo $OUTPUTS | jq -r .workerIdentityClientId.value)" \
  --set "identities.benchmark.resourceId=$(echo $OUTPUTS | jq -r .benchmarkIdentityResourceId.value)" \
  --set "identities.benchmark.clientId=$(echo $OUTPUTS | jq -r .benchmarkIdentityClientId.value)" \
  --set "identities.candidate.resourceId=$(echo $OUTPUTS | jq -r .candidateIdentityResourceId.value)" \
  --set "identities.candidate.clientId=$(echo $OUTPUTS | jq -r .candidateIdentityClientId.value)"
