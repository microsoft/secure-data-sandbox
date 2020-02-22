import { DataType, Column, Model, Table } from 'sequelize-typescript';

import { ICandidate } from '../interfaces';

import { dateColumn } from './decorators';

@Table
export class Candidate extends Model<Candidate> implements ICandidate {
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
  benchmark!: string;

  @Column(DataType.STRING)
  mode!: string;
}
