import { defineFunction } from '@aws-amplify/backend';

export const method1Screener = defineFunction({
  name: 'method1-screener',
  entry: './handler.ts',
  timeoutSeconds: 300,
  memoryMB: 1024,
  schedule: [
    '30 13 ? * 2 *',
    '30 13 ? * 3 *',
    '30 13 ? * 4 *',
    '30 13 ? * 5 *',
    '30 13 ? * 6 *',
  ],
});
