# Laboratory TODO

* Top
  * Reduce sequelize console spew
  * Service should print out port and hostname (for README.md demo script)
  * Consider using SQL ids instead of GUIDs for run name
  * Server Error: listen EADDRINUSE: address already in use :::3000
  * Enforce workflow for status changes (e.g. disallow complete to created)
  * Authentication
  * x REVIEW use of TypeError instead of IllegalOperationError or EntityNotFoundError
  * x REVIEW: net.Server vs http.Server
  * Are README.md dependencies correct? Does the user have to install anything else?
  * TODO: update readme to correct supported version of node. package.json says 10.0.3, README.md says 13.7.0.
  * REVIEW: are suite names globally unique or namespaced to benchmarks? 
  * README.md
    * Template
    * Generator
  * x Consistent use of config in LaboratoryClient
  * CLI
    * connect with no arguments shows connection
    * x Connect command shouldn't show connected state error at top.
    * = Convert to class - converted to function instead.
    * Formatting for measures - e.g. fixed, etc.
    * list run command should have id column instead of name
    * x Top-level try/catch reporter for better error messages
    * Suppress id property in show command
    * x list runs should show status, suite, candidate
    * x improve error messages
      * x Scenario
        * x connect http:/foobar - Connected to http://http/ - note single /
        * x results benchmark1 suite1
        * x Gives schema validation error
      * x Scenario
        * xconnect google.com or microsoft.com
        * x results list benchmark
        * x Show google html
      * x Message when connection refused: UnhandledPromiseRejectionWarning: Error: connect ECONNREFUSED 127.0.0.1:5000
      * x Message when list and show get no results
        * x node build\src\cli\dct.js results benchmark suite
      * x node build\src\cli\dct.js show benchmark foo (returns 500)
      * x node build\src\cli\dct.js show run 18538ce (TypeError: Invalid uuid 18538ce)
      * x node build\src\cli\dct.js show run foo (TypeError: Invalid uuid foo)
      * x node build\src\cli\dct.js create foo bar (TypeError: Invalid entity "foo")
      * x node build\src\cli\dct.js create benchmark bar (Error: ENOENT: no such file or directory, open 'bar')
      * x node build\src\cli\dct.js show foo
      * x When server is down
        * x Error: connect ECONNREFUSED 127.0.0.1:3000
    * x Better error messages for errors transported on the wire
    * x Error handling strategy for LaboratoryClient
    * Commands
      * x connect command
        * x .dct file location
        * x report connection status on startup
      * x create benchmark|suite|candidate
      * x list benchmark|suite|candidate
      * x run
      * x list results w/formatted table output
      * x demo command
      * deploy command
    * Bash completion api
    * = usage configuration in yargs
    * = Consider using luxon in reviver - probably can't since io-ts uses Date
    * x Set version
    * x examples in usage()
    * x Spike commander as replacement for yargs
    * x ReferenceError: Cannot access 'benchmarkOps' before initialization
      * x node build\src\cli\dct.js list benchmark
    * x No error for bad command-line arguments
      * x node build\src\cli\dct.js r benchmark1 suite2
    * x ILaboratory stubs (LaboratoryClient)
    * x Unit testing strategy for LaboratoryClient (need service on http://localhost) - used nock
  * = Recode server.test.ts to use ILaboratory stub - decided not to do this
  * Shell
  * sequelize configuration
  * x Express routes for AllResults()
  * x Rename Date2 => DateType
  * x Move validate() out of schemas directory. Remove schemas directory.
  * x Split validate.ts into type-specific (validate()) and JSON-specific (entityBaseReviver)
  * Figure out where messages.ts goes.
  * Review laboratory/server unit test
    * Shims
    * x Commented out code in reportRunResults()
  * Unit tests for runs
    * x Express routes - review these tests - updateRunStatus() and reportRunResults()
    * x Laboratory
  * x Rework express body payload format - e.g. UpdateRunStatusRequestBody
  * Figure out better, less manual process for schema validation
    * x io-ts?
    * Route generator?
    * Is there some automatic Express-app implementer that works from existing TS types?
  * Figure out better structure for laboratory class.
    * Perhaps use mixins to break up large file.
    * Perhaps use partial classes if they exist in Typescript
  * AAD Express middleware
  * Telemetry
  * x Review models.test.ts - dead code, duplicated code with data.js
  * x Move test data.ts and shared.ts up one level.
  * x Figure out tsc/bluebird versioning problem on the mac.
    * x VSCode reports errors in laboratory.ts
    * x typescript-json-schema errors
    * x Problem due to old version of tsc, globally installed, and used by VSCode
    * x https://code.visualstudio.com/docs/typescript/typescript-compiling#_using-newer-typescript-versions
  * x Remove column definitions from Benchmark
  * x Express routes
    * x Schema validation for ReportRunResultsRequestBody
    * x Schema validation for UpdateRunStatusRequestBody
  * x Messages should include reporting endpoints (statusEndpoint, resultsEndpoint)
* Items to track in Project
  * SequelizeLaboratory run methods
    * allRuns()
    * oneRun()
    * createRun()
      * integrate with IQueue
    * updateRunStatus()
  * SequelizeLaboratory Results tables
    * Benchmark includes results schema
    * Dynamic sequelize model, created from Benchmarks table
* Integration
  * SQL server dialect
  * Azure queue
  * Deployment
  * Authentication
* x npm uninstall request-promise
* Remove startServer()
* x Delete nameColumn
* x Delete dateColumn
* Cleanup models.test.ts - lots of dead code
* x Run router
* x Run router unit test
* Run methods on ILaboratory
  * x Generate blob
  * Queue IRun
  * Figure out how to pass in global constants like runBlobBase.
  * Unit tests
* CLI
  * help
  * connect
  * benchmark
  * candidate
  * suite
  * run
  * list
  * deploy
* Promote laboratory express server to peer of queue? Move it to apps?
* REVIEW: is "reflect-metadata": "^0.1.13" only a dev-dependency?
* Rename Queue to IQueue. Move from index.ts to interfaces.ts.
* REVIEW: should Queue be templated by T, instead of its methods?
* Where do IBenchmark, ICandidate, IRun, ISuite go?
* Where does ILaboratory go?
* Where does IQueue go?
* Review package.json dependencies.
* * uuid use v1()
* Colocate shims - XMLHttpRequest
* JSDOCs
* Validator for queue message
* Look at apache airflow
* deepStrictEqual
* * DESIGN: who gets docker digest from image - laboratory or worker?
* x Suite router
* x Suite methods on ILaboratory
* x Correct createdAt/updatedAt handling
  * x JSON parse reviver - parsing seems to be done by express
  * x Change probably goes into routes
  * x Perhaps validateFoo() methods could strip createdAt/updatedAt
  * x More likely normalizeFoo() methods
  * x Remove dateColumn decorator
  * x Check json schema generation/validation for Date
  * x bodyParser.json
  * x Figure out some way to unit test
* x Candidate & Suite: verify that referenced model is provided by benchmark.
* ? server.ts should not initializeSequelize()
* x Remove naming.ts
* x Candidate router
* x Validate that modes in a benchmark are unique
* Can unique modes be enforced in JSON-schema?
* better-ajv-erros integration
* Documentation
  * app.ts: debug: process.env.ENV !== 'prod',
  * jsdoc comments
* Review
  * app.ts: res.header('Access-Control...')
  * Consider reintroducing nameColumn decorator.
  * check sqlite error behavior on string value (varchar(256)) too long.
  * dateColumn decorator does not seem the apply to createdAt and updatedAt
  * Investigate schema verification in jsonColumn decorator.
  * Consider removing luxon
* Duplicate code
  * toPOJO()
  * assertDeepEqual()
* Accidentally PUT benchmark to candidates seems error-prone. Also PUT suite/candidate to candidate/suite.
* 
  
