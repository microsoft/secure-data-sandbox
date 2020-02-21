import {
  DataType,
  Column,
  Model,
  Sequelize,
  Table,
} from 'sequelize-typescript';

import { dateAsString as dateColumn, jsonColumn } from './decorators';
import { IBenchmark, IPipeline } from './interfaces';

@Table
class Benchmark extends Model<Benchmark> implements IBenchmark {

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  author!: string;

  @Column(DataType.STRING)
  version!: string;

  @Column(DataType.STRING)
  image!: string;

  @Column(jsonColumn<IPipeline[]>('pipelines'))
  pipelines!: IPipeline[];

  @Column(dateColumn('createdAt'))
  createdAt!: string;

  @Column(dateColumn('updatedAt'))
  updatedAt!: string;
}


async function go() {
  //
  // Initialize sequlize-typescript
  //
  const sequelize = new Sequelize('sqlite::memory:');
  sequelize.addModels([Benchmark]);

  await Benchmark.sync();

  //
  // Example of creating a Benchmark record from an IBenchmark
  //
  const b: IBenchmark = {
    name: 'foo',
    author: 'bar',
    version: 'v1.0.0',
    pipelines: [
      {
        mode: 'mode1',
        stages: [
          {
            image: 'stage1 image'
          },
          {
            image: 'stage2 image'
          }
        ]
      }
    ],
    createdAt: '2020-02-21T19:07:08.842Z',
    updatedAt: '2020-02-21T19:07:08.842Z'
  };

  const r = await Benchmark.create(b);

  //
  // Example of creating a Benchmark row from an untyped POJO.
  //
  await Benchmark.create({
    name: 'foo2',
    author: 'bar2',
    version: 'v1.0.0',
    pipelines: [
      {
        mode: 'mode2',
        stages: [
          {
            image: 'stage1 image'
          },
          {
            image: 'stage2 image'
          }
        ]
      }
    ]
  });

  //
  // Select and print all records.
  //
  const records = await Benchmark.findAll();
  console.log(JSON.stringify(records, null, 4));
}

go();
