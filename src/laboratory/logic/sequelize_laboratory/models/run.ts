import { DataType, Column, Model, Table } from 'sequelize-typescript';

import {
  IBenchmark,
  ICandidate,
  IResult,
  IRun,
  ISuite,
  RunStatus,
} from '../../interfaces';

import { jsonColumn } from './decorators';

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

  @Column(DataType.STRING)
  blob!: string;

  // TODO: REVIEW: magic number 1024
  @Column(jsonColumn<RunStatus>('status', 1024))
  status!: RunStatus;

  // TODO: REVIEW: magic number 1024
  @Column(jsonColumn<IBenchmark[]>('benchmark', 1024))
  benchmark!: IBenchmark;

  // TODO: REVIEW: magic number 1024
  @Column(jsonColumn<ICandidate[]>('candidate', 1024))
  candidate!: ICandidate;

  // TODO: REVIEW: magic number 1024
  @Column(jsonColumn<ISuite[]>('suite', 1024))
  suite!: ISuite;
}

@Table
export class Result extends Model<Result> implements IResult {
  @Column({
    type: DataType.STRING,
    unique: true,
  })
  name!: string;

  @Column(DataType.STRING)
  author!: string;

  @Column(DataType.STRING)
  version!: string;

  @Column(DataType.STRING)
  benchmark!: string;

  @Column(DataType.STRING)
  mode!: string;

  @Column(DataType.STRING)
  suite!: string;

  @Column(DataType.STRING)
  candidate!: string;

  @Column(jsonColumn<object>('measures', 1024))
  measures!: object;
}
