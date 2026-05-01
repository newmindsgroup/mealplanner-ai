// Permission System
import type { HouseholdRole } from '../types/household';

export type Permission =
  | 'manage_members'
  | 'invite_members'
  | 'remove_members'
  | 'update_roles'
  | 'create_plans'
  | 'edit_plans'
  | 'delete_plans'
  | 'view_plans'
  | 'manage_household'
  | 'delete_household'
  | 'transfer_ownership'
  | 'manage_settings';

export const ROLE_PERMISSIONS: Record<HouseholdRole, Permission[]> = {
  owner: [
    'manage_members',
    'invite_members',
    'remove_members',
    'update_roles',
    'create_plans',
    'edit_plans',
    'delete_plans',
    'view_plans',
    'manage_household',
    'delete_household',
    'transfer_ownership',
    'manage_settings',
  ],
  admin: [
    'invite_members',
    'remove_members',
    'create_plans',
    'edit_plans',
    'delete_plans',
    'view_plans',
    'manage_settings',
  ],
  member: [
    'create_plans',
    'edit_plans',
    'view_plans',
  ],
  viewer: [
    'view_plans',
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: HouseholdRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

/**
 * Check if a role can perform an action on another role
 * E.g., admins cannot manage owners
 */
export function canManageRole(
  actorRole: HouseholdRole,
  targetRole: HouseholdRole
): boolean {
  const roleHierarchy: Record<HouseholdRole, number> = {
    owner: 4,
    admin: 3,
    member: 2,
    viewer: 1,
  };

  return roleHierarchy[actorRole] > roleHierarchy[targetRole];
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: HouseholdRole): Permission[] {
  return ROLE_PERMISSIONS[role];
}

/**
 * Check if a role can invite members
 */
export function canInviteMembers(role: HouseholdRole): boolean {
  return hasPermission(role, 'invite_members');
}

/**
 * Check if a role can manage household settings
 */
export function canManageSettings(role: HouseholdRole): boolean {
  return hasPermission(role, 'manage_settings');
}

/**
 * Check if a role can delete the household
 */
export function canDeleteHousehold(role: HouseholdRole): boolean {
  return hasPermission(role, 'delete_household');
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: HouseholdRole): string {
  const names: Record<HouseholdRole, string> = {
    owner: 'Owner',
    admin: 'Administrator',
    member: 'Member',
    viewer: 'Viewer',
  };
  return names[role];
}

/**
 * Get role description
 */
export function getRoleDescription(role: HouseholdRole): string {
  const descriptions: Record<HouseholdRole, string> = {
    owner: 'Full control over the household, including deletion and ownership transfer',
    admin: 'Can manage members, meal plans, and household settings',
    member: 'Can create and edit meal plans',
    viewer: 'Can only view meal plans',
  };
  return descriptions[role];
}

/**
 * Get available roles that a user can assign
 */
export function getAssignableRoles(currentUserRole: HouseholdRole): HouseholdRole[] {
  switch (currentUserRole) {
    case 'owner':
      return ['owner', 'admin', 'member', 'viewer'];
    case 'admin':
      return ['member', 'viewer'];
    default:
      return [];
  }
}

