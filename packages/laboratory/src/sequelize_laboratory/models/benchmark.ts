import { DataType, Column, Model, Table } from 'sequelize-typescript';

import { IBenchmark, PipelineStage } from '@microsoft/sds';

import { jsonColumn } from './decorators';

@Table
export class Benchmark extends Model<Benchmark> implements IBenchmark {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
  })
  name!: string;

  @Column(DataType.STRING)
  author!: string;

  @Column(DataType.STRING)
  apiVersion!: string;

  // TODO: REVIEW: magic number 4096
  @Column(jsonColumn<PipelineStage[]>('stages', 4096))
  stages!: PipelineStage[];
}
