# Repository Service 

A [JSON-RPC 2.0](https://www.jsonrpc.org/index.html) service that maintains a table-based representation of specifications in blob storage.
* `Benchmarks`
* `Suites`
* `Candidates`
* `Runs`

The `Repository Service` registers for blob-change events and then crawls blob storage to populate tables from existing blobs.

Single `update(path)` function invoked by crawl and change events. Performs idempotent updates to tables.

Factory creates instances targetting different table providers.

## TODO List

