// Schema generated with
//   typescript-json-schema tsconfig.json IRunRequest --required
export const runRequestSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  properties: {
    candidate: {
      type: 'string',
    },
    suite: {
      type: 'string',
    },
  },
  required: ['candidate', 'suite'],
  type: 'object',
};
