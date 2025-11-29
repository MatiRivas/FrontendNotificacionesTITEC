// src/hooks/useAuth.fake.ts
export interface AuthUser {
  id: string;
  name?: string;
  role?: 'buyer' | 'seller';
}

export function useAuth() {
  // ÚNICO lugar para setear el user en desarrollo
  const user: AuthUser = {
    id: 'seller-test-456',
    name: 'Demo',
    role: 'seller',
  };
  return { user };
}