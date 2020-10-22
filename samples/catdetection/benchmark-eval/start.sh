#!/bin/bash
set -euo pipefail

# Verify that the candidate predicted our expected animal
PREDICTION=$(cat /results/prediction.txt)

SCORE=0
if [ "$PREDICTION" == "$EXPECTED_ANIMAL" ]; then 
  echo "Perfect match for run!"
  SCORE=1
else 
  echo "Prediction did not match expected value: $EXPECTED"
fi

echo "TODO: POST to $2: {run: $1, score: $SCORE}"
