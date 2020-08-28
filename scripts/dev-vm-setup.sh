#!/bin/bash
set -euo pipefail

# Useful tools for developing / debugging on a remote terminal connected to the detonation chamber

# Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# kubectl
sudo az aks install-cli

# helm
sudo snap install helm --classic

# octant
curl -LO https://github.com/vmware-tanzu/octant/releases/download/v0.15.0/octant_0.15.0_Linux-64bit.tar.gz
tar xvf octant_0.15.0_Linux-64bit.tar.gz
sudo mv ./octant_0.15.0_Linux-64bit/octant /usr/local/bin
