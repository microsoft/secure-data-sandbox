// Schema generated with
//   typescript-json-schema tsconfig.json ISuite --required
export const suiteSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  properties: {
    author: {
      type: 'string',
    },
    benchmark: {
      type: 'string',
    },
    createdAt: {
      description: 'Enables basic storage and retrieval of dates and times.',
      format: 'date-time',
      type: 'object',
    },
    mode: {
      type: 'string',
    },
    name: {
      type: 'string',
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
  required: ['author', 'benchmark', 'mode', 'name', 'version'],
  type: 'object',
};
