// Schema generated with
//   typescript-json-schema tsconfig.json ICandidate --required
export const candidateSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  properties: {
    author: {
      type: 'string',
    },
    benchmark: {
      type: 'string',
    },
    createdAt: {
      type: 'string',
    },
    mode: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
    updatedAt: {
      type: 'string',
    },
    version: {
      type: 'string',
    },
  },
  required: ['author', 'benchmark', 'mode', 'name', 'version'],
  type: 'object',
};
