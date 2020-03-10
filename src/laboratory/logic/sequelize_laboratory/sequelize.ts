import { Sequelize } from 'sequelize-typescript';

import { Benchmark, Candidate, Result, Run, Suite } from './models';

export async function initializeSequelize(): Promise<Sequelize> {
  const sequelize = new Sequelize('sqlite::memory:');
  sequelize.addModels([Benchmark, Candidate, Result, Run, Suite]);

  await sequelize.sync();

  return sequelize;
}
