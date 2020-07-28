import { DataType, Column, Model, Table } from 'sequelize-typescript';

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
  benchmark!: string;

  @Column(DataType.STRING)
  image!: string;
}
