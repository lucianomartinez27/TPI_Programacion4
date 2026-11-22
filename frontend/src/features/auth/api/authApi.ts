import api from '../../../shared/api/axiosInstance';
import type { UserRead, UsuarioListRead } from '../../../shared/api/types';

export async function login(username: string, password: string) {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);
  return api.post('/auth/token', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
}

export async function register(data: {
  username: string;
  email: string;
  full_name: string;
  password: string;
}) {
  return api.post<UserRead>('/auth/register', data);
}

export async function logout() {
  return api.post('/auth/logout');
}

export async function getMe(): Promise<UserRead> {
  const { data } = await api.get<UserRead>('/auth/me');
  return data;
}

export async function updateProfile(data: {
  full_name?: string;
  email?: string;
}): Promise<UserRead> {
  const { data: result } = await api.put<UserRead>('/auth/me', data);
  return result;
}

export async function changePassword(data: {
  old_password: string;
  new_password: string;
}) {
  return api.post('/auth/me/password', data);
}

// Admin
export async function listUsers(): Promise<UsuarioListRead[]> {
  const { data } = await api.get<UsuarioListRead[]>('/usuarios/');
  return data;
}

export async function activateUser(userId: number): Promise<UsuarioListRead> {
  const { data } = await api.post<UsuarioListRead>(`/usuarios/${userId}/activar`);
  return data;
}

export async function deactivateUser(userId: number): Promise<UsuarioListRead> {
  const { data } = await api.post<UsuarioListRead>(`/usuarios/${userId}/desactivar`);
  return data;
}
