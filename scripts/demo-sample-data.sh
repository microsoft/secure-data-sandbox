#!/bin/bash
set -euo pipefail

npm run cli create benchmark sample-data/benchmark1.yaml
npm run cli create suite sample-data/suite1.yaml
npm run cli create candidate sample-data/candidate1.yaml

npm run cli run candidate1 suite1
