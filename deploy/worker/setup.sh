#!/bin/bash
set -euo pipefail

# Docker repository
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

# Microsoft repository
curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | apt-key add -
apt-add-repository "deb [arch=amd64] https://packages.microsoft.com/ubuntu/$(lsb_release -rs)/prod $(lsb_release -cs) main"

# Install dependencies
apt-get update -y
apt-get install -y jq docker-ce docker-ce-cli containerd.io blobfuse fuse
