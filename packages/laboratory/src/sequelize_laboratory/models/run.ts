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

  @Column(jsonColumn<IBenchmark[]>('benchmark'))
  benchmark!: IBenchmark;

  @Column(jsonColumn<ICandidate[]>('candidate'))
  candidate!: ICandidate;

  @Column(jsonColumn<ISuite[]>('suite'))
  suite!: ISuite;
}
