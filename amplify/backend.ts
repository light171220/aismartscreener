import { defineBackend } from '@aws-amplify/backend';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Stack } from 'aws-cdk-lib';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { polygonFetcher } from './functions/polygon-fetcher/resource';
import { marketScanner } from './jobs/market-scanner/resource';
import { stockAnalyzer } from './jobs/stock-analyzer/resource';
import { method1Screener } from './jobs/method1-screener/resource';
import { method2Screener } from './jobs/method2-screener/resource';
import { resultsCombiner } from './jobs/results-combiner/resource';
import { filterScreener } from './jobs/filter-screener/resource';

const backend = defineBackend({
  auth,
  data,
  storage,
  polygonFetcher,
  marketScanner,
  stockAnalyzer,
  method1Screener,
  method2Screener,
  resultsCombiner,
  filterScreener,
});

const dataStack = Stack.of(backend.data);
const region = dataStack.region;
const account = dataStack.account;

const bedrockPolicy = new PolicyStatement({
  sid: 'BedrockInvokeModel',
  effect: Effect.ALLOW,
  actions: [
    'bedrock:InvokeModel',
    'bedrock:InvokeModelWithResponseStream',
  ],
  resources: [
    'arn:aws:bedrock:*::foundation-model/anthropic.claude-3-5-sonnet-20240620-v1:0',
    'arn:aws:bedrock:*::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0',
    'arn:aws:bedrock:*::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0',
    'arn:aws:bedrock:*::foundation-model/anthropic.claude-3-haiku-20240307-v1:0',
    'arn:aws:bedrock:*::foundation-model/anthropic.claude-*',
    'arn:aws:bedrock:*::foundation-model/*',
    `arn:aws:bedrock:${region}:${account}:inference-profile/us.anthropic.claude-*`,
    `arn:aws:bedrock:*:${account}:inference-profile/*`,
  ],
});

const dataResources = backend.data.resources;

Object.entries(dataResources.functions).forEach(([name, lambdaFunction]) => {
  lambdaFunction.addToRolePolicy(bedrockPolicy);
});

const bedrockDataSource = backend.data.resources.graphqlApi.addHttpDataSource(
  'BedrockDataSource',
  `https://bedrock-runtime.${region}.amazonaws.com`,
  {
    authorizationConfig: {
      signingRegion: region,
      signingServiceName: 'bedrock',
    },
  }
);

bedrockDataSource.grantPrincipal.addToPrincipalPolicy(
  new PolicyStatement({
    sid: 'BedrockHttpDataSource',
    effect: Effect.ALLOW,
    actions: [
      'bedrock:InvokeModel',
      'bedrock:InvokeModelWithResponseStream',
    ],
    resources: [
      'arn:aws:bedrock:*::foundation-model/anthropic.claude-*',
      'arn:aws:bedrock:*::foundation-model/*',
      `arn:aws:bedrock:${region}:${account}:inference-profile/*`,
    ],
  })
);

export default backend;
