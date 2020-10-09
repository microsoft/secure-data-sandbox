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

  @Column(jsonColumn<Record<string, string>>('properties', 1024))
  properties!: Record<string, string>;

  // TODO: REVIEW: magic number 1024
  @Column(jsonColumn<SuiteVolume[]>('volumes', 1024))
  volumes!: SuiteVolume[];
}
