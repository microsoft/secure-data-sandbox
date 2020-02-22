import { DataType, Column, Model, Table } from 'sequelize-typescript';

import { IBenchmark, ICandidate, IRun, ISuite, RunStatus } from '../interfaces';

import { dateColumn, jsonColumn } from './decorators';

@Table
export class Run extends Model<Run> implements IRun {
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

  @Column(jsonColumn<RunStatus>('status'))
  status!: RunStatus;

  @Column(jsonColumn<IBenchmark[]>('benchmark'))
  benchmark!: IBenchmark;

  @Column(jsonColumn<ICandidate[]>('candidate'))
  candidate!: ICandidate;

  @Column(jsonColumn<ISuite[]>('suite'))
  suite!: ISuite;
}
