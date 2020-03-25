#!/bin/bash
set -eo pipefail

show_usage() {
  echo 'Usage: deploy.sh -g <resource_group> [--assets <assets_base_uri>] [--force]'
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
  if [[ -z $RESOURCE_GROUP ]]; then
    show_usage
    exit 1
  fi

  ASSETS_BASE=${ASSETS_BASE:-'https://raw.githubusercontent.com/microsoft/data-contest-toolkit/master/deploy'}
  FORCE=${FORCE:-false}
}

deploy_azure() {
  if ! az image show -g $RESOURCE_GROUP -n dct-worker &>/dev/null || [ "$FORCE" = true ]; then
    TMP_DIR=$(mktemp -d)
    (
      pushd $TMP_DIR
      curl -sL -O "${ASSETS_BASE}/worker/packer.json" -O "${ASSETS_BASE}/worker/setup.sh" -O "${ASSETS_BASE}/worker/start.sh"
      packer build -force -var resource_group=$RESOURCE_GROUP packer.json
    )
  else
    >&2 echo "Skipping worker VM image. Run with --force to recreate"
  fi
  
  DEPLOYMENT=$(az deployment group create -g $RESOURCE_GROUP -u "${ASSETS_BASE}/azure/dev.environment.json" -o json)
}

deploy_laboratory() {
  LABORATORY_SITE_ID=$(jq -r .properties.outputs.laboratorySiteId.value <<< $DEPLOYMENT)

  npm run laboratory:package:appservice
  az webapp deployment source config-zip --ids $LABORATORY_SITE_ID --src dist/data-contest-toolkit.zip
  az webapp restart --ids $LABORATORY_SITE_ID
}

parse_arguments "$@"
validate_arguments

set -ux
time deploy_azure
time deploy_laboratory
