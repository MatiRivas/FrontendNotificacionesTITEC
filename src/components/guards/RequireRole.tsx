/*// src/components/guards/RequireRole.tsx
import { Navigate } from 'react-router-dom';
import type { PropsWithChildren } from 'react';

const useAuth = () => ({ user: { id: 'usuario123', role: 'buyer' as 'buyer' | 'seller' } });

export default function RequireRole({ children, role }: PropsWithChildren<{ role: 'buyer' | 'seller' }>) {
  const { user } = useAuth();
  if (!user?.id) return <Navigate to="/auth/login" replace />;
  if (user.role !== role) return <Navigate to="/403" replace />;
  return <>{children}</>;
}*/