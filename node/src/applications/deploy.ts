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

  const connection = await deployLocal(world);
}

go();
