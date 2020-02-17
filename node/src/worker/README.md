# Worker 

A service that invokes `Runs` associated with `Candidate-Suite` pairs, pulled from a work queue.
* Configures volume with `Candidate` input files.
* Runs `Candidate` container.
* Runs `Benchmark` container.
* Zips up `Candidate` and `Benchmark` output.
* Stores zipfile in blob storage.

## Queue Message format
* `Candidate` spec
* `Suite` spec
* `Benchmark` spec
* `Run` spec

## Volume Configuration
* Copies of the `Candidate`, `Benchmark`, and `Run` specs
* Copies of the domain data
* Copies of the input data

## ZIP file creation
* `Benchmark` and `Candidate` inputs and outputs
* Specifications
* Log files

## TODO List
* Define queue message format
* Define volume configuration protocol
  * Candidate secrets
  * candidate.yaml
  * benchmark.yaml
* Try out Docker API for Typescript

