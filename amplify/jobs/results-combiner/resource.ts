import { defineFunction } from '@aws-amplify/backend';

export const resultsCombiner = defineFunction({
  name: 'results-combiner',
  entry: './handler.ts',
  timeoutSeconds: 120,
  memoryMB: 512,
  schedule: [
    '40 13 ? * 2 *',
    '40 13 ? * 3 *',
    '40 13 ? * 4 *',
    '40 13 ? * 5 *',
    '40 13 ? * 6 *',
  ],
});
