import { CLI, CLIMain, JaysonLaboratory, JaysonRepository } from '../cli';

import {
  ConsoleLogger,
  Environment,
  LocalDisk,
  LocalQueue,
  RamDisk,
  World,
} from '../cloud';

import { deployLocal } from '../deploy';
import { Kind } from '../laboratory';

async function go() {
//  const localDiskPath = undefined;
  const localDiskPath = 'c:\\temp';
  const localStorage = localDiskPath
    ? new LocalDisk(localDiskPath)
    : new RamDisk();

  const world: World = {
    cloudStorage: new RamDisk(),
    localStorage,
    queueStorage: new LocalQueue(),
    environment: new Environment(),
    logger: new ConsoleLogger('shell'),
    cwd: '/',
  };

  const labPort = 3000;
  const repositoryPort = 3001;
  const connection = {
    apiVersion: '0.0.1',
    kind: Kind.LABORATORY,

    laboratory: {
      host: 'localhost',
      port: labPort,
    },

    repository: {
      host: 'localhost',
      port: repositoryPort,
    },
  }
  // const connection = await deployLocal(world);

  const lab = new JaysonLaboratory(connection.laboratory.host, connection.laboratory.port);
  const repository = new JaysonRepository(
    connection.repository.host,
    connection.repository.port
  );

  const cli = new CLI(world, lab, repository);
  const cliMain = new CLIMain(cli, world);

  cliMain.run(process.argv.slice(1));
  // process.exit(0);
}

go();
