#!/bin/bash
set -euo pipefail

npm run cli create benchmark ./samples/catdetection/benchmark.yml
npm run cli create suite ./samples/catdetection/suite.yml
npm run cli create candidate ./samples/catdetection/candidate.yml

npm run cli run cognitiveservices images
