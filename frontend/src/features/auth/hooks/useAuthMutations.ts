import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/authStore';
import { register, logout as logoutApi, updateProfile, changePassword } from '../api/authApi';
import { throwApiError } from '../../../shared/api/handleApiError';

export function useLoginMutation() {
  const login = useAuthStore((s) => s.login);
  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      login(username, password),
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (data: {
      username: string;
      email: string;
      full_name: string;
      password: string;
    }) => register(data),
    onError: (error) => {
      throwApiError(error);
    },
  });
}

export function useLogoutMutation() {
  const logout = useAuthStore((s) => s.logout);
  return useMutation({
    mutationFn: logoutApi,
    onSettled: () => {
      logout();
    },
  });
}

export function useUpdateProfileMutation() {
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (data: { full_name?: string; email?: string }) =>
      updateProfile(data),
    onSuccess: (user) => {
      setUser(user);
    },
    onError: (error) => {
      throwApiError(error);
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (data: { old_password: string; new_password: string }) =>
      changePassword(data),
    onError: (error) => {
      throwApiError(error);
    },
  });
}
