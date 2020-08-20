import { DataType, Column, Model, Table } from 'sequelize-typescript';
import { jsonColumn } from './decorators';

import { ICandidate } from '../../interfaces';

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

  // TODO: REVIEW: magic number 1024
  @Column(jsonColumn<string[]>('cmd', 1024))
  cmd!: string[];

  // TODO: REVIEW: magic number 1024
  @Column(jsonColumn<{ [x: string]: string }>('env', 1024))
  env!: { [x: string]: string };
}
