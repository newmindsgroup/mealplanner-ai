// Household Type Definitions
import type { User } from './auth';

export type HouseholdRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface Household {
  id: string;
  name: string;
  ownerId: string;
  members: HouseholdMember[];
  createdAt: string;
  updatedAt?: string;
  settings: HouseholdSettings;
}

export interface HouseholdMember {
  id: string;
  userId: string;
  householdId: string;
  role: HouseholdRole;
  joinedAt: string;
  invitedBy: string;
  user: User;
  status: 'active' | 'invited' | 'inactive';
}

export interface HouseholdSettings {
  allowMemberInvites: boolean;
  mealPlanVisibility: 'all' | 'admins' | 'owner';
  requireApproval: boolean;
  allowGuestAccess: boolean;
}

export interface CreateHouseholdData {
  name: string;
  settings?: Partial<HouseholdSettings>;
}

export interface UpdateHouseholdData {
  name?: string;
  settings?: Partial<HouseholdSettings>;
}

export const defaultHouseholdSettings: HouseholdSettings = {
  allowMemberInvites: false,
  mealPlanVisibility: 'all',
  requireApproval: true,
  allowGuestAccess: false,
};

