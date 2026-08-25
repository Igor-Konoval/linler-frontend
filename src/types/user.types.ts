export interface GetUserAccountResponse {
  id: string;
  email: string;
  username: string;
  avatarUrl: null | string;
}

export interface EditUserAccountRequest {
  username: string;
}
