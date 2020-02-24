import { Sequelize } from 'sequelize-typescript';

import {
  Benchmark,
  Candidate,
  Run,
  Suite,
} from './logic/sequelize_laboratory/models';

export async function initializeSequelize(): Promise<Sequelize> {
  const sequelize = new Sequelize('sqlite::memory:');
  sequelize.addModels([Benchmark, Candidate, Run, Suite]);

  await Benchmark.sync();
  await Candidate.sync();
  await Run.sync();
  await Suite.sync();

  return sequelize;
}
