# Design Decisions

* Fairly flat folder hierarchy for specification files. One folder/collection per KIND.
* Blob and table naming
  * Goals
    * Suitable blob paths
    * Suitable for table names
      * [Azure Storage Names](https://docs.microsoft.com/en-us/archive/blogs/jmstall/azure-storage-naming-rules)
    * Suiteable for bash command parameters
    * Eliminate risk of injection attack
    * Eliminate risk of aliasing attack
  * Characteristics
    * Start with unicode alpha character
    * Continue with ASCII alphanumeric, '.', '-', or '_'. NOTE: consider using Unicode if regex library supports.
    * Not case sensitive
    * Length limited
    * Results table names must not collide with collection table names.
  * Does encodeAndVerify() need to work for table names? Only name that is used as a table name is the benchmarkid.
  * Do we want to do base32 encoding to allow puntuation + spaces in benchmark names?
* Error hierarchy design
  * Want to know which to pass back across RPC.
* TypeScript and Node
  * Definitely for Laboratory and Repository.
  * Consider for CLI, using [pkg](https://www.npmjs.com/package/pkg)
* [JSON-RPC 2.0](https://www.jsonrpc.org/index.html) to communicate with the services
  * Definitely for Laboratory and Repository.
  * Worker doesn't currently support any RPCs (in just monitors a queue).
  * RPC implemented with [jayson](https://www.npmjs.com/package/jayson).
* Need to design whitelist provisioning
  * Single whitelist.yaml file?
  * Multiple yaml files in a whitelist folder?
  * Portion of the laboratory.yaml?

  
