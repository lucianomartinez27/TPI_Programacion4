import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './shared/api/queryClient';
import { AppRouter } from './routes/AppRouter';
import { useAuthStore } from './store/authStore';
import { useMe } from './features/auth/hooks/useAuthMutations';
import { useEffect } from 'react';

function AppContent() {
  const setUser = useAuthStore((s) => s.setUser);
  const { data: user, isLoading, isError } = useMe();

  useEffect(() => {
    if (user) {
      setUser(user);
    } else if (isError) {
      setUser(null);
    }
  }, [user, isError, setUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-orange-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  return <AppRouter />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App
