// Member Card Modal Component
import React, { useState } from 'react';
import { X, Shield, Trash2, Loader } from 'lucide-react';
import type { HouseholdMember, HouseholdRole } from '../../types/household';
import { memberService } from '../../services/memberService';
import { useHousehold } from '../../contexts/HouseholdContext';
import { getRoleDisplayName, getRoleDescription, getAssignableRoles, canManageRole } from '../../utils/permissions';

interface MemberCardProps {
  member: HouseholdMember;
  onClose: () => void;
}

export default function MemberCard({ member, onClose }: MemberCardProps) {
  const { currentHousehold, members, refreshMembers } = useHousehold();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<HouseholdRole>(member.role);

  // Get current user's role
  const currentUserMember = members.find(m => m.status === 'active');
  const currentUserRole = currentUserMember?.role || 'viewer';

  // Check if current user can manage this member
  const canManage = currentHousehold && canManageRole(currentUserRole, member.role);
  const assignableRoles = getAssignableRoles(currentUserRole);

  const handleUpdateRole = async () => {
    if (!currentHousehold || newRole === member.role) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await memberService.updateMemberRole(
        currentHousehold.id,
        member.id,
        newRole
      );

      if (response.success) {
        await refreshMembers(currentHousehold.id);
        onClose();
      } else {
        setError(response.error || 'Failed to update role');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!currentHousehold) return;

    if (!confirm(`Are you sure you want to remove ${member.user.name} from the household?`)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await memberService.removeMember(
        currentHousehold.id,
        member.id
      );

      if (response.success) {
        await refreshMembers(currentHousehold.id);
        onClose();
      } else {
        setError(response.error || 'Failed to remove member');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="card p-6 max-w-md w-full mx-4 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Member Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Member Info */}
        <div className="space-y-6">
          {error && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Avatar & Name */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-2xl">
              {member.user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {member.user.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {member.user.email}
              </p>
            </div>
          </div>

          {/* Role Management */}
          {canManage && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Shield className="w-4 h-4 inline mr-1" />
                Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as HouseholdRole)}
                className="input"
                disabled={isLoading}
              >
                {assignableRoles.map((role) => (
                  <option key={role} value={role}>
                    {getRoleDisplayName(role)}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {getRoleDescription(newRole)}
              </p>
            </div>
          )}

          {/* Info */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Joined:</span>
              <span className="text-gray-900 dark:text-white">
                {new Date(member.joinedAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Current Role:</span>
              <span className="text-gray-900 dark:text-white capitalize">
                {member.role}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span className="text-green-600 dark:text-green-400 capitalize">
                {member.status}
              </span>
            </div>
          </div>

          {/* Actions */}
          {canManage && (
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              {newRole !== member.role && (
                <button
                  onClick={handleUpdateRole}
                  className="btn-primary flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    'Update Role'
                  )}
                </button>
              )}
              <button
                onClick={handleRemoveMember}
                className="btn-secondary text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex-1"
                disabled={isLoading}
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Remove
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

