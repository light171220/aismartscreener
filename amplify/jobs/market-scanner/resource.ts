import { defineFunction } from '@aws-amplify/backend';

export const marketScanner = defineFunction({
  name: 'market-scanner',
  entry: './handler.ts',
  timeoutSeconds: 300,
  memoryMB: 512,
  schedule: [
    '0 13 ? * 2 *',
    '0 13 ? * 3 *',
    '0 13 ? * 4 *',
    '0 13 ? * 5 *',
    '0 13 ? * 6 *',
  ],
});
