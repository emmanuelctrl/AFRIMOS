import type { ReactElement, ReactNode } from 'react';

/**
 * Types for the JavaScript `AuthContext.jsx`.
 *
 * The provider stays JavaScript — it is shared with the older `.jsx` screens
 * and is not what this redesign is touching. This declaration sits beside it
 * so the TypeScript components get a real `user` instead of the `null` that
 * `createContext(null)` infers.
 *
 * Mirrors `publicUser()` in `server/src/routes/auth.routes.js`; if a field is
 * added there, add it here too.
 */
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'supplier' | 'buyer';
  userType: string | null;
  emailVerified: boolean;
  /** Gates access to real data — only `verified` accounts get through. */
  verificationStatus: 'pending' | 'verified' | 'rejected';
  supplierProfileId: string | null;
  createdAt: string;
}

export interface AuthValue {
  /** Null while signed out, and until the first `/auth/me` resolves. */
  user: AuthUser | null;
  /** True until the session has been restored on first load. */
  loading: boolean;
  login(email: string, password: string): Promise<AuthUser>;
  signup(payload: Record<string, unknown>): Promise<AuthUser>;
  adminLogin(password: string): Promise<AuthUser>;
  logout(): Promise<void>;
  refreshUser(): Promise<void>;
}

export function AuthProvider(props: { children?: ReactNode }): ReactElement;

export function useAuth(): AuthValue;
