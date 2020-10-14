#!/bin/bash
set -eo pipefail

show_usage() {
  echo 'Usage: deploy.sh -g <resource_group> [--assets <assets_base_uri>] [--sas <sas_token>] [--auth-tenant-id <auth_tenantId>] [--auth-laboratory-clientId <laboratory_clientId>] [--auth-cli-clientId <cli_clientId>] [--dev]'
}

DEV=false
SAS=""
AUTH_MODE="none"
AUTH_TENANT_ID=""
AUTH_LABORATORY_CLIENT_ID=""
AUTH_CLI_CLIENT_ID=""

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
      --sas)
        SAS=$2
        shift 2
        ;;
      --auth-tenant-id)
        AUTH_TENANT_ID=$2
        shift 2
        ;;
      --auth-laboratory-clientId)
        AUTH_LABORATORY_CLIENT_ID=$2
        shift 2
        ;;
      --auth-cli-clientId)
        AUTH_CLI_CLIENT_ID=$2
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

  if [[ -n "$AUTH_TENANT_ID" && -n "$AUTH_LABORATORY_CLIENT_ID" && -n "$AUTH_CLI_CLIENT_ID" ]]; then
    AUTH_MODE="aad"
  fi
}

deploy_environment() {
  PARAMS_FILE="parameters.json"

  if [ "$DEV" = true ]; then
    PARAMS_FILE="parameters.dev.json"
  fi

  az deployment group create -g $RESOURCE_GROUP -p "${ASSETS_BASE}/arm/${PARAMS_FILE}?${SAS}" -u "${ASSETS_BASE}/arm/azuredeploy.json?${SAS}" -p "assetsBaseUrl=$ASSETS_BASE" "deploymentSas=$SAS" "authMode=$AUTH_MODE" "authTenantId=$AUTH_TENANT_ID" "authLaboratoryClientId=$AUTH_LABORATORY_CLIENT_ID" "authCliClientId=$AUTH_CLI_CLIENT_ID"
}

deploy_dev() {
  if [ "$DEV" = true ]; then
    az deployment group create -g $RESOURCE_GROUP -u "${ASSETS_BASE}/arm/azuredeploy.dev.json?${SAS}" -p "sshPublicKey=$(cat ~/.ssh/id_rsa.pub)"
  fi
}

parse_arguments "$@"
validate_arguments

set -u
deploy_environment
deploy_dev
