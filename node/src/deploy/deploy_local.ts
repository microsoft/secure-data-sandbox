import { World } from '../cloud';

import {
  Kind,
  Laboratory,
  LaboratoryDescription,
  LaboratoryServer,
} from '../laboratory';

export async function deployLocal(
  world: World
): Promise<LaboratoryDescription> {
  const labPort = 3000;
  const repositoryPort = 3001;

  const lab = new Laboratory(world);
  const labService = new LaboratoryServer(lab);
  labService.start(labPort);

  return {
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
  };
}
