import { DataType, Column, Model, Table } from 'sequelize-typescript';

import {
  IBenchmark,
  ICandidate,
  IRun,
  ISuite,
  RunStatus,
} from '@microsoft/sds';

import { jsonColumn } from './decorators';

@Table
export class Run extends Model<Run> implements IRun {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
  })
  name!: string;

  @Column(DataType.STRING)
  author!: string;

  @Column(DataType.STRING)
  apiVersion!: string;

  @Column(DataType.STRING)
  status!: RunStatus;

  // TODO: REVIEW: magic number 4096
  @Column(jsonColumn<IBenchmark[]>('benchmark', 4096))
  benchmark!: IBenchmark;

  // TODO: REVIEW: magic number 1024
  @Column(jsonColumn<ICandidate[]>('candidate', 1024))
  candidate!: ICandidate;

  // TODO: REVIEW: magic number 1024
  @Column(jsonColumn<ISuite[]>('suite', 1024))
  suite!: ISuite;
}
