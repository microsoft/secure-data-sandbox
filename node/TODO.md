# TODO List

* Top
  * really need the connect command and .dct (and .gitignore)
  * dct should wait for current command before exiting
  * laboratory.yaml should handle inproc, localhost, docker and cloud deployments.
  * dct needs to migrate from ramdisk to localdisk
  * dct will then need sample yaml files
  * dct should not deploy automatically - this should only be done in the shell
  * investigate service rebuild/watcher/restarter for node apps
* Laboratory
  * x Validation
  * x LoadEntity()
* Jayson CLI
  * x Main
  * x Jayson Laboratory RPC stub
  * Jayson Repository RPC stub
  * Jayson RPC stub mocks for unit testing
  * Deploy module
    * Deployer factory
    * laboratory.yaml
    * Access to local filesystem
    * in-process, in-container, cloud
  * Connect module
  * Create module
  * Run module
* LaboratoryServer
  * Jayson-based integration tests for in-proc version
* Cloud mocks
  * In-process blob storage
  * In-process queue storage
  * Console logger
* RepositoryServer
  * Update CLI connect
  * Update blob
  * Crawl blobs
  * Register for blob events
* Try out [pkg](https://www.npmjs.com/package/pkg)
* 