export interface AuthUserPayload {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: string;
  permissions: string[];
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: AuthUserPayload;
}

export interface AccessTokenResponse {
  access: string;
}
