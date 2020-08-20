#!/bin/bash
set -euo pipefail

export DOCKER_BUILDKIT=1

ACCOUNT=acanthamoeba

# Build the worker
docker build -t $ACCOUNT/sds-worker --target worker .

# Scale to 0 replicas
kubectl scale -n worker --replicas 0 deploy/worker

# Directly load the built image into the cluster
kind load docker-image $ACCOUNT/sds-worker

# Reapply the manifests to scale
kubectl apply -f ./deploy/k8s/3-worker.yml

# To see details on run execution, run the following, then browse to http://localhost:2746
# kubectl port-forward -n argo service/argo-server 2746
