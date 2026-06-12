export interface AuthAdapter {
  getAccessToken(): Promise<string | undefined>;

  getRefreshToken(): Promise<string | undefined>;

  getCookieHeader(): Promise<string | undefined>;

  refreshToken(refreshToken: string): Promise<boolean>;
}
