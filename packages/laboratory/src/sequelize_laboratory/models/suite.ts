import { DataType, Column, Model, Table } from 'sequelize-typescript';

import { ISuite, SuiteVolume } from '@microsoft/sds';

import { jsonColumn } from './decorators';

@Table
export class Suite extends Model<Suite> implements ISuite {
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

  @Column(jsonColumn<Record<string, string>>('properties'))
  properties!: Record<string, string>;

  @Column(jsonColumn<SuiteVolume[]>('volumes'))
  volumes!: SuiteVolume[];
}
