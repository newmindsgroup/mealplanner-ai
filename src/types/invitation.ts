// Invitation Type Definitions
import type { User } from './auth';
import type { HouseholdRole } from './household';

export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'revoked';

export interface Invitation {
  id: string;
  householdId: string;
  householdName: string;
  email: string;
  role: HouseholdRole;
  token: string;
  invitedBy: User;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
  acceptedAt?: string;
  declinedAt?: string;
}

export interface SendInvitationData {
  householdId: string;
  email: string;
  role: HouseholdRole;
  message?: string;
}

export interface InvitationResponse {
  accepted: boolean;
  reason?: string;
}

