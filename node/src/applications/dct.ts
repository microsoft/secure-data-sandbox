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

async function go() {
  const localDiskPath = undefined;
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

  const desc = await deployLocal(world);
  const lab = new JaysonLaboratory(desc.laboratory.host, desc.laboratory.port);
  const repository = new JaysonRepository(
    desc.repository.host,
    desc.repository.port
  );

  const cli = new CLI(world, lab, repository);
  const cliMain = new CLIMain(cli, world);

  cliMain.run(process.argv.slice(1));
  // process.exit(0);
}

go();
