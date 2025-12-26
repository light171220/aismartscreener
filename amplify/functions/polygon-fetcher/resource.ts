import { defineFunction } from '@aws-amplify/backend';

export const polygonFetcher = defineFunction({
  name: 'polygon-fetcher',
  entry: './handler.ts',
  timeoutSeconds: 30,
  memoryMB: 256,
});
