/*// src/components/guards/RequireAuth.tsx
import { Navigate, useLocation } from 'react-router-dom';
import React from 'react';

// Sustituye por tu hook real
const useAuth = () => ({ user: { id: 'usuario123', role: 'buyer' as 'buyer' | 'seller' } });

interface Props {
  children: React.ReactNode;   // 👈 en lugar de JSX.Element
}

export default function RequireAuth({ children }: Props) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user?.id) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}*/