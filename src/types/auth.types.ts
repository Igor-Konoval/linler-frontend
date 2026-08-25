export interface GetUserResponse {
  id: string;
  email: string;
  username: string;
  avatarUrl: null | string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
