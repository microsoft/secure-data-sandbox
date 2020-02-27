import { DataType, Column, Model, Table } from 'sequelize-typescript';

import { ICandidate } from '../../interfaces';

@Table
export class Candidate extends Model<Candidate> implements ICandidate {
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
  image!: string;
}
