export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: string;
  refreshExpiresAt: string;
}

export type RefreshResult = {
  tokens?: TokenPair;
  statusCode: number;
};
