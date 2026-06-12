import { BaseHttpClient } from './base-http';
import { ClientAuthAdapter } from './client-auth-adapter';

export const clientHttp = new BaseHttpClient(new ClientAuthAdapter());
