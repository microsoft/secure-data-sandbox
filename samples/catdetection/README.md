# Cat Detection

This sample demonstrates a three stage pipeline with the following behavior

1. Preparation
  * Downloads a cat picture from the Internet
  * Stores the image on an ephemeral volume
2. Candidate
  * Reads the source image
  * Makes a call to Azure Cognitive Services to get its category
  * Translates the raw API output into the desired format
  * Saves the result to an ephemeral volume
3. Evaluation
  * Reads the Candidate's results
  * Determines whether or not a cat was correctly identified

## Explanation

This sample demonstrates several aspects of SDS for Benchmarks/Candidates/Runs

Downloading a cat photo is analagous to executing a query against an API or data lake to load data - which may or may not be preprocessed for optimal usage by the Candidate. Volumes are used to durably pass data between containers - but not used as long-term storage. 

The Candidate reads and has access only to the data that it has been provided. The expectation is that the Candidate adheres to the contract set forth by the Benchmark design. It also calls out to an external API for some, but not all of its ML-related work. 

And finally, the Evaluation container is aware of ground-truth, and scores the Candidate's results based on a criteria that has meaning to the business, versus other methods that may be purely mathematical.
