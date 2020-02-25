import * as rp from 'request-promise';
import { URL } from 'url';

import { ICandidate } from './logic';
import { startServer } from './server';

async function request(
  base: string,
  port: number,
  path: string,
  method: string,
  body: object
) {
  const uri = new URL(path, base);
  uri.port = port.toString();
  const options = {
    uri,
    headers: {
      'User-Agent': 'Request-Promise',
    },
    json: true,
    method,
    body,
  };

  const res = await rp(options);

  return res;
}

// async function startServer() {
//   const port = process.env.PORT || 3000;

//   (async () => {
//     const app = await createApp();

//     createServer(app).listen(port, () =>
//       console.info(`Server running on port ${port}`)
//     );
//   })();
// }

async function test() {
  startServer();

  const candidate1: ICandidate = {
    name: 'candidate1',
    author: 'author1',
    version: 'v1.0.0',
    benchmark: 'benchmark1',
    mode: 'mode1',
  };

  const res = await request(
    'http://localhost',
    3000,
    'candidates/foo',
    'PUT',
    candidate1
  );

  console.log(res);
}

test();

// function test() {
//   const candidate: ICandidate = {
//     name: 'foo',
//     author: 'bar',
//     version: 'v1.0.0',
//     createdAt: new Date('1970-01-01T00:00:00.000Z'),
//     updatedAt: new Date('1970-01-01T00:00:00.000Z'),
//     benchmark: 'benchmark',
//     mode: 'mode',
//   };

//   const text = JSON.stringify(candidate);

//   // // tslint:disable-next-line:no-any
//   // const reviver = (key: string, value: any) => {
//   //   if (key === 'updatedAt' || key === 'createdAt') {
//   //     return new Date(value);
//   //   } else {
//   //     return value;
//   //   }
//   // }

//   const parsed = JSON.parse(text, entityBaseReviver);
//   const result = validateCandidate(parsed);
//   console.log();
// }
