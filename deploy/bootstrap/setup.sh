#!/bin/bash
set -euxo pipefail

# Repositories
curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | apt-key add -
apt-add-repository "deb [arch=amd64] https://packages.microsoft.com/repos/azure-cli/ $(lsb_release -cs) main"
apt-add-repository "deb [arch=amd64] https://packages.microsoft.com/ubuntu/$(lsb_release -rs)/prod $(lsb_release -cs) main"

# Install tools
apt-get update -y
apt-get install -y azure-cli powershell

# Configure storage
az login --identity --allow-no-subscriptions
