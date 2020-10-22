#!/bin/bash
set -euo pipefail

RESOURCE_GROUP=${1:-sds}
DEPLOYMENT_NAME=${2:-azuredeploy}

# Versions
AAD_POD_IDENTITY_VERSION="2.0.2"
AZUREFILE_CSI_DRIVER_VERSION="v0.9.0"
ARGO_VERSION="v2.11.0"

# aad-pod-identity
if ! helm repo list | grep '^aad-pod-identity'; then
  helm repo add aad-pod-identity https://raw.githubusercontent.com/Azure/aad-pod-identity/master/charts
fi
helm upgrade --install aad-pod-identity aad-pod-identity/aad-pod-identity --namespace kube-system --version $AAD_POD_IDENTITY_VERSION --set nmi.metadataHeaderRequired=true

# azurefile-csi-driver
if ! helm repo list | grep '^azurefile-csi-driver'; then
  helm repo add azurefile-csi-driver https://raw.githubusercontent.com/kubernetes-sigs/azurefile-csi-driver/master/charts
fi
helm upgrade --install azurefile-csi-driver azurefile-csi-driver/azurefile-csi-driver --namespace kube-system --version $AZUREFILE_CSI_DRIVER_VERSION

OUTPUTS=$(az deployment group show -g $RESOURCE_GROUP -n $DEPLOYMENT_NAME --query properties.outputs -o json)
INFRA_ACR=$(echo $OUTPUTS | jq -r .infraAcrLoginServer.value)
helm upgrade --install sds deploy/helm \
  --set "instrumentationKey=$(echo $OUTPUTS | jq -r .instrumentationKey.value)" \
  --set "argoController.executorImage=$INFRA_ACR/argoproj/argoexec:$ARGO_VERSION" \
  --set "argoController.image=$INFRA_ACR/argoproj/workflow-controller:$ARGO_VERSION" \
  --set "argoServer.image=$INFRA_ACR/argoproj/argocli:$ARGO_VERSION" \
  --set "worker.image=$INFRA_ACR/sds-worker" \
  --set "worker.queueEndpoint=$(echo $OUTPUTS | jq -r .runsQueueEndpoint.value)" \
  --set "identities.worker.resourceId=$(echo $OUTPUTS | jq -r .workerIdentityResourceId.value)" \
  --set "identities.worker.clientId=$(echo $OUTPUTS | jq -r .workerIdentityClientId.value)" \
  --set "identities.benchmark.resourceId=$(echo $OUTPUTS | jq -r .benchmarkIdentityResourceId.value)" \
  --set "identities.benchmark.clientId=$(echo $OUTPUTS | jq -r .benchmarkIdentityClientId.value)" \
  --set "identities.candidate.resourceId=$(echo $OUTPUTS | jq -r .candidateIdentityResourceId.value)" \
  --set "identities.candidate.clientId=$(echo $OUTPUTS | jq -r .candidateIdentityClientId.value)" \
  --set "worker.storage.storageAccount=$(echo $OUTPUTS | jq -r .runsTransientStorageAccount.value)" \
  --set "worker.storage.resourceGroup=$RESOURCE_GROUP"
