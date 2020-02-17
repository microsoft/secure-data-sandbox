# CLI

Command-line interface to perform operations on the laboratory and repository services.
* This reference implementation will likely be recoded in golang for easier distribution.
Might also consider using [pkg](https://www.npmjs.com/package/pkg) to create a self-contained executable from the Node project.
* Uses [JSON-RPC 2.0](https://www.jsonrpc.org/index.html) to communicate with the services.
* RPC implemented with [jayson](https://www.npmjs.com/package/jayson).

## Operations
* connect
* deploy
* create
* run
* list
* results

## TODO List
* Investigate [pkg](https://www.npmjs.com/package/pkg).
* Write manpage
* Decide how to perform authentication.
  * Are credentials passed explicitly in the API?


