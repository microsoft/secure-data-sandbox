#!/bin/bash
set -eo pipefail

show_usage() {
  echo 'Usage: deploy.sh -g <resource_group> [--assets <assets_base_uri>] [--dev] [--force]'
}

parse_arguments() {
  PARAMS=""
  while (( $# )); do
    case "$1" in
      -h|--help)
        show_usage
        exit 0
        ;;
      -f|--force)
        FORCE=true
        shift
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
    ASSETS_BASE=$(curl -s http://127.0.0.1:4040/api/tunnels | jq -r '.tunnels[] | select(.name == "deploy").public_url')
  fi

  ASSETS_BASE=${ASSETS_BASE:-'https://raw.githubusercontent.com/microsoft/secure-data-sandbox/main/deploy'}
  FORCE=${FORCE:-false}
}

deploy_environment() {
  if ! az image show -g $RESOURCE_GROUP -n sds-worker &>/dev/null || [ "$FORCE" = true ]; then
    TMP_DIR=$(mktemp -d)
    (
      pushd $TMP_DIR
      curl -sL -O "${ASSETS_BASE}/worker/packer.json" -O "${ASSETS_BASE}/worker/setup.sh" -O "${ASSETS_BASE}/worker/start.sh"
      packer build -force -var resource_group=$RESOURCE_GROUP packer.json
    )
  else
    >&2 echo "Skipping worker VM image. Run with --force to recreate"
  fi
 
  az deployment group create -g $RESOURCE_GROUP -u "${ASSETS_BASE}/azure/azuredeploy.json" -p "assetsBaseUrl=$ASSETS_BASE"
}

deploy_laboratory() {
  SITE_ID=$(az deployment group show -g $RESOURCE_GROUP -n azuredeploy --query properties.outputs.laboratorySiteId.value -o tsv)

  npm run laboratory:package:appservice
  az webapp deployment source config-zip --ids $SITE_ID --src dist/secure-data-sandbox.zip
  az webapp restart --ids $SITE_ID
}

deploy_worker() {
  REGISTRY=$(az deployment group show -g $RESOURCE_GROUP -n azuredeploy --query properties.outputs.laboratoryRegistryName.value -o tsv)

  az acr import -n $REGISTRY --source docker.io/acanthamoeba/sds-worker:latest -t worker:latest --force
}

deploy_dev() {
  if [ "$DEV" = true ]; then
    az vm wait -g $RESOURCE_GROUP -n bootstrap --custom "instanceView.statuses[?code=='PowerState/deallocated']"
    az vm start -g $RESOURCE_GROUP -n bootstrap
    az deployment group create -g $RESOURCE_GROUP -u "${ASSETS_BASE}/azure/dev.json" -p "sshPublicKey=$(cat ~/.ssh/id_rsa.pub)"
  fi
}

parse_arguments "$@"
validate_arguments

if [ -f .env ]; then
  set -o allexport
  source .env
  set +o allexport
fi

set -ux
deploy_environment
deploy_worker
deploy_laboratory
deploy_dev
