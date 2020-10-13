import { DataType, Column, Model, Table } from 'sequelize-typescript';
import { jsonColumn } from './decorators';

import { ICandidate } from '@microsoft/sds';

@Table
export class Candidate extends Model<Candidate> implements ICandidate {
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
  image!: string;

  @Column(jsonColumn<string[]>('cmd'))
  cmd!: string[];

  @Column(jsonColumn<{ [x: string]: string }>('env'))
  env!: { [x: string]: string };
}
