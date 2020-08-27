#!/bin/bash
set -eo pipefail

show_usage() {
  echo 'Usage: deploy.sh -g <resource_group> [--assets <assets_base_uri>] [--dev]'
}

CREATE_VNET=true
DEV=false

parse_arguments() {
  PARAMS=""
  while (( $# )); do
    case "$1" in
      -h|--help)
        show_usage
        exit 0
        ;;
      -g|--resource-group)
        RESOURCE_GROUP=$2
        shift 2
        ;;
      -a|--assets)
        ASSETS_BASE=$2
        shift 2
        ;;
      --dev)
        DEV=true
        shift
        ;;
      --)
        shift
        break
        ;;
      -*|--*)
        echo "Unsupported flag $1" >&2
        exit 1
        ;;
      *)
        PARAMS="$PARAMS $1"
        shift
        ;;
    esac
  done
}

validate_arguments() {
  if [[ -z "$RESOURCE_GROUP" ]]; then
    show_usage
    exit 1
  fi

  if [[ -z "$ASSETS_BASE" && "$DEV" = true ]]; then
    ASSETS_BASE=$(curl -s http://127.0.0.1:4040/api/tunnels | jq -r '.tunnels[] | select(.name == "arm").public_url')
  fi

  ASSETS_BASE=${ASSETS_BASE:-'https://raw.githubusercontent.com/microsoft/secure-data-sandbox/main/deploy/'}
}

deploy_environment() {
  if az network vnet show -g $RESOURCE_GROUP -n vnet &>/dev/null; then
    CREATE_VNET=false
  fi

  az deployment group create -g $RESOURCE_GROUP -u "${ASSETS_BASE}/arm/azuredeploy.json" -p "assetsBaseUrl=$ASSETS_BASE" "createVnet=$CREATE_VNET"
}

deploy_dev() {
  if [ "$DEV" = true ]; then
    az deployment group create -g $RESOURCE_GROUP -u "${ASSETS_BASE}/arm/azuredeploy.dev.json" -p "sshPublicKey=$(cat ~/.ssh/id_rsa.pub)"
  fi
}

parse_arguments "$@"
validate_arguments

set -u
deploy_environment
deploy_dev
