import { DataType, Column, Model, Table } from 'sequelize-typescript';

import {
  IBenchmark,
  ICandidate,
  IRun,
  ISuite,
  RunStatus,
} from '../../interfaces';

import { dateColumn, jsonColumn } from './decorators';

@Table
export class Run extends Model<Run> implements IRun {
  @Column({
    type: DataType.STRING,
    unique: true,
  })
  name!: string;

  @Column(DataType.STRING)
  author!: string;

  @Column(DataType.STRING)
  version!: string;

  // @Column(dateColumn('createdAt'))
  // createdAt!: string;

  // @Column(dateColumn('updatedAt'))
  // updatedAt!: string;

  @Column(DataType.STRING)
  blob!: string;

  @Column(jsonColumn<RunStatus>('status', 1024))
  status!: RunStatus;

  @Column(jsonColumn<IBenchmark[]>('benchmark', 1024))
  benchmark!: IBenchmark;

  @Column(jsonColumn<ICandidate[]>('candidate', 1024))
  candidate!: ICandidate;

  @Column(jsonColumn<ISuite[]>('suite', 1024))
  suite!: ISuite;
}
