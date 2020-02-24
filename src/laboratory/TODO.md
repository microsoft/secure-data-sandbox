# Laboratory TODO

* Correct createdAt/updatedAt handling
  * JSON parse replacer - parsing seems to be done by express
  * Change probably goes into routes
  * Perhaps validateFoo() methods could strip createdAt/updatedAt
  * More likely normalizeFoo() methods
  * Remove dataColumn decorator
  * Check json schema generation/validation for Date
* server.ts should not initializeSequelize()
* x Remove naming.ts
* Candidate router
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
  
