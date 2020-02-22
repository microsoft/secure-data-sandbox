import { DataType, Column, Model, Table } from 'sequelize-typescript';

import { ISuite } from '../interfaces';

import { dateColumn } from './decorators';

@Table
export class Suite extends Model<Suite> implements ISuite {
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
