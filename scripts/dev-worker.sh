#!/bin/bash
set -euo pipefail

export DOCKER_BUILDKIT=1

IMAGE=acanthamoeba/sds-worker:dev

# Build and push the worker
docker build -t $IMAGE --target worker .
docker push $IMAGE

# Scale to 0 replicas
kubectl scale -n worker --replicas 0 deploy/worker

# Scale back to 1
kubectl scale -n worker --replicas 1 deploy/worker

# To see details on run execution, run the following, then browse to http://localhost:2746
# kubectl port-forward -n argo service/argo-server 2746
