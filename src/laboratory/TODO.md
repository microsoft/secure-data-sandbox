# Laboratory TODO

* Integration
  * SQL server dialect
  * Azure queue
  * Deployment
  * Authentication
* npm uninstall request-promise
* Remove startServer()
* Delete nameColumn
* Delete dateColumn
* Cleanup models.test.ts - lots of dead code
* Run router
* Run methods on ILaboratory
  * Generate blob
* CLI
  * help
  * connect
  * benchmark
  * candidate
  * suite
  * run
  * list
  * deploy
* Rename Queue to IQueue. Move from index.ts to interfaces.ts.
* REVIEW: should Queue be templated by T, instead of its methods?
* Where do IBenchmark, ICandidate, IRun, ISuite go?
* Where does ILaboratory go?
* Where does IQueue go?
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
  
