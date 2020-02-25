// import * as chai from 'chai';
// import { assert } from 'chai';
// // const chaiAsPromised = require('chai-as-promised');
// // import chaiExclude from 'chai-exclude';
// // import * as http from 'http';

// import * as rp from 'request-promise';
// import { URL } from 'url';

// import {
//   IBenchmark,
//   ICandidate,
//   ILaboratory,
//   IRun,
//   ISuite,
//   RunStatus
// } from '../../../../src/laboratory/logic';

// import {
//   startServer
// } from '../../../../src/laboratory/server';
// import { Server } from 'http';

// // chai.use(chaiExclude);
// // chai.use(chaiAsPromised);

// // let server: Server | undefined;

// // before(async () => {
// //   console.log('before');
// //   console.log('before2');
// //   server = await startServer();
// //   console.log('after');
// // });

// // after(async () => {
// //   if (server) {
// //     server.close();
// //   }
// // });

// const candidate1: ICandidate = {
//   name: 'candidate1',
//   author: 'author1',
//   version: 'v1.0.0',
//   benchmark: 'benchmark1',
//   mode: 'mode1',
// };

// class MockLaboratory implements ILaboratory {
//   allBenchmarks(): Promise<IBenchmark[]> {
//     throw new Error("Method not implemented.");
//   }

//   oneBenchmark(name: string): Promise<IBenchmark> {
//     throw new Error("Method not implemented.");
//   }
//   upsertBenchmark(benchmark: IBenchmark, name?: string | undefined): Promise<void> {
//     throw new Error("Method not implemented.");
//   }
//   allCandidates(): Promise<ICandidate[]> {
//     throw new Error("Method not implemented.");
//   }
//   oneCandidate(name: string): Promise<ICandidate> {
//     throw new Error("Method not implemented.");
//   }
//   upsertCandidate(candidate: ICandidate, name?: string | undefined): Promise<void> {
//     throw new Error("Method not implemented.");
//   }
//   allSuites(): Promise<ISuite[]> {
//     throw new Error("Method not implemented.");
//   }
//   oneSuite(name: string): Promise<ISuite> {
//     throw new Error("Method not implemented.");
//   }
//   upsertSuite(suite: ISuite, name?: string | undefined): Promise<void> {
//     throw new Error("Method not implemented.");
//   }
//   allRuns(): Promise<IRun[]> {
//     throw new Error("Method not implemented.");
//   }
//   oneRun(name: string): Promise<IRun> {
//     throw new Error("Method not implemented.");
//   }
//   createRun(candidate: string, suite: string): Promise<IRun> {
//     throw new Error("Method not implemented.");
//   }
//   updateRunStatus(name: string, status: RunStatus): Promise<void> {
//     throw new Error("Method not implemented.");
//   }
// }

// async function request(
//   base: string,
//   port: number,
//   path: string,
//   method: string,
//   body: object) {

//   const uri = new URL(path, base);
//   uri.port = port.toString();
//   const options = {
//     uri,
//     headers: {
//         'User-Agent': 'Request-Promise'
//     },
//     json: true,
//     method,
//     body,
//   };

//   const res = await rp(options);

//   return res;
// }

// async function jsonrequest(relative: string, method: string, body: object) {
//   const uri = new URL(relative, 'http://localhost:3000');
//   const options = {
//     uri,
//     headers: {
//         'User-Agent': 'Request-Promise'
//     },
//     json: true,
//     method,
//     body,
//   };

//   const res = await rp(options);

//   return res;
// }

// describe('laboratory', () => {
//   describe('server', () => {
//     ///////////////////////////////////////////////////////////////////////////
//     //
//     // Candidates
//     //
//     ///////////////////////////////////////////////////////////////////////////
//     describe('candidates', () => {
//       // it('upsertCandidate()', async () => {
//       //   console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');

//       //   const lab = new MockLaboratory();

//       //   let observed: ICandidate;
//       //   lab.upsertCandidate = async (
//       //     candidate: ICandidate,
//       //     name?: string
//       //   ): Promise<void> => {
//       //     observed = candidate;
//       //   };

//       //   const res = await jsonrequest(
//       //     'candidates/candidate1',
//       //     'PUT',
//       //     candidate1
//       //   );

//       //   assert.deepEqual(observed!, candidate1);
//       //   console.log('===========================================');
//       // });
//     });
//   });
// });
