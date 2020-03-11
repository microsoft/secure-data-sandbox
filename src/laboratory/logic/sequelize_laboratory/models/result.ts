import { DataType, Column, Model, Table } from 'sequelize-typescript';

import { IResult } from '../../interfaces';
import { Measures } from '../../types';

import { jsonColumn } from './decorators';

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
  measures!: Measures;
}
