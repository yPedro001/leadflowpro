'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { PlanKey, PlanConfig } from '@/lib/plans';
import { getPlanConfig } from '@/lib/plans';

interface ProfileData {
  id: string;
  authUid: string;
  name: string;
  email: string;
  plan: PlanKey | string;
}

interface ProfileContextData {
  profile: ProfileData | null;
  planConfig: PlanConfig;
}

const ProfileContext = createContext<ProfileContextData | undefined>(undefined);

export function ProfileProvider({
  children,
  profile,
}: {
  children: ReactNode;
  profile: ProfileData | null;
}) {
  const planConfig = getPlanConfig(profile?.plan || 'STARTER');

  return (
    <ProfileContext.Provider value={{ profile, planConfig }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
