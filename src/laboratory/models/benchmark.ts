import { DataType, Column, Model, Table } from 'sequelize-typescript';

import { IBenchmark, IPipeline } from '../interfaces';

import { dateColumn, jsonColumn } from './decorators';

@Table
export class Benchmark extends Model<Benchmark> implements IBenchmark {
  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  author!: string;

  @Column(DataType.STRING)
  version!: string;

  @Column(dateColumn('createdAt'))
  createdAt!: string;

  @Column(dateColumn('updatedAt'))
  updatedAt!: string;

  @Column(DataType.STRING)
  image!: string;

  @Column(jsonColumn<IPipeline[]>('pipelines'))
  pipelines!: IPipeline[];
}
