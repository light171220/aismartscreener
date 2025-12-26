import { defineFunction } from '@aws-amplify/backend';

export const stockAnalyzer = defineFunction({
  name: 'stock-analyzer',
  entry: './handler.ts',
  timeoutSeconds: 300,
  memoryMB: 512,
});
