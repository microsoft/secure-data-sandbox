import * as jayson from 'jayson';
import { ILaboratory } from './interfaces';
import { Laboratory } from './laboratory';

// Can use jayson CLI as follows:
// node node_modules\jayson\bin\jayson.js -u http://localhost:3000 -m create -p "[{\"a\":1},2]"

class LaboratoryServer {
  server: jayson.Server;
  laboratory: ILaboratory;

  constructor(laboratory: ILaboratory) {
    this.laboratory = laboratory;

    this.server = new jayson.Server({
      // tslint:disable-next-line:no-any
      create(args: [any], callback: any) {
        console.log(`create xxx "${args[0].toString()}"`);
        callback(null, 'ok');
      },

      // tslint:disable-next-line:no-any
      run(args: [string, string], callback: any) {
        const c = args[0];
        const s = args[1];
        console.log(`run candidate(${c}) suite(${s})`);
        callback(null, 'ok');
      },
    });
  }

  start(port: number) {
    console.log(`Listening on port ${port}`);
    this.server.http().listen(port);
  }
}

function go() {
  const laboratory: ILaboratory | undefined = undefined;
  const server = new LaboratoryServer(laboratory!);
  server.start(3000);
}

go();
