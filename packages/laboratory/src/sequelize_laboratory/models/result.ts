import { DataType, Column, Model, Table } from 'sequelize-typescript';

import { IResult, Measures } from '@microsoft/sds';

import { jsonColumn } from './decorators';

@Table
export class Result extends Model<Result> implements IResult {
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
  benchmark!: string;

  @Column(DataType.STRING)
  suite!: string;

  @Column(DataType.STRING)
  candidate!: string;

  @Column(jsonColumn<object>('measures'))
  measures!: Measures;
}
