# SDS Development

## Quick Start

* Create a [Visual Studio Codespaces](https://online.visualstudio.com) instance with no selected repository
* Enter the following commands

```shell
# Get the code
git clone https://github.com/microsoft/secure-data-sandbox
cd secure-data-sandbox

# Install dependencies and link projects
npm install

# Run tests
npm run test
```

## Prerequisites

To fully develop and debug SDS, you'll want to have the following installed on your `PATH`

* Node 12+
* Docker
* Helm 3
* Azure CLI

## Azure development

The `Laboratory` and `Worker` communicate via Azure Storage Queue. To set up a queue for use with local development, follow the steps below

```shell
# Choose a unique name for your storage account
export AZURE_STORAGE_ACCOUNT=sdsdev
REGION=westus2

# Create a Storage Account and queue
az group create -n sds-dev -l $REGION
az storage account create -g sds-dev -n $AZURE_STORAGE_ACCOUNT --sku Standard_LRS
az storage queue create -n runs

# Create a Service Principal with permissions
QUEUE_ID="$(az storage account show -n $AZURE_STORAGE_ACCOUNT --query id -o tsv)/queueServices/default/queues/runs"
az ad sp create-for-rbac --role 'Storage Queue Data Contributor' --scopes $QUEUE_ID
```

### Environment variables

Copy `.env.template` to `.env` and enter the data returned by the CLI. A translation guide for the property names is below

* `AZURE_TENANT_ID`: `tenant`
* `AZURE_CLIENT_ID`: `appId`
* `AZURE_CLIENT_SECRET`: `password`

## Kubernetes development

The `Worker` component runs on Kubernetes. Follow the instructions below to set up your dev environment

```shell
# Set up a local k8s cluster using kind
curl -Lo ./kind https://github.com/kubernetes-sigs/kind/releases/download/v0.8.1/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind
kind cluster create

# Deploy Worker components to the cluster, filling in parameters for your resources
helm install \
  --set argoController.containerRuntimeExecutor=pns \
  --set argoServer.enabled=true \
  --set worker.queueEndpoint=https://<storageaccount>.queue.core.windows.net/runs \
  --set worker.tenantId=00000000-0000-0000-0000-000000000000 \
  --set worker.clientId=00000000-0000-0000-0000-000000000000 \
  --set worker.clientSecret=00000000-0000-0000-0000-000000000000 \
  sds ./deploy/sds-worker
```

### Iterating on the Worker

Rather than build an image, upload it to a registry, then make an update to Kubernetes, you can short-circuit the process by building & directly loading into your kind cluster

```shell
# Update the Worker running in the local kind cluster
./scripts/dev-worker.sh
```

### Viewing workflows

In development mode, SDS installs `argo-server` as a UX to view & troubleshoot Workflows. To access it, run

```shell
kubectl port-forward -n argo svc/argo-server 2746
```

> Note: if you are running in codespaces, you will have to forward port 2746 in VS Code in order to navigate to Argo Server

## Demos

It can be useful to execute the samples rapidly. Scripts are provided to help you exercise the system

* `scripts/sample-data.sh` - Execute the basic YAML files
* `scripts/demo-catdetection.sh` - Run the cat detection demo (see [README](/samples/catdetection/README.md) for setup instructions)
