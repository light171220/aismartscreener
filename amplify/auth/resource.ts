import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailSubject: 'AI Smart Screener - Verify your email',
      verificationEmailBody: (createCode) =>
        `Welcome to AI Smart Screener! Your verification code is: ${createCode()}`,
      verificationEmailStyle: 'CODE',
    },
  },

  userAttributes: {
    preferredUsername: {
      required: true,
      mutable: true,
    },
    phoneNumber: {
      required: false,
      mutable: true,
    },
  },

  multifactor: {
    mode: 'OPTIONAL',
    totp: true,
  },

  accountRecovery: 'EMAIL_ONLY',

  groups: ['admin', 'trader', 'viewer'],
});
