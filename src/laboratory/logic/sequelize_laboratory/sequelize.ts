import { Sequelize, SequelizeOptions } from 'sequelize-typescript';

import { Benchmark, Candidate, Result, Run, Suite } from './models';

export async function initializeSequelize(
  options: SequelizeOptions
): Promise<Sequelize> {
  const sequelize = new Sequelize(options);
  sequelize.addModels([Benchmark, Candidate, Result, Run, Suite]);

  await sequelize.sync();

  return sequelize;
}
