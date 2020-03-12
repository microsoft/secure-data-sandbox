# Laboratory TODO

* Top
  * Express routes for AllResults()
  * CLI
    * ILaboratory stubs
    * connect
    * create benchmark|suite|candidate
    * list benchmark|suite|candidate
    * run
    * list results w/formatted table output
    * deploy
  * Recode server.test.ts to use ILaboratory stub
  * Shell
  * sequelize configuration
  * x Rename Date2 => DateType
  * x Move validate() out of schemas directory. Remove schemas directory.
  * x Split validate.ts into type-specific (validate()) and JSON-specific (entityBaseReviver)
  * Figure out where messages.ts goes.
  * Review laboratory/server unit test
    * Shims
    * Commented out code in reportRunResults()
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
  
