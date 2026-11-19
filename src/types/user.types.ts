export interface GetUserAccountResponse {
  id: string;
  email: string;
  username: string;
  avatarUrl: null | string;
  subscriptionActive?: boolean;
  subscriptionCancelAtPeriodEnd?: boolean;
  subscriptionCurrentPeriodEnd?: string | null;
}

export interface EditUserAccountRequest {
  username: string;
}
