import { DataType, Column, Model, Table } from 'sequelize-typescript';

import { ICandidate } from '../../interfaces';

import { dateColumn, nameColumn } from './decorators';

@Table
export class Candidate extends Model<Candidate> implements ICandidate {
  @Column({
    ...nameColumn('name'),
    unique: true,
  })
  name!: string;

  @Column(DataType.STRING)
  author!: string;

  @Column(DataType.STRING)
  version!: string;

  @Column(dateColumn('createdAt'))
  createdAt!: string;

  @Column(dateColumn('updatedAt'))
  updatedAt!: string;

  @Column({
    ...nameColumn('benchmark'),
  })
  benchmark!: string;

  @Column({
    ...nameColumn('mode'),
  })
  mode!: string;
}
