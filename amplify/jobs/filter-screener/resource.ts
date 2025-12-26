import { defineFunction } from '@aws-amplify/backend';

export const filterScreener = defineFunction({
  name: 'filter-screener',
  entry: './handler.ts',
  timeoutSeconds: 300,
  memoryMB: 1024,
  schedule: [
    '0 13 ? * 2 *',
    '0 13 ? * 3 *',
    '0 13 ? * 4 *',
    '0 13 ? * 5 *',
    '0 13 ? * 6 *',
  ],
});
