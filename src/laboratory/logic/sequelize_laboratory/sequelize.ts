import { Sequelize } from 'sequelize-typescript';

import { Benchmark, Candidate, Result, Run, Suite } from './models';

export async function initializeSequelize(sequelize: Sequelize): Promise<void> {
  sequelize.addModels([Benchmark, Candidate, Result, Run, Suite]);
  await sequelize.sync();
}
