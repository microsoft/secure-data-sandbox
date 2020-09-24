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

### ARM Template Deployment

To create a full deployment environment that would match production requirements, ARM templates have been created to stand up a resource group with
the following resources included:

- Azure Kubernetes Cluster
- Managed Identites for benchmark, candidate, laboratory, worker and boostrap roles
- A Development Jump Box (optional)
- Azure Firewall
- Private Link configurations and Virtual Networks
- Azure Storage accounts
- Azure Container Registry

To deploy the ARM template, first create an SSH key on the machine you intend to execute the ARM template from - it should be named id_rsa (the default name when using [ssh keygen](https://www.tutorialspoint.com/unix_commands/ssh-keygen.htm)).

#### Using local templates (optional)

>If you are developing changes in the ARM templates and wish to use them directly, you first need to make them available over the internet (due to limitations in the Azure CLI). The easiest way to do this is using the [ngrok](https://ngrok.com/download) tool. 

This repository is configured to automatically configure and run ngrok by using the following command:

```bash
# install dependencies
npm install

# Start the local ngrok tunnel
npm run dev:azure
```

>This will locally run ngrok, and autopopulate the `assets_base_uri` for `deploy.sh`.

Once you have created the SSH key, run the following Azure CLI command:

```bash
# If you are running ngrok manually, or using remote ARM templates, provide the assets_base_uri
./deploy/arm/deploy.sh -g <resource_group> [--assets <assets_base_uri>] --dev
```

This will take several minutes to deploy.

Alternatively, you may deploy just an Azure Storage Queue, and develop on a local K8s cluster.

### Standalone Azure Storage Queue

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

### Laboratory 

#### Environment variables

Copy `.env.template` to `.env` and enter the data returned by the CLI. A translation guide for the property names is below

* `AZURE_TENANT_ID`: `tenant`
* `AZURE_CLIENT_ID`: `appId`
* `AZURE_CLIENT_SECRET`: `password`

#### Running

```shell
# Load the values into your shell
set -o allexport; source .env; set +o allexport

# Start the laboratory
npm run laboratory

# Connect to the laboratory (one-time operation)
npm run cli connect http://localhost:3000
```

## Kubernetes development

The `Worker` component runs on Kubernetes. Follow the instructions below to set up your dev environment

### Local setup

```shell
# Set up a local k8s cluster using kind
curl -Lo ./kind https://github.com/kubernetes-sigs/kind/releases/download/v0.8.1/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind
kind cluster create
```

### Using Dev Jump Box

Because the resources deployed via the ARM template are locked down via Azure Firewall rules, a development VM has been provided as a "jump box". The main use for this dev box is to deploy resources within this subscription (e.g. deploying the K8s cluster). To connect to this machine, you may SSH into it using the same SSH key you created earlier.

#### Dev Box Setup

Currently the dev box is a standard Linux VM, so be sure to install the following:

- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest)
- [Kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/#install-kubectl-on-linux)
- [Helm](https://helm.sh/docs/intro/install/)
- [NPM](https://github.com/nodesource/distributions/blob/master/README.md)
- [Docker](https://docs.docker.com/engine/install/ubuntu/#:~:text=%20Install%20from%20a%20package%20%F0%9F%94%97%20%201,the%20hello-world%20image.%0A%24%20sudo%20docker%20run...%20More%20) (if you will be building images on the box)

Once those tools are installed, clone the SDS repo into that dev machine and continue with the `Configuration` section below.

### Configuration

Update `deploy/helm/values.dev.yaml` with the values that match your environment. Specifically, you'll need

* `worker.queueEndpoint`: Point to a queue in your Azure Storage Account
* `identities.*`: Enter values for your own Service Principal(s). The `worker` identity will need the `Storage Queue Data Message Processor` (or higher) role on your queue

>NOTE: If using the ARM template, managed identities have been created for you, and you can instead use the format found in `deploy/helm/values.yaml`, filling in the appropriate client IDs matching the pre-created identities.

### Install SDS

If this is your first time using the K8s cluster, be sure that you have installed the AAD Identity Binding on the AKS cluster within the `kube-system` namespace.
```shell
kubectl apply -f https://raw.githubusercontent.com/Azure/aad-pod-identity/release-v1.6.0/deploy/infra/deployment-rbac.yaml -n kube-system
```
Then, install SDS:

```shell
helm install sds deploy/helm --values deploy/helm/values.dev.yaml
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
