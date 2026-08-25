import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const serverEnv = createEnv({
  server: {
    JWT_ACCESS_SECRET: z.string().min(1),
    API_URL: z.string().url(),
    NODE_ENV: z.enum(['development', 'production']).default('development'),
  },

  experimental__runtimeEnv: process.env,

  emptyStringAsUndefined: true,

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
