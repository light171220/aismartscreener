// This file configures Amplify and must be imported first
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';

// Log the configuration for debugging
console.log('Amplify outputs auth config:', outputs.auth);

// Configure Amplify immediately when this module loads
Amplify.configure(outputs);

// Verify configuration was applied
const config = Amplify.getConfig();
console.log('Amplify configured with auth:', config.Auth);

export { outputs };
