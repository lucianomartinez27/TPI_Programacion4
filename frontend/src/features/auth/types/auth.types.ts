export type Role = 'user' | 'admin';

export interface UserPublic {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: Role;
  disabled: boolean;
  created_at: string;
}

export interface RegisterPayload {
  username: string;
  full_name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface MessageResponse {
  message: string;
}
