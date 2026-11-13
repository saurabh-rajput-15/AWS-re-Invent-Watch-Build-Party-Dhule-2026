import React from 'react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { AdminLoginForm } from './AdminLoginForm';

interface AdminProtectedRouteProps {
  onNavigateHome: () => void;
  children: (props: { token: string; onLogout: () => void }) => React.ReactNode;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({
  onNavigateHome,
  children,
}) => {
  const { isAuthenticated, isLoading, error, login, logout, token } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090D16] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#AB5CFF] border-t-transparent" />
          <span className="text-xs text-slate-400">Verifying admin session with server...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !token) {
    return (
      <AdminLoginForm
        onLogin={login}
        onNavigateHome={onNavigateHome}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  return <>{children({ token, onLogout: logout })}</>;
};

