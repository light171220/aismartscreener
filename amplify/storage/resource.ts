import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'aismartscreener-storage',
  access: (allow) => ({
    'profile-images/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
    'trade-attachments/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
    'exports/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
    'public/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read']),
    ],
  }),
});