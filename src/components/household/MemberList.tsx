// Member List Component
import React, { useState } from 'react';
import { MoreVertical, Crown, Shield, User, Eye } from 'lucide-react';
import { useHousehold } from '../../contexts/HouseholdContext';
import { useAuth } from '../../contexts/AuthContext';
import MemberCard from './MemberCard';
import type { HouseholdMember } from '../../types/household';

export default function MemberList() {
  const { members, currentHousehold } = useHousehold();
  const { user } = useAuth();
  const [selectedMember, setSelectedMember] = useState<HouseholdMember | null>(null);

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4" />;
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'member':
        return <User className="w-4 h-4" />;
      case 'viewer':
        return <Eye className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20';
      case 'admin':
        return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20';
      case 'member':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20';
      case 'viewer':
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800';
    }
  };

  if (!currentHousehold) {
    return <div>No household selected</div>;
  }

  return (
    <div className="space-y-4">
      <div className="card divide-y divide-gray-200 dark:divide-gray-700">
        {members.map((member) => (
          <div
            key={member.id}
            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              {/* Member Info */}
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-lg">
                  {member.user.name.charAt(0).toUpperCase()}
                </div>

                {/* Details */}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {member.user.name}
                    </h3>
                    {member.userId === user?.id && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                        You
                      </span>
                    )}
                    {member.userId === currentHousehold.ownerId && (
                      <Crown className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {member.user.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Role Badge & Actions */}
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize flex items-center gap-1.5 ${getRoleColor(
                    member.role
                  )}`}
                >
                  {getRoleIcon(member.role)}
                  {member.role}
                </span>

                {/* Actions Menu */}
                {member.userId !== user?.id && (
                  <button
                    onClick={() => setSelectedMember(member)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Member Details Modal */}
      {selectedMember && (
        <MemberCard
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
}

