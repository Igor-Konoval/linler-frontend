import { serverEnv } from '@/src/env/server';

import { BaseHttpClient } from './base-http';
import { ServerAuthAdapter } from './server-auth-adapter';

export const serverHttp = new BaseHttpClient(
  new ServerAuthAdapter(),
  serverEnv.API_URL,
);
