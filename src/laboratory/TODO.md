# Laboratory TODO

* x Correct createdAt/updatedAt handling
  * x JSON parse reviver - parsing seems to be done by express
  * x Change probably goes into routes
  * x Perhaps validateFoo() methods could strip createdAt/updatedAt
  * x More likely normalizeFoo() methods
  * x Remove dateColumn decorator
  * x Check json schema generation/validation for Date
  * x bodyParser.json
  * x Figure out some way to unit test
* Candidate & Suite: verify that referenced model is provided by benchmark.
* ? server.ts should not initializeSequelize()
* x Remove naming.ts
* x Candidate router
* Suite router
* Run router
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
* Accidentally PUT benchmark to candidates seems error-prone.
* npm uninstall request-promise
* 
  
