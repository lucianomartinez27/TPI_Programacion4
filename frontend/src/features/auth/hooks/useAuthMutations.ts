import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/authStore';
import { login, register, logout, getMe, updateProfile, changePassword } from '../api/authApi';
import { throwApiError } from '../../../shared/api/handleApiError';

export const ME_QUERY_KEY = ['auth', 'me'];

export function useMe() {
  const isAuthPage = ['/login', '/register'].includes(window.location.pathname);

  return useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: getMe,
    retry: false,
    enabled: !isAuthPage,
  });
}

export function useLoginMutation() {
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      login(username, password),
    onSuccess: () => {
      getMe().then(setUser).catch(() => {});
    },
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
  return useMutation({
    mutationFn: () => logout(),
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
