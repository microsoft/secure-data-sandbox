// Schema generated with
//   typescript-json-schema tsconfig.json IBenchmark --required
export const benchmarkSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  definitions: {
    IPipeline: {
      properties: {
        mode: {
          type: 'string',
        },
        stages: {
          items: {
            $ref: '#/definitions/IPipelineStage',
          },
          type: 'array',
        },
      },
      required: ['mode', 'stages'],
      type: 'object',
    },
    IPipelineStage: {
      properties: {
        image: {
          type: 'string',
        },
      },
      type: 'object',
    },
    ResultColumn: {
      properties: {
        name: {
          type: 'string',
        },
        type: {
          $ref: '#/definitions/ResultColumnType',
        },
      },
      required: ['name', 'type'],
      type: 'object',
    },
    ResultColumnType: {
      enum: ['float', 'integer', 'string'],
      type: 'string',
    },
  },
  properties: {
    author: {
      type: 'string',
    },
    columns: {
      items: {
        $ref: '#/definitions/ResultColumn',
      },
      type: 'array',
    },
    createdAt: {
      description: 'Enables basic storage and retrieval of dates and times.',
      format: 'date-time',
      type: 'object',
    },
    name: {
      type: 'string',
    },
    pipelines: {
      items: {
        $ref: '#/definitions/IPipeline',
      },
      type: 'array',
    },
    updatedAt: {
      description: 'Enables basic storage and retrieval of dates and times.',
      format: 'date-time',
      type: 'object',
    },
    version: {
      type: 'string',
    },
  },
  required: ['author', 'columns', 'name', 'pipelines', 'version'],
  type: 'object',
};
