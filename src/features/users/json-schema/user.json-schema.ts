// This regex enforces a "safe password" policy requiring at least one uppercase letter,
// one lowercase letter, one digit, and one special character, with a minimum length of 8.
import { IJsonSchema } from '@denis_bruns/core';

const SAFE_PASSWORD_PATTERN =
  '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()\\-_=+{};:,<.>]).{8,}$';

export const createUserSchema: IJsonSchema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
    name: { type: 'string', minLength: 2 },
    password: {
      type: 'string',
      minLength: 8,
      pattern: SAFE_PASSWORD_PATTERN,
      errorMessage: {
        type: 'Password must be a valid string.',
        minLength: 'Password must be at least 8 characters long.',
        pattern:
          'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character.',
      },
    },
  },
  required: ['email', 'name', 'password'],
  additionalProperties: false,
};

export const updateUserSchema: IJsonSchema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
    name: { type: 'string', minLength: 2 },
    password: {
      type: 'string',
      minLength: 8,
      pattern: SAFE_PASSWORD_PATTERN,
      errorMessage: {
        type: 'Password must be a valid string.',
        minLength: 'Password must be at least 8 characters long.',
        pattern:
          'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character.',
      },
    },
    isVerified: { type: 'boolean' },
  },
  additionalProperties: false,
};
