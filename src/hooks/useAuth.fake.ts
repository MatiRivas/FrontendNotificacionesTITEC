// src/hooks/useAuth.fake.ts
export interface AuthUser {
  id: string;
  name?: string;
  role?: 'buyer' | 'seller';
}

export function useAuth() {
  // ÚNICO lugar para setear el user en desarrollo
  const user: AuthUser = {
    id: 'buyer-test-123',
    name: 'Demo',
    role: 'buyer',
  };
  return { user };
}