import { defineFunction } from '@aws-amplify/backend';

export const method2Screener = defineFunction({
  name: 'method2-screener',
  entry: './handler.ts',
  timeoutSeconds: 300,
  memoryMB: 1024,
  schedule: [
    '35 13 ? * 2 *',
    '35 13 ? * 3 *',
    '35 13 ? * 4 *',
    '35 13 ? * 5 *',
    '35 13 ? * 6 *',
  ],
});
