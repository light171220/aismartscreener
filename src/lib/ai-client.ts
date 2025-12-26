import { generateClient } from 'aws-amplify/api';
import { createAIHooks } from '@aws-amplify/ui-react-ai';
import type { Schema } from '../../amplify/data/resource';

// Create the Amplify client with userPool auth
export const aiClient = generateClient<Schema>({ authMode: 'userPool' });

// Create AI hooks from the client
// These hooks connect to the conversation routes defined in the schema
export const { useAIConversation, useAIGeneration } = createAIHooks(aiClient);

// Export the client for direct use
export default aiClient;
