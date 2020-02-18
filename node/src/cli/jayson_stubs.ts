import * as jayson from 'jayson';

import { AnyDescription, ILaboratory, Kind, BenchmarkDescription } from "../laboratory";
import { IRepository, SelectResults } from '../repository';

class JaysonLaboratory implements ILaboratory {
  private readonly client: jayson.Client;

  constructor(hostname: string, port: number) {
    this.client = jayson.Client.http({
      hostname,
      port,
    });
  }
 
  async create(description: AnyDescription): Promise<string> {
    const client = this.client;

    const p = () => {
      return new Promise<string>((resolve, reject) => {
        client.request(
          'create',
          [description],
          // tslint:disable-next-line: no-any
          (err: any, response: any) => {
            if (err) {
              reject(err);
            } else {
              resolve(response.result);
            }
          }
        );
      })
    }

    return p();
  }
  
  run(candidateId: string, suiteId: string): Promise<string> {
    const client = this.client;

    const p = () => {
      return new Promise<string>((resolve, reject) => {
        client.request(
          'run',
          [candidateId, suiteId],
          // tslint:disable-next-line: no-any
          (err: any, response: any) => {
            if (err) {
              reject(err);
            } else {
              resolve(response.result);
            }
          }
        );
      })
    }

    return p();
  }
}

class JaysonRepository implements IRepository {
  private readonly client: jayson.Client;

  constructor(hostname: string, port: number) {
    this.client = jayson.Client.http({
      hostname,
      port,
    });
  }

  initialize(): Promise<void> {
    // TODO: implement
    throw new Error("Method not implemented.");
  }

  selectFromCollection(collection: string): Promise<SelectResults> {
    // TODO: implement
    throw new Error("Method not implemented.");
  }

  selectFromResults(benchmarkId: string): Promise<SelectResults> {
    // TODO: implement
    throw new Error("Method not implemented.");
  }

  select(from: string): Promise<SelectResults> {
    // TODO: implement
    throw new Error("Method not implemented.");
  }
}

// function go() {
//   const lab = new JaysonLaboratory('localhost', 3000);

//   const spec: BenchmarkDescription = {
//     apiVersion: '0.0.1',
//     kind: Kind.BENCHMARK,

//     name: 'benchmark',
//     image: 'image',
//     columns: [],
//   };

//   lab.create(spec);
//   lab.run('a', 'b');
// }

// go();
