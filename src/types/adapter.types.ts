export interface AuthAdapter {
  readonly supportsRefresh: boolean;

  getCookieHeader(): Promise<string | undefined>;

  refreshToken(): Promise<boolean>;
}
