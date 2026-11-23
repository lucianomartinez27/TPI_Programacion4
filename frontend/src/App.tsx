import { useEffect } from 'react';
import { AppRouter } from '@/routes/AppRouter';
import { useAuthStore } from '@/store/authStore';
import { Toast } from '@/shared/ui/Toast';

export default function App() {
  const checkSession = useAuthStore((s) => s.checkSession);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  return (
    <>
      <AppRouter />
      <Toast />
    </>
  );
}
