import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getPlan, type PlanDefinition, type PlanId } from '@/configs/plans';
import * as authService from '@/services/authService';
import type { User, UserProfile } from '@/services/types';

export type AuthContextValue = {
  user: User | null;
  plan: PlanDefinition;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (input: authService.RegisterInput) => Promise<User>;
  exploreAsGuest: () => Promise<User>;
  signOut: () => Promise<void>;
  updateProfile: (patch: {
    name?: string;
    profile?: UserProfile;
    institution?: string;
  }) => Promise<void>;
  selectPlan: (plan: PlanId) => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    authService
      .getCurrentUser()
      .then((current) => {
        if (active) setUser(current);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const next = await authService.login(email, password);
    setUser(next);
    return next;
  }, []);

  const signUp = useCallback(async (input: authService.RegisterInput) => {
    const next = await authService.register(input);
    setUser(next);
    return next;
  }, []);

  const exploreAsGuest = useCallback(async () => {
    const next = await authService.continueAsGuest();
    setUser(next);
    return next;
  }, []);

  const signOut = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback<AuthContextValue['updateProfile']>(
    async (patch) => {
      if (!user) return;
      setUser(await authService.updateUser(patch));
    },
    [user],
  );

  const selectPlan = useCallback<AuthContextValue['selectPlan']>(
    async (plan) => {
      if (!user) return;
      setUser(await authService.changePlan(plan));
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      plan: getPlan(user?.plan ?? 'free'),
      loading,
      signIn,
      signUp,
      exploreAsGuest,
      signOut,
      updateProfile,
      selectPlan,
    }),
    [user, loading, signIn, signUp, exploreAsGuest, signOut, updateProfile, selectPlan],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
