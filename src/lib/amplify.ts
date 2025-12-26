import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

export function configureAmplify() {
  const isDev = typeof window !== 'undefined' &&
    window.location.hostname === 'localhost';

  if (isDev) {
    console.log('Running in development mode');
  }
}

export const client = generateClient<Schema>();

export { Amplify };
