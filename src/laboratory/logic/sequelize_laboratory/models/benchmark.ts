import { DataType, Column, Model, Table } from 'sequelize-typescript';

import { IBenchmark, IPipeline, ResultColumn } from '../../interfaces';

import { jsonColumn } from './decorators';

@Table
export class Benchmark extends Model<Benchmark> implements IBenchmark {
  @Column({
    type: DataType.STRING,
    unique: true,
  })
  name!: string;

  @Column(DataType.STRING)
  author!: string;

  @Column(DataType.STRING)
  version!: string;

  @Column(jsonColumn<IPipeline[]>('pipelines', 1024))
  pipelines!: IPipeline[];

  @Column(jsonColumn<ResultColumn[]>('columns', 1024))
  columns!: ResultColumn[];
}
